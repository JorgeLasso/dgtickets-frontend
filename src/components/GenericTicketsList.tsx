import React from "react";
import { List, Spin, Typography, Tag, Row, Col, Divider, Flex } from "antd";
import { WorkingTicket } from "../types/ticket/ticket.types";
import { formatTime } from "../helpers/formatTime";

interface GenericTicketsListProps {
  tickets: WorkingTicket[];
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
  tagLabel,
  emptyText,
}) => {
  return (
    <>
      <Row>
        <Col span={24}>
          <Divider style={{ fontSize: 18 }}> {title} </Divider>
          <Col style={{ width: "100%" }} lg={12} sm={24}>
            <Typography.Text>
              Tiempo promedio de atención: {formatTime(avgPending)}
            </Typography.Text>
          </Col>
          <Col>
            <Typography.Text>
              Tiempo promedio por ticket: {formatTime(avgProcessing)}
            </Typography.Text>
          </Col>
          <Col>
            <Typography.Text>Tickets en cola: {count}</Typography.Text>
          </Col>
          <Spin spinning={isLoading} tip="Cargando...">
            <List
              style={{
                maxHeight: 600,
                overflowY: "auto",
                maxWidth: 400,
                margin: "auto",
              }}
              bordered
              dataSource={tickets}
              locale={{ emptyText }}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={`Ticket No. ${item.id}`}
                    description={
                      <Flex justify="flex-start">
                        <div>
                          <Tag color={tagColor}>{tagLabel}</Tag>
                          <Tag color="green">Prioridad: {item.priority}</Tag>
                        </div>
                        <div>
                          <Tag color="blue">Módulo: {item.priority}</Tag>
                          <Tag color="purple">{item.ticketType}</Tag>
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

export default GenericTicketsList;
