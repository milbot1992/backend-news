const express = require('express')
const apiRouter = require('./routes/api-router');
const { handlePSQLErrors, handleCustomErrors, handleServerErrors } = require('./controllers/errors.controllers')

const app = express()
app.use(express.json())

app.use('/api', apiRouter);

app.all("/*", (req, res, next) => {
    res.status(404).send({ message: 'Path not found'})
    })

// Error handling
app.use(handlePSQLErrors)
app.use(handleCustomErrors)
app.use(handleServerErrors)


module.exports = app