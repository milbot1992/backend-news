const { fetchArticles, fetchArticleById, updateArticle } = require('../models/articles.models')
const { fetchTopics } = require('../models/topics.models')

exports.getArticles = (req, res, next) => {
    const { topic } = req.query

    fetchArticles(topic).then((articles) => {
        res.status(200).send({articles})
    })
    .catch((err) => {
        next(err)
    })
}

exports.getArticles = (req, res, next) => {
    const { topic, sort_by, order } = req.query

    Promise.allSettled([
        fetchArticles(topic, sort_by, order),
        topic && fetchTopics(topic)
    ])
    .then((results) => {
        const [articlesResult, topicResult] = results

        if(articlesResult.status === 'fulfilled') {
            const articles = articlesResult.value

            if(topicResult && topicResult.status === 'fulfilled' && articles.length === 0 ) {
                res.status(200).send({articles: []})
            } else {
                res.status(200).send({articles})
            } 
        } else {
            next(articlesResult.reason)
        }
    })
    .catch((err) => {
        next(err)
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
        next(err)
    })
}