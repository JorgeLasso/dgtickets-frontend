import React, { useState } from "react";
import { Modal, Form, Input, Button } from "antd";
import { PQR } from "../types/pqrs/pqrs.types";

interface PQRsModalProps {
  isVisible: boolean;
  onCancel: () => void;
  onSubmit: (description: string) => Promise<boolean>;
  selectedPQR?: PQR | null;
  onAnswer?: (id: number, answer: string) => Promise<boolean>;
  isLoading: boolean;
  mode: "create" | "answer";
}

const { TextArea } = Input;

const PQRsModal: React.FC<PQRsModalProps> = ({
  isVisible,
  onCancel,
  onSubmit,
  selectedPQR,
  onAnswer,
  isLoading,
  mode,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      let success = false;

      if (mode === "create") {
        success = await onSubmit(values.description);
      } else if (mode === "answer" && selectedPQR && onAnswer) {
        success = await onAnswer(selectedPQR.id, values.answer);
      }

      if (success) {
        form.resetFields();
      }

      return success;
    } catch (error) {
      console.error("Validation failed:", error);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const title = mode === "create" ? "Crear nueva PQR" : "Responder PQR";
  const submitButtonText = mode === "create" ? "Crear" : "Responder";

  return (
    <Modal
      title={title}
      open={isVisible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Cancelar
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={submitting || isLoading}
          onClick={handleSubmit}
        >
          {submitButtonText}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={
          mode === "answer" && selectedPQR
            ? { answer: selectedPQR.answer || "" }
            : {}
        }
      >
        {mode === "create" ? (
          <Form.Item
            name="description"
            label="Descripción"
            rules={[
              { required: true, message: "Por favor ingrese una descripción" },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Describa su solicitud, queja o reclamo"
            />
          </Form.Item>
        ) : (
          <>
            {selectedPQR && (
              <div style={{ marginBottom: 16 }}>
                <p>
                  <strong>Descripción de la PQR:</strong>
                </p>
                <p>{selectedPQR.description}</p>
              </div>
            )}
            <Form.Item
              name="answer"
              label="Respuesta"
              rules={[
                { required: true, message: "Por favor ingrese una respuesta" },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Ingrese la respuesta a esta PQR"
              />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default PQRsModal;
