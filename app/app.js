const express = require('express')
const { getTopics } = require('./controllers/topics.controllers')
const { getArticles, getArticleById } = require('./controllers/articles.controllers')
const { getEndpoints } = require('./controllers/endpoints.controllers')
const { getCommentsForArticle } = require('./controllers/comments.controllers')
const { handlePSQLErrors, handleCustomErrors, handleServerErrors } = require('./controllers/errors.controllers')



const app = express()

app.get('/api/topics', getTopics)
app.get('/api', getEndpoints)
app.get('/api/articles', getArticles)
app.get('/api/articles/:article_id', getArticleById)

app.get('/api/articles/:article_id/comments', getCommentsForArticle)

app.all("/*", (req, res, next) => {
    res.status(404).send({ message: 'Path not found'})
    })

// Error handling
app.use(handlePSQLErrors)
app.use(handleCustomErrors)
app.use(handleServerErrors)


module.exports = app