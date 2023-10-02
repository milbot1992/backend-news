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
                expect(article).toHaveProperty('author')
                expect(article).toHaveProperty('title')
                expect(article).toHaveProperty('article_id')
                expect(article).toHaveProperty('topic')
                expect(article).toHaveProperty('created_at')
                expect(article).toHaveProperty('votes')
                expect(article).toHaveProperty('article_img_url')
                expect(article).toHaveProperty('comment_count')
                expect(article).not.toHaveProperty('body')
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