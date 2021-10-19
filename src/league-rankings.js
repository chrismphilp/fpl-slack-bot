const request = require('request');
const {WebClient} = require('@slack/web-api');
const ListItLib = require("list-it");
const listIt = new ListItLib({
    autoAlign: true,
    headerUnderline: true,
});

const slackToken = process.env.SLACK_TOKEN;
const web = new WebClient(slackToken);

const COLUMNS = [
    {
        title: 'Team Name',
        key: 'entry_name'
    },
    {
        title: 'Player Name',
        key: 'player_name'
    },
    {
        title: 'ID',
        key: 'id'
    },
    {
        title: 'T/P',
        key: 'total'
    },
    {
        title: 'T/GW/P',
        key: 'event_total'
    },
    {
        title: 'Rank',
        key: 'rank'
    }
];

const leagueRanking = (req, res) => {

    let chatId = req.query.chatId || req.body.chatId;

    if (chatId === undefined) {
        return res.status(400).send('No Slack chat defined. Please ensure you send a chatId');
    }

    let leagueId = req.query.leagueId || req.body.leagueId;

    if (leagueId === undefined) {
        return res.status(400).send('No FPL league defined. Please ensure you send a leagueId');
    }

    let count = req.query.count || req.body.count || 10;

    return request(`https://fantasy.premierleague.com/api/leagues-classic/${leagueId}/standings`, {json: true},
        async (error, result, {standings}) => {
            if (error) {
                console.error('Error:', error);
                return res.status(500).send(error);
            }

            const formattedText = formatTextTable(createDataTable(standings), count);
            const slackMessageRes = await web.chat.postMessage({channel: chatId, text: formattedText});
            return res.status(200).send(slackMessageRes.ts);
        });
};

const formatTextTable = (dataRows) => '```' + listIt.setHeaderRow(dataRows.shift()).d(dataRows).toString() + '```';

const createDataTable = ({results}, count) => [
    COLUMNS.map(row => row.title),
    ...results.slice(0, count).map(result => COLUMNS.map(row => result[row.key]))
];


module.exports = {
    leagueRanking,
    createDataTable,
    formatTextTable
}
