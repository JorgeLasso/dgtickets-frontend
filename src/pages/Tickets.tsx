import React, { useEffect, useState } from "react";
import { Card, Col, Divider, Flex, List, Row, Tag, Typography } from "antd";
import useHideMenu from "../hooks/useHideMenu";
import { BASE_API_URL, BASE_WS_URL } from "../services/api";

const { Title, Text } = Typography;

const Tickets: React.FC = () => {
  useHideMenu(true);

  interface Ticket {
    number: number;
    handleAtModule: string;
  }

  const [workingOnTickets, setWorkingOnTickets] = useState<Ticket[]>();

  useEffect(() => {
    const getWorkingOnTickets = async () => {
      try {
        const resp = await fetch(`${BASE_API_URL}/tickets/working-on`);
        if (!resp.ok) {
          throw new Error(`Error al obtener los tickets: ${resp.statusText}`);
        }
        const data = await resp.json();
        setWorkingOnTickets(data);
      } catch (error) {
        console.log(error);
      }
    };
    getWorkingOnTickets();
  }, []);

  useEffect(() => {
    const socket = new WebSocket(BASE_WS_URL);

    socket.onmessage = (event) => {
      const { type, payload } = JSON.parse(event.data);
      if (type !== "on-working-on-ticket-changed") return;
      setWorkingOnTickets(payload);
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <>
      <Title style={{ textAlign: "center" }} level={2}>
        Atendiendo el Ticket:
      </Title>
      <Row>
        <Col lg={12} sm={24}>
          <List
            dataSource={workingOnTickets?.slice(0, 3)}
            renderItem={(item) => (
              <List.Item style={{ borderBlockEnd: "none" }}>
                <Card
                  style={{
                    width: 300,
                    margin: "auto",
                  }}
                  actions={[
                    <Tag color="volcano">Mario</Tag>,
                    <Tag color="magenta">Módulo: {item.handleAtModule}</Tag>,
                  ]}
                >
                  <Title style={{ textAlign: "center" }}>
                    No. {item.number}
                  </Title>
                </Card>
              </List.Item>
            )}
          />
        </Col>

        <Col style={{ width: "100%" }} lg={12} sm={24}>
          <Divider> Historial </Divider>
          <List
            bordered
            dataSource={workingOnTickets?.slice(3)}
            style={{
              maxHeight: 600,
              overflowY: "auto",
              maxWidth: 400,
              margin: "auto",
            }}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={`Ticket No. ${item.number}`}
                  description={
                    <Flex justify="flex-start">
                      <div>
                        <Text type="secondary">En el escritorio: </Text>
                        <Tag color="magenta">{item.handleAtModule}</Tag>
                      </div>
                      <div>
                        <Text type="secondary">Agente: </Text>
                        <Tag color="volcano">Mario</Tag>
                      </div>
                    </Flex>
                  }
                />
              </List.Item>
            )}
          />
        </Col>
      </Row>
    </>
  );
};

export default Tickets;
