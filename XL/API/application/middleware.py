from documents.models import Log
from datetime import datetime, timezone, timedelta


def getnow():
	return datetime.now().astimezone(timezone(timedelta(hours=8)))


def logging_middleware(get_response):
	def middleware(request):
		response = get_response(request)
		Log.objects.create(
			path=request.path,
			method=request.method,
			status_code=response.status_code,
			timestamp=getnow(),
		)
		return response
	return middleware