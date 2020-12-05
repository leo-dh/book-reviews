USE `reviews`;

LOAD DATA INFILE '/var/lib/mysql-files/kindle_reviews.csv'
INTO TABLE `reviews_review`
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
ESCAPED BY ''
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(review_id, asin, overall, text, reviewer_id, reviewer_name, summary, @date, helpful_num, helpful_denom)
SET date = CONVERT_TZ(STR_TO_DATE(@date, '%Y-%m-%d %H:%i:%s+08:00'), '+08:00', 'system');