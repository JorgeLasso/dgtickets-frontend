import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Typography, Tag, Card, Spin, Empty, Alert, Select, Space } from "antd";
import {
  EyeOutlined,
  HistoryOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import useHideMenu from "../hooks/useHideMenu";
import { Ticket } from "../types/ticket/ticket.types";
import useHeadquarters from "../hooks/useHeadquarters";
import useCities from "../hooks/useCities";
import useTicketHistory from "../hooks/useTicketHistory";
import CardList from "../components/CardList";
import { CardData } from "../types/cards/cards.types";
import Pagination from "../components/Pagination";
import { TYPES } from "../constants/TicketType";

const { Title, Text } = Typography;
const { Option } = Select;

// Map of ticket type values to display labels
const ticketTypeOptions = Object.entries(TYPES).map(([key, value]) => ({
  value: key,
  label: value,
}));

const TicketHistoryPage: React.FC = () => {
  useHideMenu(false);
  const navigate = useNavigate();
  const [pageSize] = useState(8);
  const [selectedTicketType, setSelectedTicketType] = useState<
    string | undefined
  >(undefined);

  const {
    tickets,
    totalTickets,
    currentPage,
    isLoading: isLoadingTickets,
    error,
    fetchTickets,
    setPage,
    filterTickets,
  } = useTicketHistory(undefined, {
    limit: pageSize,
    page: 1,
  });

  const { headquarters, isLoading: isLoadingHeadquarters } = useHeadquarters();
  const { cities, isLoading: isLoadingCities } = useCities();
  const getHeadquarterName = (headquarterId: number) => {
    const headquarter = headquarters.find((h) => h.id === headquarterId);
    return headquarter ? headquarter.name : "Desconocida";
  };

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const getCityName = (headquarterId: number) => {
    const headquarter = headquarters.find((h) => h.id === headquarterId);
    if (headquarter) {
      const city = cities.find((c) => c.id === headquarter.cityId);
      return city ? city.name : "Desconocida";
    }
    return "Desconocida";
  };

  const viewTicketDetails = (ticketId: number) => {
    navigate(`/ticket/${ticketId}`);
  };

  const onPageChange = (page: number) => {
    setPage(page);
  };
  const handleTicketTypeChange = (value: string) => {
    setSelectedTicketType(value);
    filterTickets(value);
  };

  const renderTicketCard = (ticket: Ticket): CardData => {
    return {
      loading: false,
      title: `Turno #${ticket.id}`,
      image: undefined,
      properties: [
        {
          label: "Tipo",
          value:
            TYPES[ticket.ticketType as keyof typeof TYPES] || ticket.ticketType,
        },
        {
          label: "Prioridad",
          value: (
            <Tag color={ticket.priority ? "red" : "green"}>
              {ticket.priority ? "Prioritario" : "Regular"}
            </Tag>
          ),
        },
        {
          label: "Sede",
          value: getHeadquarterName(ticket.headquarterId),
        },
        {
          label: "Ciudad",
          value: getCityName(ticket.headquarterId),
        },
        {
          label: "Fecha",
          value: new Date(ticket.createdAt).toLocaleString(),
        },
      ],
      actions: [
        <EyeOutlined key="view" onClick={() => viewTicketDetails(ticket.id)} />,
      ],
    };
  };
  const isLoading =
    isLoadingTickets || isLoadingHeadquarters || isLoadingCities;

  if (isLoading && tickets.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <Spin size="large" tip="Cargando historial de turnos..." />
      </div>
    );
  }

  return (
    <>
      <Card>
        <Title level={3} style={{ textAlign: "center", marginBottom: "20px" }}>
          <HistoryOutlined /> Historial de Turnos
        </Title>
        <div style={{ marginBottom: "20px" }}>
          <Text>
            A continuación se muestra el historial de todos los turnos que has
            creado. Puedes hacer clic en el ícono del ojo para ver la
            información completa de cada uno.
          </Text>
        </div>{" "}
        <Space style={{ marginBottom: "20px" }}>
          <FilterOutlined />
          <Select
            placeholder="Filtrar por tipo de turno"
            style={{ width: 200 }}
            allowClear
            onChange={handleTicketTypeChange}
            value={selectedTicketType}
          >
            {ticketTypeOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Space>
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: "20px" }}
          />
        )}
        {!error && tickets.length > 0 ? (
          <>
            <CardList
              data={tickets}
              loading={isLoading}
              renderItem={renderTicketCard}
            />

            <div style={{ marginTop: "20px" }}>
              <Pagination
                current={currentPage}
                total={totalTickets}
                pageSize={pageSize}
                onChange={onPageChange}
                showSizeChanger={false}
              />
              <Text
                style={{
                  display: "block",
                  marginTop: "10px",
                  textAlign: "right",
                }}
              >
                Mostrando {tickets.length} de {totalTickets} turnos
              </Text>
            </div>
          </>
        ) : !error ? (
          <Empty
            description="No tienes turnos en tu historial"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : null}
      </Card>
    </>
  );
};

export default TicketHistoryPage;
