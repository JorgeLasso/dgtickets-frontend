import React from "react";
import { tickets } from "../constants/TicketsFake";
import { Card, Col, Divider, Flex, List, Row, Tag, Typography } from "antd";
import useHideMenu from "../hooks/useHideMenu";

const { Title, Text } = Typography;

const Tickets: React.FC = () => {
  useHideMenu(true);

  return (
    <>
      <Title style={{ textAlign: "center" }} level={2}>
        Atendiendo el Ticket:
      </Title>
      <Row>
        <Col lg={12} sm={24}>
          <List
            dataSource={tickets.slice(0, 3)}
            renderItem={(item) => (
              <List.Item style={{ borderBlockEnd: "none" }}>
                <Card
                  style={{
                    width: 300,
                    margin: "auto",
                  }}
                  actions={[
                    <Tag color="volcano">
                      {item.agente.length > 20
                        ? `${item.agente.slice(0, 12)}...`
                        : item.agente}
                    </Tag>,
                    <Tag color="magenta">Módulo: {item.escritorio}</Tag>,
                  ]}
                >
                  <Title style={{ textAlign: "center" }}>
                    No. {item.ticketNo}
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
            dataSource={tickets.slice(3)}
            style={{
              maxHeight: 600,
              overflowY: "auto",
              maxWidth: 400,
              margin: "auto",
            }}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={`Ticket No. ${item.ticketNo}`}
                  description={
                    <Flex justify="flex-start">
                      <div>
                        <Text type="secondary">En el escritorio: </Text>
                        <Tag color="magenta">{item.escritorio}</Tag>
                      </div>
                      <div>
                        <Text type="secondary">Agente: </Text>
                        <Tag color="volcano">
                          {item.agente.length > 20
                            ? `${item.agente.slice(0, 12)}...`
                            : item.agente}
                        </Tag>
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
