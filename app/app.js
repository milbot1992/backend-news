const express = require('express')
const { getTopics } = require('./controllers/topics.controllers')
const { getArticles, getArticleById, patchArticle } = require('./controllers/articles.controllers')
const { getEndpoints } = require('./controllers/endpoints.controllers')
const { getCommentsForArticle, postComments, deleteComment } = require('./controllers/comments.controllers')
const { handlePSQLErrors, handleCustomErrors, handleServerErrors } = require('./controllers/errors.controllers')
const { getUsers } = require('./controllers/users.controllers')

const app = express()
app.use(express.json())

app.get('/api/topics', getTopics)
app.get('/api', getEndpoints)
app.get('/api/articles', getArticles)
app.get('/api/articles/:article_id', getArticleById)
app.get('/api/articles/:article_id/comments', getCommentsForArticle)
app.get('/api/users', getUsers)

app.patch('/api/articles/:article_id', patchArticle)
app.post('/api/articles/:article_id/comments', postComments)
app.delete('/api/comments/:comment_id', deleteComment)

app.all("/*", (req, res, next) => {
    res.status(404).send({ message: 'Path not found'})
    })

// Error handling
app.use(handlePSQLErrors)
app.use(handleCustomErrors)
app.use(handleServerErrors)


module.exports = app