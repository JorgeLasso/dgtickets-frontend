import React from "react";
import { Pie, Column, Bar } from "@ant-design/charts";
import { Card, Row, Col, Divider, Typography, Empty, Spin } from "antd";
import { Ticket } from "../types/ticket/ticket.types";
import styles from "../pages/KPIsDashboardPage.module.css";

const { Title } = Typography;

interface TicketDistributionProps {
  priorityTicketsCount: number;
  normalTicketsCount: number;
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

interface TicketDistributionData {
  type: string;
  value: number;
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
  priorityTicketsCount,
  normalTicketsCount,
  isLoading,
}) => {
  const data = [
    { type: "Prioritarios", value: priorityTicketsCount },
    { type: "Normales", value: normalTicketsCount },
  ];
  const config = {
    appendPadding: 15,
    data,
    angleField: "value",
    colorField: "type",
    radius: 0.75,
    label: {
      type: "outer",
      content: "{name} {percentage}",
      offset: 20,
    },
    interactions: [{ type: "pie-legend-active" }, { type: "element-active" }],
    legend: {
      position: "bottom",
      flipPage: false,
      itemHeight: 20,
    },
    tooltip: {
      formatter: (datum: TicketDistributionData) => {
        return { name: datum.type, value: datum.value };
      },
    },
    color: ["#ff4d4f", "#1677ff"],
    autoFit: true,
  };
  if (isLoading) {
    return (
      <Card className={styles.kpiCard}>
        <Spin spinning={true} size="large" />
      </Card>
    );
  }

  if (priorityTicketsCount === 0 && normalTicketsCount === 0) {
    return (
      <Card className={styles.kpiCard}>
        <Empty description="Sin datos disponibles" />
      </Card>
    );
  }
  return (
    <Card className={styles.kpiCard}>
      <Title level={5}>Distribución de Tickets</Title>
      <div>
        <Pie {...config} />
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
    label: {
      formatter: (datum: WaitTimeData) => {
        return datum.value !== undefined && datum.value !== null
          ? `${datum.value.toFixed(1)} min`
          : "0.0 min";
      },
    },
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
    .slice()
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5) //
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
        <Spin spinning={true} size="large" />
      </Card>
    );
  }

  if (processedData.length === 0) {
    return (
      <Card className={styles.kpiCard}>
        <Empty description="Sin datos disponibles" />
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
  ticketHistory: Ticket[];
  isLoading: boolean;
}> = ({
  priorityTicketsData,
  normalTicketsData,
  inProgressTickets,
  ticketHistory,
  isLoading,
}) => {
  const hasData =
    (priorityTicketsData?.tickets?.length || 0) > 0 ||
    (normalTicketsData?.tickets?.length || 0) > 0 ||
    (inProgressTickets?.length || 0) > 0 ||
    (ticketHistory?.length || 0) > 0;

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

  const getMedicineData = () => {
    const allMedicines: Record<string, number> = {};

    if (inProgressTickets && inProgressTickets.length > 0) {
      inProgressTickets.forEach((ticket) => {
        if (ticket.ticketMedicines && Array.isArray(ticket.ticketMedicines)) {
          ticket.ticketMedicines.forEach((med) => {
            if (med && med.medicine && med.medicine.name) {
              const medicineName = med.medicine.name;
              allMedicines[medicineName] =
                (allMedicines[medicineName] || 0) + (med.quantity || 1);
            } else if (med && med.quantity) {
              allMedicines["Medicamento sin nombre"] =
                (allMedicines["Medicamento sin nombre"] || 0) + med.quantity;
            }
          });
        }
      });
    }

    const result = Object.entries(allMedicines).map(([name, quantity]) => ({
      medicine: { name },
      quantity,
    }));

    console.log("Datos de medicamentos procesados:", result);
    return result;
  };

  const medicineData = getMedicineData();
  const hasLimitedData =
    ((priorityTicketsData?.tickets?.length || 0) < 2 &&
      (normalTicketsData?.tickets?.length || 0) < 2) ||
    medicineData.length < 2;
  return (
    <>
      <Divider orientation="left">Estadísticas y Gráficos</Divider>
      {hasLimitedData && !isLoading && (
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
            priorityTicketsCount={priorityTicketsData?.tickets?.length || 0}
            normalTicketsCount={normalTicketsData?.tickets?.length || 0}
            isLoading={isLoading}
          />
        </Col>
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
              ticketHistory && ticketHistory.length > 0
                ? ticketHistory
                    .filter(
                      (ticket) =>
                        ticket.processingTimeInSeconds !== null &&
                        ticket.processingTimeInSeconds !== undefined
                    )
                    .reduce(
                      (sum, ticket) =>
                        sum + (ticket.processingTimeInSeconds || 0),
                      0
                    ) /
                  (ticketHistory.filter(
                    (ticket) =>
                      ticket.processingTimeInSeconds !== null &&
                      ticket.processingTimeInSeconds !== undefined
                  ).length || 1)
                : 0
            }
            isLoading={isLoading}
          />{" "}
        </Col>
        <Col xs={24} style={{ marginTop: 8 }}>
          <TopMedicinesChart
            medicineData={medicineData}
            isLoading={isLoading}
          />
        </Col>
      </Row>
    </>
  );
};

export default KPIsCharts;
