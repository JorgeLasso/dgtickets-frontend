import React from "react";
import { Form, Input } from "antd";
import { FormField } from "../types/forms/forms.types";
import GenericFormModal from "./GenericFormModal";

interface AddModuleModalProps {
  isVisible: boolean;
  onCancel: () => void;
  onSubmit: (name: string) => Promise<boolean>;
  isLoading: boolean;
}

interface FormValues {
  name: string;
}

const AddModuleModal: React.FC<AddModuleModalProps> = ({
  isVisible,
  onCancel,
  onSubmit,
  isLoading,
}) => {
  const [form] = Form.useForm<FormValues>();

  const handleSubmit = async (values: FormValues) => {
    const success = await onSubmit(values.name);
    if (success) {
      form.resetFields();
    }
  };

  const fields: FormField[] = [
    {
      name: "name",
      label: "Nombre del Módulo",
      component: <Input placeholder="Ingrese el nombre del módulo" />,
      rules: [
        {
          required: true,
          message: "Por favor ingrese un nombre para el módulo",
        },
      ],
    },
  ];

  return (
    <GenericFormModal<FormValues>
      title="Crear Nuevo Módulo"
      open={isVisible}
      onCancel={onCancel}
      onSubmit={handleSubmit}
      fields={fields}
      loading={isLoading}
      form={form}
      submitButtonText="Crear"
      cancelButtonText="Cancelar"
    />
  );
};

export default AddModuleModal;
