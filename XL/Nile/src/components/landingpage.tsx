import React from "react";
import { Row, Col, Input, Card, Typography } from "antd";
import { GiBookshelf } from "react-icons/gi";
import { TiThList } from "react-icons/ti";
import { BsFileEarmarkPlus } from "react-icons/bs";
import { navigate } from "gatsby";

const { Text } = Typography;
const { Search } = Input;

const LandingPage: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        margin: "18px 0",
      }}
    >
      <Row
        justify="center"
        align="middle"
        gutter={36}
        style={{ width: "75%", minWidth: 450, maxWidth: 840 }}
      >
        <Col
          xs={24}
          style={{
            textAlign: "center",
            margin: "18px 0",
            width: "50%",
            minWidth: 420,
            maxWidth: 840,
          }}
        >
          <Search
            style={{ fontSize: 24 }}
            size="large"
            placeholder="Search with book title or author ... "
            allowClear
            enterButton
            autoFocus
            onSearch={value => {
              if (!value.trim()) return;
              navigate(`/search?query=${encodeURI(value.trim())}`);
            }}
          />
        </Col>

        <Col xs={12} style={{ textAlign: "center", margin: "18px 0" }}>
          <Card
            hoverable
            cover={<TiThList style={{ fontSize: 128, marginTop: 24 }} />}
            style={{ borderRadius: 5 }}
            onClick={() => navigate(`/genres`)}
          >
            <Card.Meta
              title={
                <Text strong style={{ fontSize: 24 }}>
                  Book Genres
                </Text>
              }
            />
          </Card>
        </Col>
        <Col xs={12} style={{ textAlign: "center", margin: "18px 0" }}>
          <Card
            hoverable
            cover={<GiBookshelf style={{ fontSize: 128, marginTop: 24 }} />}
            style={{ borderRadius: 5 }}
            onClick={() => navigate(`/books`)}
          >
            <Card.Meta
              title={
                <Text strong style={{ fontSize: 24 }}>
                  All Books
                </Text>
              }
            />
          </Card>
        </Col>

        <Col xs={24} style={{ textAlign: "center", margin: "18px 0" }}>
          <Card
            hoverable
            cover={
              <BsFileEarmarkPlus style={{ fontSize: 128, marginTop: 24 }} />
            }
            style={{ borderRadius: 5 }}
            onClick={() => navigate(`/new`)}
          >
            <Card.Meta
              title={
                <Text strong style={{ fontSize: 24 }}>
                  New Book
                </Text>
              }
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LandingPage;
