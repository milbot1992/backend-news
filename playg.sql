\c nc_news_test

SELECT * FROM topics;
SELECT * FROM users;
SELECT * FROM articles;
SELECT * FROM comments;

<<<<<<< HEAD
INSERT INTO comments
(body, article_id, author, votes, created_at)
VALUES
('great article','1','butter_bridge','0','2023-10-02 14:53:15.796+00')
RETURNING*;
=======
SELECT
                        articles.author, articles.title, articles.article_id, articles.topic,
                        articles.created_at, articles.votes, articles.article_img_url,
                        COUNT(comments.comment_id) AS comment_count
                        FROM articles
                        LEFT JOIN comments ON comments.article_id = articles.article_id
                        GROUP BY articles.author, articles.title, articles.article_id, articles.topic,
                        articles.created_at, articles.votes, articles.article_img_url
                        ORDER BY articles.created_at;
>>>>>>> main
