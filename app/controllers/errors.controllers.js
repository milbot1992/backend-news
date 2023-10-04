exports.handlePSQLErrors = (err, req, res, next) => {
    if (err.code === '22P02') {
        res.status(400).send({ message: 'Invalid ID' })
    }
    if (err.code === '23502') {
        res.status(400).send({ message: 'Bad request, request missing required columns' })
    }
    if (err.code === '23503') {
        res.status(404).send({ message: 'Not found' })
    }
    if (err.code === '42703' || err.code === '42601') {
        res.status(400).send({ message: 'Invalid search query' })
    }
    next(err)
}

exports.handleCustomErrors = (err, req, res, next) => {
    if (err.status) {
        res.status(err.status).send({ message: err.message })
    }
    next(err)
}

exports.handleServerErrors = (err, req, res, next) => {
        res.status(500).send({message: 'Internal server error!'})
}
