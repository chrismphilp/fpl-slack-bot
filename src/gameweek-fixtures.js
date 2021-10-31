const request = require('request');
const {WebClient} = require('@slack/web-api');
const ListItLib = require("list-it");
const {createErrorMessage} = require("./util/error");
const dayjs = require("dayjs");
const listIt = new ListItLib({
    autoAlign: true,
    headerUnderline: true,
});

const slackToken = process.env.SLACK_TOKEN;
const web = new WebClient(slackToken);

const COLUMNS = [
    {title: 'Home', getter: (map, {team_h}) => map.get(team_h)},
    {title: 'Away', getter: (map, {team_a}) => map.get(team_a)},
    {title: 'Kickoff', getter: (_, {kickoff_time}) => dayjs(kickoff_time).format('HH:mm dddd D MMMM YYYY')},
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

const formatTextTable = (dataRows) =>
    '```' +
    listIt.setHeaderRow(dataRows.shift()).d(dataRows).toString()
    + '```';

const createDataTable = async () => [
    COLUMNS.map(col => col.title),
    ...(await processGameweekFixtures()),
];

const processGameweekFixtures = () => new Promise(async (resolve, reject) => {

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
            return resolve(fixtures.filter(fixture => fixture.event === nextFixture));
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

module.exports = {
    gameweekFixtures,
    processGameweekFixtures,
    createDataTable,
}
