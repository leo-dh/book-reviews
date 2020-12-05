import React from "react";
import { Result, Button } from "antd";
import { Provider } from "react-redux";
import { navigate } from "gatsby";
import { store } from "../state/store";
import BaseLayout from "../components/BaseLayout";

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
