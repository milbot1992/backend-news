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
            expect(res.body.message).toBe('Article does not exist')
        })
    })
    test('should return 400 Bad Request if given an invalid id',()=>{
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
    test('should return 404 Not found if given an id that does not exist',()=>{
        return request(app)
        .patch('/api/articles/999')
        .send({ inc_votes : 100 })
        .expect(404).then((res)=>{
            expect(res.body.message).toBe('Article does not exist')
        })
    })
    test('should return 400 Bad Request if given an invalid id',()=>{
        return request(app)
        .patch('/api/articles/notAnId')
        .send({ inc_votes : 100 })
        .expect(400).then((res)=>{
            expect(res.body.message).toBe('Invalid ID')
        })
    })
    test('should return a 400 Bad Request if the object passed is incorrectly formatted',()=>{
        return request(app)
        .patch('/api/articles/2')
        .send({ inc : 100 })
        .expect(400)
        .then ((res)=>{
            expect(res.body.message).toBe('Bad request, request missing required columns')
        })
    })
})