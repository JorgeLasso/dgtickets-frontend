import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { Button, Checkbox, Flex, Form, Input, Row, Typography } from "antd";
import React, { useContext, useEffect } from "react";
import { Link } from "react-router";
import { LoginFormValues } from "../types/auth/auth.types";
import { AuthContext } from "../auth/AuthContext";

const { Title } = Typography;

const Login: React.FC = () => {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }
  const { login, isLoading } = authContext;
  const [form] = Form.useForm();

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (email) {
      form.setFieldsValue({ email });
      form.setFieldValue("remember", true);
    }
  }, [form]);

  const onFinish = async ({ email, password, remember }: LoginFormValues) => {
    if (remember) {
      localStorage.setItem("email", email);
    } else {
      localStorage.removeItem("email");
    }

    try {
      login(email, password);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    } finally {
      form.resetFields();
    }
  };

  return (
    <>
      <Title level={2} style={{ textAlign: "center" }}>
        Ingresar
      </Title>
      <Form
        form={form}
        name="login"
        initialValues={{ remember: true }}
        style={{ maxWidth: 300, margin: "auto" }}
        onFinish={onFinish}
      >
        <Form.Item
          name="email"
          initialValue={localStorage.getItem("email") || ""}
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
          <Button
            block
            type="primary"
            htmlType="submit"
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
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
