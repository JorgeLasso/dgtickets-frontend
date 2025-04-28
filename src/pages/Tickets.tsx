import React, { useEffect, useState } from "react";
import {
  Card,
  Col,
  Divider,
  Flex,
  List,
  Row,
  Tag,
  Typography,
  Spin,
} from "antd";
import useHideMenu from "../hooks/useHideMenu";
import { BASE_WS_URL } from "../services/api";
import { WorkingTicket } from "../types/ticket/ticket.types";
import useFetch from "../hooks/useFetch";

const { Title, Text } = Typography;

const Tickets: React.FC = () => {
  useHideMenu(true);

  const [workingOnTickets, setWorkingOnTickets] = useState<WorkingTicket[]>([]);
  const { get, isLoading } = useFetch<WorkingTicket[]>();

  useEffect(() => {
    const getWorkingOnTickets = async () => {
      try {
        const data = await get("/tickets_/row/4");
        setWorkingOnTickets(data || []);
      } catch (error) {
        console.log(error);
      }
    };
    getWorkingOnTickets();
  }, [get]);

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
          <Spin spinning={isLoading} tip="Cargando tickets...">
            <List
              dataSource={workingOnTickets?.slice(0, 3)}
              locale={{ emptyText: "No hay tickets en atención" }}
              renderItem={(item) => (
                <List.Item style={{ borderBlockEnd: "none" }}>
                  <Card
                    style={{
                      width: 300,
                      margin: "auto",
                    }}
                    actions={[
                      <Tag color="volcano">Mario</Tag>,
                      <Tag color="magenta">Módulo: {item.id}</Tag>,
                    ]}
                  >
                    <Title style={{ textAlign: "center" }}>
                      No. {item.priority}
                    </Title>
                  </Card>
                </List.Item>
              )}
            />
          </Spin>
        </Col>

        <Col style={{ width: "100%" }} lg={12} sm={24}>
          <Divider> Historial </Divider>
          <Spin spinning={isLoading} tip="Cargando historial...">
            <List
              bordered
              dataSource={workingOnTickets?.slice(3)}
              locale={{ emptyText: "No hay historial de tickets" }}
              style={{
                maxHeight: 600,
                overflowY: "auto",
                maxWidth: 400,
                margin: "auto",
              }}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={`Ticket No. ${item.id}`}
                    description={
                      <Flex justify="flex-start">
                        <div>
                          <Text type="secondary">En el escritorio: </Text>
                          <Tag color="magenta">{item.priority}</Tag>
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
          </Spin>
        </Col>
      </Row>
    </>
  );
};

export default Tickets;
