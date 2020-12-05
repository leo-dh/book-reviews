import subprocess as sp
from datetime import datetime
from documents.models import Log

def background_logger():
	f = sp.Popen(["tail", "-F", "/var/log/nginx/access.log"], stdout=sp.PIPE, stderr=sp.PIPE)
	while True:
		line = f.stdout.readline().decode("utf-8")
		ip_address, timestamp, rest = line.replace("]", "[").split("[")
		ip_address = ip_address.split(" ")[0].strip()
		timestamp = datetime.strptime(timestamp.strip(), "%d/%b/%Y:%H:%M:%S %z")
		_, temp, rest = rest.split('"')[:3]
		status_code = rest.strip().split(" ")[0]
		method, path, _ = temp.split(" ")
		Log.objects.create(
			path=path,
			method=method,
			status_code=status_code,
			timestamp=timestamp,
			ip_address=ip_address
		)