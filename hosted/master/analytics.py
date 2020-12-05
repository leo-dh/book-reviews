import automate, sys

if "--ingest" in sys.argv:
	automate.run_ingestion()

if "--run" in sys.argv:
	automate.run_analytics(ingest=False)