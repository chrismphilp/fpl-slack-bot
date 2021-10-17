const request = require('request');
const {WebClient} = require('@slack/web-api');
const ListItLib = require("list-it");
const listit = new ListItLib({
    autoAlign: true,
    headerUnderline: true,
});

const slackToken = process.env.SLACK_TOKEN;
const web = new WebClient(slackToken);

// This argument can be a channel ID, a DM ID, a MPDM ID, or a group ID
const chatId = 'C02G8JD6R3Q';

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
]

const leagueRanking = (req, res) => {

    let chatId = req.query.chatId || req.body.chatId;

    if (chatId === undefined) {
        return res.status(400).send('No Slack chat defined. Please ensure you send a chatId');
    }

    let leagueId = req.query.leagueId || req.body.leagueId;

    if (leagueId === undefined) {
        return res.status(400).send('No FPL league defined. Please ensure you send a leagueId');
    }

    return request(`https://fantasy.premierleague.com/api/leagues-classic/${leagueId}/standings`, {json: true},
        async (error, result, body) => {
            console.error('Error:', error);
            const {new_entries, last_updated_data, league, standings} = body;
            const formattedText = formatTextTable(createDataTable(standings));
            const slackMessage = await web.chat.postMessage({channel: chatId, text: formattedText});
            return res.status(200).json({message: formattedText});
        });
};

const createDataTable = (standings) => [createTitleRow(), ...createDataRows(standings)];

const createTitleRow = () => COLUMNS.map(row => row.title);

const createDataRows = ({results}) => results.map(result => COLUMNS.map(row => result[row.key]));

const formatTextTable = (dataRows) => '```' + listit.setHeaderRow(dataRows.shift()).d(dataRows).toString() + '```';

module.exports = {
    leagueRanking,
    createDataTable,
    formatTextTable
}
