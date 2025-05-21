import React, { useContext, useState, useEffect } from "react";
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
  DatePicker,
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
import useTickets from "../hooks/useTickets";
import useHeadquarters from "../hooks/useHeadquarters";
import { Ticket } from "../types/ticket/ticket.types";
import { HeadquarterMedicine } from "../types/headquarters/headquarter.types";
import HeadquarterSelector from "../components/HeadquarterSelector";
import KPIsCharts from "../components/KPIsCharts";
import {
  exportTicketsToExcelUnified,
  exportMedicinesToExcelUnified,
  exportKPIsToExcelUnified,
} from "../utils/excelExport";
import styles from "./KPIsDashboardPage.module.css";
import { TYPES } from "../constants/TicketType";
import { Dayjs } from "dayjs";

const { Title, Text } = Typography;

const KPIsDashboardPage: React.FC = () => {
  const { selectedHeadquarter } = useContext(HeadquarterContext)!;
  const { headquarters, getMedicinesByHeadquarter } = useHeadquarters();
  const [refreshing, setRefreshing] = useState(false);
  const [ticketMedicines, setTicketMedicines] = useState<
    Array<{ name: string; quantity: number }>
  >([]);
  const [headquarterMedicines, setHeadquarterMedicines] = useState<
    HeadquarterMedicine[]
  >([]);
  const [isLoadingHeadquarterMedicines, setIsLoadingHeadquarterMedicines] =
    useState<boolean>(false);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    null,
    null,
  ]);

  const {
    tickets: completedTickets,
    isLoading: isLoadingCompleted,
    reloadTickets: reloadCompletedTickets,
    getMedicinesFromCompletedTickets,
    isMedicinesLoading,
  } = useTickets("COMPLETED", selectedHeadquarter || 0);

  useEffect(() => {
    if (selectedHeadquarter) {
      setIsLoadingHeadquarterMedicines(true);
      getMedicinesByHeadquarter(selectedHeadquarter)
        .then((medicines) => {
          if (medicines) {
            setHeadquarterMedicines(medicines);
          } else {
            setHeadquarterMedicines([]);
          }
        })
        .catch((error) => {
          console.error("Error al obtener medicamentos de la sede:", error);
          setHeadquarterMedicines([]);
        })
        .finally(() => {
          setIsLoadingHeadquarterMedicines(false);
        });
    } else {
      setHeadquarterMedicines([]);
    }
  }, [selectedHeadquarter, getMedicinesByHeadquarter]);

  React.useEffect(() => {
    if (completedTickets.length > 0) {
      getMedicinesFromCompletedTickets().then((medicines) => {
        setTicketMedicines(medicines);
      });
    }
  }, [completedTickets, getMedicinesFromCompletedTickets]);

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
    isLoading: isLoadingMedicines,
  } = useMedicines({ limit: 100 });

  const filterByDateRange = <
    T extends { createdAt?: string; updatedAt?: string }
  >(
    items: T[]
  ): T[] => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) return items;
    const start = dateRange[0].startOf("day").toDate().getTime();
    const end = dateRange[1].endOf("day").toDate().getTime();
    return items.filter((item) => {
      const created = item.createdAt
        ? new Date(item.createdAt).getTime()
        : null;
      const updated = item.updatedAt
        ? new Date(item.updatedAt).getTime()
        : null;
      // Check if either created or updated date falls within the range
      return (
        (created && created >= start && created <= end) ||
        (updated && updated >= start && updated <= end)
      );
    });
  };

  // Filter tickets by date range
  const filteredCompletedTickets = filterByDateRange(completedTickets);
  const filteredInProgressTickets = filterByDateRange(inProgressTickets || []);
  const filteredPriorityTickets = filterByDateRange(
    priorityTicketsData?.tickets || []
  );
  const filteredNormalTickets = filterByDateRange(
    normalTicketsData?.tickets || []
  );

  const calculateKPIs = () => {
    const totalPendingTickets =
      (filteredPriorityTickets?.length || 0) +
      (filteredNormalTickets?.length || 0);

    const totalInProgressTickets = filteredInProgressTickets?.length || 0;
    const medicinesWithLowStock = medicines.filter(
      (med) => med.quantity < 10
    ).length;

    let totalMedicineQuantity = 0;
    if (headquarterMedicines?.length) {
      totalMedicineQuantity = headquarterMedicines.reduce(
        (sum, medicine) => sum + medicine.quantity,
        0
      );
    } else if (ticketMedicines?.length) {
      totalMedicineQuantity = ticketMedicines.reduce(
        (sum, medicine) => sum + medicine.quantity,
        0
      );
    } else {
      totalMedicineQuantity = medicines.reduce(
        (sum, med) => sum + med.quantity,
        0
      );
    }

    const avgPriorityWaitTime =
      filteredPriorityTickets?.length > 0
        ? filteredPriorityTickets
            .filter((ticket) => ticket.createdAt)
            .reduce((sum, ticket) => {
              const createdAt = new Date(ticket.createdAt).getTime();
              const now = new Date().getTime();
              return sum + (now - createdAt) / 1000;
            }, 0) /
          (filteredPriorityTickets.filter((ticket) => ticket.createdAt)
            .length || 1)
        : 30;

    const avgNormalWaitTime =
      filteredNormalTickets?.length > 0
        ? filteredNormalTickets
            .filter((ticket) => ticket.createdAt)
            .reduce((sum, ticket) => {
              const createdAt = new Date(ticket.createdAt).getTime();
              const now = new Date().getTime();
              return sum + (now - createdAt) / 1000;
            }, 0) /
          (filteredNormalTickets.filter((ticket) => ticket.createdAt).length ||
            1)
        : 60;
    const totalCompletedTickets = filteredCompletedTickets.length;

    let avgCompletionTime = 0;
    if (
      filteredCompletedTickets.length > 0 &&
      filteredCompletedTickets[0].createdAt &&
      filteredCompletedTickets[0].updatedAt
    ) {
      avgCompletionTime =
        filteredCompletedTickets.reduce((sum, ticket) => {
          const created = new Date(ticket.createdAt).getTime();
          const completed = new Date(ticket.updatedAt).getTime();
          return sum + (completed - created) / 1000; // in seconds
        }, 0) / filteredCompletedTickets.length;
    }
    let medicinesDeliveredCount = 0;

    if (ticketMedicines?.length) {
      medicinesDeliveredCount = ticketMedicines.reduce(
        (sum, medicine) => sum + medicine.quantity,
        0
      );
    } else if (inProgressTickets?.length) {
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
    const allTickets = [
      ...(filteredPriorityTickets || []),
      ...(filteredNormalTickets || []),
      ...(filteredInProgressTickets || []),
      ...(filteredCompletedTickets || []),
    ];
    exportTicketsToExcelUnified(allTickets, headquarters);
  };

  const handleExportMedicines = () => {
    exportMedicinesToExcelUnified(medicines, headquarters);
  };

  const handleExportKPIs = () => {
    exportKPIsToExcelUnified(kpis);
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
    setRefreshing(true);

    if (reloadCompletedTickets) {
      reloadCompletedTickets();
    }

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
    isLoadingInProgress ||
    isLoadingMedicines ||
    isLoadingCompleted ||
    isLoadingHeadquarterMedicines;

  const ratings = filteredCompletedTickets
    .map((ticket) => ticket.rating?.value)
    .filter((value) => typeof value === "number");

  const avgRating =
    ratings.length > 0
      ? (ratings.reduce((sum, val) => sum + val, 0) / ratings.length).toFixed(2)
      : null;

  const allTickets = [
    ...(filteredPriorityTickets || []),
    ...(filteredNormalTickets || []),
    ...(filteredInProgressTickets || []),
    ...(filteredCompletedTickets || []),
  ];
  const ticketTypeCounts = allTickets.reduce((acc, ticket) => {
    const typeKey = ticket.ticketType || "Sin estado";
    // Map to Spanish using TYPES, fallback to typeKey if not found
    const type = TYPES[typeKey as keyof typeof TYPES] || typeKey;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const ticketTypeData = Object.entries(ticketTypeCounts).map(
    ([type, count]) => ({
      type,
      count,
    })
  );

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
              <DatePicker.RangePicker
                allowClear
                value={dateRange}
                onChange={(range) => {
                  if (!range) {
                    setDateRange([null, null]);
                  } else {
                    setDateRange(range as [Dayjs | null, Dayjs | null]);
                  }
                }}
                format="DD/MM/YYYY"
                style={{ marginRight: 8 }}
                placeholder={["Fecha inicio", "Fecha fin"]}
              />
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
          </Col>{" "}
          <Col xs={24} sm={12} md={8}>
            <Card className={styles.kpiCard}>
              <Statistic
                title="Inventario total de medicamentos en sede"
                value={kpis.totalMedicineQuantity}
                prefix={<MedicineBoxOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card className={styles.kpiCard}>
              <Statistic
                title="Promedio de calificación"
                value={avgRating !== null ? avgRating : "N/A"}
                prefix={
                  <span style={{ color: "#faad14", fontSize: 18 }}>★</span>
                }
                valueStyle={{ color: "#faad14" }}
                suffix={avgRating !== null ? "/ 5" : ""}
              />
            </Card>
          </Col>
        </Row>{" "}
      </Spin>{" "}
      <KPIsCharts
        priorityTicketsData={{
          ...priorityTicketsData,
          tickets: filteredPriorityTickets,
        }}
        normalTicketsData={{
          ...normalTicketsData,
          tickets: filteredNormalTickets,
        }}
        inProgressTickets={filteredInProgressTickets}
        completedTickets={filteredCompletedTickets}
        ticketMedicines={ticketMedicines}
        isMedicinesLoading={isMedicinesLoading}
        isLoading={
          priorityTicketsData.isLoading ||
          normalTicketsData.isLoading ||
          isLoadingInProgress ||
          isLoadingMedicines ||
          isMedicinesLoading ||
          isLoadingHeadquarterMedicines ||
          refreshing
        }
        ratings={ratings}
        ticketTypeData={ticketTypeData}
      />
    </div>
  );
};

export default KPIsDashboardPage;
