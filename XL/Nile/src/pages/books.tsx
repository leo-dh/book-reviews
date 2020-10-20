import React from "react";
import { Provider } from "react-redux";
import { store } from "../state/store";
import BooksPage from "../components/bookspage";


const Page = (): React.FC => {
	return (
		<Provider store={store}>
			<BooksPage />
		</Provider>
	);
};

export default Page;
