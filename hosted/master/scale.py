import automate, sys

if len(sys.argv) != 2:
	raise ValueError("Invalid number of arguments")

try:
	num_workers = int(sys.argv[1])
except:
	raise ValueError("Please specify a numeric number of worker nodes")

automate.scale_hadoop(num_workers)