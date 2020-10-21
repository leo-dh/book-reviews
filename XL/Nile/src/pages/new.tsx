import React from "react";
import { Provider } from "react-redux";
import { store } from "../state/store";
import NewPage from "../components/newpage";


const Page = (): React.FC => {
	return (
		<Provider store={store}>
			<NewPage />
		</Provider>
	);
};

export default Page;
