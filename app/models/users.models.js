const { db } = require('../../db/connection')

exports.fetchUsers = () => {
    return db.query('SELECT * FROM users;')
    .then((result) => {
        return result.rows
    })
}

exports.fetchUserByUsername = (username) => {
    return db.query(`SELECT * FROM users WHERE username = $1`, [username])

    .then(({rows}) => {
        if(rows.length === 0) {
            return Promise.reject( { status: 404, message: 'Article not found' } )
        }
        return rows[0]
    })
}