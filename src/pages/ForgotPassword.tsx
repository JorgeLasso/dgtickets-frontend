import React from "react";
import { Form, Input, Button, Typography, Row } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { Link } from "react-router";
import useNotification from "../hooks/useNotification";
import useFetch from "../hooks/useFetch";

const { Title } = Typography;

const ForgotPassword: React.FC = () => {
  const [form] = Form.useForm();
  const { openNotification } = useNotification();
  const { post, isLoading } = useFetch();

  const onFinish = async (values: { email: string }) => {
    try {
      await post("/auth/recovery-password", values);

      openNotification(
        "success",
        "Correo enviado",
        "Se ha enviado un correo para recuperar tu contraseña!"
      );
      form.resetFields();
    } catch (error) {
      console.error("Error sending recovery email:", error);
      openNotification(
        "error",
        "Error al enviar el correo",
        "Ocurrió un error inesperado, intenta nuevamente!"
      );
    }
  };

  return (
    <>
      <Title level={2} style={{ textAlign: "center" }}>
        Recuperar contraseña
      </Title>

      <Form
        name="forgot-password-form"
        form={form}
        style={{ maxWidth: 300, margin: "auto" }}
        onFinish={onFinish}
      >
        <Form.Item
          name="email"
          rules={[
            {
              required: true,
              message: "Por favor ingresa tu correo electrónico",
            },
            {
              type: "email",
              message: "Ingresa un correo electrónico válido",
            },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="Correo electrónico" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={isLoading}>
            Enviar enlace de recuperación
          </Button>
        </Form.Item>
      </Form>

      <Row justify="center">
        <Link to="/login">Regresar</Link>
      </Row>
    </>
  );
};

export default ForgotPassword;
