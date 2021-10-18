const request = require('request');
const {WebClient} = require('@slack/web-api');
const ListItLib = require("list-it");
const {standardDeviation} = require("./util/math");
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

    const formattedText = formatTextTable(createDataTable(playerIds));
    const slackMessageRes = await web.chat.postMessage({channel: chatId, text: formattedText});
    return res.status(200).send(slackMessageRes.ts);
};

const formatTextTable = (dataRows) =>
    '```' +
    listit.setHeaderRow(dataRows.shift()).d(dataRows).toString()
    + '```';

const createDataTable = (playerIds) => [
    COLUMNS.map(row => row.title),
    ...playerIds.map(id => processPlayerHistory(id))
];

const processPlayerHistory = async (playerId) => {
    return await request(`https://fantasy.premierleague.com/api/entry/${playerId}/history`, {json: true},
        async (error, result, body) => {
            console.error('Error:', error);
            const {current} = body;

            const totalPoints = current.at(-1).total_points;
            const average = totalPoints / current.length;
            const standardDeviation = standardDeviation(current, average);
            return [playerId, totalPoints, average, standardDeviation];
        });
};

module.exports = {
    playerHistory,
    formatTextTable,
    processPlayerHistory
}
