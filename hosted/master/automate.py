from dotenv import load_dotenv
load_dotenv(dotenv_path="/home/ubuntu/config")
import boto3, time, paramiko, json, secrets, os, subprocess as sp
from concurrent.futures import ThreadPoolExecutor


KEY_PAIR_NAME = "aws-automated-key"
SSH_GROUP_NAME = "ssh-secgroup"
HTTP_GROUP_NAME = "http-secgroup"
INTERNAL_GROUP_NAME = "internal-secgroup"

AWS_ACCESS_KEY_ID = os.getenv("aws_access_key_id")
AWS_SECRET_ACCESS_KEY = os.getenv("aws_secret_access_key")
AWS_SESSION_TOKEN = os.getenv("aws_session_token")
REGION_NAME = os.getenv("region_name", "us-east-1")
PRODUCTION_INSTANCE_SIZE = os.getenv("production_instance_size", "t2.medium")
HADOOP_INSTANCE_SIZE = os.getenv("hadoop_instance_size", "t2.medium")
HADOOP_WORKER_NODES = int(os.getenv("hadoop_worker_nodes", 3))
HADOOP_VOLUME_SIZE = int(os.getenv("hadoop_volume_size", 8))

with open("/home/ubuntu/.aws/credentials", "w+") as f:
	f.write(f"[default]\naws_access_key_id={AWS_ACCESS_KEY_ID}\naws_secret_access_key={AWS_SECRET_ACCESS_KEY}")
	if AWS_SESSION_TOKEN: f.write(f"\naws_session_token={AWS_SESSION_TOKEN}")

AMI_MAPPER = {
	"us-east-1": "ami-0f82752aa17ff8f5d",
	"ap-southeast-1": "ami-04613ff1fdcd2eab1"
}
if REGION_NAME not in AMI_MAPPER: raise ValueError("region_name must be either 'us-east-1' or 'ap-southeast-1'")

ec2 = boto3.resource("ec2", region_name=REGION_NAME)
ec2client = boto3.client("ec2", region_name=REGION_NAME)

def create_instance(InstanceType, KeyName, SecurityGroups, VolumeSize=8):
	return ec2.create_instances(
		ImageId=AMI_MAPPER[REGION_NAME],
		MinCount=1,
		MaxCount=1,
		InstanceType=InstanceType,
		KeyName=KeyName,
		SecurityGroups=SecurityGroups,
		BlockDeviceMappings=[{
			"DeviceName": "/dev/sda1",
			"Ebs": {
				"VolumeSize": VolumeSize
			}
		}]
	)[0]

def await_running(instance):
	while True:
		time.sleep(3)
		instance = ec2.Instance(instance.id)
		if instance.public_ip_address:
			return instance

def await_ssh(instance):
	client = paramiko.SSHClient()
	client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
	while True:
		time.sleep(3)
		try:
			client.connect(instance.public_ip_address, username="ubuntu", key_filename=f"/home/ubuntu/.ssh/id_rsa")
			client.close()
			break
		except:
			continue

def connect(host):
	client = paramiko.SSHClient()
	client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
	client.connect(host["host"], username=host["username"], key_filename=host["key_filename"])
	return client

def exec_verbose(client, identity, command):
	stdin, stdout, stderr = client.exec_command(command)
	for line in stdout:
		print(identity, ">>>", line.strip("\n"))


def generate_key_pair():
	print("Generating key pair... ", end="", flush=True)
	key_pair = ec2.create_key_pair(KeyName=KEY_PAIR_NAME)
	with open(f"/home/ubuntu/.ssh/id_rsa", "w+") as f:
		f.write(key_pair.key_material)
	with open("/home/ubuntu/key_pair", "w+") as f:
		f.write(key_pair.key_pair_id)
	sp.run(["chmod", "600", ".ssh/id_rsa"])
	print("Done")

