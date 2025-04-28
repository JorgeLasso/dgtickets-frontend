import React from "react";
import { Card, Tag } from "antd";
import styles from "./ModuleCard.module.css";
import { Module } from "../types/modules/modules.types";

interface ModuleCardProps {
  module: Module;
  loading?: boolean;
}
const ModuleCard: React.FC<ModuleCardProps> = ({ module, loading }) => (
  <Card className={styles.container} loading={loading} title={module.name}>
    <div className={styles.content}>
      {module.isActive ? (
        <Tag color="green" className={styles.activeTag}>
          Activo
        </Tag>
      ) : (
        <Tag color="red" className={styles.inactiveTag}>
          Inactivo
        </Tag>
      )}
      <Tag color="blue" className={styles.adviserTag}>
        {module.user
          ? `Asesor: ${module.user.firstName} ${module.user.lastName}`
          : "Sin asesor asignado"}
      </Tag>
    </div>
  </Card>
);

export default ModuleCard;
