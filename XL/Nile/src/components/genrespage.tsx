import React, { useEffect, useState } from "react";
import { Layout, Row, Col, Input, Card, Typography, Tree, Button, Divider, List, Collapse } from "antd";
import logo from "../images/nile_dark.svg";
import { navigate } from "gatsby";
import categories from "../../content/categories.json";
import { getGenreQuery } from "../services/api";
import { IBook } from "../state/types";


const { Content } = Layout;
const { Text } = Typography;

const LandingPage = (): React.FC => {
	const [loading, setLoading] = useState<boolean>(false);
	const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
	const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
	const [data, setData] = useState<IBook[]>([]);

	const leaves = checkedKeys.filter((key) => key[key.length - 1] === "|").map((key) => key.slice(0, key.length - 1));

	const performQuery = async () => {
		if (!leaves.length) return;
		setLoading(true);
		const query = JSON.stringify(leaves.map((leaf) => leaf.split(" / ")));
		const result = await getGenreQuery(query);
		if (result) setData(result);
		console.log(result);
		setLoading(false);
	};

	return (
		<>
		<Layout>
		<Content style={{minHeight: "100vh"}}>
		<div style={{display: "flex", justifyContent: "center", margin: "18px 0"}}>
		<Row justify="center" align="middle" gutter={36} style={{width: "80%", minWidth: 450, maxWidth: 1280}}>
			<Col xs={24} style={{textAlign: "center", marginTop: 36, margin: "18px 0", width: "50%", minWidth: 450, maxWidth: 840}}>
			<img src={logo} style={{height: 120, cursor: "pointer"}} onClick={() => navigate(`/`)} />
			</Col>

			<Col xs={24} style={{textAlign: "center", margin: "18px 0", width: "50%", minWidth: 450, maxWidth: 840}}>
			<Button
				type="primary"
				block
				style={{fontSize: 24, height: 60, borderRadius: 7}}
				disabled={leaves.length === 0}
				onClick={performQuery}
			>Find</Button>
			</Col>

			<Col xs={24} style={{textAlign: "center", margin: "18px 0", width: "50%", minWidth: 450, maxWidth: 840}}>
			<Card>
			<Collapse defaultActiveKey={["genres"]}>
			<Collapse.Panel header="Genres" key="genres">
			<Tree
				style={{fontSize: 18}}
				showLine
				showIcon
				checkable
				selectable={false}
				onExpand={(keys) => setExpandedKeys(keys as string[])}
				expandedKeys={expandedKeys}
				onCheck={(keys) => setCheckedKeys(keys as string[])}
				checkedKeys={checkedKeys}
				treeData={categories}
			/>
			</Collapse.Panel>
			</Collapse>
			</Card>
			</Col>

			<Col xs={24} style={{textAlign: "center", margin: "18px 0"}}>
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