def create_security_groups():
	print("Creating security groups... ", end="", flush=True)
	def create_security_group(GroupName, Description, Port):
		security_group = ec2.create_security_group(GroupName=GroupName, Description=Description)
		security_group.authorize_ingress(IpPermissions=[
			{
				"IpProtocol": "TCP",
				"FromPort": Port,
				"ToPort": Port,
				"IpRanges": [{"CidrIp": "0.0.0.0/0"}]
			},
			{
				"IpProtocol": "TCP",
				"FromPort": Port,
				"ToPort": Port,
				"Ipv6Ranges": [{"CidrIpv6": "::/0"}]
			}
		])
		return security_group

	ssh_security_group = create_security_group(GroupName=SSH_GROUP_NAME, Description="Allow SSH traffic", Port=22)
	http_security_group = create_security_group(GroupName=HTTP_GROUP_NAME, Description="Allow HTTP traffic", Port=80)
	internal_security_group = ec2.create_security_group(GroupName=INTERNAL_GROUP_NAME, Description="Allow internal VPC traffic")
	internal_security_group.authorize_ingress(IpPermissions=[{
			"IpProtocol": "TCP",
			"FromPort": 0,
			"ToPort": 65535,
			"UserIdGroupPairs": [{
					"GroupId": internal_security_group.id
			}]
	}])

	with open("/home/ubuntu/security_groups", "w+") as f:
		f.write("\n".join([group.id for group in [ssh_security_group, http_security_group, internal_security_group]]))
	print("Done")

def create_production_instances():
	print("Creating production instances... ", end="", flush=True)
	mysql_instance = create_instance(InstanceType=PRODUCTION_INSTANCE_SIZE, KeyName=KEY_PAIR_NAME, SecurityGroups=[SSH_GROUP_NAME, INTERNAL_GROUP_NAME])
	mongo_instance = create_instance(InstanceType=PRODUCTION_INSTANCE_SIZE, KeyName=KEY_PAIR_NAME, SecurityGroups=[SSH_GROUP_NAME, INTERNAL_GROUP_NAME])
	django_instance = create_instance(InstanceType=PRODUCTION_INSTANCE_SIZE, KeyName=KEY_PAIR_NAME, SecurityGroups=[SSH_GROUP_NAME, INTERNAL_GROUP_NAME, HTTP_GROUP_NAME])
	print("Done")

	print("Waiting for production instance IP addresses... ", end="", flush=True)
	mysql_instance = await_running(mysql_instance)
	mongo_instance = await_running(mongo_instance)
	django_instance = await_running(django_instance)
	print("Done")

	print("Waiting for production instance SSH connectivity... ", end="", flush=True)
	await_ssh(mysql_instance)
	await_ssh(mongo_instance)
	await_ssh(django_instance)
	print("Done")

	print("Writing production instance addresses to hosts... ", end="", flush=True)
	with open("/home/ubuntu/production_hosts.json", "w+") as f:
		f.write(json.dumps({
			"mysql": {
				"host": mysql_instance.private_ip_address,
				"username": "ubuntu",
				"key_filename": f"/home/ubuntu/.ssh/id_rsa",
				"instance_id": mysql_instance.id
			},
			"mongo": {
				"host": mongo_instance.private_ip_address,
				"username": "ubuntu",
				"key_filename": f"/home/ubuntu/.ssh/id_rsa",
				"instance_id": mongo_instance.id
			},
			"django": {
				"host": django_instance.public_ip_address,
				"username": "ubuntu",
				"key_filename": f"/home/ubuntu/.ssh/id_rsa",
				"instance_id": django_instance.id
			}
		}, indent="\t"))
	sp.run(f"ssh-keyscan -H {django_instance.public_ip_address} >> .ssh/known_hosts", shell=True)
	print("Done")

