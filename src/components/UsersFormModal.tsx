import React from "react";
import { Form, Input, Select, Switch } from "antd";
import { User } from "../types/user/user.types";
import { FormField } from "../types/forms/forms.types";
import GenericFormModal from "./GenericFormModal";
import { ROLES } from "../constants/Roles";

interface UsersFormModalProps {
  title: string;
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: Partial<User>) => Promise<boolean>;
  initialValues?: User | null;
  isLoading: boolean;
  cities: { id: number; name: string }[];
}

// Map of user type values to display labels
const userTypeOptions = Object.entries(ROLES).map(([key, value]) => ({
  value: value,
  label: key,
}));

const UsersFormModal: React.FC<UsersFormModalProps> = ({
  title,
  open,
  onCancel,
  onSubmit,
  initialValues,
  isLoading,
  cities,
}) => {
  const [form] = Form.useForm();

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };
  const getUserFormFields = (): FormField[] => {
    const isCreating = !initialValues;

    return [
      {
        name: "firstName",
        label: "Nombre",
        component: <Input />,
        rules: [{ required: true, message: "Por favor ingrese el nombre" }],
      },
      {
        name: "lastName",
        label: "Apellido",
        component: <Input />,
        rules: [{ required: true, message: "Por favor ingrese el apellido" }],
      },
      {
        name: "email",
        label: "Email",
        component: <Input type="email" />,
        rules: [
          { required: true, message: "Por favor ingrese el email" },
          { type: "email", message: "Por favor ingrese un email válido" },
        ],
      },
      {
        name: "password",
        label: "Contraseña",
        component: <Input.Password />,
        rules: [
          { required: isCreating, message: "Por favor ingrese la contraseña" },
          {
            min: 6,
            message: "La contraseña debe tener al menos 6 caracteres",
            warningOnly: !isCreating, // Only warn when editing, not creating
          },
        ],
        tooltip: isCreating
          ? "Contraseña del usuario (mínimo 6 caracteres)"
          : "Deje en blanco para mantener la contraseña actual, o ingrese una nueva contraseña",
      },
      {
        name: "userType",
        label: "Tipo de Usuario",
        component: (
          <Select>
            {userTypeOptions.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        ),
        rules: [
          {
            required: true,
            message: "Por favor seleccione un tipo de usuario",
          },
        ],
      },
      {
        name: "cityId",
        label: "Ciudad",
        component: (
          <Select>
            {cities.map((city) => (
              <Select.Option key={city.id} value={city.id}>
                {city.name}
              </Select.Option>
            ))}
          </Select>
        ),
        rules: [{ required: true, message: "Por favor seleccione una ciudad" }],
      },
      {
        name: "isActive",
        label: "Usuario Activo",
        component: <Switch />,
        valuePropName: "checked",
      },
    ];
  };
  const handleFormSubmit = async (values: Partial<User>) => {
    await onSubmit(values);
  };

  return (
    <GenericFormModal
      title={title}
      open={open}
      onCancel={handleCancel}
      onSubmit={handleFormSubmit}
      fields={getUserFormFields()}
      loading={isLoading}
      form={form}
      initialValues={initialValues || undefined}
      width={600}
      submitButtonText="Guardar"
      cancelButtonText="Cancelar"
    />
  );
};

export default UsersFormModal;
