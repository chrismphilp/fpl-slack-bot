const dayjs = require("dayjs");
const {WebClient} = require('@slack/web-api');
const {createErrorMessage} = require("./util/error");
const {getStaticData} = require("./util/static-data");
const {formatTextTable} = require("./util/format");

const slackToken = process.env.SLACK_TOKEN;
const web = new WebClient(slackToken);

const COLUMNS = [
    {title: 'Name', getter: (_, {name}) => name},
    {title: 'Deadline', getter: (_, {deadline_time}) => dayjs(deadline_time).format('ddd DD MMM HH:mm')},
    {title: 'Avg Pts', getter: (_, {average_entry_score}) => average_entry_score},
    {title: 'Max Pts', getter: (_, {highest_score}) => highest_score},
    {title: 'Most Sel.', getter: (map, {most_selected}) => map.get(most_selected)},
    {title: 'Most Capt.', getter: (map, {most_captained}) => map.get(most_captained)},
    {title: 'Most VC', getter: (map, {most_vice_captained}) => map.get(most_vice_captained)},
    {title: 'Most Trns. In', getter: (map, {most_transferred_in}) => map.get(most_transferred_in)},
    {title: 'Total Trns.', getter: (_, {transfers_made}) => transfers_made},
];

const gameweekStats = async (req, res) => {

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
    COLUMNS.map(col => col.title),
    ...(await processGameweekStats()),
];

const processGameweekStats = () => new Promise(async (resolve, _) => {
    const [events, elements] = await getStaticData(({events, elements}) => [events, elements]);
    const currentGameweekId = events.find(event => event.is_current === true).id;
    const lastFiveGameweeks = events.slice(Math.max(0, currentGameweekId - 5), Math.max(0, currentGameweekId));
    const playerMappings = new Map(elements.map(player => [
        player.id,
        player.first_name.substring(0, 1) + ' ' + player.second_name.substring(0, 10),
    ]));

    const gameweekStats = lastFiveGameweeks.map(gameweek => COLUMNS.map(col => col.getter(playerMappings, gameweek)));
    return resolve(gameweekStats);
});

module.exports = {
    gameweekStats,
}
