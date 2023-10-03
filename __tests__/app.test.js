const { db } = require('../db/connection')
const app = require('../app/app')
const request = require('supertest')
const seed = require('../db/seeds/seed.js')
const data = require('../db/data/test-data')

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
    test('should return 400 Bad Request if given an invalid id',()=>{
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