import React from "react";
import { Layout, Row, Col, Input, Card, Typography } from "antd";
import { GiBookshelf } from "react-icons/gi";
import { TiThList } from "react-icons/ti";
import { BsFileEarmarkPlus } from "react-icons/bs";
import { SearchOutlined } from "@ant-design/icons";
import { navigate } from "gatsby";
import logo from "../images/nile_dark.svg";


const { Content } = Layout;
const { Text } = Typography;

const LandingPage = (): React.FC => {
	return (
		<>
		<Layout>
		<Content style={{minHeight: "100vh"}}>
		<div style={{display: "flex", justifyContent: "center", margin: "18px 0"}}>
		<Row justify="center" align="middle" gutter={36} style={{width: "50%", minWidth: 450, maxWidth: 840}}>
			<Col xs={24} style={{textAlign: "center", marginTop: 36, margin: "18px 0"}}>
			<img src={logo} style={{height: 120, cursor: "pointer"}} onClick={() => navigate(`/`)} />
			</Col>

			<Col xs={24} style={{textAlign: "center", margin: "18px 0", width: "50%", minWidth: 420, maxWidth: 840}}>
			<Input style={{fontSize: 24}} size="large" placeholder="🔍 Search for a book" autoFocus onPressEnter={(e) => {
				if (e.currentTarget.getAttribute("value").trim()) navigate(`/search?query=${e.currentTarget.getAttribute("value")}`)
			}} />
			</Col>

			<Col xs={12} style={{textAlign: "center", margin: "18px 0"}}>
			<Card
				hoverable
				cover={<TiThList style={{fontSize: 128, marginTop: 24}} />}
				style={{borderRadius: 5}}
				onClick={() => navigate(`/genres`)}
			>
				<Card.Meta title={<Text strong style={{fontSize: 24}}>Book Genres</Text>} />
			</Card>
			</Col>
			<Col xs={12} style={{textAlign: "center", margin: "18px 0"}}>
			<Card
				hoverable
				cover={<GiBookshelf style={{fontSize: 128, marginTop: 24}} />}
				style={{borderRadius: 5}}
				onClick={() => navigate(`/books`)}
			>
				<Card.Meta title={<Text strong style={{fontSize: 24}}>All Books</Text>} />
			</Card>
			</Col>

			<Col xs={24} style={{textAlign: "center", margin: "18px 0"}}>
			<Card
				hoverable
				cover={<BsFileEarmarkPlus style={{fontSize: 128, marginTop: 24}} />}
				style={{borderRadius: 5}}
				onClick={() => navigate(`/new`)}
			>
				<Card.Meta title={<Text strong style={{fontSize: 24}}>New Book</Text>} />
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