import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { getBookDetails } from "../services/api";
import { IBookDetails, IRequestState } from "../state/types";

export default function useGetBookDetails(
  id: string,
): [
  IRequestState<IBookDetails>,
  Dispatch<SetStateAction<IRequestState<IBookDetails>>>,
] {
  const [state, setState] = useState<IRequestState<IBookDetails>>({
    loading: true,
    data: null,
  });
  useEffect(() => {
    (async function fetchData() {
      const data = await getBookDetails(id);
      setState({
        loading: false,
        data,
      });
    })();
  }, [id]);
  return [state, setState];
}
