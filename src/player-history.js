const request = require('request');
const {WebClient} = require('@slack/web-api');
const ListItLib = require("list-it");
const {standardDeviation} = require("./util/math");
const util = require("util");
const listit = new ListItLib({
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
    listit.setHeaderRow(dataRows.shift()).d(dataRows).toString()
    + '```';

const createDataTable = async (playerIds) => {
    const processPlayerHistoryAsync = util.promisify(processPlayerHistory);

    const playerRows = await Promise.all(playerIds.map(processPlayerHistoryAsync))
        .then(data => data);

    return [
        COLUMNS.map(row => row.title),
        ...playerRows
    ];
}

const processPlayerHistory = (playerId) => new Promise((resolve, reject) => {
    request(`https://fantasy.premierleague.com/api/entry/${playerId}/history`, {json: true},
        (error, result, body) => {
            if (error) {
                console.error('Error:', error);
                return reject(error);
            }
            const {current} = body;

            const totalPoints = current.at(-1).total_points;
            const average = totalPoints / current.length;
            const standardDeviation = standardDeviation(current, average);
            return resolve([playerId, totalPoints, average, standardDeviation]);
        });
});

module.exports = {
    playerHistory,
    formatTextTable,
    processPlayerHistory
}
