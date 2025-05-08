import React, { useEffect, useState, useContext } from "react";
import { Card, Typography, Row, Col, Spin, Tag } from "antd";
import { useParams, useNavigate } from "react-router";
import { AuthContext } from "../auth/AuthContext";
import { HeadquarterContext } from "../context/HeadquarterContext";
import useFetch from "../hooks/useFetch";
import { formatTime } from "../helpers/formatTime";
import { Ticket, PositionData } from "../types/ticket/ticket.types";
import useHideMenu from "../hooks/useHideMenu";
import { connectToWebSockets } from "../services/WebSocketService";
import useHeadquarters from "../hooks/useHeadquarters";
import useCities from "../hooks/useCities";

const { Title, Text } = Typography;

const TicketDetailsPage: React.FC = () => {
  useHideMenu(false);
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext)!;
  const { selectedHeadquarter } = useContext(HeadquarterContext)!;
  const { get, isLoading: isLoadingTicket } = useFetch<{ ticket: Ticket }>();
  const { get: getPositionData, isLoading: isLoadingPosition } =
    useFetch<PositionData>();
  const { headquarters, isLoading: loadingHeadquarters } = useHeadquarters();
  const { cities, isLoading: loadingCities } = useCities();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [positionData, setPositionData] = useState<PositionData | null>(null);
  const [currentTicket, setCurrentTicket] = useState<number | null>(null);

  const headquarter = headquarters.find((hq) => hq.id === selectedHeadquarter);
  const city =
    headquarter && cities.find((city) => city.id === headquarter.cityId);

  useEffect(() => {
    if (!ticketId) {
      navigate("/crear");
      return;
    }

    const getTicketDetails = async () => {
      try {
        const data = await get(`/tickets_/${ticketId}`);
        setTicket(data.ticket);
      } catch (error) {
        console.log(error);
        navigate("/crear");
      }
    };

    const getPosition = async () => {
      try {
        const data = await getPositionData(`/tickets_/position/${ticketId}`);
        setPositionData(data);

        setCurrentTicket(parseInt(ticketId) - data.position);
      } catch (error) {
        console.log(error);
      }
    };

    getTicketDetails();
    getPosition();
  }, [get, getPositionData, ticketId, navigate]);

  useEffect(() => {
    const socket = connectToWebSockets();

    socket.onmessage = (event) => {
      const { type, payload } = JSON.parse(event.data);
      if (
        type !== "on-ticket-changed" &&
        type !== "on-last-ticket-number-changed"
      )
        return;

      if (payload.positionData) {
        setPositionData(payload.positionData);
      }

      if (payload.currentTicket) {
        setCurrentTicket(payload.currentTicket);
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  const isLoading =
    isLoadingTicket ||
    isLoadingPosition ||
    loadingHeadquarters ||
    loadingCities;

  if (isLoading) {
    return (
      <Row justify="center" align="middle" style={{ height: "80vh" }}>
        <Spin size="large" tip="Cargando detalles del turno..." />
      </Row>
    );
  }

  if (!ticket || !positionData) {
    return (
      <Card>
        <Title level={3}>No se encontraron detalles del turno</Title>
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
                <Text>{headquarter?.name || "No disponible"}</Text>
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Tipo: </Text>
                <Text>{ticket.ticketType || "No disponible"}</Text>
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Fecha de creación: </Text>
                <Text>{new Date(ticket.createdAt).toLocaleString()}</Text>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24}>
          <Card type="inner" title="Estado de la atención">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Text strong>Turno actual en atención: </Text>
                <Tag color="processing" style={{ fontSize: "18px" }}>
                  {currentTicket || "N/A"}
                </Tag>
              </Col>
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
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default TicketDetailsPage;
