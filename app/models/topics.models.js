const { db } = require('../../db/connection')

exports.fetchTopics = (topic) => {
    let query = `SELECT * FROM topics`
    const values = []

    if(topic !== undefined) {
        query += ` WHERE slug = $1`
        values.push(topic)
    }
    query += `;`
    
    return db.query(query, values)
    .then(({rows}) => {
        if(rows.length === 0) {
            return Promise.reject( { status: 404, message: 'Non-existent topic query' } )
        }
        return rows
    })
}