cd /home/ubuntu/server
source env/bin/activate
python manage.py migrate
python manage.py shell << EOF
from documents.models import Metadata
from pymongo import TEXT, ASCENDING
Metadata.collection.create_index([("title", TEXT), ("author", TEXT)], background=True)
Metadata.collection.create_index([("category", ASCENDING)], background=True)
EOF
echo Migrations OK