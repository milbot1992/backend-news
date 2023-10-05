const { db } = require('../../db/connection')
const format = require('pg-format')

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

exports.insertTopic = (newTopic) => {
    const { slug, description } = newTopic
    const topicArr = [[slug, description]]

    const formattedQuery = format(`
                                    INSERT INTO topics
                                    (slug, description)
                                    VALUES
                                    %L
                                    RETURNING*;
                                    `, topicArr)

    return db.query(formattedQuery).then((result) => {

        return result.rows[0]
    })
}