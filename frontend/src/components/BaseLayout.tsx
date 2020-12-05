import React, { useState } from "react";
import { Input, Layout, Button, Space, Menu, BackTop } from "antd";
import { navigate, Link } from "gatsby";
import { useLocation } from "@reach/router";
import { BsSearch } from "react-icons/bs";
import logo from "../images/nile_dark.svg";

const { Header, Content } = Layout;

interface Props {
  width?: string;
}
const BaseLayout: React.FC<Props> = ({ children, width }) => {
  const [queryString, setQueryString] = useState("");

  const navigateToQuery = () => {
    if (queryString.trim()) {
      navigate(`/search?query=${encodeURI(queryString.trim())}`);
    } else {
      navigate(`/search`);
    }
  };
  const location = useLocation();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          background: "white",
          boxShadow: "0 2px 8px #f0f1f2",
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            height: "100%",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link to="/">
            <img
              src={logo}
              alt=""
              style={{ cursor: "pointer", height: "40px" }}
            />
          </Link>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Space size={32}>
              <Menu mode="horizontal" selectedKeys={[location.pathname]}>
                <Menu.Item key="/books">
                  <Link to="/books">Books</Link>
                </Menu.Item>
                <Menu.Item key="/genres">
                  <Link to="/genres">Genres</Link>
                </Menu.Item>
              </Menu>
              <div style={{ display: "flex", position: "relative" }}>
                <Input
                  style={{
                    fontSize: "1em",
                    height: "100%",
                    width: "40ch",
                    borderRadius: "16px",
                    padding: "4px 48px 4px 16px",
                  }}
                  value={queryString}
                  onChange={e => setQueryString(e.target.value)}
                  placeholder="Search for a book ..."
                  onPressEnter={navigateToQuery}
                />
                <Button
                  shape="circle"
                  type="ghost"
                  icon={<BsSearch />}
                  style={{
                    position: "absolute",
                    border: "none",
                    boxShadow: "none",
                    right: "4px",
                    top: 0,
                  }}
                  onClick={navigateToQuery}
                />
              </div>
            </Space>
          </div>
        </div>
      </Header>
      <Content style={{ background: "white" }}>
        <BackTop style={{ bottom: "100px" }} />
        <div
          style={{ display: "flex", justifyContent: "center", padding: "32px" }}
        >
          <div
            style={{
              display: "flex",
              width: width || "1024px",
              flexDirection: "column",
            }}
          >
            {children}
          </div>
        </div>
      </Content>
    </Layout>
  );
};
export default BaseLayout;
