import React, { useEffect, useState } from "react";
import { Card, Tree, Button } from "antd";
import { useLocation } from "@reach/router";
import categories from "../../content/categories.json";
import { getGenreQuery } from "../services/api";
import { IBook } from "../state/types";
import ResultList from "./ResultList";

const LandingPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const [data, setData] = useState<IBook[]>([]);
  const [queryString, setQueryString] = useState<string>("");
  const [totalCount, setTotalCount] = useState<number>(0);
  const location = useLocation();

  const performQuery = async (pageNum = 1) => {
    if (!checkedKeys.length) return;
    setLoading(true);
    const newQueryString = JSON.stringify(
      checkedKeys.map(key => key.split(" / ")),
    );
    console.log(newQueryString);
    if (queryString === newQueryString) {
      const result = await getGenreQuery(newQueryString, pageNum);
      if (result) setData(result.books);
    } else {
      setQueryString(newQueryString);
      const result = await getGenreQuery(newQueryString, pageNum, 1);
      console.log(result);
      if (result) {
        setData(result.books);
        setTotalCount(result.totalCount || 0);
      }
    }
    setLoading(false);
  };
  useEffect(() => {
    const state = location.state as Record<string, any>;
    if (!state) return;
    if ("genre" in state) {
      const key = (state.genre as string[]).join(" / ");
      setCheckedKeys([key]);
      (async () => {
        setLoading(true);
        const qs = JSON.stringify([key].map(k => k.split(" / ")));
        console.log(qs);
        setQueryString(qs);
        const result = await getGenreQuery(qs, 1, 1);
        console.log(result);

        if (result) {
          setData(result.books);
          setTotalCount(result.totalCount || 0);
        }
        setLoading(false);
      })();
    }
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", width: "300px" }}>
        <Card>
          <Tree
            showIcon
            checkable
            selectable={false}
            onExpand={keys => setExpandedKeys(keys as string[])}
            expandedKeys={expandedKeys}
            onCheck={keys => setCheckedKeys(keys as string[])}
            onSelect={selectedKeys => {
              console.log({ selectedKeys });
            }}
            checkedKeys={checkedKeys}
            treeData={categories}
            height={500}
          />
        </Card>

        <Button
          style={{ marginTop: "16px" }}
          type="primary"
          block
          disabled={checkedKeys.length === 0}
          onClick={() => performQuery()}
          loading={loading}
        >
          {loading ? "Finding" : "Find"}
        </Button>
      </div>
      <Card style={{ marginLeft: "24px", flex: 1 }}>
        <ResultList
          pagination={{
            onChange: page => {
              window.scrollTo({ top: 0, behavior: "auto" });
              performQuery(page);
            },
            pageSize: 20,
            pageSizeOptions: [],
            total: totalCount,
          }}
          dataSource={data}
          loading={loading && data.length === 0}
        />
      </Card>
    </div>
  );
};

export default LandingPage;
