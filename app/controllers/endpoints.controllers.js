const { fetchEndpoints } = require('../models/endpoints.models')

exports.getEndpoints = (req, res, next) => {
    fetchEndpoints().then((endpoints) => {
        res.status(200).send({endpoints})
    })
}