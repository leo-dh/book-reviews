import React, { useState } from "react";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import {
  Comment,
  Image,
  Tag,
  Typography,
  Avatar,
  Space,
  Rate,
  List,
  Skeleton,
  Form,
  Input,
  Button,
  Select,
  message,
  Result,
} from "antd";
import { LikeOutlined } from "@ant-design/icons";
import { Link, navigate } from "gatsby";
import { IBook, IBookReview } from "state/types";
import useGetBookDetails from "../hooks/useGetBookDetails";
import { instanceOfIAPIError, postUserReview } from "../services/api";

const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { useForm } = Form;

interface BookPageProps {
  id: string;
}

enum SortTypes {
  DATE,
  RATING,
  HELPFULNESS,
}

const decodeHTMLEntities = (str: string) => {
  const el = document.createElement("span");
  el.innerHTML = str.replace(/&nbsp;/g, " ");
  return el.innerHTML;
};

const BookPage: React.FC<BookPageProps> = ({ id }) => {
  const [request, setRequest] = useGetBookDetails(id);
  const [form] = useForm();
  const [sortMethod, setSortMethod] = useState<SortTypes | "">("");

  const LoadingTemplate: React.FC = () => (
    <>
      <div style={{ display: "flex", width: "100%", flexDirection: "column" }}>
        <Space size={24}>
          <Skeleton.Image style={{ width: "300px", height: "300px" }} />
          <Skeleton
            active
            paragraph={{ rows: 7, width: ["700px", "700px", "700px"] }}
          />
        </Space>
        <div style={{ marginTop: "32px" }}>
          <Skeleton.Input
            active
            style={{ width: "150px", marginBottom: "32px" }}
          />
          <Skeleton active avatar />
          <Skeleton active avatar />
        </div>
      </div>
    </>
  );

  const NotFoundTemplate: React.FC = () => (
    <Result
      status="404"
      title="404"
      subTitle="Sorry, the page you visited does not exist."
      extra={
        <Button type="primary" onClick={() => navigate("/")}>
          Back Home
        </Button>
      }
    />
  );

  const DataTemplate: React.FC<{
    metadata: IBook;
    reviews: IBookReview[];
  }> = ({ metadata, reviews }) => {
    const categories = metadata.categories.map(value => {
      const text =
        value[0] === "Kindle Store"
          ? `[Kindle] ${value[value.length - 1]}`
          : value[value.length - 1];
      return {
        key: value,
        text,
      };
    });
    const rating =
      reviews.reduce((all, currentValue) => {
        return all + currentValue.overall;
      }, 0) / reviews.length;

    const formatDate = (dateString: string) => {
      const date = new Date(dateString).toDateString().slice(4);
      return date.replace(/(\w{3} \d+)/, "$1,");
    };

    const helpfulRating = (helpfulNum: number) => {
      if (helpfulNum === 0) {
        return "";
      }
      const noun = helpfulNum === 1 ? "person" : "people";
      return (
        <>
          <LikeOutlined style={{ display: "inline" }} />
          <span>{`${helpfulNum} ${noun} found this helpful`}</span>
        </>
      );
    };
    /* eslint-disable no-template-curly-in-string */
    const formValidateMessages = {
      required: "${label} is required!",
      whitespace: "${label} should have at least one character.",
    };
    /* eslint-enable no-template-curly-in-string */

    switch (sortMethod) {
      case SortTypes.DATE:
        reviews.sort((a, b) => {
          return new Date(b.date).valueOf() - new Date(a.date).valueOf();
        });
        break;
      case SortTypes.HELPFULNESS:
        reviews.sort((a, b) => {
          return b.helpful_num - a.helpful_num;
        });
        break;
      case SortTypes.RATING:
        reviews.sort((a, b) => {
          return b.overall - a.overall;
        });
        break;
      default:
        break;
    }

    return (
      <>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            maxWidth: "100%",
          }}
        >
          <div style={{ flex: "0 0 300px", alignSelf: "start" }}>
            <Image src={metadata.imUrl} width={300} height={300} />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginLeft: "24px",
              wordBreak: "break-word",
            }}
          >
            <Title
              style={{ marginBottom: "4px" }}
              ellipsis={{ rows: 2, expandable: true, symbol: "more" }}
            >
              {metadata.title || "Title"}
            </Title>
            <Title
              level={4}
              type="secondary"
              style={{ marginTop: 0, marginBottom: "8px" }}
            >
              {metadata.author || "Author"}
            </Title>
            <Rate
              disabled
              defaultValue={rating}
              allowHalf
              style={{ marginTop: "-8px" }}
              tooltips={Array(5).fill((rating || 0).toString())}
            />
            <Paragraph
              style={{ marginBottom: "32px", marginTop: "24px" }}
              ellipsis={{ rows: 4, symbol: "more", expandable: true }}
            >
              {decodeHTMLEntities(
                metadata.description || "No description provided.",
              )}
            </Paragraph>
            <div>
              {categories.map(category => {
                return (
                  <Tag
                    style={{ marginBottom: "8px" }}
                    key={category.text}
                    className="tag-hover"
                  >
                    <Link to="/genres" state={{ genre: category.key }}>
                      {category.text}
                    </Link>
                  </Tag>
                );
              })}
            </div>
          </div>
        </div>
        <div style={{ marginTop: "52px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Title level={2}>Reviews</Title>
            {reviews.length > 0 && (
              <Select
                style={{ width: "20ch" }}
                placeholder="Sort by ..."
                onChange={(value: SortTypes) => {
                  setSortMethod(value);
                }}
              >
                <Option value={SortTypes.DATE}>Sort by date</Option>
                <Option value={SortTypes.HELPFULNESS}>
                  Sort by helpfulness
                </Option>
                <Option value={SortTypes.RATING}>Sort by rating</Option>
              </Select>
            )}
          </div>
          <List
            style={{ marginTop: "24px" }}
            itemLayout="horizontal"
            dataSource={reviews}
            renderItem={review => (
              <Comment
                actions={[helpfulRating(review.helpful_num)]}
                content={
                  <Space size={8} direction="vertical">
                    <div>
                      <Rate
                        disabled
                        defaultValue={review.overall}
                        className="small"
                      />
                      <Text strong style={{ marginLeft: "16px" }}>
                        {review.summary}
                      </Text>
                    </div>
                    <Text>{review.text}</Text>
                  </Space>
                }
                datetime={<span>{formatDate(review.date)}</span>}
                author={review.reviewer_name}
                avatar={<Avatar>{review.reviewer_name[0]}</Avatar>}
              />
            )}
          />
          <Title level={4} style={{ marginTop: "32px" }}>
            Submit Review
          </Title>
          <Form
            style={{ marginTop: "24px" }}
            form={form}
            onFinish={values => {
              message.loading({
                content: "Submitting Review ... ",
                key: "messageKey",
              });
              postUserReview(id, values).then(result => {
                if (!result || instanceOfIAPIError(result)) {
                  message.error(
                    {
                      content: "Failed to submit review.",
                      key: "errorKey",
                    },
                    1000,
                  );
                } else {
                  message.success(
                    { content: "Review Submitted!", key: "messageKey" },
                    1000,
                  );
                  setRequest(prevState => {
                    return {
                      loading: prevState.loading,
                      data: {
                        metadata: prevState.data!.metadata,
                        reviews: result,
                      },
                    };
                  });
                }
              });
              form.resetFields();
            }}
            layout="vertical"
            requiredMark={false}
            validateMessages={formValidateMessages}
            validateTrigger="onBlur"
          >
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, whitespace: true, max: 64 }]}
            >
              <Input maxLength={64} />
            </Form.Item>
            <Form.Item
              name="summary"
              label="Summary"
              rules={[{ required: true, whitespace: true, max: 512 }]}
            >
              <Input maxLength={512} />
            </Form.Item>
            <Form.Item
              name="text"
              label="Review"
              rules={[{ required: true, whitespace: true }]}
            >
              <TextArea autoSize={{ minRows: 3, maxRows: 6 }} />
            </Form.Item>
            <Form.Item
              name="overall"
              label="Rating"
              rules={[{ required: true }]}
            >
              <Rate />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </div>
      </>
    );
  };

  const getTemplate = () => {
    if (request.loading) {
      return <LoadingTemplate />;
    }
    if (!request.data) {
      return <NotFoundTemplate />;
    }
    const { reviews, metadata } = request.data;
    return <DataTemplate reviews={reviews} metadata={metadata} />;
  };

  const getKey = () => {
    if (request.loading) {
      return "loading";
    }
    if (!request.data) {
      return "error";
    }
    return "data";
  };

  return (
    <SwitchTransition>
      <CSSTransition
        key={getKey()}
        timeout={500}
        addEndListener={(node, done) =>
          node.addEventListener("transitionend", done, false)
        }
        classNames="fade"
      >
        {getTemplate()}
      </CSSTransition>
    </SwitchTransition>
  );
};

export default BookPage;
