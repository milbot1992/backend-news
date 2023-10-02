const express = require('express')
const { getTopics } = require('./controllers/topics.controllers')
const { handleServerErrors } = require('./controllers/errors.controllers')

const app = express()

app.get('/api/topics', getTopics)

app.all("/*", (req, res, next) => {
    res.status(404).send({ message: 'Path not found'})
    })

// Error handling
app.use(handleServerErrors)

module.exports = app