import React, { useState } from "react";
import {
  Button,
  Form,
  Input,
  Popover,
  TreeSelect,
  Typography,
  Result,
} from "antd";
import { Link, navigate } from "gatsby";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import categories from "../../content/categories.json";
import { instanceOfIAPIError, postNewBook } from "../services/api";

const { Title } = Typography;
const { TextArea } = Input;
const { useForm } = Form;

enum ResultState {
  FORM,
  SUCCESS,
}

const LandingPage: React.FC = () => {
  const [form] = useForm();
  const [previewImageSrc, setPreviewImageSrc] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultState, setResultState] = useState(ResultState.FORM);
  const [newBookId, setNewBookId] = useState("");

  const ResultSuccess = () => {
    return (
      <Result
        style={{ marginTop: "24px" }}
        status="success"
        title="You have successfully added a new book!"
        subTitle={
          <>
            Book ID:
            <Link to={`/book/${newBookId}`}>{` ${newBookId}`}</Link>
          </>
        }
        extra={[
          <Button type="primary" key="home" onClick={() => navigate(`/`)}>
            Back Home
          </Button>,
          <Button
            key="add"
            onClick={() => {
              setResultState(ResultState.FORM);
            }}
          >
            Add Another Book
          </Button>,
        ]}
      />
    );
  };

  const ResultForm = () => {
    return (
      <Form
        style={{ marginTop: "24px" }}
        validateTrigger="onBlur"
        requiredMark={false}
        layout="vertical"
        form={form}
        onFinish={values => {
          const {
            author,
            title,
            categories: genres,
            description,
            imUrl,
          } = values;
          const c = genres.map((g: string) => g.split(" / "));
          console.log({ author, title, description, imUrl, categories: c });
          setLoading(true);
          postNewBook({
            author,
            title,
            description,
            imUrl,
            categories: c,
          }).then(value => {
            if (value && !instanceOfIAPIError(value)) {
              setResultState(ResultState.SUCCESS);
              setNewBookId(value.asin);
              form.resetFields();
            }
            setLoading(false);
          });
        }}
      >
        <Form.Item label="Book Title" name="title" rules={[{ required: true }]}>
          <Input allowClear />
        </Form.Item>
        <Form.Item label="Author" name="author" rules={[{ required: true }]}>
          <Input allowClear />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <TextArea
            autoSize={{ minRows: 3, maxRows: 6 }}
            placeholder="General description of the book"
          />
        </Form.Item>
        <Form.Item
          label="Book Cover"
          name="imUrl"
          tooltip="URL to book cover image."
          rules={[{ required: true, message: "An image url is required." }]}
        >
          <div style={{ display: "flex" }}>
            <Input allowClear placeholder="http://...." />
            <Popover
              content={
                <img
                  src={previewImageSrc}
                  style={{ height: "200px", width: "200px" }}
                />
              }
              trigger="click"
            >
              <Button
                onClick={() => {
                  setPreviewImageSrc(form.getFieldValue("imUrl"));
                }}
                type="ghost"
              >
                Preview
              </Button>
            </Popover>
          </div>
        </Form.Item>
        <Form.Item
          name="categories"
          label="Genres"
          rules={[
            {
              required: true,
              message: "Please select at least 1 genre.",
              type: "array",
            },
          ]}
        >
          <TreeSelect
            showSearch
            allowClear
            multiple
            dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
            treeData={categories}
            placeholder="Please select the relevant genres."
            onChange={values => {
              console.log(values);
            }}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    );
  };

  const getComponent = (key: ResultState) => {
    switch (key) {
      case ResultState.SUCCESS: {
        return ResultSuccess();
      }
      case ResultState.FORM: {
        return ResultForm();
      }
      default:
        return ResultForm();
    }
  };
  return (
    <>
      <Title level={1}>Add Book</Title>

      <SwitchTransition>
        <CSSTransition
          key={resultState}
          timeout={500}
          addEndListener={(node, done) =>
            node.addEventListener("transitionend", done, false)
          }
          classNames="fade"
        >
          {getComponent(resultState)}
        </CSSTransition>
      </SwitchTransition>
    </>
  );
};

export default LandingPage;
