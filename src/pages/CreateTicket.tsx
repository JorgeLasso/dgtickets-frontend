import React, { useEffect, useState } from "react";
import { Button, Col, Divider, Row, Typography } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import useHideMenu from "../hooks/useHideMenu";
import { connectToWebSockets } from "../services/WebSocketService";
import { Ticket } from "../types/ticket/ticket.types";
import useFetch from "../hooks/useFetch";

const { Title, Text } = Typography;

const CreateTicket: React.FC = () => {
  useHideMenu(true);

  const [newTicket, setNewTicket] = useState<Ticket | null>(null);
  const [lastTicket, setLastTicket] = useState();
  const { get, post, isLoading } = useFetch<Ticket>();

  useEffect(() => {
    const getLastTicket = async () => {
      try {
        const data = await get("/tickets/last");
        setLastTicket(data);
      } catch (error) {
        console.log(error);
      }
    };
    getLastTicket();
  }, [get]);

  useEffect(() => {
    const socket = connectToWebSockets();

    socket.onmessage = (event) => {
      const { type, payload } = JSON.parse(event.data);
      if (type !== "on-last-ticket-number-changed") return;
      setLastTicket(payload);
    };

    return () => {
      socket.close();
    };
  }, []);

  const createNewTicket = async () => {
    try {
      const data = await post("/tickets");
      setNewTicket(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Row justify={"center"}>
        <Col style={{ textAlign: "center" }}>
          <Title level={3}>Último Ticket creado:</Title>
        </Col>
      </Row>

      <Row justify={"center"}>
        <Col>
          <Text strong type="danger" style={{ fontSize: 50 }}>
            {lastTicket}
          </Text>
        </Col>
      </Row>
      <Divider />

      <Row justify={"center"}>
        <Col style={{ textAlign: "center" }}>
          <Title level={3}>Presione el botón para crear un ticket</Title>

          <Button
            type="primary"
            icon={<DownloadOutlined />}
            size="large"
            onClick={() => createNewTicket()}
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? "Creando Ticket..." : "Nuevo Ticket"}
          </Button>
        </Col>
      </Row>
      <Divider />

      {newTicket && (
        <>
          <Row justify={"center"}>
            <Col>
              <Text>Su número: </Text>
            </Col>
          </Row>

          <Row justify={"center"}>
            <Col>
              <Text strong type="danger" style={{ fontSize: 50 }}>
                {newTicket?.number}
              </Text>
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default CreateTicket;
