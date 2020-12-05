import React from "react";
import { Provider } from "react-redux";
import { store } from "../state/store";
import BaseLayout from "../components/BaseLayout";
import LandingPage from "../components/landingpage";

const Page: React.FC = () => {
  return (
    <Provider store={store}>
      <BaseLayout>
        <LandingPage />
      </BaseLayout>
    </Provider>
  );
};

export default Page;
