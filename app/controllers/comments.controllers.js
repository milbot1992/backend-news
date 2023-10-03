const { fetchCommentsForArticle, insertComments, removeComment } = require('../models/comments.models')
const { fetchArticleById } = require('../models/articles.models')

exports.postComments = (req, res, next) => {
    const newComment = req.body
    const { article_id } = req.params  
    insertComments(newComment, article_id).then((comment) => {
        res.status(201).send({comment})
    })
    .catch((err)=>{
        next(err);
    })
}

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

exports.deleteComment = (req,res,next) => {
    const { comment_id } = req.params

    removeComment(comment_id).then((comment)=>{
        res.status(204).send()
    })
    .catch((err)=>{
        next(err)
    })
}
