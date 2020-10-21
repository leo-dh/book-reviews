enum EActionType {
	UPDATE_PERSISTENT_DATA,
	CLEAR_PERSISTENT_DATA,
}

interface IState {
	persistence: Record<string, unknown>,
}

interface IAction {
	type: EActionType,
}

interface IBook {
	title: string,
	author: string,
	asin: string,
	imUrl: string,
	price: number,
	categories: string[][],
	description? : string,
	related?: {
		also_viewed?: string[],
		buy_after_viewing?: string[],
	},
}

export { 
	EActionType, 
	IState, 
	IAction,
	IBook,
};