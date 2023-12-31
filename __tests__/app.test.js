const {db} = require('../db/connection')
const app = require('../app/app')
const request = require('supertest')
const seed = require('../db/seeds/seed.js')
const data = require('../db/data/test-data')
const { expect } = require('@jest/globals')

beforeEach(()=>seed(data))
afterAll(()=>db.end())

describe('/api', () => {
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
    });
})

describe('/api/topics', () => {
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
    describe('POST api/topics', () => {
        test('should return 201 status code and return the new posted topic', () => {
            const newTopic = {
                                "slug": "New topic",
                                "description": "this topic is new"
                            }
            return request(app)
            .post('/api/topics')
            .send(newTopic)
            .expect(201)
            .then((res) => {
                expect(res.body.topic).toMatchObject({
                                                    slug: "New topic",
                                                    description: "this topic is new"
                                                    })
            })
        });
        test('should return 201 status code and return the new posted topic when passed a request with an extra field', () => {
            const newTopic = {
                                "slug": "New topic 2",
                                "description": "this topic is new",
                                "extra_key": 'extra-value'
                            }
            return request(app)
            .post('/api/topics')
            .send(newTopic)
            .expect(201)
            .then((res) => {
                expect(res.body.topic).toMatchObject({
                                                        slug: "New topic 2",
                                                        description: "this topic is new"
                                                        })
            })
        });
        test('should return a 400 Bad Request if the object passed is incorrectly formatted - first key incorrectly spelt',()=>{
            const newTopic = {
                                "sluggg": "New topic",
                                "description": "this topic is new",
                            }
            return request(app)
            .post('/api/topics')
            .send(newTopic)
            .expect(400)
            .then ((res)=>{
                expect(res.body.message).toBe('Bad request, request missing required columns')
            })
        })
        test('should return a 400 Bad Request if the object passed is missing required properties - missing key: slug',()=>{
            const newTopic = {
                                "description": "this topic is new"
                            }
            return request(app)
            .post('/api/topics')
            .send(newTopic)
            .expect(400)
            .then ((res)=>{
                expect(res.body.message).toBe('Bad request, request missing required columns')
            })
        }) 
    });
});

