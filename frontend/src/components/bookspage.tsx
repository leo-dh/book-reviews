import React, { useState, useEffect } from "react";
import { Typography, Button, Card } from "antd";
import { IQueryResults } from "state/types";
import { Link } from "gatsby";
import ResultsList from "./ResultList";
import { getAllBooks } from "../services/api";

const { Title } = Typography;

const LandingPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<IQueryResults>({ books: [], totalCount: 0 });
  const [pageNum, setPageNum] = useState(0);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const result = await getAllBooks(1, 1);
      if (result) {
        setData(result);
        setPageNum(1);
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (pageNum === 0) return;
    (async () => {
      setLoading(true);
      const result = await getAllBooks(pageNum);
      if (result) {
        setData(prevData => {
          return {
            books: result.books,
            totalCount: prevData.totalCount,
          };
        });
      }
      setLoading(false);
    })();
  }, [pageNum]);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Title level={1} style={{ margin: 0 }}>
          Books
        </Title>
        <Button type="primary">
          <Link to="/new">Add Book</Link>
        </Button>
      </div>
      <Card style={{ marginTop: "24px" }}>
        <ResultsList
          loading={loading}
          dataSource={data.books}
          pagination={{
            onChange: page => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              setPageNum(page);
            },
            pageSize: 20,
            pageSizeOptions: [],
            total: data.totalCount,
            current: pageNum,
          }}
        />
      </Card>
    </div>
  );
};

export default LandingPage;
