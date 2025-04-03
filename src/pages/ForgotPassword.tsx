import React, { useState } from "react";
import { Form, Input, Button, Typography, Row } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { Link } from "react-router";
import { BASE_API_URL } from "../services/api";
import useNotification from "../hooks/useNotification";

const { Title } = Typography;

const ForgotPassword: React.FC = () => {
  const [form] = Form.useForm();
  const { openNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);

  const onFinish = async (values: { email: string }) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_API_URL}/auth/recovery-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        openNotification(
          "error",
          "Error al enviar el correo",
          "No se pudo enviar el correo de recuperación, intenta nuevamente!"
        );
        return;
      }

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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Title level={2} style={{ textAlign: "center" }}>
        Recuperar contraseña
      </Title>

      <Form
        name="forgot-password-form"
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
