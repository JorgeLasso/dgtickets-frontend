import { Modal, Form, Button } from "antd";
import { FormInstance } from "antd/es/form";
import { FormField } from "../types/forms/forms.types";

export interface GenericFormModalProps<T> {
  title: string;
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: T) => Promise<void>;
  fields: FormField[];
  loading: boolean;
  form: FormInstance<T>;
  initialValues?: Partial<T>;
  width?: number;
  submitButtonText?: string;
  cancelButtonText?: string;
}

const GenericFormModal = <T,>({
  title,
  open,
  onCancel,
  onSubmit,
  fields,
  loading,
  form,
  initialValues,
  width = 520,
  submitButtonText = "Guardar",
  cancelButtonText = "Cancelar",
}: GenericFormModalProps<T>) => {
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
    } catch (error) {
      console.error("Error validating form:", error);
    }
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      width={width}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          {cancelButtonText}
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          {submitButtonText}
        </Button>,
      ]}
    >
      {" "}
      <Form form={form} initialValues={initialValues}>
        {fields.map((field) => (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
            rules={field.rules}
            hidden={field.hidden}
            valuePropName={field.valuePropName}
            tooltip={field.tooltip}
          >
            {field.component}
          </Form.Item>
        ))}
      </Form>
    </Modal>
  );
};

export default GenericFormModal;
