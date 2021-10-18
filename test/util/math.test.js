const assert = require('assert');
const {standardDeviation} = require("../../src/util/math");

describe('standard deviation tests', () => {
    it('should produce correct standard deviation for positive values', () => {
        const values = [1, 2, 3, 4, 5];
        assert.equal(standardDeviation(values, 3).toFixed(2), 1.41);
    });

    it('should produce correct standard deviation for negative values', () => {
        const values = [-1, -2, -3, -4, -5];
        assert.equal(standardDeviation(values, -3).toFixed(2), 1.41);
    });
});
