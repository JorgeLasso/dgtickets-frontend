import React, { useContext, useState } from "react";
import {
  Typography,
  Empty,
  Spin,
  Tooltip,
  Button,
  Tag,
  Pagination,
} from "antd";
import { PlusOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import CardList from "../components/CardList";
import { PQR } from "../types/pqrs/pqrs.types";
import useHideMenu from "../hooks/useHideMenu";
import { NotificationContext } from "../context/NotificationContext";
import usePQRs from "../hooks/usePQRs";
import PQRsModal from "../components/PQRsModal";
import { AuthContext } from "../auth/AuthContext";
import { ROLES } from "../constants/Roles";

const { Title, Text, Paragraph } = Typography;

const PQRsPage: React.FC = () => {
  useHideMenu(false);

  // Auth context for role validation
  const authContext = useContext(AuthContext);
  if (!authContext)
    throw new Error("AuthContext must be used within AuthProvider");
  const { auth } = authContext;

  // Notification context
  const notificationContext = useContext(NotificationContext);
  if (!notificationContext)
    throw new Error(
      "NotificationContext must be used within NotificationProvider"
    );
  const { openNotification } = notificationContext;

  // Check if user can answer PQRs (admin role)
  const isAdmin = auth.role === ROLES.ADMIN;
  const isUser = auth.role === ROLES.USER;

  // States for modal
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isAnswerModalVisible, setIsAnswerModalVisible] = useState(false);
  const [selectedPQR, setSelectedPQR] = useState<PQR | null>(null);

  // Get PQRs from custom hook
  const { pqrs, isLoading, pagination, fetchPQRs, createPQR, answerPQR } =
    usePQRs();

  // Handle modal visibility
  const handleOpenCreateModal = () => {
    setIsCreateModalVisible(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalVisible(false);
  };

  const handleOpenAnswerModal = (pqr: PQR) => {
    setSelectedPQR(pqr);
    setIsAnswerModalVisible(true);
  };

  const handleCloseAnswerModal = () => {
    setIsAnswerModalVisible(false);
    setSelectedPQR(null);
  };

  // Handle create PQR form submission
  const handleCreatePQR = async (description: string) => {
    const success = await createPQR(description);

    if (success) {
      openNotification(
        "success",
        "PQR creada",
        "Su solicitud, queja o reclamo ha sido creada exitosamente"
      );
      return true;
    }
    return false;
  };

  // Handle answer PQR form submission
  const handleAnswerPQR = async (id: number, answer: string) => {
    const success = await answerPQR(id, answer);

    if (success) {
      openNotification(
        "success",
        "PQR respondida",
        "La respuesta ha sido registrada exitosamente"
      );
      setIsAnswerModalVisible(false);
      return true;
    }
    return false;
  };

  // Handle pagination change
  const handlePageChange = (page: number, pageSize?: number) => {
    fetchPQRs(page, pageSize || pagination.limit);
  };

  // Render PQR card with details
  const renderPQRCard = (pqr: PQR) => {
    return {
      loading: isLoading,
      title: `PQR #${pqr.id}`,
      image: undefined,
      properties: [
        {
          label: "Estado",
          value:
            pqr.pqrType === "COMPLETED" ? (
              <Tag color="green">Respondida</Tag>
            ) : (
              <Tag color="orange">Pendiente</Tag>
            ),
        },
        {
          label: "Descripción",
          value: (
            <Paragraph ellipsis={{ rows: 2 }}>{pqr.description}</Paragraph>
          ),
        },
        {
          label: "Fecha",
          value: new Date(pqr.createdAt).toLocaleDateString(),
        },
        {
          label: "Respuesta",
          value: pqr.answer ? (
            <Paragraph ellipsis={{ rows: 2 }}>{pqr.answer}</Paragraph>
          ) : (
            <Text type="secondary">Sin respuesta</Text>
          ),
        },
      ],
      actions:
        isAdmin && pqr.pqrType !== "COMPLETED"
          ? [
              <Tooltip key="answer-tooltip" title="Responder">
                <QuestionCircleOutlined
                  key="answer"
                  onClick={() => handleOpenAnswerModal(pqr)}
                />
              </Tooltip>,
            ]
          : [],
    };
  };

  // Loading state
  if (isLoading && pqrs.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <Spin size="large" tip="Cargando PQRs..." />
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          Peticiones, Quejas y Reclamos
        </Title>
      </div>

      {isUser && (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenCreateModal}
          style={{ marginBottom: "20px" }}
        >
          Crear PQR
        </Button>
      )}

      {pqrs.length === 0 && !isLoading ? (
        <Empty description="No hay PQRs disponibles" />
      ) : (
        <>
          <CardList
            data={pqrs}
            loading={isLoading}
            renderItem={renderPQRCard}
          />
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <Pagination
              current={pagination.page}
              pageSize={pagination.limit}
              total={pagination.total}
              onChange={handlePageChange}
              showSizeChanger
              pageSizeOptions={["5", "10", "20", "50"]}
            />
          </div>
        </>
      )}

      {/* Create PQR Modal */}
      <PQRsModal
        isVisible={isCreateModalVisible}
        onCancel={handleCloseCreateModal}
        onSubmit={handleCreatePQR}
        isLoading={isLoading}
        mode="create"
      />

      {/* Answer PQR Modal */}
      <PQRsModal
        isVisible={isAnswerModalVisible}
        onCancel={handleCloseAnswerModal}
        onSubmit={() => Promise.resolve(false)} // Not used in answer mode
        onAnswer={handleAnswerPQR}
        selectedPQR={selectedPQR}
        isLoading={isLoading}
        mode="answer"
      />
    </div>
  );
};

export default PQRsPage;
