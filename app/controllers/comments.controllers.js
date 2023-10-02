const { insertComments } = require('../models/comments.models')

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
