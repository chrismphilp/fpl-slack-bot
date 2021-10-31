const request = require('request');
const {WebClient} = require('@slack/web-api');
const {createErrorMessage} = require("./util/error");
const {getStaticData} = require("./util/static-data");
const {formatTextTable} = require("./util/format");

const slackToken = process.env.SLACK_TOKEN;
const web = new WebClient(slackToken);

const COLUMNS = [
    'First Name',
    'Last Name',
    'Team',
    'Points',
    'No. Transfers In',
    'No. Transfers Out',
];

const gameweekDreamTeam = async (req, res) => {

    let channelId = req.query.channel_id || req.body.channel_id;

    if (channelId === undefined) {
        return res.status(400).send(createErrorMessage('No Slack chat defined. Please ensure you send a channelId'));
    }

    res.status(200).send();

    const dataTable = await createDataTable();
    const formattedText = formatTextTable(dataTable);
    await web.chat.postMessage({channel: channelId, text: formattedText});
};

const createDataTable = async () => [
    COLUMNS,
    ...(await processGameweekDreamTeam()),
];

const processGameweekDreamTeam = () => new Promise(async (resolve, _) => {

    const staticData = await getStaticData((v) => v);
    const currentGameweekId = staticData.events.find(event => event.is_current === true).id;
    const gameweekPlayerMappings = await getGameweekDreamTeamPlayers(currentGameweekId);
    console.log(gameweekPlayerMappings);
    const teamMappings = new Map(staticData.teams.map(team => [team.id, team.name]));
    const individualPlayerIds = gameweekPlayerMappings.map(v => v[0]);
    const filteredPlayers = staticData.elements.filter(elem => individualPlayerIds.includes(elem.id));
    const playerDetails = gameweekPlayerMappings.map(val => processPlayer(val[0], val[1], filteredPlayers, teamMappings));

    return resolve(playerDetails);
});

const getGameweekDreamTeamPlayers = (gameweekId) => new Promise((resolve, reject) => {
    request(`https://fantasy.premierleague.com/api/dream-team/${gameweekId}/`, {json: true},
        async (error, result, {team}) => {
            if (error) {
                console.error('Error:', error);
                return reject(error);
            }

            const playerValues = team.map(item => [item.element, item.points]);
            return resolve(playerValues);
        });
});

const processPlayer = (playerId, points, players, teamMappings) => {
    const player = players.find(p => p.id === playerId);

    return [
        player.first_name,
        player.second_name,
        teamMappings.get(player.team),
        points,
        player.transfers_in,
        player.transfers_out
    ];
};

module.exports = {
    gameweekDreamTeam,
}
