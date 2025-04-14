import React, { useEffect, useState } from "react";
import EmailValidationResult from "../components/EmailValidationResult";
import { ResultStatus } from "../types/validation/validation.types";
import useFetch from "../hooks/useFetch";

const EmailValidated: React.FC = () => {
  const [status, setStatus] = useState<ResultStatus>("info");
  const [title, setTitle] = useState<string>("Validando correo electrónico...");
  const [subTitle, setSubTitle] = useState<string>(
    "Por favor espere mientras validamos su correo electrónico."
  );
  const { get, isLoading } = useFetch();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");

    const validateEmail = async () => {
      try {
        if (!token) {
          console.error("Token not found in URL");
          setStatus("error");
          setTitle("Error al validar el correo electrónico");
          setSubTitle("No se encontró el token en la URL.");
          return;
        }

        await get(`/auth/validate-email/${token}`);

        setStatus("success");
        setTitle("Correo Electrónico validado correctamente!");
        setSubTitle("Ya puedes iniciar sesión con tu correo y contraseña.");
      } catch (error) {
        console.error("Error validating email:", error);
        setStatus("error");
        setTitle("Error al validar el correo electrónico");
        setSubTitle("El token es inválido o ha expirado.");
      }
    };

    validateEmail();
  }, [get]);

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
