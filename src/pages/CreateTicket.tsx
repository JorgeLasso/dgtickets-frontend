import React, { useEffect, useState, useContext } from "react";
import { Button, Col, Divider, Row, Typography, Select, Switch } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import useHideMenu from "../hooks/useHideMenu";
import { connectToWebSockets } from "../services/WebSocketService";
import { Ticket_ } from "../types/ticket/ticket.types";
import useFetch from "../hooks/useFetch";
import { AuthContext } from "../auth/AuthContext";
import useHeadquarters from "../hooks/useHeadquarters";

const { Title, Text } = Typography;

const CreateTicket: React.FC = () => {
  useHideMenu(true);

  const { auth } = useContext(AuthContext)!;

  const [newTicket, setNewTicket] = useState<Ticket_ | null>(null);
  const [lastTicket, setLastTicket] = useState();
  const { get, post, isLoading } = useFetch<Ticket_>();
  const { headquarters } = useHeadquarters();
  const [selectedHeadquarter, setSelectedHeadquarter] = useState<
    number | undefined
  >(undefined);
  const [priority, setPriority] = useState<boolean>(false);

  useEffect(() => {
    if (!selectedHeadquarter) {
      setLastTicket(undefined);
      return;
    }
    const getLastTicket = async () => {
      try {
        const data = await get(
          `/tickets_/handle/last?headquarterId=${selectedHeadquarter}`
        );
        setLastTicket(data);
      } catch (error) {
        console.log(error);
      }
    };
    getLastTicket();
  }, [get, selectedHeadquarter]);

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

  const handleHeadquarterChange = (id: number | undefined) => {
    setSelectedHeadquarter(id);
    if (id === undefined) {
      setNewTicket(null);
    }
  };

  const createNewTicket = async () => {
    try {
      const payload = {
        userId: auth.id,
        headquarterId: selectedHeadquarter,
        priority,
      };
      const data = await post("/tickets_", payload);
      setNewTicket(data.ticket);
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

      <Row justify={"center"} style={{ marginBottom: 16 }}>
        <Col>
          <Select
            allowClear
            placeholder="Seleccionar sede"
            style={{ width: 200 }}
            value={selectedHeadquarter}
            onChange={handleHeadquarterChange}
          >
            {headquarters.map((hq) => (
              <Select.Option key={hq.id} value={hq.id}>
                {hq.name}
              </Select.Option>
            ))}
          </Select>
        </Col>
      </Row>
      <Row justify={"center"} style={{ marginBottom: 16 }}>
        <Col>
          <Text>Usuario Prioritario </Text>
          <Switch
            checked={priority}
            onChange={(checked) => setPriority(checked)}
          />
        </Col>
      </Row>

      <Row justify={"center"}>
        <Col style={{ textAlign: "center" }}>
          <Title level={3}>Presione el botón para crear un ticket</Title>

          <Button
            type="primary"
            icon={<DownloadOutlined />}
            size="large"
            onClick={() => createNewTicket()}
            loading={isLoading}
            disabled={!selectedHeadquarter || isLoading}
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
              <Text>Su Ticket: </Text>
            </Col>
          </Row>

          <Row justify={"center"}>
            <Col>
              <Text strong type="danger" style={{ fontSize: 50 }}>
                {newTicket?.code}
              </Text>
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default CreateTicket;