def create_hadoop_instances(num_workers=HADOOP_WORKER_NODES):
	assert num_workers >= 1
	print("Creating hadoop instances... ", end="", flush=True)
	hadoop_instances = [create_instance(InstanceType=HADOOP_INSTANCE_SIZE, KeyName=KEY_PAIR_NAME, SecurityGroups=[INTERNAL_GROUP_NAME, SSH_GROUP_NAME], VolumeSize=HADOOP_VOLUME_SIZE) for _ in range(num_workers + 1)]
	print("Done")

	print("Waiting for hadoop instance IP addresses... ", end="", flush=True)
	hadoop_instances = [await_running(instance) for instance in hadoop_instances]
	print("Done")

	print("Waiting for hadoop instance SSH connectivity... ", end="", flush=True)
	[await_ssh(instance) for instance in hadoop_instances]
	print("Done")

	print("Writing hadoop instance addresses to hosts... ", end="", flush=True)
	with open("/home/ubuntu/hadoop_hosts.json", "w+") as f:
		f.write(json.dumps({"hadoop.node.{0:03d}".format(ind): {
			"host": instance.private_ip_address,
			"username": "ubuntu",
			"key_filename": f"/home/ubuntu/.ssh/id_rsa",
			"instance_id": instance.id
		} for ind, instance in enumerate(hadoop_instances)}, indent="\t"))
	sp.run(f"ssh-keyscan -H {hadoop_instances[0].private_ip_address} >> .ssh/known_hosts", shell=True)
	print("Done")

def generate_environment():
	with open("/home/ubuntu/production_hosts.json", "r") as f:
		hosts = json.load(f)

	MYSQL_HOST = hosts["mysql"]["host"]
	MYSQL_USER = "postgres"
	MYSQL_PASSWORD = secrets.token_urlsafe()
	MYSQL_PORT = 3306

	MONGO_HOST = hosts["mongo"]["host"]
	MONGO_USER = "redis"
	MONGO_PASSWORD = secrets.token_urlsafe()
	MONGO_PORT = 27017

	environment = {
		"MYSQL_USER": MYSQL_USER,
		"MYSQL_PASSWORD": MYSQL_PASSWORD,
		"MYSQL_HOST": MYSQL_HOST,
		"MYSQL_PORT": MYSQL_PORT,
		"MONGO_USER": MONGO_USER,
		"MONGO_PASSWORD": MONGO_PASSWORD,
		"MONGO_HOST": MONGO_HOST,
		"MONGO_PORT": MONGO_PORT
	}

	with open("/home/ubuntu/.env.json", "w+") as f:
		f.write(json.dumps(environment, indent="\t"))

def setup_production():
	with open("/home/ubuntu/production_hosts.json", "r") as f:
		hosts = json.load(f)

	mysql = connect(hosts["mysql"])
	mongo = connect(hosts["mongo"])
	django = connect(hosts["django"])

	with open("/home/ubuntu/.env.json", "r") as f:
		environment = json.load(f)

	DJANGO_HOST = hosts["django"]["host"]

	MYSQL_COMMAND = f"wget https://dbs.xuliang.dev/mysql/setup.sh && chmod +x setup.sh && ./setup.sh {environment['MYSQL_USER']} {environment['MYSQL_PASSWORD']}"
	MONGO_COMMAND = f"wget https://dbs.xuliang.dev/mongo/setup.sh && chmod +x setup.sh && ./setup.sh {environment['MONGO_USER']} {environment['MONGO_PASSWORD']}"
	DJANGO_COMMAND = f"wget https://dbs.xuliang.dev/django/setup.sh && chmod +x setup.sh && ./setup.sh {DJANGO_HOST}"

	with ThreadPoolExecutor(max_workers=3) as executor:
		executor.submit(exec_verbose, mysql, "MYSQL", MYSQL_COMMAND)
		executor.submit(exec_verbose, mongo, "MONGO", MONGO_COMMAND)
		executor.submit(exec_verbose, django, "DJANGO", DJANGO_COMMAND)
		executor.shutdown(wait=True)

	def make_dotenv(client, **kwargs):
		for key, value in kwargs.items():
			exec_verbose(client, "DJANGO", f"printf \"{key}={value}\n\" >> /home/ubuntu/server/.env")

	make_dotenv(django,
		DB_REVIEWS_USER=environment['MYSQL_USER'],
		DB_REVIEWS_PASSWORD=environment['MYSQL_PASSWORD'],
		DB_REVIEWS_HOST=environment['MYSQL_HOST'],
		DB_REVIEWS_PORT=environment['MYSQL_PORT'],
		DB_DOCUMENTS_USER=environment['MONGO_USER'],
		DB_DOCUMENTS_PASSWORD=environment['MONGO_PASSWORD'],
		DB_DOCUMENTS_HOST=environment['MONGO_HOST'],
		DB_DOCUMENTS_PORT=environment['MONGO_PORT']
	)

	print("Performing migrations...")
	exec_verbose(django, "DJANGO", "./migrate.sh")
	print("Loading reviews data...")
	exec_verbose(mysql, "MYSQL", "sudo mysql < '/home/ubuntu/ingestion.sql' -proot")

	print("Launching webserver...")
	exec_verbose(django, "DJANGO", "/home/ubuntu/launch.sh")

	mysql.close()
	mongo.close()
	django.close()

