const assert = require('assert');
const {createDataTable, formatTextTable} = require("../src/league-rankings");

describe('should produce correct data array for standings', () => {

    const standings = {
        has_next: true,
        page: 1,
        results: [
            {
                id: 173893,
                event_total: 40,
                player_name: "aimey wong",
                rank: 1,
                last_rank: 1,
                rank_sort: 1,
                total: 547,
                entry: 34140,
                entry_name: "K fc"
            },
            {
                id: 19039397,
                event_total: 66,
                player_name: "Wan Bazli",
                rank: 2,
                last_rank: 13,
                rank_sort: 2,
                total: 544,
                entry: 3029848,
                entry_name: "KK CF 2 Scha"
            },
            {
                id: 919976,
                event_total: 58,
                player_name: "Ainur Aqilah",
                rank: 3,
                last_rank: 11,
                rank_sort: 3,
                total: 538,
                entry: 176015,
                entry_name: "Koboi Frozen"
            }
        ]
    };

    it('should return formatted Slack input', () => {
        const dataRows = createDataTable(standings);
        assert.equal(dataRows.length, 4);
        assert.equal(dataRows.reduce((prev, curr) => prev + curr.length, 0), 24);

        const formattedTextTable = formatTextTable(dataRows);
        assert.equal(formattedTextTable.substr(0, 3), '\`\`\`');
        assert.equal(formattedTextTable.substr(formattedTextTable.length - 3, formattedTextTable.length), '```');
        assert.equal(formattedTextTable.length > 20, true);
    });
});
