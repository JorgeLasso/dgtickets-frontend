import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { Button, Checkbox, Flex, Form, Input, Row, Typography } from "antd";
import React from "react";
import { Link } from "react-router";

const { Title } = Typography;

interface FormValues {
  email: string;
  password: string;
  remember: boolean;
}

const Login: React.FC = () => {
  const onFinish = ({ email, password, remember }: FormValues) => {
    localStorage.setItem("email", email);
    localStorage.setItem("password", password);
    localStorage.setItem("remember", remember.toString());
  };

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
          name="email"
          rules={[
            {
              required: true,
              message: "Por favor ingresa el correo electrónico!",
            },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="Correo Electrónico" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            { required: true, message: "Por favor ingresa la contraseña!" },
          ]}
        >
          <Input
            prefix={<LockOutlined />}
            type="password"
            placeholder="Contraseña"
          />
        </Form.Item>
        <Form.Item>
          <Flex justify="space-between" align="center">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Recuérdame</Checkbox>
            </Form.Item>
            <Link to="/recuperar-contraseña">¿Olvidaste la contraseña?</Link>
          </Flex>
        </Form.Item>

        <Form.Item>
          <Button block type="primary" htmlType="submit">
            Iniciar Sesión
          </Button>
        </Form.Item>
      </Form>
      <Row justify="center">
        <Link to="/registro"> Registrarse</Link>
      </Row>
    </>
  );
};

export default Login;
