import React from "react";
import { Button, Result, Spin } from "antd";
import { useNavigate } from "react-router";
import { ResultStatus } from "../types/validation/validation.types";

interface EmailValidationResultProps {
  status: ResultStatus;
  title: string;
  subTitle: string;
  isLoading: boolean;
  navigateTo?: string;
  buttonText?: string;
}

const EmailValidationResult: React.FC<EmailValidationResultProps> = ({
  status,
  title,
  subTitle,
  isLoading,
  navigateTo = "/login",
  buttonText = "Iniciar sesión",
}) => {
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 50 }}>
      {isLoading ? (
        <div style={{ textAlign: "center" }}>
          <Spin size="large" />
          <p style={{ marginTop: 20 }}>Validando correo electrónico...</p>
        </div>
      ) : (
        <Result
          status={status}
          title={title}
          subTitle={subTitle}
          extra={[
            <Button
              type="primary"
              key="console"
              onClick={() => navigate(navigateTo)}
            >
              {buttonText}
            </Button>,
          ]}
        />
      )}
    </div>
  );
};

export default EmailValidationResult;
