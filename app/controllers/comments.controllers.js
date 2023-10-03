const { fetchCommentsForArticle } = require('../models/comments.models')
const { fetchArticleById } = require('../models/articles.models')

exports.getCommentsForArticle = (req, res, next) => {
    const { article_id } = req.params

    Promise.all([
        fetchCommentsForArticle(article_id),
        article_id && fetchArticleById(article_id)
    ])
    .then((results) => {
        const [comments, article] = results
        if(article && comments.length ===0) {
            res.status(200).send({comments: []})
        } else {
            res.status(200).send({comments})
        }
    })
    .catch((err) => {
        next(err)
    })
}