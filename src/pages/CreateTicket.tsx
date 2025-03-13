import React from "react";
import { Button, Col, Divider, Row, Typography } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import useHideMenu from "../hooks/useHideMenu";

const { Title, Text } = Typography;

const CreateTicket: React.FC = () => {
  useHideMenu(true);

  const newTicket = () => {
    console.log("Ticket created");
  };

  return (
    <>
      <Row justify={"center"}>
        <Col style={{ textAlign: "center" }}>
          <Title level={3}>Presione el botón para crear un ticket</Title>

          <Button
            type="primary"
            icon={<DownloadOutlined />}
            size="large"
            onClick={() => newTicket()}
          >
            Nuevo Ticket
          </Button>
        </Col>
      </Row>
      <Divider />

      <Row justify={"center"}>
        <Col>
          <Text>Su número: </Text>
        </Col>
      </Row>

      <Row justify={"center"}>
        <Col>
          <Text strong type="danger" style={{ fontSize: 50 }}>
            1
          </Text>
        </Col>
      </Row>
    </>
  );
};

export default CreateTicket;
