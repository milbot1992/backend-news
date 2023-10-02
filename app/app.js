const express = require('express')
const { getTopics } = require('./controllers/topics.controllers')
const { getEndpoints } = require('./controllers/endpoints.controllers')
const { handleServerErrors } = require('./controllers/errors.controllers')
const { getArticles } = require('./controllers/articles.controllers')

const app = express()

app.get('/api/topics', getTopics)

app.get('/api', getEndpoints)

app.get('/api/articles', getArticles)

app.all("/*", (req, res, next) => {
    res.status(404).send({ message: 'Path not found'})
    })

// Error handling
app.use(handleServerErrors)

module.exports = app