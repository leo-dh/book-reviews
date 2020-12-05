import json
import random
import string
from datetime import date, datetime, time, timedelta, timezone
from typing import Dict

import bson
import numpy as np
import pandas as pd
from django.core.exceptions import ValidationError
from django.http import (
    HttpRequest,
    HttpResponse,
    HttpResponseBadRequest,
    HttpResponseNotFound,
)
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from documents.models import Log, Metadata
from reviews.models import Review

def generate_random_string(length: int) -> str:
    letters = string.ascii_uppercase + string.digits
    random_string = "".join(random.choice(letters) for _ in range(length))
    return random_string


def get_params(req: HttpRequest):
    return req.GET.dict()


def get_data(req: HttpRequest) -> Dict or None:
    try:
        return json.loads(req.body)
    except:
        return None


def getnow():
    return datetime.now().astimezone(timezone(timedelta(hours=8)))


def jsonify(data):
    def dt_handler(obj):
        if isinstance(obj, (datetime, date, time)):
            return obj.isoformat()
        elif isinstance(obj, np.int64):
            return int(obj)
        elif isinstance(obj, timedelta):
            return obj.total_seconds()
        elif isinstance(obj, bson.objectid.ObjectId):
            return str(obj)
        else:
            print(type(obj))
            return None

    return HttpResponse(json.dumps(data, default=dt_handler))


@csrf_exempt
@require_http_methods(["GET"])
def test(req):
    return jsonify({"status": "OK"})

@csrf_exempt
@require_http_methods(["GET"])
def search(req: HttpRequest):
    params = get_params(req)
    query = params.get("query")
    page = int(params.get("page", 1))
    total_count = int(params.get("totalCount", 0))
    if not query:
        return HttpResponseBadRequest()

    page_size = 20
    start_index = page_size * (page - 1)
    result = (
        Metadata.collection.find(
            {"$text": {"$search": query}}, {"score": {"$meta": "textScore"}}
        )
        .sort([("score", {"$meta": "textScore"})])
        .skip(start_index)
        .limit(page_size)
    )

    if total_count:
        document_count = result.collection.count_documents(
            {"$text": {"$search": query}}
        )
        return jsonify({"books": list(result), "totalCount": document_count})

    return jsonify({"books": list(result)})


# this really shouldn't be a POST request but the request is sometimes too long for URI
@csrf_exempt
@require_http_methods(["POST"])
def genre(req: HttpRequest):
    params = get_params(req)
    data = get_data(req)
    query = json.loads(data.get("query"))
    page = int(params.get("page", 1))
    total_count = int(params.get("totalCount", 0))
    if not query:
        return HttpResponseBadRequest()

    page_size = 20
    start_index = page_size * (page - 1)
    result = (
        Metadata.collection.find({"categories": {"$in": query}})
        .skip(start_index)
        .limit(page_size)
    )
    if total_count:
        document_count = result.collection.count_documents(
            {"categories": {"$in": query}}
        )
        return jsonify({"books": list(result), "totalCount": document_count})

    return jsonify({"books": list(result)})


@csrf_exempt
@require_http_methods(["GET"])
def book(req: HttpRequest, book_id: str):
    metadata = Metadata.collection.find_one({"asin": book_id})
    if metadata:
        reviews = [review.values() for review in Review.objects.filter(asin=book_id)]
        return jsonify({"metadata": metadata, "reviews": reviews})
    else:
        return HttpResponseNotFound()


@csrf_exempt
@require_http_methods(["POST"])
def book_review(req: HttpRequest, book_id: str):
    form_data = get_data(req)
    if not form_data:
        return HttpResponseBadRequest("Form data missing.")
    metadata = Metadata.collection.find_one({"asin": book_id})
    if not metadata:
        return HttpResponseBadRequest("Book cannot be found.")
    review = Review(
        asin=book_id,
        helpful_num=0,
        helpful_denom=0,
        overall=form_data.get("overall"),
        text=form_data.get("text"),
        summary=form_data.get("summary"),
        date=getnow(),
        reviewer_id=generate_random_string(20),
        reviewer_name=form_data.get("name"),
    )
    try:
        review.clean_fields()
        review.save()
        reviews = [review.values() for review in Review.objects.filter(asin=book_id)]
        return jsonify(reviews)
    except ValidationError as e:
        error_dict = {k: v[0] for k, v in e.message_dict.items()}
        return HttpResponseBadRequest(json.dumps({"error": error_dict}))


@csrf_exempt
@require_http_methods(["POST"])
def new_book(req: HttpRequest):
    form_data = get_data(req)
    if not form_data:
        return HttpResponseBadRequest("Form data missing.")
    print(form_data)

    try:
        book = Metadata.objects.validate(form_data)
        created_id = Metadata.objects.create(**book)
        created_book = Metadata.collection.find_one({"_id": created_id})
        return jsonify(created_book)
    except Exception as e:
        return HttpResponseBadRequest(json.dumps({"error": e.message_dict}))


@csrf_exempt
@require_http_methods(["GET"])
def books(req: HttpRequest):
    params = get_params(req)
    page = int(params.get("page", 1))
    total_count = int(params.get("totalCount", 0))

    page_size = 20
    start_index = page_size * (page - 1)

    all_documents = Metadata.collection.find({}).skip(start_index).limit(page_size)

    if total_count:
        document_count = all_documents.collection.count_documents({})
        return jsonify({"books": list(all_documents), "totalCount": document_count})

    return jsonify({"books": list(all_documents)})
