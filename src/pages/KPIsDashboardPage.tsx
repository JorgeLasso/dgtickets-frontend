import React, { useContext, useState } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Spin,
  Divider,
  Typography,
  Button,
  Progress,
  Tooltip,
  Space,
  Dropdown,
} from "antd";
import type { MenuProps } from "antd";
import {
  DashboardOutlined,
  MedicineBoxOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  AlertOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { HeadquarterContext } from "../context/HeadquarterContext";
import usePendingTickets from "../hooks/usePendingTickets";
import useInProgressTickets from "../hooks/useInProgressTickets";
import useMedicines from "../hooks/useMedicines";
import useTicketHistory from "../hooks/useTicketHistory";
import { Ticket } from "../types/ticket/ticket.types";
import HeadquarterSelector from "../components/HeadquarterSelector";
import KPIsCharts from "../components/KPIsCharts";
import {
  exportTicketsToExcel,
  exportMedicinesToExcel,
  exportKPIsToExcel,
} from "../utils/excelExport";
import styles from "./KPIsDashboardPage.module.css";

const { Title, Text } = Typography;

const KPIsDashboardPage: React.FC = () => {
  const { selectedHeadquarter } = useContext(HeadquarterContext)!;
  const [refreshing, setRefreshing] = useState(false);

  const priorityTicketsData = usePendingTickets(
    "priority",
    selectedHeadquarter || 0
  );
  const normalTicketsData = usePendingTickets("row", selectedHeadquarter || 0);

  const { tickets: inProgressTickets, isLoading: isLoadingInProgress } =
    useInProgressTickets(selectedHeadquarter || 0);

  const {
    medicines,
    totalMedicines,
    isLoading: isMedicinesLoading,
  } = useMedicines({ limit: 100 });

  const { tickets: ticketHistory, isLoading: isHistoryLoading } =
    useTicketHistory(undefined, { limit: 100 });

  const calculateKPIs = () => {
    const totalPendingTickets =
      (priorityTicketsData?.tickets?.length || 0) +
      (normalTicketsData?.tickets?.length || 0);

    const totalInProgressTickets = inProgressTickets?.length || 0;

    const medicinesWithLowStock = medicines.filter(
      (med) => med.quantity < 10
    ).length;
    const totalMedicineQuantity = medicines.reduce(
      (sum, med) => sum + med.quantity,
      0
    );

    const avgPriorityWaitTime =
      priorityTicketsData?.tickets?.length > 0
        ? priorityTicketsData.tickets
            .filter((ticket) => ticket.createdAt)
            .reduce((sum, ticket) => {
              const createdAt = new Date(ticket.createdAt).getTime();
              const now = new Date().getTime();
              return sum + (now - createdAt) / 1000;
            }, 0) /
          (priorityTicketsData.tickets.filter((ticket) => ticket.createdAt)
            .length || 1)
        : 30;

    const avgNormalWaitTime =
      normalTicketsData?.tickets?.length > 0
        ? normalTicketsData.tickets
            .filter((ticket) => ticket.createdAt)
            .reduce((sum, ticket) => {
              const createdAt = new Date(ticket.createdAt).getTime();
              const now = new Date().getTime();
              return sum + (now - createdAt) / 1000;
            }, 0) /
          (normalTicketsData.tickets.filter((ticket) => ticket.createdAt)
            .length || 1)
        : 60;

    const completedTickets =
      ticketHistory?.filter(
        (ticket) => ticket.processingTimeInSeconds !== null
      ) || [];
    const totalCompletedTickets = completedTickets.length;

    let avgCompletionTime = 0;
    if (
      completedTickets.length > 0 &&
      completedTickets[0].createdAt &&
      completedTickets[0].updatedAt
    ) {
      avgCompletionTime =
        completedTickets.reduce((sum, ticket) => {
          const created = new Date(ticket.createdAt).getTime();
          const completed = new Date(ticket.updatedAt).getTime();
          return sum + (completed - created) / 1000; // in seconds
        }, 0) / completedTickets.length;
    }
    let medicinesDeliveredCount = 0;
    if (inProgressTickets?.length) {
      medicinesDeliveredCount = inProgressTickets.reduce(
        (sum: number, ticket: Ticket) => {
          if (!ticket.ticketMedicines) return sum;
          return (
            sum +
            ticket.ticketMedicines.reduce(
              (medSum: number, med: { quantity: number }) =>
                medSum + med.quantity,
              0
            )
          );
        },
        0
      );
    }

    return {
      totalPendingTickets,
      totalInProgressTickets,
      totalCompletedTickets,
      medicinesWithLowStock,
      totalMedicineQuantity,
      avgPriorityWaitTime,
      avgNormalWaitTime,
      avgCompletionTime,
      medicinesDeliveredCount,
    };
  };

  const kpis = calculateKPIs();

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const handleExportTickets = () => {
    const pendingTickets = [
      ...(priorityTicketsData?.tickets || []),
      ...(normalTicketsData?.tickets || []),
    ];
    const completedTickets =
      ticketHistory?.filter(
        (ticket) => ticket.processingTimeInSeconds !== null
      ) || [];

    exportTicketsToExcel(
      pendingTickets,
      inProgressTickets || [],
      completedTickets
    );
  };

  const handleExportMedicines = () => {
    exportMedicinesToExcel(medicines);
  };

  const handleExportKPIs = () => {
    exportKPIsToExcel(kpis);
  };

  const exportItems: MenuProps["items"] = [
    {
      key: "1",
      label: "Exportar Tickets",
      icon: <DownloadOutlined />,
      onClick: handleExportTickets,
    },
    {
      key: "2",
      label: "Exportar Medicamentos",
      icon: <DownloadOutlined />,
      onClick: handleExportMedicines,
    },
    {
      key: "3",
      label: "Exportar KPIs",
      icon: <DownloadOutlined />,
      onClick: handleExportKPIs,
    },
  ];

  const refreshAllData = () => {
    console.log("Actualizando datos...");
    setRefreshing(true);

    setTimeout(() => {
      console.log("Actualizando la página para obtener nuevos datos...");
      window.location.reload();
    }, 1000);
  };

  if (!selectedHeadquarter) {
    return (
      <div style={{ textAlign: "center", padding: "50px 0" }}>
        <Title level={3}>Seleccione una sede para ver los KPIs</Title>
        <HeadquarterSelector />
      </div>
    );
  }

  const isLoading =
    isLoadingInProgress || isMedicinesLoading || isHistoryLoading;

  return (
    <div className={styles.kpiDashboard}>
      <div className={styles.kpiDashboardHeader}>
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={2} className={styles.kpiDashboardTitle}>
              <DashboardOutlined /> Dashboard de KPIs
            </Title>
            <Text className={styles.kpiDashboardSubtitle}>
              Métricas y estadísticas para la gestión de tickets y medicamentos
            </Text>
          </Col>
          <Col>
            <Space>
              <Tooltip title="Actualizar datos">
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  loading={refreshing}
                  onClick={refreshAllData}
                >
                  Actualizar
                </Button>
              </Tooltip>

              <Dropdown menu={{ items: exportItems }} placement="bottomRight">
                <Button icon={<DownloadOutlined />}>Exportar</Button>
              </Dropdown>
            </Space>
          </Col>
        </Row>
      </div>
      <Spin spinning={isLoading}>
        {/* Ticket Status KPIs */}
        <Divider orientation="left">Estado de Tickets</Divider>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Card className={styles.kpiCard}>
              <Statistic
                title="Tickets pendientes"
                value={kpis.totalPendingTickets}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card className={styles.kpiCard}>
              <Statistic
                title="Tickets en progreso"
                value={kpis.totalInProgressTickets}
                prefix={<UserOutlined />}
                valueStyle={{ color: "#1677ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card className={styles.kpiCard}>
              <Statistic
                title="Tickets completados"
                value={kpis.totalCompletedTickets}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />

              {kpis.totalCompletedTickets +
                kpis.totalPendingTickets +
                kpis.totalInProgressTickets >
                0 && (
                <Progress
                  percent={Math.round(
                    (kpis.totalCompletedTickets /
                      (kpis.totalCompletedTickets +
                        kpis.totalPendingTickets +
                        kpis.totalInProgressTickets)) *
                      100
                  )}
                  status="success"
                  size="small"
                  style={{ marginTop: 8 }}
                />
              )}
            </Card>
          </Col>
        </Row>

        <Divider orientation="left">Tiempos de Atención</Divider>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Card className={styles.kpiCard}>
              <Statistic
                title="Tiempo de espera promedio (Prioritarios)"
                value={formatTime(kpis.avgPriorityWaitTime)}
                valueStyle={{ color: "#ff4d4f" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card className={styles.kpiCard}>
              <Statistic
                title="Tiempo de espera promedio (Normal)"
                value={formatTime(kpis.avgNormalWaitTime)}
                valueStyle={{ color: "#1677ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card className={styles.kpiCard}>
              <Statistic
                title="Tiempo de atención promedio"
                value={formatTime(kpis.avgCompletionTime)}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Medicine KPIs */}
        <Divider orientation="left">Métricas de Medicamentos</Divider>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Card className={styles.kpiCard}>
              <Statistic
                title="Total de medicamentos entregados"
                value={kpis.medicinesDeliveredCount}
                prefix={<MedicineBoxOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card className={styles.kpiCard}>
              <Statistic
                title={
                  <Space>
                    <span>Medicamentos con stock bajo</span>
                    {kpis.medicinesWithLowStock > 0 && (
                      <Tooltip title="¡Atención! Hay medicamentos con stock bajo">
                        <AlertOutlined style={{ color: "#ff4d4f" }} />
                      </Tooltip>
                    )}
                  </Space>
                }
                value={kpis.medicinesWithLowStock}
                prefix={<MedicineBoxOutlined />}
                valueStyle={{ color: "#ff4d4f" }}
                suffix={`/ ${totalMedicines}`}
              />
              {totalMedicines > 0 && (
                <Progress
                  percent={Math.round(
                    (kpis.medicinesWithLowStock / totalMedicines) * 100
                  )}
                  status="exception"
                  size="small"
                  style={{ marginTop: 8 }}
                />
              )}
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card className={styles.kpiCard}>
              <Statistic
                title="Inventario total de medicamentos"
                value={kpis.totalMedicineQuantity}
                prefix={<MedicineBoxOutlined />}
              />
            </Card>
          </Col>
        </Row>
      </Spin>{" "}
      <KPIsCharts
        priorityTicketsData={priorityTicketsData}
        normalTicketsData={normalTicketsData}
        inProgressTickets={inProgressTickets || []}
        ticketHistory={ticketHistory || []}
        isLoading={
          priorityTicketsData.isLoading ||
          normalTicketsData.isLoading ||
          isLoadingInProgress ||
          isHistoryLoading ||
          isMedicinesLoading ||
          refreshing
        }
      />
    </div>
  );
};

export default KPIsDashboardPage;
