const request = require('request');
const dayjs = require("dayjs");
const {WebClient} = require('@slack/web-api');
const ListItLib = require("list-it");
const {createErrorMessage} = require("./util/error");
const listIt = new ListItLib({
    autoAlign: true,
    headerUnderline: true,
});

const slackToken = process.env.SLACK_TOKEN;
const web = new WebClient(slackToken);

const COLUMNS = [
    {title: 'Date', getter: (_, {kickoff_time}) => dayjs(kickoff_time).format('dddd D MMMM YYYY')},
    {title: 'Home', getter: (map, {team_h}) => map.get(team_h)},
    {title: 'Away', getter: (map, {team_a}) => map.get(team_a)},
    {title: 'Time', getter: (_, {kickoff_time}) => dayjs(kickoff_time).format('HH:mm')},
];

const gameweekFixtures = async (req, res) => {

    let channelId = req.query.channel_id || req.body.channel_id;

    if (channelId === undefined) {
        return res.status(400).send(createErrorMessage('No Slack chat defined. Please ensure you send a channelId'));
    }

    res.status(200).send();

    const dataTable = await createDataTable();
    const formattedText = formatTextTable(dataTable);
    await web.chat.postMessage({channel: channelId, text: formattedText});
};

const processGameweekFixtures = () => new Promise(async (resolve, _) => {

    const apiCalls = await Promise.all([
        getUpcomingFixtures(),
        getTeamMappings(),
    ]);

    const upcomingFixtures = apiCalls[0];
    const teamMappings = apiCalls[1];

    const formattedFixtures = upcomingFixtures.map(fixture =>
        COLUMNS.map(col => col.getter(teamMappings, fixture)));
    return resolve(formattedFixtures);
});

const getUpcomingFixtures = () => new Promise((resolve, reject) => {
    request(`https://fantasy.premierleague.com/api/fixtures/?future=1`, {json: true},
        async (error, result, fixtures) => {
            if (error) {
                console.error('Error:', error);
                return reject(error);
            }

            const nextFixture = fixtures[0].event;
            const upcomingFixtures = fixtures.filter(fixture => fixture.event === nextFixture);
            return resolve(upcomingFixtures);
        });
});

const getTeamMappings = () => new Promise((resolve, reject) => {
    request(`https://fantasy.premierleague.com/api/bootstrap-static/`, {json: true},
        async (error, result, {teams}) => {
            if (error) {
                console.error('Error:', error);
                return reject(error);
            }

            const teamMap = new Map(teams.map(team => [team.id, team.name]));
            return resolve(teamMap);
        });
});

const formatTextTable = (dataRows) =>
    '```' +
    listIt.setHeaderRow(dataRows.shift()).d(dataRows).toString()
    + '```';

const createDataTable = async () => [
    COLUMNS.map(col => col.title),
    ...(await processGameweekFixtures()),
];

module.exports = {
    gameweekFixtures,
    processGameweekFixtures,
    createDataTable,
}
