import React from "react";
import { Provider } from "react-redux";
import { store } from "../state/store";
import SearchPage from "../components/searchpage";


const Page = (): React.FC => {
	return (
		<Provider store={store}>
			<SearchPage />
		</Provider>
	);
};

export default Page;
