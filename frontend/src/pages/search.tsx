import React from "react";
import { Provider } from "react-redux";
import { store } from "../state/store";
import SearchPage from "../components/searchpage";
import BaseLayout from "../components/BaseLayout";

const Page: React.FC = () => {
  return (
    <Provider store={store}>
      <BaseLayout>
        <SearchPage />
      </BaseLayout>
    </Provider>
  );
};

export default Page;
