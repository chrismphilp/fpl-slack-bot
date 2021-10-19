const request = require('request');
const {WebClient} = require('@slack/web-api');
const ListItLib = require("list-it");
const {standardDeviation} = require("./util/math");
const listIt = new ListItLib({
    autoAlign: true,
    headerUnderline: true,
});

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

    let chatId = req.query.chatId || req.body.chatId;

    if (chatId === undefined) {
        return res.status(400).send('No Slack chat defined. Please ensure you send a chatId');
    }

    let playerIds = req.query.playersIds || req.body.playerIds;

    if (playerIds === undefined) {
        return res.status(400).send('No FPL players ids defined. Please ensure you send a list of playerIds');
    }

    const dataTable = await createDataTable(playerIds);
    const formattedText = formatTextTable(dataTable);
    const slackMessageRes = await web.chat.postMessage({channel: chatId, text: formattedText});
    return res.status(200).send(slackMessageRes.ts);
};

const formatTextTable = (dataRows) =>
    '```' +
    listIt.setHeaderRow(dataRows.shift()).d(dataRows).toString()
    + '```';

const createDataTable = async (playerIds) => ([
    COLUMNS,
    ...(await Promise.all(playerIds.map(processPlayerId)))
]);

const processPlayerId = (playerId) => new Promise(async (resolve, reject) => {
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
    createDataTable,
    formatTextTable,
    processPlayerId
}
