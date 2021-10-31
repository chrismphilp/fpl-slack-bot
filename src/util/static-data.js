const request = require("request");

const getStaticData = (processData) => new Promise((resolve, reject) => {
    request(`https://fantasy.premierleague.com/api/bootstrap-static/`, {json: true},
        async (error, result, body) => {
            if (error) {
                console.error('Error:', error);
                return reject(error);
            }
            return resolve(processData(body));
        });
});

module.exports = {
    getStaticData,
}
