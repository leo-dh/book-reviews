from django.urls import path
from . import api

urlpatterns = [
	path("test", api.test),
    path("search", api.search),
    path("genre", api.genre),
    path("book/<str:book_id>", api.book),
    path("book/<str:book_id>/review", api.book_review),
    path("book", api.new_book),
    path("books", api.books),
]
