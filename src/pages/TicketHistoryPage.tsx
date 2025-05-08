import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router";
import { Typography, Tag, Card, Spin, Empty, Alert } from "antd";
import { EyeOutlined, HistoryOutlined } from "@ant-design/icons";
import { AuthContext } from "../auth/AuthContext";
import useFetch from "../hooks/useFetch";
import useHideMenu from "../hooks/useHideMenu";
import { Ticket } from "../types/ticket/ticket.types";
import useHeadquarters from "../hooks/useHeadquarters";
import useCities from "../hooks/useCities";
import CardList from "../components/CardList";
import { CardData } from "../types/cards/cards.types";
import Pagination from "../components/Pagination";

const { Title, Text } = Typography;

const TicketHistoryPage: React.FC = () => {
  useHideMenu(false);
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext)!;
  const { get, isLoading: isLoadingTickets } = useFetch<{
    tickets: Ticket[];
  }>();
  const { headquarters, isLoading: isLoadingHeadquarters } = useHeadquarters();
  const { cities, isLoading: isLoadingCities } = useCities();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    const fetchTickets = async () => {
      if (!auth.id) {
        setError("No se pudo identificar el usuario actual.");
        return;
      }

      try {
        setError(null);
        const response = await get(`/tickets_?userId=${auth.id}`);
        if (response && response.tickets) {
          setTickets(response.tickets);
        } else {
          setError("No se pudo obtener la información de turnos.");
        }
      } catch (error) {
        console.error("Error al cargar el historial de turnos:", error);
        setError(
          "Error al cargar el historial de turnos. Por favor, intenta nuevamente."
        );
      }
    };

    fetchTickets();
  }, [get, auth.id]);

  const getHeadquarterName = (headquarterId: number) => {
    const headquarter = headquarters.find((h) => h.id === headquarterId);
    return headquarter ? headquarter.name : "Desconocida";
  };

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
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * pageSize;
  const displayedTickets = tickets.slice(startIndex, startIndex + pageSize);

  const renderTicketCard = (ticket: Ticket): CardData => {
    return {
      loading: false,
      title: `Turno #${ticket.id}`,
      image: undefined,
      properties: [
        {
          label: "Tipo",
          value: ticket.ticketType,
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

  if (isLoading) {
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
        </div>

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
              data={displayedTickets}
              loading={isLoading}
              renderItem={renderTicketCard}
            />
            <Pagination
              current={currentPage}
              total={tickets.length}
              pageSize={pageSize}
              onChange={onPageChange}
              showSizeChanger={false}
            />
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
