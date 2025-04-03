import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { BASE_API_URL } from "../services/api";
import EmailValidationResult from "../components/EmailValidationResult";

type ResultStatus =
  | "success"
  | "error"
  | "info"
  | "warning"
  | "404"
  | "403"
  | "500";

const EmailValidated: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<ResultStatus>("info");
  const [title, setTitle] = useState<string>("Validando correo electrónico...");
  const [subTitle, setSubTitle] = useState<string>(
    "Por favor espere mientras validamos su correo electrónico."
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    try {
      const validateEmail = async () => {
        if (!token) {
          console.error("Token not found in URL");
          setIsLoading(false);
          setStatus("error");
          setTitle("Error al validar el correo electrónico");
          setSubTitle("No se encontró el token en la URL.");
          return;
        }
        const response = await fetch(
          `${BASE_API_URL}/auth/validate-email/${token}`
        );

        if (response.ok) {
          await response.json();
          setStatus("success");
          setTitle("Correo Electrónico validado correctamente!");
          setSubTitle("Ya puedes iniciar sesión con tu correo y contraseña.");
        } else {
          setStatus("error");
          setTitle("Error al validar el correo electrónico");
          setSubTitle("El token es inválido o ha expirado.");
        }
      };
      validateEmail();
    } catch (error) {
      console.error("Error validating email:", error);
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  return (
    <EmailValidationResult
      status={status}
      title={title}
      subTitle={subTitle}
      isLoading={isLoading}
      navigateTo="/login"
      buttonText="Iniciar sesión"
    />
  );
};

export default EmailValidated;
