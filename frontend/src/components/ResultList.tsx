import { Skeleton, List, Typography } from "antd";
import { PaginationConfig } from "antd/lib/pagination";
import { navigate, Link } from "gatsby";
import React, { CSSProperties } from "react";
import { SwitchTransition, CSSTransition } from "react-transition-group";
import { IBook } from "state/types";

const { Paragraph } = Typography;

interface ResultListProps {
  pagination: PaginationConfig;
  dataSource: IBook[];
  loading: boolean;
  style?: CSSProperties;
}

const decodeHTMLEntities = (str: string) => {
  const el = document.createElement("span");
  el.innerHTML = str;
  return el.innerHTML;
};

const ResultList: React.FC<ResultListProps> = ({
  pagination,
  dataSource,
  loading,
  style,
}) => {
  return (
    <List
      style={style}
      id="resultsList"
      size="large"
      itemLayout="vertical"
      pagination={pagination}
      loading={loading && dataSource.length === 0}
      dataSource={dataSource}
      renderItem={item => (
        <SwitchTransition>
          <CSSTransition
            key={loading ? "loading" : "data"}
            timeout={300}
            addEndListener={(node, done) =>
              node.addEventListener("transitionend", done, false)
            }
            classNames="fade"
          >
            <List.Item
              key={item.asin}
              extra={
                !loading ? (
                  <img
                    src={item.imUrl}
                    width={150}
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/book/${item.asin}`)}
                  />
                ) : (
                  <Skeleton.Image style={{ width: 150, height: 150 }} />
                )
              }
            >
              <Skeleton loading={loading} active>
                <List.Item.Meta
                  title={
                    <Link
                      to={`/book/${item.asin}`}
                      style={{ fontWeight: 600, fontSize: 20 }}
                      className="link-hover lineClamp"
                    >
                      {item.title || "Default Title"}
                    </Link>
                  }
                  description={item.author || "Default Author"}
                />
                <Paragraph
                  ellipsis={{ rows: 3, expandable: true, symbol: "more" }}
                  style={{ maxWidth: "100%" }}
                >
                  {decodeHTMLEntities(
                    item.description || "No description provided.",
                  )}
                </Paragraph>
              </Skeleton>
            </List.Item>
          </CSSTransition>
        </SwitchTransition>
      )}
    />
  );
};

export default ResultList;
