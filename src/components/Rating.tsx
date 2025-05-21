import React, { useState, useEffect } from "react";
import { Card, Typography, Row, Col, Rate, Input, Button } from "antd";
import useRatings from "../hooks/useRatings";
import useNotification from "../hooks/useNotification";
import { Rating as RatingType } from "../types/rating/rating.types";

const { Text } = Typography;
const { TextArea } = Input;

interface RatingProps {
  ticketId: number;
  initialRating: RatingType | null;
}

const Rating: React.FC<RatingProps> = ({ ticketId, initialRating }) => {
  const [ratingValue, setRatingValue] = useState<number>(0);
  const [ratingDescription, setRatingDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { rating, createRating, updateRating } = useRatings({
    ticketId,
    initialRating,
  });
  const { openNotification } = useNotification();

  // Set initial rating values if a rating exists
  useEffect(() => {
    if (rating) {
      setRatingValue(rating.value);
      setRatingDescription(rating.description || "");
    }
  }, [rating]);

  // Handle rating submission
  const handleSubmitRating = async () => {
    if (!ticketId) return;

    setIsSubmitting(true);
    try {
      if (rating && rating.id) {
        // Update existing rating
        await updateRating(rating.id, ratingValue, ratingDescription);
        openNotification(
          "success",
          "Valoración actualizada",
          "Valoración actualizada con éxito"
        );
      } else {
        // Create new rating
        await createRating(ratingValue, ratingDescription);
        openNotification(
          "success",
          "¡Gracias por su valoración!",
          "Su valoración fue registrada correctamente."
        );
      }
    } catch (error) {
      console.error("Error al enviar valoración:", error);
      openNotification(
        "error",
        "Error",
        "No se pudo enviar la valoración. Intente nuevamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  // Is there a valid rating to submit?
  const canSubmitRating =
    ratingValue > 0 && ratingDescription.trim().length > 0;

  return (
    <Card
      type="inner"
      title="Valoración del Servicio"
      style={{ marginTop: 16 }}
    >
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Text>¿Cómo calificaría nuestro servicio?</Text>
          <div style={{ marginTop: 8, marginBottom: 16 }}>
            <Rate
              allowHalf
              value={ratingValue}
              onChange={setRatingValue}
              style={{ fontSize: 36 }}
            />
          </div>
        </Col>{" "}
        <Col span={24}>
          <Text>
            Comentarios: <span style={{ color: "red" }}>*</span>
          </Text>
          <TextArea
            rows={4}
            value={ratingDescription}
            onChange={(e) => setRatingDescription(e.target.value)}
            placeholder="Comparta su experiencia o sugerencias para mejorar nuestro servicio"
            style={{ marginTop: 8, marginBottom: 16 }}
            required
          />
          {ratingValue > 0 && ratingDescription.trim().length === 0 && (
            <div style={{ color: "red", marginTop: -10, marginBottom: 10 }}>
              Por favor ingrese sus comentarios
            </div>
          )}
        </Col>
        <Col span={24}>
          <Button
            type="primary"
            onClick={handleSubmitRating}
            loading={isSubmitting}
            disabled={!canSubmitRating}
          >
            {rating && rating.id
              ? "Actualizar Valoración"
              : "Enviar Valoración"}
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

export default Rating;