def setup_hadoop():
	with open("/home/ubuntu/hadoop_hosts.json", "r") as f:
		hosts = json.load(f)

	master = connect(hosts["hadoop.node.000"])
	workers = [connect(hosts["hadoop.node.{0:03d}".format(ref)]) for ref in range(1, len(hosts.keys()))]

	with open("/home/ubuntu/.env.json", "r") as f:
		environment = json.load(f)

	def install_base(client, identity, master_address):
		exec_verbose(client, identity, "sudo sysctl vm.swappiness=10")
		exec_verbose(client, identity, f"wget https://dbs.xuliang.dev/hadoop/setup.sh && chmod +x setup.sh && ./setup.sh {master_address}")
		exec_verbose(client, identity, "curl https://dbs.xuliang.dev/hadoop/spark.sh | bash")

	with ThreadPoolExecutor(max_workers=len(hosts.keys())) as executor:
		for ind, client in enumerate([master] + workers):
			identity = "HADOOP {0:03d}".format(ind)
			executor.submit(install_base, client, identity, hosts["hadoop.node.000"]["host"])
		executor.shutdown(wait=True)

	exec_verbose(master, "HADOOP 000", "ssh-keygen -t rsa -P '' -f .ssh/id_rsa")

	_, stdout, _ = master.exec_command("cat .ssh/id_rsa.pub")
	public_key = "\n".join([line.strip("\n") for line in stdout])
	for ind, client in enumerate([master] + workers):
		identity = "HADOOP {0:03d}".format(ind)
		exec_verbose(client, identity, f"echo {public_key} >> .ssh/authorized_keys")

	exec_verbose(master, "HADOOP 000", f"curl https://dbs.xuliang.dev/hadoop/utils.sh | bash")

	worker_hosts = [hosts["hadoop.node.{0:03d}".format(ind + 1)]["host"] for ind in range(len(workers))]
	exec_verbose(master, "HADOOP 000", "rm hadoop-3.3.0/etc/hadoop/workers")
	for host in worker_hosts:
		exec_verbose(master, "HADOOP 000", f"echo {host} >> hadoop-3.3.0/etc/hadoop/workers")
		exec_verbose(master, "HADOOP 000", f"echo {host} >> spark-3.0.1-bin-hadoop3.2/conf/slaves")

	exec_verbose(master, "HADOOP 000", "echo \"Y\" | hadoop-3.3.0/bin/hdfs namenode -format")
	exec_verbose(master, "HADOOP 000", "cd hadoop-3.3.0/sbin && ./start-dfs.sh && ./start-yarn.sh")

	exec_verbose(master, "HADOOP 000", f"./schedule.sh {environment['MYSQL_HOST']}:{environment['MYSQL_PORT']} {environment['MYSQL_USER']} {environment['MYSQL_PASSWORD']} {environment['MONGO_USER']}:{environment['MONGO_PASSWORD']}@{environment['MONGO_HOST']}:{environment['MONGO_PORT']} {hosts['hadoop.node.000']['host']}:9000")

	print("Analytics cluster online")

	master.close()
	[worker.close() for worker in workers]


