import automate, sys

flags = sys.argv[1:]

if "--production" in flags:
	automate.terminate_production_instances()
if "--analytics" in flags:
	automate.terminate_hadoop_instances()
if "--production" in flags and "--analytics" in flags:
	automate.delete_security_groups()
	automate.delete_key_pair()
if not flags:
	automate.terminate_production_instances()
	automate.terminate_hadoop_instances()
	automate.delete_security_groups()
	automate.delete_key_pair()