const { fetchCommentsForArticle } = require('../models/comments.models')

exports.getCommentsForArticle = (req, res, next) => {
    const { article_id } = req.params

    fetchCommentsForArticle(article_id).then((comments) => {
        res.status(200).send({comments})
    })
    .catch((err) => {
        next(err)
    })
}