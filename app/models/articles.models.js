const { db } = require('../../db/connection')
const format = require('pg-format')
const { formatComments } = require('../../db/seeds/utils')

exports.fetchArticles = (topic, sort_by = 'created_at', order = 'desc', limit = 10, page = 1) => {
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

        const offset = (page - 1) * limit

        let query = `SELECT
                    articles.author, articles.title, articles.article_id, articles.topic,
                    articles.created_at, articles.votes, articles.article_img_url,
                    COUNT(comments.comment_id) AS comment_count
                    FROM articles
                    LEFT JOIN comments ON comments.article_id = articles.article_id`
        const values = [sort_by, order, limit, offset]
    
        if(topic !== undefined) {
            values.unshift([topic])
            query += ` WHERE articles.topic = %L`
        }
        query += ` GROUP BY articles.author, articles.title, articles.article_id, articles.topic,
                    articles.created_at, articles.votes, articles.article_img_url
                    ORDER BY articles.%s %s
                    LIMIT %s OFFSET %s;`
        
        const formattedQuery = format(query, values[0], values[1], values[2], values[3], values[4])

        return db.query (formattedQuery)
        .then(({rows}) => {
            
            let totalCountQuery = `SELECT COUNT(*) FROM articles`

            if(topic !== undefined) {
                totalCountQuery += ` WHERE topic = %L`
            }

            return db.query(format(totalCountQuery, [topic]))
            .then(({rows: [total]}) => {
                
                const output = { articles: rows, total_count: parseInt(total.count, 10) }
                return output
            })
        })
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

exports.insertArticle = (newArticle) => {
    const { title, topic, author, body, article_img_url } = newArticle
    const votes = 0
    const created_at = new Date(Date.now())
    const articleArr = [[title, topic, author, body, article_img_url, votes, created_at]]
    const formattedQuery = format(`
                                    INSERT INTO articles
                                    (title, topic, author, body, article_img_url, votes, created_at)
                                    VALUES
                                    %L
                                    RETURNING*;
                                    `, articleArr)
    return db.query(formattedQuery).then((result) => {
        return result.rows[0]
    })
}