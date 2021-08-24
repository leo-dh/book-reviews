import random
import string

from application.utils import manage_env
from pymongo import MongoClient
from pymongo.collection import Collection

MONGO_URI = manage_env("MONGO_URI")
client = MongoClient(
    MONGO_URI.format(user="django", password=manage_env("MONGO_PASSWORD"))
)

db = client.bookreviews


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
                query_types = [
                    "eq",
                    "gt",
                    "gte",
                    "in",
                    "lt",
                    "lte",
                    "ne",
                    "nin",
                    "regex",
                    "exists",
                ]
                if expression not in query_types:
                    raise ValueError("Invalid query expression.")

                evaluation[target] = {
                    **evaluation.get(target, {}),
                    f"${expression}": value,
                }

        return evaluation

    def values(self):
        return (
            list(self._collection.find(self._query))
            if self._multi
            else self._collection.find_one(self._query)
        )

    def count(self):
        return self._collection.count_documents(self._query)

    def update(self, **data):
        return (
            self._collection.update_many(self._query, {"$set": data})
            if self._multi
            else self._collection.update_one(self._query, {"$set": data})
        )

    def delete(self):
        return (
            self._collection.delete_many(self._query)
            if self._multi
            else self._collection.delete_one(self._query)
        )


class ModelObject:
    def __init__(self, name):
        self._name = name
        self._collection = db[name.lower()]

    def create(self, **data):
        return self._collection.insert_one(data).inserted_id

    def bulk_create(self, data):
        for obj in data:
            assert obj.name == self._name
        return self._collection.insert_many(
            [obj.properties for obj in data]
        ).inserted_ids

    def get(self, **query):
        return QuerySet(self._collection, query, multi=False)

    def filter(self, **query):
        return QuerySet(self._collection, query, multi=True)

    def all(self):
        return self.filter()

    def count(self):
        return self.all().count()

    def validate(self, data):
        new_book = MetadataModel(**data)
        new_book.validate()
        return new_book.get_dict()


class MetadataModel:
    def __init__(self, **kwargs):
        self.title = kwargs.get("title")
        self.author = kwargs.get("author")
        self.description = kwargs.get("description", "")
        self.imUrl = kwargs.get("imUrl")
        self.categories = kwargs.get("categories")
        self.asin = self._generate_asin()

    def _generate_asin(self):
        letters = string.ascii_uppercase
        generated_asin = random.choice(letters) + "".join(
            [random.choice(string.digits) for _ in range(9)]
        )
        result = db["metadata"].find_one({"asin": generated_asin})
        while result:
            generated_asin = random.choice(letters) + "".join(
                [random.choice(string.digits) for _ in range(9)]
            )
            result = db["metadata"].find_one({"asin": generated_asin})
        return generated_asin

    def _validate_str(self, value, length_check=False):
        if type(value) is not str:
            return False
        if length_check:
            if not len(value) > 0:
                return False
        return True

    def _validate_arr(self, value) -> bool:
        if not (isinstance(value, list)):
            return False
        if len(value) == 0:
            return False
        for sublist in value:
            if not (isinstance(sublist, list)):
                return False
            for element in sublist:
                if type(element) is not str:
                    return False

        return True

    def validate(self) -> None:
        errorObject = Exception()
        message_dict = {}
        if not (self._validate_str(self.title, True)):
            message_dict[
                "title"
            ] = "title needs to be a string and cannot be left empty."
        if not (self._validate_str(self.author, True)):
            message_dict[
                "author"
            ] = "author needs to be a string and cannot be left empty."
        if not (self._validate_str(self.description)):
            message_dict["description"] = "description needs to be a string."
        if not (self._validate_str(self.imUrl, True)):
            message_dict["imUrl"] = "imUrl needs to be a string."
        if not (self._validate_arr(self.categories)):
            message_dict[
                "categories"
            ] = "categories needs to be a 2D array of strings and cannot be left empty."

        if message_dict:
            errorObject.message_dict = message_dict
            raise errorObject

    def get_dict(self):
        return {
            "title": self.title,
            "author": self.author,
            "description": self.description,
            "imUrl": self.imUrl,
            "categories": self.categories,
            "asin": self.asin,
        }


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
    objects: ModelObject
    name: str
    collection: Collection


class Log(PropertyHandler, metaclass=Model):
    pass
