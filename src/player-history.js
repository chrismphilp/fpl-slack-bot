const request = require('request');
const {WebClient} = require('@slack/web-api');
const {standardDeviation} = require("./util/math");
const {createErrorMessage} = require("./util/error");
const {formatTextTable} = require("./util/format");

const slackToken = process.env.SLACK_TOKEN;
const web = new WebClient(slackToken);

const COLUMNS = [
    'Team Name',
    'First Name',
    'Last Name',
    'ID',
    'T/P',
    'Μ/GW/P',
    'σ/GW/P',
    'Global Rank',
];

const playerHistory = async (req, res) => {

    let channelId = req.query.channel_id || req.body.channel_id;

    if (channelId === undefined) {
        return res.status(400).send(createErrorMessage('No Slack chat defined. Please ensure you send a channelId'));
    }

    let playerIds = req.query.text || req.body.text;

    if (playerIds === undefined) {
        return res.status(400).send(createErrorMessage('No FPL players ids defined. Please ensure you send a list of playerIds'));
    }

    res.status(200).send();

    const dataTable = await createDataTable(playerIds.replace(/\s/g,'').split(','));
    const formattedText = formatTextTable(dataTable);
    await web.chat.postMessage({channel: channelId, text: formattedText});
};

const createDataTable = async (playerIds) => ([
    COLUMNS,
    ...(await Promise.all(playerIds.map(processPlayerId)))
        .sort((a, b) => a[a.length - 1] - b[b.length - 1])
]);

const processPlayerId = (playerId) => new Promise(async (resolve) => {
    const result = await Promise.all([
        processTeamInfo(playerId),
        processPlayerHistory(playerId)
    ]);
    return resolve([...result[0], ...result[1]]);
});

const processPlayerHistory = (playerId) => new Promise((resolve, reject) => {
    request(`https://fantasy.premierleague.com/api/entry/${playerId}/history/`, {json: true},
        async (error, result, {current}) => {
            if (error) {
                console.error('Error:', error);
                return reject(error);
            }

            const latestGameweek = current.at(-1);
            const {overall_rank, total_points} = latestGameweek;
            const average = (total_points / current.length).toFixed(2);
            const sd = standardDeviation(current.map(v => v.points), average).toFixed(2);

            return resolve([playerId, total_points, average, sd, overall_rank]);
        });
});

const processTeamInfo = (playerId) => new Promise((resolve, reject) => {
    request(`https://fantasy.premierleague.com/api/entry/${playerId}/`, {json: true},
        async (error, result, {name, player_first_name, player_last_name}) => {
            if (error) {
                console.error('Error:', error);
                return reject(error);
            }
            return resolve([name, player_first_name, player_last_name]);
        });
});

module.exports = {
    playerHistory,
}
