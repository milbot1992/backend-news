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

exports.fetchCommentsForArticle = (article_id, limit = 10, p = 1) => {
    const offset = (p - 1) * limit
    
    let formattedQuery = format (`SELECT *
                                FROM comments
                                WHERE article_id = %L
                                ORDER BY created_at
                                LIMIT %s OFFSET %s;`, [article_id], limit, offset)

    return db.query (formattedQuery)
    .then(({rows}) => {
        let totalCountQuery = `SELECT COUNT(*) FROM comments WHERE article_id = $1`

        return db.query(totalCountQuery, [article_id])
        .then(({rows: [total]}) => {
            const output = { comments: rows, total_count: parseInt(total.count, 10) }
            return output
        })
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

exports.updateComment = (comment_id,changeVotesBy) => {
    return db.query(`
    UPDATE comments
    SET votes = votes + $1
    WHERE comment_id = $2
    RETURNING *;
    `, [changeVotesBy,comment_id]).then((result)=>{
        if(result.rows.length === 0){
            return Promise.reject({ status: 404, message: 'Comment not found' })
        }
        return result.rows[0]
    })
}