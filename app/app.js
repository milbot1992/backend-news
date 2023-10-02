const express = require('express')
const { getTopics } = require('./controllers/topics.controllers')
const { getArticleByID } = require('./controllers/articles.controllers')
const { postComments } = require('./controllers/comments.controllers')
const { getEndpoints } = require('./controllers/endpoints.controllers')
const { handlePSQLErrors, handleCustomErrors, handleServerErrors } = require('./controllers/errors.controllers')

const app = express()
app.use(express.json())

app.get('/api/topics', getTopics)
app.get('/api/articles/:article_id', getArticleByID)
app.get('/api', getEndpoints)

app.post('/api/articles/:article_id/comments', postComments)

app.all("/*", (req, res, next) => {
    res.status(404).send({ message: 'Path not found'})
    })

// Error handling
app.use(handlePSQLErrors)
app.use(handleCustomErrors)
app.use(handleServerErrors)



module.exports = app