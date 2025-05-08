import { useState, useEffect, useContext, useCallback } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Statistic,
  Divider,
  Space,
  Alert,
  Dropdown,
  List,
  Badge,
} from "antd";
import {
  ClockCircleOutlined,
  UserOutlined,
  DashboardOutlined,
  ExclamationCircleOutlined,
  MenuOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import CardList from "../components/CardList";
import Pagination from "../components/Pagination";
import TicketMedicinesModal from "../components/TicketMedicinesModal";
import useFetch from "../hooks/useFetch";
import useModules from "../hooks/useModules";
import useTickets from "../hooks/usePendingTickets";
import useInProgressTickets from "../hooks/useInProgressTickets";
import { HeadquarterContext } from "../context/HeadquarterContext";
import { AuthContext } from "../auth/AuthContext";
import { NotificationContext } from "../context/NotificationContext";
import { formatTime } from "../helpers/formatTime";
import { Module } from "../types/modules/modules.types";
import { Ticket } from "../types/ticket/ticket.types";
import { CardData } from "../types/cards/cards.types";
import { TYPES } from "../constants/TicketType";

const { Title, Text } = Typography;

const AdviserPage = () => {
  const headquarterContext = useContext(HeadquarterContext);
  const headquarterId = headquarterContext?.selectedHeadquarter || 0;

  const authContext = useContext(AuthContext);
  const userId = authContext?.auth?.id || 0;

  const { openNotification } = useContext(NotificationContext)!;

  const [assignedModule, setAssignedModule] = useState<Module | null>(null);

  const [priorityPage, setPriorityPage] = useState<number>(1);
  const [regularPage, setRegularPage] = useState<number>(1);
  const pageSize = 4;

  const { modules, isLoading: isLoadingModules } = useModules(headquarterId);

  const {
    tickets: priorityTickets,
    isLoading: isLoadingPriority,
    count: priorityCount,
  } = useTickets("priority", headquarterId);

  const {
    tickets: regularTickets,
    isLoading: isLoadingRegular,
    count: regularCount,
  } = useTickets("row", headquarterId);

  const { tickets: inProgressTickets, isLoading: isLoadingInProgress } =
    useInProgressTickets(headquarterId);

  const paginatedPriorityTickets = priorityTickets.slice(
    (priorityPage - 1) * pageSize,
    priorityPage * pageSize
  );

  const paginatedRegularTickets = regularTickets.slice(
    (regularPage - 1) * pageSize,
    regularPage * pageSize
  );

  const { put, isLoading: isProcessingTicket } = useFetch();

  const totalPendingTickets = priorityCount + regularCount;

  const activeHeadquarter = headquarterContext?.headquarters.find(
    (hq) => hq.id === headquarterId
  );

  const [medicinesModalVisible, setMedicinesModalVisible] = useState(false);
  const [currentTicket, setCurrentTicket] = useState<Ticket | undefined>(
    undefined
  );

  const showMedicinesModal = (ticket: Ticket) => {
    setCurrentTicket(ticket);
    setMedicinesModalVisible(true);
  };

  const hideMedicinesModal = () => {
    setMedicinesModalVisible(false);
    setCurrentTicket(undefined);
  };

  useEffect(() => {
    if (modules.length > 0 && userId) {
      const userModule = modules.find((module) => module.userId === userId);
      setAssignedModule(userModule || null);
    }
  }, [modules, userId]);

  const handleUpdateTicketStatus = useCallback(
    async (ticketId: number, newStatus: string) => {
      try {
        if (!assignedModule) {
          openNotification(
            "error",
            "Error de módulo",
            "No tienes un módulo asignado para atender tickets"
          );
          return;
        }

        if (newStatus === "IN_PROGRESS") {
          const existingInProgressTicket = inProgressTickets.find(
            (ticket) => ticket.moduleId === assignedModule.id
          );

          if (existingInProgressTicket) {
            openNotification(
              "error",
              "Ticket en progreso",
              "Ya tienes un ticket en progreso. Debes completar o cancelar el ticket actual antes de atender uno nuevo."
            );
            return;
          }
        }

        const ticketToUpdate = [
          ...priorityTickets,
          ...regularTickets,
          ...inProgressTickets,
        ].find((ticket) => ticket.id === ticketId);

        if (!ticketToUpdate) {
          openNotification(
            "error",
            "Ticket no encontrado",
            "No se encontró el ticket solicitado"
          );
          return;
        }

        await put(`/tickets_/${ticketId}`, {
          ...ticketToUpdate,
          moduleId: assignedModule.id,
          ticketType: newStatus,
          userUpdated: userId,
          priority: ticketToUpdate.priority.toString(),
        });

        openNotification(
          "success",
          "Ticket actualizado",
          `Estado del ticket actualizado a ${newStatus}`
        );
      } catch (error) {
        console.error("Error al actualizar el estado del ticket:", error);
        openNotification(
          "error",
          "Error al actualizar",
          "No se pudo actualizar el estado del ticket"
        );
      }
    },
    [
      assignedModule,
      put,
      priorityTickets,
      regularTickets,
      inProgressTickets,
      userId,
      openNotification,
    ]
  );

  const renderTicket = useCallback(
    (ticket: Ticket): CardData => {
      const menuItems: MenuProps["items"] = Object.entries(TYPES).map(
        ([key, value]) => ({
          key: value,
          label: value,
          onClick: () => handleUpdateTicketStatus(ticket.id, key),
        })
      );

      return {
        title: `Turno #${ticket.id}`,
        properties: [
          {
            label: "Usuario",
            value: ticket.user
              ? `${ticket.user.firstName} ${ticket.user.lastName}`
              : "N/A",
          },
          {
            label: "Tiempo de espera",
            value: ticket.pendingTimeInSeconds
              ? formatTime(ticket.pendingTimeInSeconds)
              : "N/A",
          },
        ],
        actions: [
          <Dropdown
            key="status-dropdown"
            menu={{ items: menuItems }}
            placement="bottom"
            arrow
            trigger={["click"]}
          >
            <Button
              type="primary"
              icon={<MenuOutlined />}
              loading={isProcessingTicket}
              disabled={!assignedModule}
              style={{
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
              }}
            >
              Gestionar
            </Button>
          </Dropdown>,
        ],
        loading: isProcessingTicket,
      };
    },
    [assignedModule, isProcessingTicket, handleUpdateTicketStatus]
  );

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2} style={{ textAlign: "center" }}>
        Panel de Asesor
      </Title>
      <Divider />

      <Row gutter={[16, 16]}>
        <Col xs={24} md={24}>
          <Card
            title={
              <>
                <UserOutlined />
              </>
            }
            loading={isLoadingModules}
          >
            {assignedModule ? (
              <Space
                direction="vertical"
                size="middle"
                style={{ width: "100%" }}
              >
                <Row>
                  <Col xs={24} sm={24} md={12}>
                    <Statistic
                      title="Nombre del Módulo"
                      value={assignedModule.name}
                    />
                  </Col>
                  <Col xs={24} sm={24} md={12}>
                    <Statistic
                      title="Estado"
                      value={assignedModule.isActive ? "Activo" : "Inactivo"}
                      valueStyle={{
                        color: assignedModule.isActive ? "#3f8600" : "#cf1322",
                      }}
                    />
                  </Col>
                </Row>
                <Text type="secondary">
                  Sede: {activeHeadquarter?.name || "No disponible"}
                </Text>
              </Space>
            ) : (
              <Alert
                message="Sin módulo asignado"
                description="No tienes un módulo asignado en esta sede. Contacta al administrador."
                type="warning"
                showIcon
              />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Total Tickets Pendientes"
              value={totalPendingTickets}
              prefix={<DashboardOutlined />}
              loading={isLoadingPriority || isLoadingRegular}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Tickets Prioritarios"
              value={priorityCount}
              valueStyle={{ color: "#ff4d4f" }}
              prefix={<ExclamationCircleOutlined />}
              loading={isLoadingPriority}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Tickets Regulares"
              value={regularCount}
              valueStyle={{ color: "#1890ff" }}
              prefix={<ClockCircleOutlined />}
              loading={isLoadingRegular}
            />
          </Card>
        </Col>
      </Row>

      {assignedModule && (
        <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
          <Col xs={24}>
            <Card
              title="Ticket en Atención"
              loading={isLoadingInProgress}
              className="in-progress-ticket-card"
            >
              {inProgressTickets.length > 0 ? (
                <div>
                  {inProgressTickets
                    .filter((ticket) => ticket.moduleId === assignedModule.id)
                    .map((ticket) => (
                      <Row key={ticket.id} gutter={[16, 16]}>
                        <Col xs={24} md={6}>
                          <Statistic
                            title="Número de Ticket"
                            value={ticket.id}
                            valueStyle={{ color: "#1890ff" }}
                          />
                        </Col>
                        <Col xs={24} md={6}>
                          <Statistic
                            title="Usuario"
                            value={`${ticket.user.firstName} ${ticket.user.lastName}`}
                          />
                        </Col>
                        <Col xs={24} md={6}>
                          <Statistic
                            title="Tiempo de Procesamiento"
                            value={
                              ticket.processingTimeInSeconds
                                ? formatTime(ticket.processingTimeInSeconds)
                                : "0m 00s"
                            }
                            prefix={<ClockCircleOutlined />}
                          />
                        </Col>
                        <Col xs={24} md={6}>
                          <Space
                            direction="vertical"
                            style={{ width: "100%" }}
                            size="small"
                          >
                            <Button
                              type="primary"
                              icon={<MedicineBoxOutlined />}
                              onClick={() => showMedicinesModal(ticket)}
                              style={{ width: "100%" }}
                            >
                              Entregar
                            </Button>
                            <Dropdown
                              menu={{
                                items: Object.entries(TYPES).map(
                                  ([key, value]) => ({
                                    key: value,
                                    label: value,
                                    onClick: () =>
                                      handleUpdateTicketStatus(ticket.id, key),
                                  })
                                ),
                              }}
                              placement="bottomRight"
                              trigger={["click"]}
                            >
                              <Button type="primary" style={{ width: "100%" }}>
                                Gestionar <MenuOutlined />
                              </Button>
                            </Dropdown>
                          </Space>
                        </Col>

                        {ticket.ticketMedicines &&
                          ticket.ticketMedicines.length > 0 && (
                            <Col xs={24} style={{ marginTop: 16 }}>
                              <div>
                                <Badge.Ribbon
                                  text="Medicamentos Entregados"
                                  color="green"
                                >
                                  <Card>
                                    <List
                                      dataSource={ticket.ticketMedicines}
                                      renderItem={(item) => (
                                        <List.Item>
                                          <List.Item.Meta
                                            title={item.medicine.name}
                                            description={`Cantidad: ${item.quantity}`}
                                            avatar={
                                              <MedicineBoxOutlined
                                                style={{
                                                  fontSize: "20px",
                                                  color: "#1890ff",
                                                }}
                                              />
                                            }
                                          />
                                        </List.Item>
                                      )}
                                    />
                                  </Card>
                                </Badge.Ribbon>
                              </div>
                            </Col>
                          )}
                      </Row>
                    ))}
                </div>
              ) : (
                <Alert
                  message="No hay tickets en atención actualmente"
                  description="Selecciona un ticket de la lista para comenzar a atenderlo."
                  type="info"
                  showIcon
                />
              )}
            </Card>
          </Col>
        </Row>
      )}

      <div style={{ marginTop: "24px" }}>
        <Title level={4}>Tickets Prioritarios</Title>
        <CardList
          data={paginatedPriorityTickets}
          loading={isLoadingPriority}
          renderItem={renderTicket}
        />
        {priorityTickets.length === 0 && !isLoadingPriority && (
          <Alert
            message="No hay tickets prioritarios en espera"
            type="info"
            showIcon
            style={{ marginTop: "16px" }}
          />
        )}
        {priorityTickets.length > 0 && (
          <Pagination
            current={priorityPage}
            total={priorityTickets.length}
            pageSize={pageSize}
            onChange={(page) => setPriorityPage(page)}
          />
        )}
      </div>

      <div style={{ marginTop: "24px" }}>
        <Title level={4}>Tickets Regulares</Title>
        <CardList
          data={paginatedRegularTickets}
          loading={isLoadingRegular}
          renderItem={renderTicket}
        />
        {regularTickets.length === 0 && !isLoadingRegular && (
          <Alert
            message="No hay tickets regulares en espera"
            type="info"
            showIcon
            style={{ marginTop: "16px" }}
          />
        )}
        {regularTickets.length > 0 && (
          <Pagination
            current={regularPage}
            total={regularTickets.length}
            pageSize={pageSize}
            onChange={(page) => setRegularPage(page)}
          />
        )}
      </div>

      <TicketMedicinesModal
        open={medicinesModalVisible}
        onCancel={hideMedicinesModal}
        currentTicket={currentTicket}
        userId={userId}
      />
    </div>
  );
};

export default AdviserPage;
