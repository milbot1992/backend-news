const { db } = require('../../db/connection')

exports.fetchCommentsForArticle = (article_id) => {
    return db.query (   `SELECT *
                        FROM comments
                        WHERE article_id = $1
                        ORDER BY created_at;`, [article_id] )
    .then(({rows}) => {
        return rows
    })
}