import { IBook } from "../state/types";

const apiUrl = "http://127.0.0.1:8000/api";

interface IRequest {
	endpoint: string,
	headers?: Record<string, unknown>,
	params?: Record<string, unknown>,
	data?: Record<string, unknown>,
}

async function makeRequest(
	request: IRequest,
	method: string
): Record<string, unknown> {
	let url = `${apiUrl}/${request.endpoint}`
	if (request.params)
		Object.keys(request.params).forEach((param, ind) => {
			url += `${ind === 0 ? "?" : "&"}${param}=${request.params[param]}`
		})
	const headers = ({
		"Content-Type": "application/json",
		...request.headers,
	} as unknown) as Headers
	try {
		const response = await fetch(url, {
			method: method,
			headers: headers,
			body: request.data ? JSON.stringify(request.data) : null,
		})
		return await response.json()
	} catch (e) {
		console.log(e)
	}
}

async function get(request: IRequest): Record<string, unknown> {
	return await makeRequest(request, "GET")
}

async function patch(request: IRequest): Record<string, unknown> {
	return await makeRequest(request, "PATCH")
}

async function post(request: IRequest): Record<string, unknown> {
	return await makeRequest(request, "POST")
}


async function getSearchQuery(query: string, page = 1): IBook[] {
	const result = await get({
		endpoint: `search`,
		params: {
			query: query,
			page: page,
		}
	});
	if (!result) return null;
	return (result as unknown) as IBook[];
}

async function getGenreQuery(query: string, page = 1): IBook[] {
	const result = await post({
		endpoint: `genre`,
		params: {
			page: page,
		},
		data: {
			query: query,
		},
	});
	if (!result) return null;
	return (result as unknown) as IBook[];
}


export {
	getSearchQuery,
	getGenreQuery,
};