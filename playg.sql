\c nc_news_test

SELECT * FROM topics;
SELECT * FROM users;
SELECT * FROM articles;
SELECT * FROM comments;

INSERT INTO comments
(body, article_id, author, votes, created_at)
VALUES
('great article','1','butter_bridge','0','2023-10-02 14:53:15.796+00')
RETURNING*;