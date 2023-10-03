const { fetchArticles, fetchArticleById, updateArticle } = require('../models/articles.models')

exports.getArticles = (req, res, next) => {
    fetchArticles().then((articles) => {
        res.status(200).send({articles})
    })
}

exports.getArticleById = (req, res, next) => {
    const { article_id } = req.params

    fetchArticleById(article_id).then((article) => {
        res.status(200).send({article})
    })
    .catch((err) => {
        next(err)
    })
}

exports.patchArticle = (req,res,next) => {
    const {article_id} = req.params
    const changeVotesBy = req.body.inc_votes

    updateArticle(article_id,changeVotesBy).then((article)=>{
        res.status(201).send({article})
    })
    .catch((err)=>{
        console.log(err)
        next(err)
    })
}