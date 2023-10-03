const { fetchArticles } = require('../models/articles.models')
const { fetchArticleByID } = require('../models/articles.models')

exports.getArticles = (req, res, next) => {
    fetchArticles().then((articles) => {
        res.status(200).send({articles})
    })
}

exports.getArticleByID = (req, res, next) => {
    const { article_id } = req.params

    fetchArticleByID(article_id).then((article) => {
        res.status(200).send({article})
    })
    .catch((err) => {
        next(err)
    })
}