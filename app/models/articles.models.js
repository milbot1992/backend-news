const { db } = require('../../db/connection')

exports.fetchArticles = (topic) => {
    return db.query('SELECT DISTINCT slug FROM topics;')
    .then((topics) => {
        const validTopics = topics.rows
        const topicObject = {}
        validTopics.forEach ((item) => {
            topicObject[item.slug] = item.slug
        })

        if(topic !== undefined && !(topic in topicObject)) {
            return Promise.reject({ status: 404, message: `Non-existent topic query: ${topic}`})
        }
        let query = `SELECT
                    articles.author, articles.title, articles.article_id, articles.topic,
                    articles.created_at, articles.votes, articles.article_img_url,
                    COUNT(comments.comment_id) AS comment_count
                    FROM articles
                    LEFT JOIN comments ON comments.article_id = articles.article_id`
        const values = []
    
        if(topic !== undefined) {
            query += ' WHERE topic = $1'
            values.push(topic)
        }
        query += ` GROUP BY articles.author, articles.title, articles.article_id, articles.topic,
                    articles.created_at, articles.votes, articles.article_img_url
                    ORDER BY articles.created_at DESC;`
        return db.query (query, values)
        .then(({rows}) => {
            return rows
        })
    })
}

exports.fetchArticleById = (article_id) => {
    return db.query('SELECT * FROM articles WHERE article_id = $1;', [article_id])

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