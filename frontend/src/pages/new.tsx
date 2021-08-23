import React from "react";
import { Provider } from "react-redux";
import { store } from "../state/store";
import BaseLayout from "../components/BaseLayout";
import NewPage from "../components/newpage";

const Page: React.FC = () => {
  return (
    <Provider store={store}>
      <BaseLayout width="768px">
        <NewPage />
      </BaseLayout>
    </Provider>
  );
};

export default Page;
