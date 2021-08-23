import React from "react";
import { Provider } from "react-redux";
import { store } from "../state/store";
import BaseLayout from "../components/BaseLayout";
import GenresPage from "../components/genrespage";

const Page: React.FC = () => {
  return (
    <Provider store={store}>
      <BaseLayout width="100%">
        <GenresPage />
      </BaseLayout>
    </Provider>
  );
};

export default Page;
