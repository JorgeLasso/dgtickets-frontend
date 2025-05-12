import React from "react";
import { Column, Bar } from "@ant-design/charts";
import { Card, Row, Col, Divider, Typography, Empty, Spin } from "antd";
import { Ticket } from "../types/ticket/ticket.types";
import styles from "../pages/KPIsDashboardPage.module.css";

const { Title } = Typography;

interface TicketDistributionProps {
  completedTickets: Ticket[];
  isLoading: boolean;
}

interface WaitTimeChartProps {
  priorityWaitTime: number;
  normalWaitTime: number;
  completionTime: number;
  isLoading: boolean;
}

interface MedicineChartProps {
  medicineData: Array<{ medicine: { name: string }; quantity: number }>;
  isLoading: boolean;
}

interface WaitTimeData {
  type: string;
  value: number;
}

interface PendingTicketsData {
  tickets: Ticket[];
  isLoading: boolean;
  error: unknown;
  count?: number;
  avgPending?: number;
  avgProcessing?: number;
}

export const TicketDistributionChart: React.FC<TicketDistributionProps> = ({
  completedTickets,
  isLoading,
}) => {
  const moduleCountMap: Record<string | number, number> = {};
  completedTickets.forEach((ticket) => {
    const moduleId = ticket.moduleId || "Sin módulo";
    moduleCountMap[moduleId] = (moduleCountMap[moduleId] || 0) + 1;
  });

  const data = Object.entries(moduleCountMap)
    .map(([moduleId, count]) => ({
      type: `Módulo ${moduleId}`,
      value: count,
      moduleId,
    }))
    .sort((a, b) => b.value - a.value);

  const topModuleId = data.length > 0 ? data[0].moduleId : null;

  const highlightColor = "#52c41a";
  const secondaryColors = [
    "#1677ff",
    "#faad14",
    "#ff4d4f",
    "#722ed1",
    "#13c2c2",
    "#b37feb",
  ];
  const colorMap: Record<string, string> = {};
  data.forEach((item, idx) => {
    if (item.moduleId === topModuleId) {
      colorMap[item.type] = highlightColor;
    } else {
      colorMap[item.type] = secondaryColors[(idx - 1) % secondaryColors.length];
    }
  });

  if (isLoading) {
    return (
      <Card className={styles.kpiCard}>
        <Spin spinning={true} size="large" />
      </Card>
    );
  }

  if (completedTickets.length === 0) {
    return (
      <Card className={styles.kpiCard}>
        <Empty description="No hay tickets completados para mostrar" />
      </Card>
    );
  }

  const config = {
    data,
    xField: "type",
    yField: "value",
    padding: [50, 30, 90, 40],
    minColumnWidth: 40,
    maxColumnWidth: 60,
    columnWidthRatio: 0.5,
    label: false,
    tooltip: {
      formatter: (datum: { type: string; value: number }) => {
        return { name: datum.type, value: datum.value };
      },
    },
    color: ({ type }: { type: string }) => colorMap[type] || secondaryColors[0],
    meta: {
      value: {
        alias: "Tickets Completados",
      },
    },
    autoFit: true,
    animation: {
      appear: {
        animation: "fade-in",
      },
    },
  };
  return (
    <Card className={styles.kpiCard}>
      <Title level={5}>Tickets Completados por Módulo</Title>
      <div>
        <Column {...config} />
      </div>
    </Card>
  );
};

