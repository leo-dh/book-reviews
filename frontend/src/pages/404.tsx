import React from "react";
import { Provider } from "react-redux";
import { store } from "../state/store";
import BaseLayout from "../components/BaseLayout";
// eslint-disable-next-line import/order
import { Result, Button } from "antd";
// eslint-disable-next-line import/order
import { navigate } from "gatsby";

const Page: React.FC = () => {
  return (
    <Provider store={store}>
      <BaseLayout>
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
      </BaseLayout>
    </Provider>
  );
};

export default Page;
