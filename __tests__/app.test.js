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
        // .expect(404)
        .then((res) => {
            expect(res.body.message).toBe('Article does not exist')
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