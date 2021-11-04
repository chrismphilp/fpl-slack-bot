const request = require('request');
const {WebClient} = require('@slack/web-api');
const {createErrorMessage} = require("./util/error");
const {formatTextTable, normaliseString} = require("./util/format");

const slackToken = process.env.SLACK_TOKEN;
const web = new WebClient(slackToken);

const COLUMNS = [
    {title: 'Team Name', key: 'entry_name'},
    {title: 'Player Name', key: 'player_name'},
    {title: 'ID', key: 'id'},
    {title: 'T/P', key: 'total'},
    {title: 'T/GW/P', key: 'event_total'},
    {title: 'League Rank', key: 'rank'}
];

const leagueRanking = (req, res) => {

    let channelId = req.query.channel_id || req.body.channel_id;

    if (channelId === undefined) {
        return res.status(400).send(createErrorMessage('No Slack chat defined. Please ensure you send a channelId'));
    }

    let leagueId = req.query.text || req.body.text;

    if (leagueId === undefined) {
        return res.status(400).send(createErrorMessage('No FPL league defined. Please ensure you send a leagueId'));
    }

    let count = req.query.count || req.body.count || 10;

    res.status(200).send();

    return request(`https://fantasy.premierleague.com/api/leagues-classic/${leagueId}/standings`, {json: true},
        async (error, result, {standings}) => {
            if (error) {
                console.error('Error:', error);
                return res.status(500).send(createErrorMessage(error));
            }

            const {results} = standings;
            const formattedText = formatTextTable(createDataTable(results.slice(0, count)));
            await web.chat.postMessage({channel: channelId, text: formattedText});
        });
};

const createDataTable = (values) => [
    COLUMNS.map(row => row.title),
    ...values.map(result =>
        COLUMNS.map(row =>
            normaliseString(result[row.key] + ''))),
];

module.exports = {
    leagueRanking,
    createDataTable,
}
