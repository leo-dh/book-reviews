### Dataset

http://deepyeti.ucsd.edu/jianmo/amazon/index.html

### Docker Installation

```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add - && sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" && sudo apt-get update && sudo apt-get install docker-ce docker-ce-cli containerd.io -y

sudo groupadd docker
sudo gpasswd -a $USER docker

sudo curl -L "https://github.com/docker/compose/releases/download/1.26.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Run Databases

```bash
docker run --name database_reviews -p 5432:5432 -e POSTGRES_PASSWORD=<PASSWORD> -d postgres:13.0

docker run --name database_documents -p 27017:27017  -e MONGO_INITDB_ROOT_USERNAME=<USERNAME> -e MONGO_INITDB_ROOT_PASSWORD=<PASSWORD> -d mongo:4.4.1
```

### Set Up Databases

##### Postgres

```sql
create database reviews;
```

##### Django

```bash
python manage.py migrate
```

```python
import populate_reviews, populate_metadata

populate_reviews.upload_data(populate_reviews.get_data())
populate_metadata.upload_stream()


from documents.models import Metadata
from pymongo import TEXT, ASCENDING

Metadata.collection.create_index([("title", TEXT), ("author", TEXT)], background=True)
Metadata.collection.create_index([("category", ASCENDING)], background=True)
```

