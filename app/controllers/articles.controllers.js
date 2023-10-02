const { fetchArticleByID } = require('../models/articles.models')

exports.getArticleByID = (req, res, next) => {
    const { article_id } = req.params

    fetchArticleByID(article_id).then((article) => {
        res.status(200).send({article})
    })
    .catch((err) => {
        console.log(err, '<<<<<1<<<<<<')
        next(err)
    })
}