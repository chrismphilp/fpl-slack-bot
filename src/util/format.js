const ListItLib = require("list-it");
const listIt = new ListItLib({
    autoAlign: true,
    headerUnderline: true,
});

const formatTextTable = (dataRows) =>
    '```' +
    listIt.setHeaderRow(dataRows.shift()).d(dataRows).toString()
    + '```';

module.exports = {
    formatTextTable,
}
