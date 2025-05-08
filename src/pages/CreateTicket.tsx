import React, { useEffect, useState, useContext } from "react";
import { Button, Col, Divider, Row, Typography, Switch } from "antd";
import { DownloadOutlined, InfoCircleOutlined } from "@ant-design/icons";
import useHideMenu from "../hooks/useHideMenu";
import { connectToWebSockets } from "../services/WebSocketService";
import { Ticket, PositionData } from "../types/ticket/ticket.types";
import useFetch from "../hooks/useFetch";
import { AuthContext } from "../auth/AuthContext";
import { HeadquarterContext } from "../context/HeadquarterContext";
import { formatTime } from "../helpers/formatTime";
import { useNavigate } from "react-router";

const { Title, Text } = Typography;

const CreateTicket: React.FC = () => {
  useHideMenu(true);
  const navigate = useNavigate();

  const { auth } = useContext(AuthContext)!;

  const [newTicket, setNewTicket] = useState<Ticket | null>(null);
  const [lastTicket, setLastTicket] = useState(Number);
  const [positionData, setPositionData] = useState<PositionData | null>(null);
  const { get, post, isLoading } = useFetch<Ticket>();
  const { selectedHeadquarter } = useContext(HeadquarterContext)!;
  const [priority, setPriority] = useState<boolean>(false);

  useEffect(() => {
    const getTicketPositionData = async () => {
      try {
        if (!lastTicket) return;
        const data = await get(`/tickets_/position/${lastTicket}`);
        setPositionData(data);
      } catch (error) {
        console.log(error);
      }
    };
    getTicketPositionData();
  }, [get, lastTicket]);

  useEffect(() => {
    const socket = connectToWebSockets();

    socket.onmessage = (event) => {
      const { type, payload } = JSON.parse(event.data);
      if (type !== "on-last-ticket-number-changed") return;
      setPositionData(payload);
    };

    return () => {
      socket.close();
    };
  }, []);

  const createNewTicket = async () => {
    try {
      const payload = {
        userId: auth.id,
        headquarterId: selectedHeadquarter,
        priority: priority.toString(),
      };
      const data = await post("/tickets_", payload);
      setNewTicket(data.ticket);
      setLastTicket(data.ticket.id);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Row justify={"center"} style={{ marginBottom: 16 }}>
        <Col>
          <Text>Solicitar turno prioritario </Text>
          <Switch
            checked={priority}
            onChange={(checked) => setPriority(checked)}
          />
        </Col>
      </Row>

      <Row justify={"center"}>
        <Col style={{ textAlign: "center" }}>
          <Title level={3}>Presione el botón para solicitar un turno</Title>

          <Button
            type="primary"
            icon={<DownloadOutlined />}
            size="large"
            onClick={() => createNewTicket()}
            loading={isLoading}
            disabled={!selectedHeadquarter || isLoading}
          >
            {isLoading ? "Asignando Turno..." : "Nuevo Turno"}
          </Button>
        </Col>
      </Row>
      <Divider />

      {newTicket && (
        <>
          <Row justify={"center"}>
            <Col>
              <Text>Su Turno es: </Text>
            </Col>
          </Row>

          <Row justify={"center"}>
            <Col>
              <Text strong type="danger" style={{ fontSize: 50 }}>
                {positionData?.position}
              </Text>
            </Col>
          </Row>

          <Row justify={"center"}>
            <Col>
              <Text>El tiempo promedio para ser atendido es: </Text>
            </Col>
          </Row>

          <Row justify={"center"}>
            <Col>
              <Text strong style={{ fontSize: 25 }}>
                {positionData?.estimatedTimeAtentionInSeconds &&
                  formatTime(positionData?.estimatedTimeAtentionInSeconds)}
              </Text>
            </Col>
          </Row>

          <Row justify={"center"} style={{ marginTop: 24 }}>
            <Col>
              <Button
                type="primary"
                icon={<InfoCircleOutlined />}
                onClick={() => navigate(`/ticket/${newTicket.id}`)}
              >
                Ver detalles de mi turno
              </Button>
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default CreateTicket;
