const ListItLib = require("list-it");
const listIt = new ListItLib({
    autoAlign: true,
    headerUnderline: true,
});

const formatTextTable = (dataRows) =>
    '```' +
    listIt.setHeaderRow(dataRows.shift()).d(dataRows).toString()
    + '```';

const normaliseString = (str) => str.normalize("NFD").replace(/\p{Diacritic}/gu, "");

module.exports = {
    formatTextTable,
    normaliseString,
}
