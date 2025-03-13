import React, { useState } from "react";
import { SolutionOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Form, Input, Typography } from "antd";
import { Navigate, useNavigate } from "react-router";
import useHideMenu from "../hooks/useHideMenu";
import getUserStorage from "../helpers/getUserStorage";

const { Title } = Typography;

interface FormValues {
  userName: string;
  module: string;
}

const AdviserPage: React.FC = () => {
  const [user] = useState(getUserStorage());

  useHideMenu(false);

  const navigate = useNavigate();

  const onFinish = ({ userName, module }: FormValues) => {
    localStorage.setItem("userName", userName);
    localStorage.setItem("module", module);
    navigate("/asesor/modulo");
  };

  // const onFinishFailed = (errorInfo: any) => {
  //   console.log("Failed:", errorInfo);
  // }

  if (user.userName && user.module) {
    return <Navigate to="/asesor/modulo" />;
  }

  return (
    <>
      <Title level={2} style={{ textAlign: "center" }}>
        Ingresar
      </Title>
      <Form
        name="login"
        initialValues={{ remember: true }}
        style={{ maxWidth: 300, margin: "auto" }}
        onFinish={onFinish}
      >
        <Form.Item
          name="userName"
          rules={[
            {
              required: true,
              message: "Por favor ingresa tu nombre de usuario!",
            },
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="Nombre de usuario" />
        </Form.Item>
        <Form.Item
          name="module"
          rules={[
            {
              required: true,
              message: "Por favor ingresa el módulo de atención!",
            },
          ]}
        >
          <Input
            prefix={<SolutionOutlined />}
            type="number"
            placeholder="Módulo"
          />
        </Form.Item>

        <Form.Item>
          <Button block type="primary" htmlType="submit">
            Ingresar
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default AdviserPage;
