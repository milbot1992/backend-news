const { db } = require('../../db/connection')
const format = require('pg-format')

exports.insertComments = (newComment, article_id) => {
    const { username, body } = newComment
    const votes = 0
    const created_at = new Date(Date.now())
    const commentArr = [[body, article_id, username, votes, created_at]]
    const formattedQuery = format(`
                                    INSERT INTO comments
                                    (body, article_id, author, votes, created_at)
                                    VALUES
                                    %L
                                    RETURNING*;
                                    `, commentArr)
    return db.query(formattedQuery).then((result) => {
        return result.rows[0]
    })
}

exports.fetchCommentsForArticle = (article_id) => {
    return db.query (   `SELECT *
                        FROM comments
                        WHERE article_id = $1
                        ORDER BY created_at;`, [article_id] )
    .then(({rows}) => {
        return rows
    })
}

exports.removeComment = (comment_id) => {
    return db.query(`
                    SELECT * FROM comments
                    WHERE comment_id = $1;`,[comment_id])
    .then((result)=>{
        if(result.rows.length === 0){
            return Promise.reject({ status: 404, message: 'Comment not found' })
        }
        return Promise.all ( [result,db.query(`
            DELETE FROM comments
            WHERE comment_id = $1;
            `,[comment_id])
        ])
    })
    .then((result)=>{
        return result[0].rows[0]
    })
}