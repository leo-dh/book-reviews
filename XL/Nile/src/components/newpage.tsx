import React from "react";
import { Layout, Row, Col, Input, Card, Typography } from "antd";
import logo from "../images/nile_dark.svg";
import { navigate } from "gatsby";


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
		</Row>
		</div>
		</Content>
		</Layout>
		</>
	);
};

export default LandingPage;