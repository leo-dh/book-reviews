# Book Reviews (Desktop Site)

## Setup

Files to create:

1. `.env` file in `server` folder

   ```sh
   # ./server/.env
   SECRET_KEY=abcdef...
   ALLOWED_HOST=subdomain1.domain.com,subdomain2.domain.com
   ```

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

To run the application, use the following command:

```sh
$ docker-compose up
```

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