export const WaitTimeChart: React.FC<WaitTimeChartProps> = ({
  priorityWaitTime,
  normalWaitTime,
  completionTime,
  isLoading,
}) => {
  const data = [
    { type: "Espera Prioritarios", value: (priorityWaitTime || 0) / 60 },
    { type: "Espera Normales", value: (normalWaitTime || 0) / 60 },
    { type: "Atención Promedio", value: (completionTime || 0) / 60 },
  ];
  const config = {
    data,
    xField: "type",
    yField: "value",
    padding: [50, 30, 90, 40],
    minColumnWidth: 40,
    maxColumnWidth: 60,
    columnWidthRatio: 0.5,
    label: false,
    tooltip: {
      formatter: (datum: WaitTimeData) => {
        const formattedValue =
          datum.value !== undefined && datum.value !== null
            ? `${datum.value.toFixed(1)} minutos`
            : "0.0 minutos";
        return { name: datum.type, value: formattedValue };
      },
    },
    color: ({ type }: { type: string }) => {
      if (type === "Espera Prioritarios") return "#ff4d4f";
      if (type === "Espera Normales") return "#1677ff";
      return "#52c41a";
    },
    meta: {
      value: {
        alias: "Minutos",
      },
    },
    autoFit: true,
    animation: {
      appear: {
        animation: "fade-in",
      },
    },
  };
  if (isLoading) {
    return (
      <Card className={styles.kpiCard}>
        <Spin spinning={true} size="large" />
      </Card>
    );
  }

  if (priorityWaitTime === 0 && normalWaitTime === 0 && completionTime === 0) {
    return (
      <Card className={styles.kpiCard}>
        <Empty description="Sin datos disponibles" />
      </Card>
    );
  }
  return (
    <Card className={styles.kpiCard}>
      <Title level={5}>Tiempos de Espera y Atención (minutos)</Title>
      <div>
        <Column {...config} />
      </div>
    </Card>
  );
};

export const TopMedicinesChart: React.FC<MedicineChartProps> = ({
  medicineData,
  isLoading,
}) => {
  const processedData = medicineData
    .slice(0, 5) // Tomar los 5 medicamentos con mayor cantidad
    .map((item) => ({
      name: item.medicine.name,
      quantity: item.quantity,
    }));
  const config = {
    data: processedData,
    xField: "quantity",
    yField: "name",
    seriesField: "name",
    padding: [30, 20, 40, 35],
    legend: {
      position: "top-right",
      flipPage: false,
    },
    meta: {
      quantity: {
        alias: "Cantidad",
      },
    },
    autoFit: true,
    barStyle: {
      radius: [2, 2, 0, 0],
    },
    label: {
      position: "right",
      offset: 5,
    },
    animation: {
      appear: {
        animation: "fade-in",
      },
    },
  };
  if (isLoading) {
    return (
      <Card className={styles.kpiCard}>
        <Title level={5}>Top 5 Medicamentos Solicitados</Title>
        <Spin spinning={true} size="large" />
      </Card>
    );
  }
  if (processedData.length === 0) {
    return (
      <Card className={styles.kpiCard}>
        <Title level={5}>Top 5 Medicamentos Solicitados</Title>
        <Empty description="No hay datos de medicamentos para la sede seleccionada" />
      </Card>
    );
  }
  return (
    <Card className={styles.kpiCard}>
      <Title level={5}>Top 5 Medicamentos Solicitados</Title>
      <div>
        <Bar {...config} />
      </div>
    </Card>
  );
};

