import React, { useEffect, useState } from "react";
import { Button, Col, Divider, Row, Typography } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import useHideMenu from "../hooks/useHideMenu";
import { connectToWebSockets } from "../services/WebSocketService";
import { BASE_API_URL } from "../services/api";

const { Title, Text } = Typography;

interface Ticket {
  id: string;
  number: number;
  createdAt: Date;
  done: boolean;
}

const CreateTicket: React.FC = () => {
  useHideMenu(true);

  const [newTicket, setNewTicket] = useState<Ticket | null>(null);
  const [lastTicket, setLastTicket] = useState();

  useEffect(() => {
    try {
      const getLastTicket = async () => {
        const resp = await fetch(`${BASE_API_URL}/tickets/last`);
        const data = await resp.json();
        setLastTicket(data);
      };
      getLastTicket();
    } catch (error) {
      console.log(error);
    }
  }, []);

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
      const resp = await fetch(`${BASE_API_URL}/tickets`, {
        method: "POST",
      });

      const data = await resp.json();

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
          >
            Nuevo Ticket
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