describe('/api/articles', () => {
    describe('GET /api/articles', () => {
        describe('Tests for path with no queries', () => {
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
        });
        describe('Tests for when a topic query is entered', () => {
            test('should return an array of only articles of a certain specified topic - cats', () => {
                return request(app)
                .get('/api/articles?topic=cats')
                .expect(200)
                .then(({body}) => {
                    body.articles.forEach((article)=>{
                        expect(article.topic).toBe('cats')
                })
            })
            })
            test('should return a 404, not found when a non-existent topic query is entered - dogs', () => {
                return request(app)
                .get('/api/articles?topic=dogs')
                .expect(404)
                .then((response) => {
                    expect(response.body.message).toBe('Non-existent topic query: dogs')
                })
            })
            test('should return 200 status code and an empty array for valid topic with no articles', () => {
                return request(app)
                .get('/api/articles?topic=paper')
                .expect(200)
                .then(({body}) => {
                    expect(body.articles).toHaveLength(0)
                    expect(body.articles).toEqual([])
                })
            })
        });
        describe('Tests for sort_by query', () => {
            test('should return an array of article objects ordered by specified field desc', () => {
                return request(app)
                .get('/api/articles?sort_by=title')
                .expect(200)
                .then(({body}) => {
                    expect(body.articles).toBeSortedBy('title', {descending: true})
                })
            })
            test('should return a 400, bad request when an invalid sort_by field is entered', () => {
                return request(app)
                .get('/api/articles?sort_by=notValidSort')
                .expect(400)
                .then((response) => {
                    expect(response.body.message).toBe('Invalid search query')
                })
            })
        });
        describe('Tests for order query', () => {
            test('should return an array of articles sorted in ascending order when passed a query order=asc', () => {
                return request(app)
                .get('/api/articles?order=asc')
                .expect(200)
                .then(({body}) => {
                    expect(body.articles).toBeSortedBy('created_at')
                })
            })
            test('should return a 400, bad request when an invalid order field is entered', () => {
                return request(app)
                .get('/api/articles?order=ascc')
                .expect(400)
                .then((response) => {
                    expect(response.body.message).toBe('Invalid search query')
                })
            })
        });
        describe('Tests for limit and pagination queries', () => {
            test('checking limit parameter: should return an object with accurate list of articles and total_count - limit=2, page=default(1)', () => {
                return request(app)
                .get('/api/articles?limit=2')
                .expect(200)
                .then((res) => {
                    expect(res.body.total_count).toBe(13)
                    expect(res.body.articles).toMatchObject([{
                                                            author: 'icellusedkars',
                                                            title: 'Eight pug gifs that remind me of mitch',
                                                            article_id: 3,
                                                            topic: 'mitch',
                                                            created_at: "2020-11-03T09:12:00.000Z",
                                                            votes: 0,
                                                            article_img_url: 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
                                                            comment_count: '2'
                                                        },
                                                        {
                                                            author: 'icellusedkars',
                                                            title: 'A',
                                                            article_id: 6,
                                                            topic: 'mitch',
                                                            created_at: "2020-10-18T01:00:00.000Z",
                                                            votes: 0,
                                                            article_img_url: 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
                                                            comment_count: '1'
                    }
                    ])
                })
            });
            test('checking pagination parameter: should return an object with accurate list of articles and total_count - limit=2, page =2', () => {
                return request(app)
                .get('/api/articles?limit=2&p=2')
                .expect(200)
                .then((res) => {
                    expect(res.body.total_count).toBe(13)
                    expect(res.body.articles).toMatchObject([{
                                                            author: 'icellusedkars',
                                                            title: 'Sony Vaio; or, The Laptop',
                                                            article_id: 2,
                                                            topic: 'mitch',
                                                            created_at: "2020-10-16T05:03:00.000Z",
                                                            votes: 0,
                                                            article_img_url: 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
                                                            comment_count: '0'
                                                        },
                                                        {
                                                            author: 'butter_bridge',
                                                            title: 'Another article about Mitch',
                                                            article_id: 13,
                                                            topic: 'mitch',
                                                            created_at: "2020-10-11T11:24:00.000Z",
                                                            votes: 0,
                                                            article_img_url: 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
                                                            comment_count: '0'
                    }
                    ])
                })
            })
            test('should return empty articles array when page entered is higher than number of articles that we have', async () => {
                return request(app)
                .get('/api/articles?p=5')
                .expect(200)
                .then((res) => {
                    expect(res.body.total_count).toBe(13)
                    expect(res.body.articles).toMatchObject([])
                })
            });
            test('should return 400 Bad Request when limit parameter is invalid', async () => {
                return request(app)
                .get('/api/articles?topic=cats&limit=invalid')
                .expect(400)
                .then((res) => {
                    expect(res.body.message).toBe('Invalid search query');
                })
            });
            test('should return 400 Bad Request when pagination parameter is invalid', async () => {
                return request(app)
                .get('/api/articles?topic=cats&p=invalid')
                .expect(400)
                .then((res) => {
                    expect(res.body.message).toBe('Invalid search query');
                })
            });
        });
    });
    describe('POST /api/articles', () => {
        test('should return 201 status code and return the new posted article', () => {
            const newArticle = {
                                title: "Test Article",
                                topic: "paper",
                                author: "lurker",
                                body: "Test article to ensure it is added to articles",
                                article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                                }
            return request(app)
            .post('/api/articles')
            .send(newArticle)
            .expect(201)
            .then((res) => {
                expect(res.body.article).toMatchObject({
                                                        article_id: 14,
                                                        title: "Test Article",
                                                        topic: "paper",
                                                        author: "lurker",
                                                        votes: 0,
                                                        body: "Test article to ensure it is added to articles",
                                                        article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                                                        created_at: expect.any(String)
                                                        })
            })
        });
        test('should return 201 status code and return the new posted article when passed a request with an extra field', () => {
            const newArticle = {
                                title: "Test Article 2",
                                topic: "cats",
                                author: "lurker",
                                body: "Test article 2 to ensure it is added to articles",
                                extra_key: 'extra-value',
                                article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                                }
            return request(app)
            .post('/api/articles')
            .send(newArticle)
            .expect(201)
            .then((res) => {
                expect(res.body.article).toMatchObject({
                                                        article_id: 14,
                                                        title: "Test Article 2",
                                                        topic: "cats",
                                                        author: "lurker",
                                                        votes: 0,
                                                        body: "Test article 2 to ensure it is added to articles",
                                                        article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                                                        created_at: expect.any(String)
                                                        })
            })
        });
        test('should return a 400 Bad Request if the object passed is incorrectly formatted - first key incorrectly spelt',()=>{
            const newArticle = {
                                titleee: "Test Article 3",
                                topic: "mitch",
                                author: "lurker",
                                body: "Test article 3 to ensure it is added to articles",
                                article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                                }
            return request(app)
            .post('/api/articles')
            .send(newArticle)
            .expect(400)
            .then ((res)=>{
                expect(res.body.message).toBe('Bad request, request missing required columns')
            })
        })
        test('should return a 400 Bad Request if the object passed is missing required properties - missing key: title',()=>{
            const newArticle = {
                                topic: "cats",
                                author: "lurker",
                                body: "Test article 3 bad request",
                                article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                                }
            return request(app)
            .post('/api/articles')
            .send(newArticle)
            .expect(400)
            .then ((res)=>{
                expect(res.body.message).toBe('Bad request, request missing required columns')
            })
        }) 
        test('should return a 404 Not Found if the object passed has bad values - topic must appear in topics table to be accepted',()=>{
            const newArticle = {
                                title: "Test Article 5",
                                topic: "notAValidTopic",
                                author: "lurker",
                                body: "Test article 3 bad request",
                                article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                                }
            return request(app)
            .post('/api/articles')
            .send(newArticle)
            .expect(404)
            .then ((res)=>{
                expect(res.body.message).toBe('Not found')
            })
        })
        test('should return a 404 Not Found if the object passed has bad values - author must appear in users table to be accepted',()=>{
            const newArticle = {
                                title: "Test Article 5",
                                topic: "cats",
                                author: "lurkernotAValidAuthor",
                                body: "Test article 3 bad request",
                                article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                                }
            return request(app)
            .post('/api/articles')
            .send(newArticle)
            .expect(404)
            .then ((res)=>{
                expect(res.body.message).toBe('Not found')
            })
        })
        test('should return a 404 Not Found if the object passed has bad values - topic must have a value',()=>{
            const newArticle = {
                                title: "Test Article 6",
                                topic: "",
                                author: "lurker",
                                body: "Test article 6 bad request",
                                article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                                }
            return request(app)
            .post('/api/articles')
            .send(newArticle)
            .expect(404)
            .then ((res)=>{
                expect(res.body.message).toBe('Not found')
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
                expect(body.article).toMatchObject({article_id: expect.any(Number),
                                                author: expect.any(String),
                                                title: expect.any(String),
                                                body: expect.any(String),
                                                topic: expect.any(String),
                                                created_at: expect.any(String),
                                                votes: expect.any(Number),
                                                article_img_url: expect.any(String),
                                                comment_count: expect.any(String),
                                            })
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
    describe('DELETE /api/articles/:article_id',()=>{
        test('should return a 204 status code and no content - specified article_id should be deleted from articles table',()=>{
            return request(app)
            .delete('/api/articles/3')
            .expect(204)
            .then((res)=>{
                expect(res.text).toBe('')
            return db.query('SELECT * FROM articles')
            .then((articles) => {
                expect(articles.rows.length).toBe(12)
                if(articles.rows.length > 0) {
                    articles.rows.forEach((article)=>{
                        expect(articles.article_id).not.toBe(3)
                    })
                }
            })
            })
        })
        test('should return a 204 status code and no content - comments for specified article_id should be deleted from comments table',()=>{
            return request(app)
            .delete('/api/articles/1')
            .expect(204)
            .then((res)=>{
                expect(res.text).toBe('')
            return db.query('SELECT * FROM comments')
            .then((comments) => {
                expect(comments.rows.length).toBe(7)
                if(comments.rows.length > 0) {
                    comments.rows.forEach((comment)=>{
                        expect(comment.article_id).not.toBe(1)
                    })
                }
            })
            })
        })
        test('should return a 404 if given an article_id that does not exist',()=>{
            return request(app)
            .delete('/api/articles/999')
            .expect(404).then(({body})=>{
                expect(body.message).toBe('Article not found')
            })
        })
        test('should return a 400 if given an invalid article_id',()=>{
            return request(app)
            .delete('/api/articles/notAnId')
            .expect(400).then(({body})=>{
                expect(body.message).toBe('Invalid ID')
            })
        })
    })
    describe('GET /api/articles/:article_id/comments', () => {
        describe('Tests for path with no queries', () => {
            test('should return 200 status code and an array of comments for specified article', () => {
                return request(app)
                .get('/api/articles/3/comments')
                .expect(200)
                .then(({body}) => {
                    expect(body.comments).toHaveLength(2)
                    expect(body.comments).toBeSortedBy('created_at', {descending: true})
                    body.comments.forEach((comment)=>{
                        expect(comment).toMatchObject({comment_id: expect.any(Number),
                                                    votes: expect.any(Number),
                                                    created_at: expect.any(String),
                                                    author: expect.any(String),
                                                    body: expect.any(String),
                                                    article_id: expect.any(Number)
                                                })
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
        });
        describe('Tests for limit and pagination queries', () => {
            test('checking limit parameter: should return an object with accurate list of comments and total_count - limit=2, page=default(1)', () => {
                return request(app)
                .get('/api/articles/1/comments?limit=2')
                .expect(200)
                .then((res) => {
                    expect(res.body.total_count).toBe(11)
                    expect(res.body.comments).toMatchObject([{
                                                                comment_id: 5,
                                                                body: 'I hate streaming noses',
                                                                article_id: 1,
                                                                author: 'icellusedkars',
                                                                votes: 0,
                                                                created_at: "2020-11-03T21:00:00.000Z"
                                                            },
                                                            {
                                                                comment_id: 2,
                                                                body: 'The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.',
                                                                article_id: 1,
                                                                author: 'butter_bridge',
                                                                votes: 14,
                                                                created_at: "2020-10-31T03:03:00.000Z"
                                                            }
                    ])
                })
            });
            test('checking pagination parameter: should return an object with accurate list of comments and total_count - limit=2, page =2', () => {
                return request(app)
                .get('/api/articles/1/comments?limit=2&p=2')
                .expect(200)
                .then((res) => {
                    expect(res.body.total_count).toBe(11)
                    expect(res.body.comments).toMatchObject([{
                                                            comment_id: 18,
                                                            body: 'This morning, I showered for nine minutes.',
                                                            article_id: 1,
                                                            author: 'butter_bridge',
                                                            votes: 16,
                                                            created_at: '2020-07-21T00:20:00.000Z'
                                                            },
                                                            {
                                                            comment_id: 13,
                                                            body: 'Fruit pastilles',
                                                            article_id: 1,
                                                            author: 'icellusedkars',
                                                            votes: 0,
                                                            created_at: '2020-06-15T10:25:00.000Z'
                    }
                    ])
                })
            })
            test('should return empty articles array when page entered is higher than number of articles that we have', async () => {
                return request(app)
                .get('/api/articles/1/comments?p=5')
                .expect(200)
                .then((res) => {
                    expect(res.body.total_count).toBe(11)
                    expect(res.body.comments).toMatchObject([])
                })
            });
            test('should return 400 Bad Request when limit parameter is invalid', async () => {
                return request(app)
                .get('/api/articles/1/comments?topic=cats&limit=invalid')
                .expect(400)
                .then((res) => {
                    expect(res.body.message).toBe('Invalid search query');
                })
            });
            test('should return 400 Bad Request when pagination parameter is invalid', async () => {
                return request(app)
                .get('/api/articles/1/comments?topic=cats&p=invalid')
                .expect(400)
                .then((res) => {
                    expect(res.body.message).toBe('Invalid search query');
                })
            });
        });
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
                                                            comment_id: 19,
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
});

describe('/api/users', () => {
    describe('GET /api/users', () => {
        test('should return 200 status code and an array of users objects', () => {
            return request(app)
            .get('/api/users')
            .expect(200)
            .then(({body}) => {
                expect(body.users).toHaveLength(4)
                body.users.forEach((user)=>{
                    expect(user).toMatchObject({username: expect.any(String),
                                                name: expect.any(String),
                                                avatar_url: expect.any(String)
                                            })
                })
            })
        })
    })
    describe('GET /api/users/:username', () => {
        test('should return 200 status code and a user object with the correct username', () => {
            return request(app)
            .get('/api/users/icellusedkars')
            .expect(200)
            .then(({body}) => {
                expect(body.user.username).toBe('icellusedkars')
                expect(body.user).toMatchObject({username: 'icellusedkars',
                                                name: 'sam',
                                                avatar_url: 'https://avatars2.githubusercontent.com/u/24604688?s=460&v=4'
                                            })
            })
        })
        test('should return 404 Not found if given a username that does not exist',()=>{
            return request(app)
            .get('/api/users/milbot1992')
            .expect(404)
            .then((res) => {
                expect(res.body.message).toBe('Article not found')
            })
        })
    })
});

describe('/api/comments', () => {
    describe('DELETE /api/comments/:comment_id',()=>{
        test('should return a 204 status code and no content - specified comment_id should be deleted from comments table',()=>{
            return request(app)
            .delete('/api/comments/18')
            .expect(204)
            .then((res)=>{
                expect(res.text).toBe('')
            return db.query('SELECT * FROM comments')
            .then((comments) => {
                expect(comments.rows.length).toBe(17)
                if(comments.rows.length > 0) {
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
    describe('PATCH /api/comments/:comment_id',()=>{
        test('should return the updated comment object with a 201 status code when passed a positive inc_votes',()=>{
            return request(app)
            .patch('/api/comments/1')
            .send({ inc_votes : 10 })
            .expect(201).then((res)=>{
                expect(res.body.comment).toMatchObject({
                                                        comment_id: 1,
                                                        body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
                                                        votes: 26,
                                                        author: "butter_bridge",
                                                        article_id: 9,
                                                        created_at: "2020-04-06T12:17:00.000Z"            
                                                        })
            })
        })
        test('should return the updated comment object with a 201 status code  when passed a negative inc_votes',()=>{
            return request(app)
            .patch('/api/comments/5')
            .send({ inc_votes : -10 })
            .expect(201).then((res)=>{
                expect(res.body.comment).toMatchObject({
                                                        comment_id: 5,
                                                        body: "I hate streaming noses",
                                                        votes: -10,
                                                        author: "icellusedkars",
                                                        article_id: 1,
                                                        created_at: "2020-11-03T21:00:00.000Z",                
                                                        })
            })
        })
        test('should return the updated comment object with a 201 status code when passed a request with extra properties',()=>{
            return request(app)
            .patch('/api/comments/4')
            .send({ inc_votes : 10,
                    extra_field: "extra value"})
            .expect(201).then((res)=>{
                expect(res.body.comment).toMatchObject({
                                                        comment_id: 4,
                                                        body: " I carry a log — yes. Is it funny to you? It is not to me.",
                                                        votes: -90,
                                                        author: "icellusedkars",
                                                        article_id: 1,
                                                        created_at: "2020-02-23T12:01:00.000Z",        
                                                        })
            })
        })
        test('should return 404 Not found if given a comment_id that does not exist',()=>{
            return request(app)
            .patch('/api/comments/999')
            .send({ inc_votes : 100 })
            .expect(404).then((res)=>{
                expect(res.body.message).toBe('Comment not found')
            })
        })
        test('should return 400 Bad Request if given an invalid comment_id',()=>{
            return request(app)
            .patch('/api/comments/notAnId')
            .send({ inc_votes : 100 })
            .expect(400).then((res)=>{
                expect(res.body.message).toBe('Invalid ID')
            })
        })
        test('should return a 400 Bad Request if the object passed is incorrectly formatted - wrong field name',()=>{
            return request(app)
            .patch('/api/comments/2')
            .send({ inc : 100 })
            .expect(400)
            .then ((res)=>{
                expect(res.body.message).toBe('Bad request, request missing required columns')
            })
        })
        test('should return a 400 Bad Request if the object passed is incorrectly formatted - missing field name',()=>{
            return request(app)
            .patch('/api/comments/2')
            .send({})
            .expect(400)
            .then ((res)=>{
                expect(res.body.message).toBe('Bad request, request missing required columns')
            })
        })
    })
});

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