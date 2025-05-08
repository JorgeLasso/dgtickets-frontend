import React from "react";
import { List, Tag, Row, Col, Card, Statistic } from "antd";
import { Ticket } from "../types/ticket/ticket.types";
import { formatTime } from "../helpers/formatTime";
import { ClockCircleOutlined, TeamOutlined } from "@ant-design/icons";

interface GenericTicketsListProps {
  tickets: Ticket[];
  isLoading: boolean;
  avgPending: number;
  avgProcessing: number;
  count: number;
  title: string;
  tagColor: string;
  tagLabel: string;
  emptyText: string;
}

const GenericTicketsList: React.FC<GenericTicketsListProps> = ({
  tickets,
  isLoading,
  avgPending,
  avgProcessing,
  count,
  title,
  tagColor,
  emptyText,
}) => {
  return (
    <>
      <Row>
        <Col span={24}>
          <Card
            title={
              <div style={{ textAlign: "center" }}>
                <Tag color={tagColor}>{title}</Tag>
              </div>
            }
            variant="outlined"
            style={{ marginBottom: 16 }}
            loading={isLoading}
          >
            <Row>
              <Col span={24} style={{ marginBottom: 12 }}>
                <Statistic
                  title="Tiempo promedio de atención"
                  value={formatTime(avgPending)}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: "#1890ff", fontSize: "16px" }}
                />
              </Col>
              <Col span={24} style={{ marginBottom: 12 }}>
                <Statistic
                  title="Tiempo promedio por turno"
                  value={formatTime(avgProcessing)}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: "#52c41a", fontSize: "16px" }}
                />
              </Col>
              <Col span={24} style={{ marginBottom: 12 }}>
                <Statistic
                  title="Turnos en cola"
                  value={count}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: "#fa8c16", fontSize: "16px" }}
                />
              </Col>
            </Row>

            <List
              style={{
                maxHeight: 400,
                overflowY: "auto",
                scrollbarWidth: "thin",
                margin: "16px auto 0",
              }}
              bordered
              dataSource={tickets}
              locale={{ emptyText }}
              renderItem={(item, index) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <div style={{ textAlign: "center" }}>
                        {index === 0 ? "Próximo en ser atendido" : null}
                      </div>
                    }
                    description={
                      <>
                        <div style={{ marginBottom: "4px" }}>
                          <strong>Usuario: </strong>
                          {item.user.firstName} {item.user.lastName}
                        </div>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default GenericTicketsList;
