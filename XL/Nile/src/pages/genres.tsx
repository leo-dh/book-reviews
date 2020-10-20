import React from "react";
import { Provider } from "react-redux";
import { store } from "../state/store";
import GenresPage from "../components/genrespage";


const Page = (): React.FC => {
	return (
		<Provider store={store}>
			<GenresPage />
		</Provider>
	);
};

export default Page;
