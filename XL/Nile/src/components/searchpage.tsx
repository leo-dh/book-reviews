import React, { useEffect, useState, useRef } from "react";
import { Input, Card, Typography } from "antd";
import { navigate } from "gatsby";
import { useLocation } from "@reach/router";
import { getSearchQuery } from "../services/api";
import { IBook } from "../state/types";
import usePrevious from "../hooks/usePrevious";
import ResultList from "./ResultList";

const { Search } = Input;
const { Title } = Typography;

interface QueryState {
  pageNum: number;
  queryString: string | null;
}

const getQueryFromLocation = (searchString: string): QueryState => {
  const matchResults = searchString.match(
    /\?(?:page=([1-9][0-9]*)&)?query=(.*)/,
  );
  const queryString = matchResults?.[2] || null;
  const pageNum = queryString ? Number(matchResults?.[1] || 1) : 0;
  return {
    pageNum,
    queryString,
  };
};

const LandingPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<{ books: IBook[]; totalCount: number }>({
    books: [],
    totalCount: 0,
  });
  const location = useLocation();
  const [queryState, setQueryState] = useState<QueryState>(
    getQueryFromLocation(decodeURI(location.search)),
  );

  const prevQueryState = usePrevious<QueryState>(queryState);
  const inputRef = useRef<Input>(null);

  const performQuery = async (
    { pageNum, queryString }: QueryState,
    totalCount = 0,
  ) => {
    if (!queryString) return;
    setLoading(true);
    const result = await getSearchQuery(queryString, pageNum, totalCount);
    if (result) {
      setData(prevData => {
        return {
          books: result.books,
          totalCount: totalCount ? result.totalCount || 0 : prevData.totalCount,
        };
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    const newQuery = getQueryFromLocation(decodeURI(location.search));
    setQueryState(newQuery);
  }, [location.search]);

  useEffect(() => {
    if (!queryState.queryString) return;
    const totalCount =
      prevQueryState?.queryString === queryState.queryString ? 0 : 1;
    performQuery(queryState, totalCount);
    inputRef.current?.setValue(queryState.queryString || "");
  }, [queryState.pageNum, queryState.queryString]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        margin: "18px 0",
      }}
    >
      <Title level={1}>Search</Title>
      <Search
        style={{ fontSize: 24 }}
        size="large"
        ref={inputRef}
        defaultValue={queryState.queryString || ""}
        placeholder="Search with book title or author ... "
        allowClear
        enterButton
        loading={loading}
        onSearch={value => {
          if (!value.trim()) return;
          navigate(`/search?query=${encodeURI(value.trim())}`);
        }}
      />

      <Card style={{ marginTop: "24px" }}>
        <ResultList
          pagination={{
            onChange: page => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              navigate(`/search?page=${page}&query=${queryState.queryString}`);
            },
            pageSize: 20,
            pageSizeOptions: [],
            total: data.totalCount,
            current: queryState.pageNum,
          }}
          dataSource={data.books}
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default LandingPage;
