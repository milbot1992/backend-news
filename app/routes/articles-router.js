const { getArticles, getArticleById, patchArticle } = require('../controllers/articles.controllers');
const { getCommentsForArticle, postComments } = require('../controllers/comments.controllers');
const articlesRouter = require('express').Router();

articlesRouter.
route('/')
.get(getArticles);

articlesRouter.
route('/:article_id')
.get(getArticleById)
.patch(patchArticle);

articlesRouter.
route('/:article_id/comments')
.get(getCommentsForArticle)
.post(postComments);

module.exports = articlesRouter;