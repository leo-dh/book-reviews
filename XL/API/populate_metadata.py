"""
Populate metadata data into the MongoDB database
"""

import json
from tqdm import tqdm
from documents.models import Metadata

def get_data():
	print("Loading file from JSON...")
	with open("../kindle_metadata.json", "r") as f:
		metadatas = json.load(f)
	print("Done\n")

	return metadatas

def upload_data(metadatas):
	print("Building Metadata objects...")
	metadata_objects = [Metadata(**metadata) for metadata in tqdm(metadatas)]
	print("Done\n")

	print("Uploading to database...")
	for objects in tqdm(metadata_objects[::10000]):
		print(type(objects))
		Metadata.objects.bulk_create(objects)
	print("Done\n")

def upload_stream(directory="../kindle_metadata_stream.json", batch_size=10000):
	num_lines = sum(1 for line in open(directory, "r"))
	print(f"Uploading {num_lines} entries with batch size of {batch_size}...")
	batches = num_lines//batch_size + (1 if num_lines % batch_size else 0)
	with open(directory, "r") as f:
		for _ in tqdm(range(batches)):
			objects = []
			for _ in range(batch_size):
				line = f.readline()
				if not line.strip(): break
				objects.append(Metadata(**json.loads(line)))
			Metadata.objects.bulk_create(objects)
	print("Done\n")