const { getArticles, getArticleById, patchArticle } = require('../controllers/articles.controllers');
const { getCommentsForArticle, postComments } = require('../controllers/comments.controllers');
const articlesRouter = require('express').Router();

articlesRouter.get('/', getArticles);
articlesRouter.get('/:article_id', getArticleById);
articlesRouter.patch('/:article_id', patchArticle);
articlesRouter.get('/:article_id/comments', getCommentsForArticle);
articlesRouter.post('/:article_id/comments', postComments);

module.exports = articlesRouter;