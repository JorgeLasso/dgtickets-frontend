import React, { useState } from "react";
import { Button, Form, Input, Typography } from "antd";
import { BASE_API_URL } from "../services/api";
import useNotification from "../hooks/useNotification";

const { Title } = Typography;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};

interface FormValues {
  email: string;
  password: string;
  confirm: string;
}

const ChangePassword: React.FC = () => {
  const [form] = Form.useForm();
  const { openNotification } = useNotification();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onFinish = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const token = new URLSearchParams(window.location.search).get("token");
      const response = await fetch(`${BASE_API_URL}/auth/update-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          token,
        }),
      });

      if (!response.ok) {
        openNotification(
          "error",
          "Error al cambiar la contraseña",
          "No se pudo cambiar la contraseña, intenta nuevamente!"
        );
        return;
      }

      openNotification(
        "success",
        "Contraseña actualizada",
        "Tu contraseña ha sido actualizada exitosamente!"
      );
      form.resetFields();
    } catch (error) {
      console.error(error);
      openNotification(
        "error",
        "Error al cambiar la contraseña",
        "Ocurrió un error inesperado, intenta nuevamente!"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Title level={2} style={{ textAlign: "center" }}>
        Cambiar contraseña
      </Title>
      <Form
        {...formItemLayout}
        form={form}
        name="change-password"
        style={{ maxWidth: 600, margin: "auto" }}
        onFinish={onFinish}
        scrollToFirstError
      >
        <Form.Item
          name="email"
          label="Correo electrónico"
          rules={[
            {
              type: "email",
              message: "Ingresa un correo electrónico válido!",
            },
            {
              required: true,
              message: "Por favor ingresa tu correo electrónico!",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="password"
          label="Contraseña"
          rules={[
            {
              required: true,
              message: "Por favor ingresa tu contraseña!",
            },
            {
              min: 6,
              message: "La contraseña debe tener al menos 6 caracteres!",
            },
          ]}
          hasFeedback
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="confirm"
          label="Confirmar contraseña"
          dependencies={["password"]}
          hasFeedback
          rules={[
            {
              required: true,
              message: "Por favor confirma la contraseña!",
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("Las contraseñas no coinciden!")
                );
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item {...tailFormItemLayout}>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? "Actualizando contraseña..." : "Actualizar contraseña"}
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default ChangePassword;
