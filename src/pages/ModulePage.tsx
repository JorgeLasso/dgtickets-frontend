import { CloseOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Col, Divider, Row, Typography } from "antd";
import React, { useState } from "react";
import useHideMenu from "../hooks/useHideMenu";
import getUserStorage from "../helpers/getUserStorage";
import { Navigate, useNavigate } from "react-router";

const { Title, Text } = Typography;

const ModulePage: React.FC = () => {
  const [user] = useState(getUserStorage());
  const navigate = useNavigate();

  useHideMenu(false);

  const Exit = () => {
    localStorage.clear();
    navigate("/asesor/ingresar");
  };

  const Next = () => {
    console.log("Atendiendo siguiente ticket...");
  };

  if (!user.userName || !user.module) {
    return <Navigate to="/asesor/ingresar" />;
  }

  return (
    <>
      <Row justify={"end"}>
        <Col style={{ textAlign: "right" }}>
          <Button
            icon={<CloseOutlined />}
            danger
            onClick={() => {
              Exit();
            }}
          >
            Salir
          </Button>
        </Col>
      </Row>

      <Row justify={"center"}>
        <Col style={{ textAlign: "center" }}>
          <Title level={2}>{user.userName}</Title>
          <Text>Usted está trabajando en el módulo: </Text>
          <Text strong type="success">
            {user.module}
          </Text>
        </Col>
      </Row>

      <Divider />

      <Row justify={"center"}>
        <Col>
          <Text>Está atendiendo el Ticket número: </Text>
        </Col>
      </Row>

      <Row justify={"center"}>
        <Col>
          <Text strong type="danger" style={{ fontSize: 50 }}>
            1
          </Text>
        </Col>
      </Row>

      <Row justify={"end"}>
        <Col style={{ textAlign: "right" }}>
          <Button
            type="primary"
            icon={<RightOutlined />}
            onClick={() => {
              Next();
            }}
          >
            Siguiente
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default ModulePage;