def run_ingestion():
	with open("/home/ubuntu/hadoop_hosts.json", "r") as f:
		hosts = json.load(f)
	with open("/home/ubuntu/.env.json", "r") as f:
		environment = json.load(f)

	master = connect(hosts["hadoop.node.000"])
	exec_verbose(master, "HADOOP 000", f"./ingest.sh {environment['MYSQL_HOST']}:{environment['MYSQL_PORT']} {environment['MYSQL_USER']} {environment['MYSQL_PASSWORD']} {environment['MONGO_USER']}:{environment['MONGO_PASSWORD']}@{environment['MONGO_HOST']}:{environment['MONGO_PORT']}")
	master.close()	

def run_analytics(ingest=True):
	if ingest: run_ingestion()

	with open("/home/ubuntu/hadoop_hosts.json", "r") as f:
		hadoop_hosts = json.load(f)
	with open("/home/ubuntu/production_hosts.json", "r") as f:
		production_hosts = json.load(f)

	master = connect(hadoop_hosts["hadoop.node.000"])
	exec_verbose(master, "HADOOP 000", f"./analytics.sh {hadoop_hosts['hadoop.node.000']['host']}:9000")

	print("Uploading results... ", end="", flush=True)
	django = connect(production_hosts["django"])
	sp.run(["scp", f"{hadoop_hosts['hadoop.node.000']['host']}:results/latest_pearson.txt", "latest_pearson.txt"])
	sp.run(["scp", f"{hadoop_hosts['hadoop.node.000']['host']}:results/latest_tfidf.txt", "latest_tfidf.txt"])
	exec_verbose(django, "DJANGO", f"rm -rf public/analytics && mkdir public/analytics")
	sp.run(["scp", "latest_pearson.txt", f"{production_hosts['django']['host']}:public/analytics/pearson.txt"])
	sp.run(["scp", "latest_tfidf.txt", f"{production_hosts['django']['host']}:public/analytics/tfidf.txt"])
	print("Done")
	print(f"Analytics results available at {hadoop_hosts['hadoop.node.000']['host']}/analytics/pearson.txt and {hadoop_hosts['hadoop.node.000']['host']}/analytics/tfidf.txt")

	master.close()
	django.close()

