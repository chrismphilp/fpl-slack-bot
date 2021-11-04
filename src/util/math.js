const standardDeviation = (values, mean) => {
    const size = values.length;
    const nonSqrt = values
        .map(x => Math.pow((x - mean),  2))
        .reduce((a, b) => a + b, 0);
    return Math.sqrt(nonSqrt / size);
}

module.exports = {
    standardDeviation,
}
