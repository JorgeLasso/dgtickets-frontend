import React, { useContext } from "react";
import { Card, Typography, Row, Col, Spin, Tag, Button } from "antd";
import { useParams } from "react-router";
import { MedicineBoxOutlined } from "@ant-design/icons";
import { AuthContext } from "../auth/AuthContext";
import { HeadquarterContext } from "../context/HeadquarterContext";
import { formatTime } from "../helpers/formatTime";
import useHideMenu from "../hooks/useHideMenu";
import useHeadquarters from "../hooks/useHeadquarters";
import useCities from "../hooks/useCities";
import { TYPES } from "../constants/TicketType";
import useTicketDetails from "../hooks/useTicketDetails";
import useTicketPosition from "../hooks/useTicketPosition";
import Rating from "../components/Rating";
import useFetch from "../hooks/useFetch";
import useNotification from "../hooks/useNotification";

const { Title, Text } = Typography;

const TicketDetailsPage: React.FC = () => {
  useHideMenu(false);
  const { ticketId } = useParams<{ ticketId: string }>();
  const { auth } = useContext(AuthContext)!;
  const { selectedHeadquarter } = useContext(HeadquarterContext)!;
  const { ticket, isLoading: isLoadingTicket } = useTicketDetails(ticketId);
  const { positionData, isLoading: isLoadingPosition } =
    useTicketPosition(ticketId);
  const { headquarters, isLoading: loadingHeadquarters } = useHeadquarters();
  const { cities, isLoading: loadingCities } = useCities();
  const { put } = useFetch();
  const { openNotification } = useNotification();

  const headquarter = headquarters.find((hq) => hq.id === selectedHeadquarter);
  const city =
    headquarter && cities.find((city) => city.id === headquarter.cityId);
  const isLoading =
    isLoadingTicket ||
    isLoadingPosition ||
    loadingHeadquarters ||
    loadingCities;

  const handleCancelTicket = async () => {
    if (!ticket) return;
    try {
      const confirmed = window.confirm(
        "¿Está seguro que desea cancelar este ticket?"
      );
      if (!confirmed) return;
      await put(`/tickets_/${ticket.id}`, {
        ticketType: "CANCELED",
        priority: String(ticket.priority),
        userUpdated: auth.id,
      });
      openNotification(
        "success",
        "Ticket cancelado",
        "El ticket ha sido cancelado exitosamente."
      );
      window.location.reload();
    } catch {
      openNotification(
        "error",
        "Error",
        "Ocurrió un error al cancelar el ticket."
      );
    }
  };

  if (isLoading) {
    return (
      <Row justify="center" align="middle" style={{ height: "80vh" }}>
        <Spin size="large" tip="Cargando detalles del turno..." />
      </Row>
    );
  }
  if (!ticket) {
    return (
      <Card>
        <Title level={3}>No se encontraron detalles del turno</Title>
        <Text>La información del turno no está disponible.</Text>
      </Card>
    );
  }

  return (
    <>
      <Title
        level={3}
        style={{
          textAlign: "center",
          marginBottom: "20px",
          wordBreak: "break-word",
        }}
      >
        Detalles de su turno
      </Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card type="inner" title="Información del usuario">
            <Text strong>Nombre: </Text>
            <Text>
              {auth.firstName} {auth.lastName}
            </Text>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card type="inner" title={"Información del turno"}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Text strong>Número de turno: </Text>
                <Tag color="blue" style={{ fontSize: "16px" }}>
                  {ticket.id}
                </Tag>
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Prioridad: </Text>
                {ticket.priority ? (
                  <Tag color="red">Prioritario</Tag>
                ) : (
                  <Tag color="green">Regular</Tag>
                )}
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Ciudad: </Text>
                <Text>{city?.name || "No disponible"}</Text>
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Sede: </Text>
                <Text>{headquarter?.name || "No disponible"}</Text>{" "}
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Tipo: </Text>
                <Text>
                  {TYPES[ticket.ticketType as keyof typeof TYPES] ||
                    "No disponible"}
                </Text>
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Fecha de creación: </Text>
                <Text>{new Date(ticket.createdAt).toLocaleString()}</Text>
              </Col>
              {ticket.ticketType === "COMPLETED" && (
                <>
                  <Col xs={24} sm={12}>
                    <Text strong>Fecha de atención: </Text>
                    <Text>{new Date(ticket.updatedAt).toLocaleString()}</Text>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Text strong>Tiempo total de atención: </Text>
                    <Text>
                      {formatTime(
                        Math.floor(
                          (new Date(ticket.updatedAt).getTime() -
                            new Date(ticket.createdAt).getTime()) /
                            1000
                        )
                      )}
                    </Text>
                  </Col>
                </>
              )}
            </Row>
          </Card>
        </Col>{" "}
        {ticket.ticketType === "PENDING" && (
          <Col xs={24}>
            <Card type="inner" title="Estado de la atención">
              {positionData ? (
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Text strong>Su posición en la cola: </Text>
                    <Tag color="warning" style={{ fontSize: "18px" }}>
                      {positionData.position}
                    </Tag>
                  </Col>
                  <Col span={24}>
                    <Text strong>Tiempo estimado de espera: </Text>
                    <Text style={{ fontSize: "18px" }}>
                      {formatTime(positionData.estimatedTimeAtentionInSeconds)}
                    </Text>
                  </Col>
                </Row>
              ) : (
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Text>
                      La información de posición en la cola no está disponible
                      en este momento.
                    </Text>
                  </Col>
                </Row>
              )}
            </Card>
          </Col>
        )}
        {ticket.ticketMedicines && ticket.ticketMedicines.length > 0 && (
          <Col xs={24}>
            <Card type="inner" title="Medicamentos Entregados">
              <Row gutter={[16, 16]}>
                {ticket.ticketMedicines.map((med, index) => (
                  <Col xs={24} sm={12} key={index}>
                    <Card size="small" style={{ background: "#f0f8ff" }}>
                      <Row gutter={[8, 8]}>
                        <Col span={24}>
                          <MedicineBoxOutlined
                            style={{ color: "#1890ff", marginRight: 8 }}
                          />
                          <Text strong>Nombre: </Text>
                          <Text>{med.medicine.name}</Text>
                        </Col>
                        <Col span={24}>
                          <Text strong>Cantidad: </Text>
                          <Text>{med.quantity}</Text>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        )}
        {ticket.ticketType !== "PENDING" &&
          (!ticket.ticketMedicines || ticket.ticketMedicines.length === 0) && (
            <Col xs={24}>
              <Card type="inner" title="Medicamentos Asignados">
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Text>No se han entregado medicamentos en este turno.</Text>
                  </Col>
                </Row>
              </Card>
            </Col>
          )}{" "}
        {ticket.ticketType === "COMPLETED" && (
          <Col xs={24}>
            <Rating
              ticketId={ticket.id}
              initialRating={ticket.rating || null}
            />
          </Col>
        )}
        {ticket.ticketType === "PENDING" && (
          <Col xs={24} style={{ textAlign: "center", marginBottom: 16 }}>
            <Button danger type="primary" onClick={handleCancelTicket}>
              Cancelar Ticket
            </Button>
          </Col>
        )}
      </Row>
    </>
  );
};

export default TicketDetailsPage;
