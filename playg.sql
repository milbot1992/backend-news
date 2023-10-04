\c nc_news_test

SELECT * FROM topics;
SELECT * FROM users;
SELECT * FROM articles;
SELECT * FROM comments;

SELECT DISTINCT slug FROM topics;

 SELECT
                        articles.author, articles.title, articles.article_id, articles.topic,
                        articles.created_at, articles.votes, articles.article_img_url,
                        COUNT(comments.comment_id) AS comment_count
                        FROM articles
                        LEFT JOIN comments ON comments.article_id = articles.article_id WHERE articles.topic = cats GROUP BY articles.author, articles.title, articles.article_id, articles.topic,
                        articles.created_at, articles.votes, articles.article_img_url
                        ORDER BY articles.created_at desc;