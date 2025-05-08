import React from "react";
import { Card, Tag, Space } from "antd";
import styles from "./ModuleCard.module.css";
import { Module } from "../types/modules/modules.types";

interface ModuleCardProps {
  module: Module;
  loading?: boolean;
}
const ModuleCard: React.FC<ModuleCardProps> = ({ module, loading }) => {
  const inProgressTicket = module.tickets?.find(
    (ticket) => ticket.ticketType === "IN_PROGRESS"
  );

  return (
    <Card className={styles.container} loading={loading} title={module.name}>
      <div className={styles.content}>
        <Space direction="vertical" style={{ width: "100%" }}>
          {module.isActive ? (
            <Tag color="green" className={styles.moduleTags}>
              Activo
            </Tag>
          ) : (
            <Tag color="red" className={styles.moduleTags}>
              Inactivo
            </Tag>
          )}
          <Tag color="blue" className={styles.moduleTags}>
            {module.user
              ? `Asesor: ${module.user.firstName} ${module.user.lastName}`
              : "Sin asesor asignado"}
          </Tag>

          {inProgressTicket && (
            <Tag color="orange" className={styles.moduleTags}>
              Atendiendo a: {inProgressTicket.user.firstName}{" "}
              {inProgressTicket.user.lastName}
            </Tag>
          )}
        </Space>
      </div>
    </Card>
  );
};

export default ModuleCard;
