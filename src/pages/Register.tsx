import { Button, Form, Input, Row, Select, Typography } from "antd";
import { BASE_API_URL } from "../services/api";
import useNotification from "../hooks/useNotification";
import { useEffect, useState } from "react";
import { Link } from "react-router";

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

interface Register {
  firstName: string;
  lastName: string;
  cityId: number;
  email: string;
  password: string;
  confirm: string;
}

interface City {
  id: number;
  name: string;
  image: string;
  isActive: boolean;
  stateId: number;
}

const Register: React.FC = () => {
  const [form] = Form.useForm();
  const { openNotification } = useNotification();
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const getCities = async () => {
      try {
        const response = await fetch(`${BASE_API_URL}/cities`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error("Error al obtener las ciudades");
        }
        setCities(data.cities);
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
  }, [openNotification]);

  const onFinish = async (values: Register) => {
    setIsLoading(true);
    try {
      const { firstName, lastName, cityId, email, password } = values;
      const userData = {
        firstName,
        lastName,
        email,
        password,
        cityId,
        photo: null,
      };

      const response = await fetch(`${BASE_API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        openNotification(
          "error",
          "Error al registrar",
          "Error en el registro de usuario, intenta nuevamente!"
        );
        return;
      }

      openNotification(
        "info",
        "Registro exitoso",
        "Usuario registrado correctamente, por favor revisa tu correo electrónico para activar tu cuenta!"
      );

      form.resetFields();
    } catch (error) {
      console.error("Error al registrar el usuario: ", error);
      openNotification(
        "error",
        "Error al registrar",
        "Error en el registro de usuario, intenta nuevamente!"
      );
    } finally {
      setIsLoading(false);
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
          <Row justify="center" style={{ marginTop: 10 }}>
            <Link to="/login">Regresar</Link>
          </Row>
        </Form.Item>
      </Form>
    </>
  );
};

export default Register;
