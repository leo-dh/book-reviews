"""
Populate reviews data into the PostgreSQL database
"""

import pandas as pd
from tqdm import tqdm
from datetime import datetime
from reviews.models import Review

def get_data():
	print("Loading file from CSV...")
	reviews = pd.read_csv("../kindle_reviews.csv") \
		.rename({
			"Unnamed: 0": "review_id",
			"reviewText": "text",
			"reviewerID": "reviewer_id",
			"reviewerName": "reviewer_name",
		}, axis=1)
	print("Done\n")

	locale = datetime.now().astimezone().tzinfo

	print("Performing data formatting...")
	reviews["date"] = reviews.unixReviewTime.map(lambda x: datetime.fromtimestamp(x).replace(tzinfo=locale))
	reviews["helpful_num"] = reviews.helpful.map(lambda x: int(x.strip("[]").split(", ")[0]))
	reviews["helpful_denom"] = reviews.helpful.map(lambda x: int(x.strip("[]").split(", ")[0]))

	reviews.drop(["helpful", "reviewTime", "unixReviewTime"], axis=1, inplace=True)
	print("Done\n")

	return reviews

def upload_data(reviews):
	print("Converting DataFrame to dictionary...")
	reviews = reviews.to_dict(orient="records")
	print("Done\n")

	print("Building Review objects...")
	review_objects = [Review(**review) for review in tqdm(reviews)]
	print("Done\n")

	print("Uploading to database...")
	batch_size = 10000
	batches = len(reviews)//batch_size + (1 if len(reviews) % batch_size else 0)
	for ind in tqdm(range(batches)):
		objects = review_objects[ind * batch_size:(ind + 1) * batch_size]
		Review.objects.bulk_create(objects)
	print("Done\n")

