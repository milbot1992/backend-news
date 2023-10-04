const { db } = require('../../db/connection')

exports.fetchArticles = (topic) => {
    return db.query (   `SELECT
                        articles.author, articles.title, articles.article_id, articles.topic,
                        articles.created_at, articles.votes, articles.article_img_url,
                        COUNT(comments.comment_id) AS comment_count
                        FROM articles
                        LEFT JOIN comments ON comments.article_id = articles.article_id
                        GROUP BY articles.author, articles.title, articles.article_id, articles.topic,
                        articles.created_at, articles.votes, articles.article_img_url
                        ORDER BY articles.created_at DESC;`)
    .then(({rows}) => {
        return rows
    })
}

exports.fetchArticleById = (article_id) => {
    return db.query(`SELECT
                        articles.article_id, articles.author, articles.title, articles.body, articles.topic,
                        articles.created_at, articles.votes, articles.article_img_url,
                        COUNT(comments.comment_id) AS comment_count
                    FROM articles
                    LEFT JOIN comments ON comments.article_id = articles.article_id
                    WHERE articles.article_id = $1
                    GROUP BY articles.article_id, articles.author, articles.title, articles.article_id, 
                            articles.topic, articles.created_at, articles.votes, 
                            articles.article_img_url;`, [article_id])

    .then(({rows}) => {
        if(rows.length === 0) {
            return Promise.reject( { status: 404, message: 'Article not found' } )
        }
        return rows[0]
    })
}

exports.updateArticle = (article_id,changeVotesBy) => {
    return db.query(`
    UPDATE articles
    SET votes = votes + $1
    WHERE article_id = $2
    RETURNING *;
    `, [changeVotesBy,article_id]).then((result)=>{
        if(result.rows.length === 0){
            return Promise.reject({ status: 404, message: 'Article not found' })
        }
        return result.rows[0]
    })
}