import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button, Form, Input, Row, Select, Typography } from "antd";
import { RegisterFormValues } from "../types/auth/auth.types";
import { City } from "../types/user/user.types";
import useNotification from "../hooks/useNotification";
import { AuthContext } from "../auth/AuthContext";
import useFetch from "../hooks/useFetch";

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

const Register: React.FC = () => {
  const [form] = Form.useForm();
  const { openNotification } = useNotification();
  const [cities, setCities] = useState<City[]>([]);
  const { get } = useFetch<City[]>();
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  if (!auth) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }

  const { register, isLoading } = auth;

  useEffect(() => {
    const getCities = async () => {
      try {
        const { cities } = await get("/cities");
        setCities(cities || []);
      } catch (error) {
        console.error(error);
        openNotification(
          "error",
          "Error al obtener ciudades",
          "No se pudieron cargar las ciudades, intenta nuevamente!"
        );
      }
    };
    getCities();
  }, [get, openNotification]);

  const onFinish = async (values: RegisterFormValues) => {
    try {
      const { firstName, lastName, cityId, email, password } = values;

      register(firstName, lastName, email, password, cityId, null);
    } catch (error) {
      console.error("Error al registrar el usuario: ", error);
    } finally {
      form.resetFields();
      navigate("/login");
    }
  };

  return (
    <>
      <Form
        {...formItemLayout}
        form={form}
        name="register"
        onFinish={onFinish}
        style={{ maxWidth: 600, margin: "auto" }}
        scrollToFirstError
      >
        <Title level={2} style={{ textAlign: "center" }}>
          Registro
        </Title>
        <Form.Item
          name="firstName"
          label="Nombres"
          rules={[
            {
              required: true,
              message: "Por favor ingresa tu nombre!",
              whitespace: true,
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="lastName"
          label="Apellidos"
          rules={[
            {
              required: true,
              message: "Por favor ingresa tu apellido!",
              whitespace: true,
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="cityId"
          label="Ciudad"
          rules={[
            {
              required: true,
              message: "Por favor selecciona tu ciudad!",
            },
          ]}
        >
          <Select style={{ width: "100%" }}>
            {cities.map((city) => (
              <Select.Option key={city.id} value={city.id}>
                {city.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

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
            {isLoading ? "Registrando..." : "Registrarse"}
          </Button>
          <Row style={{ marginTop: 10 }}>
            <span>
              ¿Ya tienes una cuenta? <Link to="/login">Ingresa aquí</Link>
            </span>
          </Row>
        </Form.Item>
      </Form>
    </>
  );
};

export default Register;
