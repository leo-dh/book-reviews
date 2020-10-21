import json, bson
import numpy as np, pandas as pd
from documents.models import Metadata, Log
from reviews.models import Review
from datetime import datetime, timezone, timedelta, date, time

from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.http import HttpResponse, HttpResponseForbidden, HttpResponseBadRequest, HttpResponseServerError, HttpResponseNotFound


def get_params(req):
	return req.GET.dict()

def get_data(req):
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
def search(req):
	params = get_params(req)
	query = params.get("query")
	page = int(params.get("page", 1))
	if not query: return HttpResponseBadRequest()

	page_size = 20
	start_index = page_size * (page - 1)
	end_index = start_index + page_size
	return jsonify(list(Metadata.collection.find({"$text": {"$search": query}})[start_index:end_index]))

# this really shouldn't be a POST request but the request is sometimes too long for URI
@csrf_exempt
@require_http_methods(["POST"])
def genre(req):
	params = get_params(req)
	data = get_data(req)
	query = json.loads(data.get("query"))
	page = int(params.get("page", 1))
	if not query: return HttpResponseBadRequest()

	page_size = 20
	start_index = page_size * (page - 1)
	end_index = start_index + page_size
	return jsonify(list(Metadata.collection.find({"categories": {"$in": query}})[start_index:end_index]))