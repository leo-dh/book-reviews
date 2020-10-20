import React, { useEffect, useState } from "react";
import { Layout, Row, Col, Input, Card, Typography, List } from "antd";
import logo from "../images/nile_dark.svg";
import { navigate } from "gatsby";
import { getSearchQuery } from "../services/api";
import { IBook } from "../state/types";


const { Content } = Layout;
const { Text } = Typography;

const LandingPage = (): React.FC => {
	const [loading, setLoading] = useState<boolean>(false);
	const [data, setData] = useState<IBook[]>([]);
	const [query, setQuery] = useState<string>((new URLSearchParams(document.location.search.substring(1))).get("query"));

	if (!query.trim()) navigate(`/`);

	const performQuery = async (query) => {
		setLoading(true);
		const result = await getSearchQuery(query);
		if (result) setData(result);
		console.log(result);
		setLoading(false);
	};

	useEffect(() => {
		if (!query) return;
		performQuery(query);
	}, [query]);

	return (
		<>
		<Layout>
		<Content style={{minHeight: "100vh"}}>
		<div style={{display: "flex", justifyContent: "center", margin: "18px 0"}}>
		<Row justify="center" align="middle" gutter={36} style={{width: "80%", minWidth: 450, maxWidth: 1280}}>
			<Col xs={24} style={{textAlign: "center", marginTop: 36, margin: "18px 0"}}>
			<img src={logo} style={{height: 120, cursor: "pointer"}} onClick={() => navigate(`/`)} />
			</Col>

			<Col xs={24} style={{textAlign: "center", margin: "18px 0", width: "50%", minWidth: 450, maxWidth: 840}}>
			<Input style={{fontSize: 24}} size="large" defaultValue={query} placeholder="🔍 Search for a book" autoFocus onPressEnter={(e) => {
				if (e.currentTarget.getAttribute("value")) {
					const value = e.currentTarget.getAttribute("value");
					navigate(`/search?query=${value}`);
					setQuery(value);
				}
			}} />
			</Col>

			<Col xs={24} style={{margin: "18px 0"}}>
			<Card>
			<List
				size="large"
				dataSource={data}
				renderItem={(item) => (
					<a href={`http://amzn.com/${item.asin}`}>
					<List.Item
						key={item.asin}
						extra={<img src={item.imUrl} />}
						style={{cursor: "pointer"}}
					>
						<List.Item.Meta
							title={<Text style={{maxWidth: "100%"}} ellipsis>{item.title}</Text>}
							description={item.author}
						/>
					</List.Item>
					</a>
				)}
			/>
			</Card>
			</Col>
		</Row>
		</div>
		</Content>
		</Layout>
		</>
	);
};

export default LandingPage;