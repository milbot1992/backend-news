const { db } = require('../db/connection')
const app = require('../app/app')
const request = require('supertest')
const seed = require('../db/seeds/seed.js')
const data = require('../db/data/test-data')
const { expect } = require('@jest/globals')

beforeAll(()=>seed(data))
afterAll(()=>db.end())

describe('GET /api/topics', () => {
    test('should return 200 status code and an array of topics objects', () => {
        return request(app)
        .get('/api/topics')
        .expect(200)
        .then(({body}) => {
            expect(body.topics).toHaveLength(3)
            body.topics.forEach((topic)=>{
                expect(topic).toHaveProperty('slug')
                expect(topic).toHaveProperty('description')
            })
        })
    })
})
describe('GET /api/articles/:article_id', () => {
    test('should return 200 status code and an an article object with the correct id', () => {
        return request(app)
        .get('/api/articles/4')
        .expect(200)
        .then(({body}) => {
            expect(body.article.article_id).toBe(4)
            expect(body.article).toHaveProperty('author')
            expect(body.article).toHaveProperty('title')
            expect(body.article).toHaveProperty('body')
            expect(body.article).toHaveProperty('topic')
            expect(body.article).toHaveProperty('created_at')
            expect(body.article).toHaveProperty('votes')
            expect(body.article).toHaveProperty('article_img_url')
        })
    })
    test('should return 404 Not found if given an article_id that does not exist',()=>{
        return request(app)
        .get('/api/articles/999')
        .expect(404)
        .then((res) => {
            expect(res.body.message).toBe('Article not found')
        })
    })
    test('should return 400 Bad Request if given an invalid article_id',()=>{
        return request(app)
        .get('/api/articles/notAnID')
        .expect(400)
        .then(({body})=>{
            expect(body.message).toBe('Invalid ID')
        })
    })
})
describe('GET /api', () => {
    test('should return 200 status code and a JSON object describing all available endpoints', () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then(({body}) => {
            expect(Object.keys(body.endpoints).length).toBeGreaterThan(0)
            expect(body.endpoints['GET /api']).toHaveProperty('description')
            expect(body.endpoints['GET /api/topics']).toHaveProperty('description')
            expect(body.endpoints['GET /api/topics']).toHaveProperty('queries')
            expect(body.endpoints['GET /api/topics']).toHaveProperty('exampleResponse')
            expect(body.endpoints['GET /api/articles']).toHaveProperty('description')
            expect(body.endpoints['GET /api/articles']).toHaveProperty('queries')
            expect(body.endpoints['GET /api/articles']).toHaveProperty('exampleResponse')
        })
    })
})
describe('GET /api/articles', () => {
    test('should return 200 status code and an array of articles objects ordered by created_at descending', () => {
        return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({body}) => {
            expect(body.articles).toBeSortedBy('created_at', {descending: true})
            body.articles.forEach((article)=>{
                expect(article).toMatchObject({author: expect.any(String),
                                            title: expect.any(String),
                                            article_id: expect.any(Number),
                                            topic: expect.any(String),
                                            created_at: expect.any(String),
                                            votes: expect.any(Number),
                                            article_img_url: expect.any(String),
                                            comment_count: expect.any(String),
                                        })
            })
        })
    })
})
describe('GET /api/articles/:article_id/comments', () => {
    test('should return 200 status code and an array of comments for specified article', () => {
        return request(app)
        .get('/api/articles/3/comments')
        .expect(200)
        .then(({body}) => {
            expect(body.comments).toHaveLength(2)
            expect(body.comments).toBeSortedBy('created_at')
            body.comments.forEach((comment)=>{
                expect(comment).toHaveProperty('comment_id')
                expect(comment).toHaveProperty('votes')
                expect(comment).toHaveProperty('created_at')
                expect(comment).toHaveProperty('author')
                expect(comment).toHaveProperty('body')
                expect(comment).toHaveProperty('article_id')
            })
        })
    })
    test('should return 200 status code and an empty array for valid article with no comments', () => {
        return request(app)
        .get('/api/articles/2/comments')
        .expect(200)
        .then(({body}) => {
            expect(body.comments).toHaveLength(0)
            expect(body.comments).toEqual([])
        })
    })
    test('should return 404 Not found if given an article_id that does not exist',()=>{
        return request(app)
        .get('/api/articles/999/comments')
        .expect(404)
        .then((res) => {
            expect(res.body.message).toBe('Article not found')
        })
    })
    test('should return 400 Bad Request if given an invalid article_id',()=>{
        return request(app)
        .get('/api/articles/notAnID/comments')
        .expect(400)
        .then(({body})=>{
            expect(body.message).toBe('Invalid ID')
        })
    })
})
describe('All wrong paths', () => {
    test('should return a 404, not found when an invalid path is entered', () => {
        return request(app)
        .get('/api/topic')
        .expect(404)
        .then((response) => {
            expect(response.body.message).toBe('Path not found')
        })
    })
})
describe('PATCH /api/articles/:article_id',()=>{
    test('should return the updated article object with a 201 status code when passed a positive inc_votes',()=>{
        return request(app)
        .patch('/api/articles/7')
        .send({ inc_votes : 10 })
        .expect(201).then((res)=>{
            expect(res.body.article).toMatchObject({
                                                    article_id: 7,
                                                    title: "Z",
                                                    topic: "mitch",
                                                    author: "icellusedkars",
                                                    body: "I was hungry.",
                                                    created_at: "2020-01-07T14:08:00.000Z",
                                                    votes: 10,
                                                    article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
            })
        })
    })
    test('should return the updated article object with a 201 status code  when passed a negative inc_votes',()=>{
        return request(app)
        .patch('/api/articles/5')
        .send({ inc_votes : -10 })
        .expect(201).then((res)=>{
            expect(res.body.article).toMatchObject({
                                                    article_id: 5,
                                                    title: "UNCOVERED: catspiracy to bring down democracy",
                                                    topic: "cats",
                                                    author: "rogersop",
                                                    body: "Bastet walks amongst us, and the cats are taking arms!",
                                                    created_at: "2020-08-03T13:14:00.000Z",
                                                    votes: -10,
                                                    article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
                })
        })
    })
    test('should return the updated article object with a 201 status code when passed a request with extra properties',()=>{
        return request(app)
        .patch('/api/articles/4')
        .send({ inc_votes : 10,
                extra_field: "extra value"})
        .expect(201).then((res)=>{
            expect(res.body.article).toMatchObject({
                                                    article_id: 4,
                                                    title: "Student SUES Mitch!",
                                                    topic: "mitch",
                                                    author: "rogersop",
                                                    body: "We all love Mitch and his wonderful, unique typing style. However, the volume of his typing has ALLEGEDLY burst another students eardrums, and they are now suing for damages",
                                                    created_at: "2020-05-06T01:14:00.000Z",
                                                    votes: 10,
                                                    article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",            })
        })
    })
    test('should return 404 Not found if given an article_id that does not exist',()=>{
        return request(app)
        .patch('/api/articles/999')
        .send({ inc_votes : 100 })
        .expect(404).then((res)=>{
            expect(res.body.message).toBe('Article not found')
        })
    })
    test('should return 400 Bad Request if given an invalid article_id',()=>{
        return request(app)
        .patch('/api/articles/notAnId')
        .send({ inc_votes : 100 })
        .expect(400).then((res)=>{
            expect(res.body.message).toBe('Invalid ID')
        })
    })
    test('should return a 400 Bad Request if the object passed is incorrectly formatted - wrong field name',()=>{
        return request(app)
        .patch('/api/articles/2')
        .send({ inc : 100 })
        .expect(400)
        .then ((res)=>{
            expect(res.body.message).toBe('Bad request, request missing required columns')
        })
    })
    test('should return a 400 Bad Request if the object passed is incorrectly formatted - missing field name',()=>{
        return request(app)
        .patch('/api/articles/2')
        .send({})
        .expect(400)
        .then ((res)=>{
            expect(res.body.message).toBe('Bad request, request missing required columns')
        })
    })
})

describe('POST /api/articles/:article_id/comments', () => {
    test('should return 201 status code and return the new posted comment', () => {
        const newComment = {
                            username: 'butter_bridge',
                            body: 'great article'
                            }
        return request(app)
        .post('/api/articles/1/comments')
        .send(newComment)
        .expect(201)
        .then((res) => {
            expect(res.body.comment).toMatchObject({
                                                        comment_id: 19,
                                                        body: 'great article',
                                                        article_id: 1,
                                                        author: 'butter_bridge',
                                                        votes: 0,
                                                        created_at: expect.any(String)
                                                    })
        })
    });
    test('should return 201 status code and return the new posted comment when passed a request with an extra field', () => {
        const newComment = {
                            username: 'butter_bridge',
                            body: 'amazing article',
                            extraKey: 'extraValue'
                            }
        return request(app)
        .post('/api/articles/2/comments')
        .send(newComment)
        .expect(201)
        .then((res) => {
            expect(res.body.comment).toMatchObject({
                                                        comment_id: 20,
                                                        body: 'amazing article',
                                                        article_id: 2,
                                                        author: 'butter_bridge',
                                                        votes: 0,
                                                        created_at: expect.any(String)
                                                    })
        })
    });
    test('should return 404 Not Found if given an article_id that does not exist',()=>{
        const newComment = {
            username: 'butter_bridge',
            body: 'great article'
            }
        return request(app)
        .post('/api/articles/999/comments')
        .send(newComment)
        .expect(404)
        .then((res) => {
            expect(res.body.message).toBe('Not found')
        })
    })
    test('should return 400 Bad Request if given an invalid article_id',()=>{
        const newComment = {
            username: 'butter_bridge',
            body: 'great article'
            }
        return request(app)
        .post('/api/articles/notAnId/comments')
        .send(newComment)
        .expect(400)
        .then(({body})=>{
            expect(body.message).toBe('Invalid ID')
        })
    })
    test('should return a 400 Bad Request if the object passed is incorrectly formatted - key is name rather than username',()=>{
        const newComment = {
            name: 'butter_bridge',
            body: 'great article'
            }
        return request(app)
        .post('/api/articles/1/comments')
        .send(newComment)
        .expect(400)
        .then ((res)=>{
            expect(res.body.message).toBe('Bad request, request missing required columns')
        })
    })
    test('should return a 400 Bad Request if the object passed is missing required properties - missing key body',()=>{
        const newComment = {
            username: 'butter_bridge',
            }
        return request(app)
        .post('/api/articles/1/comments')
        .send(newComment)
        .expect(400)
        .then ((res)=>{
            expect(res.body.message).toBe('Bad request, request missing required columns')
        })
    }) 
    test('should return a 404 Not Found if the object passed has bad values - username must appear in users table to be accepted',()=>{
        const newComment = {
            username: 'milbot1992',
            body: 'fab article'
            }
        return request(app)
        .post('/api/articles/1/comments')
        .send(newComment)
        .expect(404)
        .then ((res)=>{
            expect(res.body.message).toBe('Not found')
        })
    })
})
describe('DELETE /api/comments/:comment_id',()=>{
    test('should return a 204 status code and no content - specified comment_id should be deleted from comments table',()=>{
        return request(app)
        .delete('/api/comments/18')
        .expect(204)
        .then((res)=>{
            expect(res.text).toBe('')
        return db.query('SELECT * FROM comments')
        .then((comments) => {
            if(comments.length > 0) {
                comments.rows.forEach((comment)=>{
                    expect(comment.comment_id).not.toBe(18)
                })
            }
        })
        })
    })
    test('should return a 404 if given a comment_id that does not exist',()=>{
        return request(app)
        .delete('/api/comments/999')
        .expect(404).then(({body})=>{
            expect(body.message).toBe('Comment not found')
        })
    })
    test('should return a 400 if given an invalid comment_id',()=>{
        return request(app)
        .delete('/api/comments/notAnId')
        .expect(400).then(({body})=>{
            expect(body.message).toBe('Invalid ID')
        })
    })
})
