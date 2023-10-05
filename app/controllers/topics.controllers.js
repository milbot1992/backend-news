const { fetchTopics, insertTopic } = require('../models/topics.models')

exports.getTopics = (req, res, next) => {
    const { topic } = req.query
    
    fetchTopics(topic).then((topics) => {
        res.status(200).send({topics})
    })
}

exports.postTopic = (req, res, next) => {
    const newTopic = req.body

    insertTopic(newTopic).then((topic) => {
        res.status(201).send({topic})
    })
    .catch((err)=>{
        next(err);
    })
}