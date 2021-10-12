const request = require('request');

exports.leagueRanking = (req, res) => {

    let id = req.query.id || req.body.id || '0';

    if (req.body.id === undefined) {
        return res.status(400).send('No FPL league defined. Please ensure you send an ID');
    }

    return request(`https://fantasy.premierleague.com/api/leagues-classic/${id}/standings`, {json: true},
        (error, result, body) => {
            console.log(res);
            return res.status(200).json({message: body});
        });
};
