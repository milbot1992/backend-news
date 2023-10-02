const { db } = require('../../db/connection')

exports.fetchCommentsForArticle = (article_id) => {
    return db.query (   `SELECT *
                        FROM comments
                        WHERE article_id = $1
                        ORDER BY created_at;`, [article_id] )
    .then(({rows}) => {
        if(rows.length === 0) {
            return Promise.reject( { status: 404, message: 'Article does not exist' } )
        }
        return rows
    })
}