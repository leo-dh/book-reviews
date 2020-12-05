import automate, json
from concurrent.futures import ThreadPoolExecutor

automate.generate_key_pair()
automate.create_security_groups()

with ThreadPoolExecutor(max_workers=2) as executor:
	executor.submit(automate.create_production_instances)
	executor.submit(automate.create_hadoop_instances)
	executor.shutdown(wait=True)

automate.generate_environment()

with ThreadPoolExecutor(max_workers=2) as executor:
	executor.submit(automate.setup_production)
	executor.submit(automate.setup_hadoop)
	executor.shutdown(wait=True)

with open("production_hosts.json", "r") as f:
	hosts = json.load(f)

print(f"Webserver online at {hosts['django']['host']}")