def scale_hadoop(num_workers):
	with open("/home/ubuntu/hadoop_hosts.json", "r") as f:
		hosts = json.load(f)

	current_workers = len(hosts) - 1

	assert num_workers >= 1
	assert current_workers >= 1

	if num_workers == current_workers:
		print(f"Analytics cluster already has {num_workers} worker nodes")
		return

	master = connect(hosts["hadoop.node.000"])
	exec_verbose(master, "HADOOP 000", "cd hadoop-3.3.0/sbin && ./stop-yarn.sh && ./stop-dfs.sh")

	if num_workers < current_workers:
		print(f"Hadoop: scaling down to {num_workers} worker nodes")
		terminate_indexes = range(num_workers + 1, current_workers + 1)
		for index in terminate_indexes:
			node_name = "hadoop.node.{0:03d}".format(index)
			ec2client.terminate_instances(InstanceIds=[hosts[node_name]["instance_id"]])
			del hosts[node_name]
	elif num_workers > current_workers:
		print(f"Hadoop: scaling up to {num_workers} worker nodes")

		print("Creating hadoop instances... ", end="", flush=True)
		new_instances = [create_instance(InstanceType=HADOOP_INSTANCE_SIZE, KeyName=KEY_PAIR_NAME, SecurityGroups=[INTERNAL_GROUP_NAME, SSH_GROUP_NAME], VolumeSize=HADOOP_VOLUME_SIZE) for _ in range(num_workers - current_workers)]
		print("Done")

		print("Waiting for new hadoop instance IP addresses... ", end="", flush=True)
		new_instances = [await_running(instance) for instance in new_instances]
		print("Done")

		print("Waiting for hadoop instance SSH connectivity... ", end="", flush=True)
		[await_ssh(instance) for instance in new_instances]
		print("Done")

		for ind, instance in enumerate(new_instances):
			node_name = "hadoop.node.{0:03d}".format(current_workers + ind + 1)
			hosts[node_name] = {
				"host": instance.private_ip_address,
				"username": "ubuntu",
				"key_filename": f"/home/ubuntu/.ssh/id_rsa",
				"instance_id": instance.id
			}

		print("Performing setup on new worker nodes...")

		new_workers = [connect(hosts["hadoop.node.{0:03d}".format(index)]) for index in range(current_workers + 1, num_workers + 1)]

		_, stdout, _ = master.exec_command("cat .ssh/id_rsa.pub")
		public_key = "\n".join([line.strip("\n") for line in stdout])

		def install_base(client, identity):
			exec_verbose(client, identity, "sudo sysctl vm.swappiness=10")
			exec_verbose(client, identity, f"wget https://dbs.xuliang.dev/hadoop/setup.sh && chmod +x setup.sh && ./setup.sh {hosts['hadoop.node.000']['host']}")
			exec_verbose(client, identity, f"curl https://dbs.xuliang.dev/hadoop/spark.sh | bash")
			exec_verbose(client, identity, f"echo {public_key} >> .ssh/authorized_keys")

		print("Nodes setup complete")

		with ThreadPoolExecutor(max_workers=len(new_workers)) as executor:
			for ind, client in enumerate(new_workers):
				identity = "HADOOP {0:03d}".format(current_workers + ind + 1)
				executor.submit(install_base, client, identity)
			executor.shutdown(wait=True)

	with open("/home/ubuntu/hadoop_hosts.json", "w+") as f:
		f.write(json.dumps(hosts, indent="\t"))

	worker_hosts = [hosts["hadoop.node.{0:03d}".format(ind + 1)]["host"] for ind in range(num_workers)]
	exec_verbose(master, "HADOOP 000", "rm hadoop-3.3.0/etc/hadoop/workers")
	for host in worker_hosts:
		exec_verbose(master, "HADOOP 000", f"echo {host} >> hadoop-3.3.0/etc/hadoop/workers")
		exec_verbose(master, "HADOOP 000", f"echo {host} >> spark-3.0.1-bin-hadoop3.2/conf/slaves")

	exec_verbose(master, "HADOOP 000", "cd hadoop-3.3.0/sbin && ./start-dfs.sh && ./start-yarn.sh")

	print(f"Analytics cluster successfully scaled to {num_workers} worker nodes")


def terminate_production_instances():
	print("Terminating production instances... ", end="", flush=True)
	with open("/home/ubuntu/production_hosts.json", "r") as f:
		try:
			hosts = json.load(f)
		except:
			print("No instances to terminate")
			return
	instance_ids = [host["instance_id"] for host in hosts.values()]
	if instance_ids: ec2client.terminate_instances(InstanceIds=instance_ids)
	with open("/home/ubuntu/production_hosts.json", "w+") as f:
		f.write("")
	print("Done")

def terminate_hadoop_instances():
	print("Terminating hadoop instances... ", end="", flush=True)
	with open("/home/ubuntu/hadoop_hosts.json", "r") as f:
		try:
			hosts = json.load(f)
		except:
			print("No instances to terminate")
			return
	instance_ids = [host["instance_id"] for host in hosts.values()]
	if instance_ids: ec2client.terminate_instances(InstanceIds=instance_ids)
	with open("/home/ubuntu/hadoop_hosts.json", "w+") as f:
		f.write("")
	print("Done")

def delete_security_groups():
	print("Deleting security groups... ", end="", flush=True)
	with open("/home/ubuntu/security_groups", "r") as f:
		group_ids = [line.strip() for line in f.readlines() if line]
	while True:
		try:
			for group in group_ids:
				ec2client.delete_security_group(GroupId=group)
			break
		except:
			time.sleep(10)
	with open("/home/ubuntu/security_groups", "w+") as f:
		f.write("")
	print("Done")

def delete_key_pair():
	print("Deleting key pair... ", end="", flush=True)
	with open("/home/ubuntu/key_pair", "r") as f:
		key_pair_id = f.read().strip()
	if key_pair_id: ec2client.delete_key_pair(KeyPairId=key_pair_id)
	with open("/home/ubuntu/key_pair", "w+") as f:
		f.write("")
	print("Done")
