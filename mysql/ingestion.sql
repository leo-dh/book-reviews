USE `reviews`;

CREATE TABLE `user_reviews` (
  `review_id` integer AUTO_INCREMENT NOT NULL PRIMARY KEY,
  `asin` varchar(10) NOT NULL,
  `helpful_num` integer NOT NULL,
  `helpful_denom` integer NOT NULL,
  `overall` integer NOT NULL,
  `text` longtext NOT NULL,
  `summary` varchar(512) NOT NULL,
  `date` datetime(6) NOT NULL,
  `reviewer_id` varchar(32) NOT NULL,
  `reviewer_name` varchar(64) NOT NULL
);

LOAD DATA INFILE '/var/lib/mysql-files/kindle_reviews.csv' INTO TABLE `user_reviews` FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"' ESCAPED BY '' LINES TERMINATED BY '\n' IGNORE 1 ROWS (
  review_id,
  asin,
  overall,
  text,
  reviewer_id,
  reviewer_name,
  summary,
  @date,
  helpful_num,
  helpful_denom
)
SET
  date = CONVERT_TZ(
    STR_TO_DATE(@date, '%Y-%m-%d %H:%i:%s+08:00'),
    '+08:00',
    'system'
  );

