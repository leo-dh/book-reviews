import React from "react";
import { Provider } from "react-redux";
import { store } from "../state/store";
import BaseLayout from "../components/BaseLayout";
import BookPage from "../components/BookPage";

interface BookDetailsPageProps {
  id: string;
}

const BookDetailsPage: React.FC<BookDetailsPageProps> = ({ id }) => {
  return (
    <Provider store={store}>
      <BaseLayout>
        <BookPage id={id} />
      </BaseLayout>
    </Provider>
  );
};

export default BookDetailsPage;