const KPIsCharts: React.FC<{
  priorityTicketsData: PendingTicketsData;
  normalTicketsData: PendingTicketsData;
  inProgressTickets: Ticket[];
  completedTickets: Ticket[];
  ticketMedicines?: Array<{ name: string; quantity: number }>;
  isMedicinesLoading?: boolean;
  isLoading: boolean;
}> = ({
  priorityTicketsData,
  normalTicketsData,
  inProgressTickets,
  completedTickets,
  ticketMedicines = [],
  isMedicinesLoading = false,
  isLoading,
}) => {
  const completedTicketMedicines = ticketMedicines.map((medicine) => ({
    medicine: { name: medicine.name },
    quantity: medicine.quantity,
  }));

  const hasData =
    (priorityTicketsData?.tickets?.length || 0) > 0 ||
    (normalTicketsData?.tickets?.length || 0) > 0 ||
    (inProgressTickets?.length || 0) > 0 ||
    (completedTickets?.length || 0) > 0 ||
    (completedTicketMedicines?.length || 0) > 0;
  if (!hasData && !isLoading) {
    return (
      <>
        <Divider orientation="left">Estadísticas y Gráficos</Divider>
        <Card className={styles.kpiCard}>
          <Empty
            description={
              <div>
                <Title level={4}>No hay datos disponibles para mostrar</Title>
                <p>
                  Se requieren tickets o medicamentos registrados para generar
                  gráficos. Asegúrese de que:
                </p>
                <ul>
                  <li>Se ha seleccionado una sede con datos</li>
                  <li>Existen tickets pendientes o en proceso</li>
                  <li>Se han registrado entregas de medicamentos</li>
                </ul>
                <p style={{ marginTop: "16px", color: "#1890ff" }}>
                  Nota: Para actualizar los datos, haga clic en el botón
                  "Actualizar" en la parte superior de la página.
                </p>
              </div>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      </>
    );
  }
  const hasLimitedData =
    ((priorityTicketsData?.tickets?.length || 0) < 2 &&
      (normalTicketsData?.tickets?.length || 0) < 2) ||
    completedTicketMedicines.length < 2;
  return (
    <>
      <Divider orientation="left">Estadísticas y Gráficos</Divider>{" "}
      {hasLimitedData && !isLoading && !isMedicinesLoading && (
        <Card>
          <div>
            <span>⚠️</span>
            <span>
              Los datos disponibles son limitados. Los gráficos pueden no
              reflejar tendencias significativas. Considere añadir más datos o
              seleccionar una sede con más actividad.
            </span>
          </div>
        </Card>
      )}{" "}
      <Row gutter={[16, 24]}>
        <Col xs={24} md={12}>
          <TicketDistributionChart
            completedTickets={completedTickets}
            isLoading={isLoading}
          />
        </Col>{" "}
        <Col xs={24} md={12}>
          <WaitTimeChart
            priorityWaitTime={
              priorityTicketsData?.tickets?.length > 0
                ? priorityTicketsData.tickets
                    .filter((ticket) => ticket.createdAt)
                    .reduce((sum, ticket) => {
                      const createdAt = new Date(ticket.createdAt).getTime();
                      const now = new Date().getTime();
                      return sum + (now - createdAt) / 1000;
                    }, 0) /
                  (priorityTicketsData.tickets.filter(
                    (ticket) => ticket.createdAt
                  ).length || 1)
                : 30
            }
            normalWaitTime={
              normalTicketsData?.tickets?.length > 0
                ? normalTicketsData.tickets
                    .filter((ticket) => ticket.createdAt)
                    .reduce((sum, ticket) => {
                      const createdAt = new Date(ticket.createdAt).getTime();
                      const now = new Date().getTime();
                      return sum + (now - createdAt) / 1000;
                    }, 0) /
                  (normalTicketsData.tickets.filter(
                    (ticket) => ticket.createdAt
                  ).length || 1)
                : 60
            }
            completionTime={
              completedTickets && completedTickets.length > 0
                ? completedTickets
                    .filter((ticket) => ticket.createdAt && ticket.updatedAt)
                    .reduce((sum, ticket) => {
                      const createdAt = new Date(ticket.createdAt).getTime();
                      const completedAt = new Date(ticket.updatedAt).getTime();
                      return sum + (completedAt - createdAt) / 1000;
                    }, 0) /
                  (completedTickets.filter(
                    (ticket) => ticket.createdAt && ticket.updatedAt
                  ).length || 1)
                : 0
            }
            isLoading={isLoading}
          />{" "}
        </Col>{" "}
        <Col xs={24} style={{ marginTop: 8 }}>
          <TopMedicinesChart
            medicineData={completedTicketMedicines}
            isLoading={isMedicinesLoading}
          />
        </Col>
      </Row>
    </>
  );
};

export default KPIsCharts;
