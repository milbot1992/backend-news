const { fetchTopics } = require('../models/topics.models')

exports.getTopics = (req, res, next) => {
    const { topic } = req.query
    
    fetchTopics(topic).then((topics) => {
        res.status(200).send({topics})
    })
}