import React from "react";
import { Provider } from "react-redux";
import { store } from "../state/store";
import LandingPage from "../components/landingpage";


const Page = (): React.FC => {
	return (
		<Provider store={store}>
			<LandingPage />
		</Provider>
	);
};

export default Page;
