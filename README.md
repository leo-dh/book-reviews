# [Book Reviews (Non-Responsive)](https://projects.leodh.dev/bookreviews)

## Background

### Context

This is a simple web application for book reviews that was developed for my
database course project. The AWS automation and big data aspects have been
stripped out of the original project as I was not heavily involved in those
parts. Docker containers are used to replace the multiple AWS instances.

### Basic Features

- Search for a book by its title or author
- Find books by their genres
- List all books
- View individual books and their reviews
- Add a new book
- Add a new review

## Setup

### Files to download

- [`kindle_reviews.csv`](https://files.leodh.dev/kindle_reviews.csv)
- [`kindle_metadata_stream.json`](https://files.leodh.dev/kindle_metadata_stream.json)

Put the `kindle_reviews.csv` file in the `mysql` folder and the
`kindle_metadata_stream.json` file in the `mongodb` folder.

The data has was originally obtained from
[here](https://nijianmo.github.io/amazon/index.html). It has been trimmed to a
large extent as the purpose was just to display some data.

> **NOTE:** The dataset has not been cleaned and processed in any way. Most
> books are missing key information like title and author. Placeholder/default
> values have to be used.

### Files to create

1. `.env` file in the root folder

   ```sh
   # .env
   MONGO_URI=mongodb+srv://{user}:{password}@...
   ALLOWED_HOSTS=subdomain1.domain.com,subdomain2.domain.com
   GATSBY_API_URL=/api
   PATH_PREFIX= (optional)
   ```

   > **NOTE:** Do not fill in `{user}` and `{password}`. The details will be filled
   > in `server/documents/models.py`.

2. `db_password.secret.env` in root folder

   ```sh
   # ./db_password.secret.env
   abcdef...
   ```

3. `db_root_password.secret.env` in root folder

   ```sh
   # ./db_root_password.secret.env
   abcdef...
   ```

4. `django_secret_key.secret.env` in root folder

   ```sh
   # ./django_secret_key.secret.env
   abcdef...
   ```

### Extra

Uncomment the `mongo` service in `docker-compose.yml` if you wish
to run the database locally.

```yml
mongo:
  image: mongo
  volumes:
    - ./mongodb/import.sh:/docker-entrypoint-initdb.d/import.sh
    - ./mongodb/init.js:/docker-entrypoint-initdb.d/init.js
    - ./mongodb/kindle_metadata_stream.json:/data/mongodb/kindle_metadata_stream.json
  restart: always
  command: --wiredTigerCacheSizeGB 0.25
  deploy:
    resources:
      limits:
        memory: 300M
  environment:
    MONGO_INITDB_ROOT_USERNAME: mongoadmin
    MONGO_INITDB_ROOT_PASSWORD_FILE: /run/secrets/db_root_password
    MONGO_INITDB_DATABASE: database
    MONGO_USER: django
    MONGO_PASSWORD_FILE: /run/secrets/db_password
  secrets:
    - db_root_password
    - db_password
```

Comment the following lines if you have yet to build the container.
This is because the service requires more than 300MB to import the json
file and dump it into a collection. You can uncomment it once the import
has been completed.

```yml
# command: --wiredTigerCacheSizeGB 0.25
# deploy:
#   resources:
#     limits:
#       memory: 300M
```

Should you wish to use `MongoDB Atlas` as opposed to a local database, you can
use the following command to do the import.

```bash
mongoimport --collection metadata \
   --file kindle_metadata_stream.json \
   --uri $MONGO_URI
```

### Run

To build and run the application, use the following command:

```sh
docker-compose up
```

You can access the web application at http://localhost:7001.
