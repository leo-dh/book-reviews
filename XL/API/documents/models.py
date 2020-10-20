import os
from pymongo import MongoClient

client = MongoClient(
	host=os.getenv("DB_DOCUMENTS_HOST"),
	username=os.getenv("DB_DOCUMENTS_USER"),
	password=os.getenv("DB_DOCUMENTS_PASSWORD"),
	port=int(os.getenv("DB_DOCUMENTS_PORT"))
)

db = client.database

class QuerySet:
	def __init__(self, collection, query, multi):
		self._collection = collection
		self._query = self._evaluate_query(query)
		self._multi = multi

	def _evaluate_query(self, query):
		evaluation = {}
		for key, value in query.items():
			terms = key.split("__")
			assert 1 <= len(terms) <= 2
			if key == "__text":
				evaluation["$text"] = {"$search": value}
			elif len(terms) == 1:
				evaluation[key] = value
			elif len(terms) == 2:
				target, expression = terms
				query_types = ["eq", "gt", "gte", "in", "lt", "lte", "ne", "nin", "regex", "exists"]
				if expression not in query_types: raise ValueError("Invalid query expression.")

				evaluation[target] = {**evaluation.get(target, {}), f"${expression}": value}

		return evaluation

	def values(self):
		return list(self._collection.find(self._query)) if self._multi else self._collection.find_one(self._query)

	def count(self):
		return self._collection.count_documents(self._query)

	def update(self, **data):
		return self._collection.update_many(self._query, {"$set": data}) if self._multi else self._collection.update_one(self._query, {"$set": data})

	def delete(self):
		return self._collection.delete_many(self._query) if self._multi else self._collection.delete_one(self._query)

class ModelObject:
	def __init__(self, name):
		self._name = name
		self._collection = db[name.lower()]

	def create(self, **data):
		return self._collection.insert_one(data).inserted_id

	def bulk_create(self, data):
		for obj in data:
			assert obj.name == self._name
		return self._collection.insert_many([obj.properties for obj in data]).inserted_ids

	def get(self, **query):
		return QuerySet(self._collection, query, multi=False)

	def filter(self, **query):
		return QuerySet(self._collection, query, multi=True)

	def all(self):
		return self.filter()

	def count(self):
		return self.all().count()


class Model(type):
	def __new__(cls, name, bases, attrs, **kwargs):
		super_new = super().__new__
		new_class = super_new(cls, name, bases, attrs, **kwargs)
		setattr(new_class, "objects", ModelObject(name))
		setattr(new_class, "name", name)
		setattr(new_class, "collection", db[name.lower()])
		return new_class

class PropertyHandler:
	def __init__(self, **properties):
		self.properties = properties

class Metadata(PropertyHandler, metaclass=Model):
	pass

class Log(PropertyHandler, metaclass=Model):
	pass

# class Item(models.Model):
# 	asin = models.CharField(max_length=10) # exact: 10

# 	class Meta:
# 		abstract = True

# class Related(models.Model):
# 	bought_together = models.ArrayField(model_container=Item, null=True)
# 	buy_after_viewing = models.ArrayField(model_container=Item, null=True)
# 	also_bought = models.ArrayField(model_container=Item, null=True)
# 	also_viewed = models.ArrayField(model_container=Item, null=True)

# 	class Meta:
# 		abstract = True

# class Subcategory(models.Model):
# 	name = models.CharField(max_length=128)

# 	class Meta:
# 		abstract = True

# class Category(models.Model):
# 	categories = models.ArrayField(model_container=Subcategory)

# 	class Meta:
# 		abstract = True

# class SalesRank(models.Model):
# 	name = models.CharField(max_length=128)
# 	sales = models.IntegerField()

# 	class Meta:
# 		abstract = True


# class Metadata(models.Model):
# 	asin = models.CharField(max_length=10) # exact: 10
# 	title = models.CharField(max_length=256, null=True) # max: 221
# 	description = models.TextField(null=True)
# 	price = models.FloatField(null=True)
# 	im_url = models.CharField(max_length=256, null=True) # max: 172
# 	related = models.EmbeddedField(model_container=Related, null=True)
# 	sales_rank = models.EmbeddedField(model_container=SalesRank, null=True)
# 	brand = models.CharField(max_length=256, null=True) # max: 21
# 	categories = models.ArrayField(model_container=Category)

# 	def values(self):
# 		return model_to_dict(self)


# class Log(models.Model):
#     def values(self):
#         return model_to_dict(self)