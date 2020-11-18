enum EActionType {
  UPDATE_PERSISTENT_DATA,
  CLEAR_PERSISTENT_DATA,
}

interface IState {
  persistence: Record<string, unknown>;
}

interface IAction {
  type: EActionType;
}

interface IBook {
  title: string;
  author: string;
  asin: string;
  imUrl: string;
  price: number;
  categories: string[][];
  description?: string;
  related?: {
    alsoViewed?: string[];
    buyAfterViewing?: string[];
  };
}

/* eslint-disable camelcase */
interface IBookReview {
  id: number;
  asin: string;
  helpful_num: number;
  helpful_denom: number;
  overall: number;
  text: string;
  summary: string;
  date: string;
  reviewer_id: string;
  reviewer_name: string;
}
/* eslint-enable camelcase */

interface IBookDetails {
  metadata: IBook;
  reviews: IBookReview[];
}

interface IRequestState<T> {
  loading: boolean;
  data: T | null;
}

interface IQueryResults {
  books: IBook[];
  totalCount?: number;
}

interface IAPIError {
  error: Record<string, string>;
}

export {
  EActionType,
  IState,
  IAction,
  IBook,
  IBookReview,
  IBookDetails,
  IRequestState,
  IAPIError,
  IQueryResults,
};
