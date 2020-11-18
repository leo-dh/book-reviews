import {
  IAPIError,
  IBook,
  IBookDetails,
  IBookReview,
  IQueryResults,
} from "../state/types";

const apiUrl = "http://127.0.0.1:8000/api";

interface IRequest {
  endpoint: string;
  headers?: Record<string, unknown>;
  params?: Record<string, unknown>;
  data?: Record<string, unknown>;
}

async function makeRequest<T>(
  request: IRequest,
  method: string,
): Promise<T | null> {
  let url = `${apiUrl}/${request.endpoint}`;
  if (request.params)
    Object.keys(request.params).forEach((param, ind) => {
      url += `${ind === 0 ? "?" : "&"}${param}=${request.params?.[param]}`;
    });
  const headers = ({
    "Content-Type": "application/json",
    ...request.headers,
  } as unknown) as Headers;
  try {
    const response = await fetch(url, {
      method,
      headers,
      body: request.data ? JSON.stringify(request.data) : null,
    });
    return await response.json();
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function get<T = Record<string, unknown>>(
  request: IRequest,
): Promise<T | null> {
  return makeRequest<T>(request, "GET");
}

async function patch<T = Record<string, unknown>>(
  request: IRequest,
): Promise<T | null> {
  return makeRequest<T>(request, "PATCH");
}

async function post<T = Record<string, unknown>>(
  request: IRequest,
): Promise<T | null> {
  return makeRequest<T>(request, "POST");
}

async function getSearchQuery(
  query: string,
  page = 1,
  totalCount = 0,
): Promise<IQueryResults | null> {
  const result = await get<IQueryResults>({
    endpoint: `search`,
    params: { query, page, totalCount },
  });
  return result;
}

async function getGenreQuery(
  query: string,
  page = 1,
  totalCount = 0,
): Promise<IQueryResults | null> {
  const result = await post<IQueryResults>({
    endpoint: `genre`,
    params: { page, totalCount },
    data: { query },
  });
  return result;
}

async function getBookDetails(id: string): Promise<IBookDetails | null> {
  const result = await get<IBookDetails>({
    endpoint: `book/${id}`,
  });
  return result;
}

async function postUserReview(
  bookId: string,
  userReview: Record<string, string | number>,
): Promise<IBookReview[] | IAPIError | null> {
  const result = await post<IBookReview[] | IAPIError>({
    endpoint: `book/${bookId}/review`,
    data: userReview,
  });
  return result;
}

async function getAllBooks(
  page = 1,
  totalCount = 0,
): Promise<IQueryResults | null> {
  const result = await get<IQueryResults>({
    endpoint: `books`,
    params: { page, totalCount },
  });
  return result;
}

async function postNewBook(
  book: Record<string, string | string[][]>,
): Promise<IBook | IAPIError | null> {
  const result = await post<IBook | IAPIError>({
    endpoint: `book`,
    data: book,
  });
  return result;
}

function instanceOfIAPIError(data: any): data is IAPIError {
  return "error" in data;
}

export {
  getSearchQuery,
  getGenreQuery,
  getBookDetails,
  getAllBooks,
  postUserReview,
  postNewBook,
  instanceOfIAPIError,
};
