exports.handlePSQLErrors = (err, req, res, next) => {
    if (err.code === '22P02') {
        res.status(400).send({ message: 'Invalid ID' })
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


