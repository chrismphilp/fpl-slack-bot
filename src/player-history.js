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
    'ID',
    'T/P',
    'T/GW/P',
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
    ...(await Promise.all(playerIds.map(processPlayerHistory)))
]);

const processPlayerHistory = (playerId) => new Promise((resolve, reject) => {
    request(`https://fantasy.premierleague.com/api/entry/${playerId}/history/`, {json: true},
        async (error, result, {current}) => {
            if (error) {
                console.error('Error:', error);
                return reject(error);
            }

            const totalPoints = current.at(-1).total_points;
            const average = totalPoints / current.length;
            const sd = standardDeviation(current.map(v => v.points), average);
            return resolve([playerId, totalPoints, average, sd]);
        });
});

module.exports = {
    playerHistory,
    createDataTable,
    formatTextTable,
    processPlayerHistory
}
