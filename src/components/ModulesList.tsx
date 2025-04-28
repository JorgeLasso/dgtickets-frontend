import React from "react";
import { Empty, Row, Col, Spin, Typography } from "antd";
import ModuleCard from "./ModuleCard";
import { Module } from "../types/modules/modules.types";

interface ModulesListProps {
  modules: Module[];
  loading: boolean;
}

const ModulesList: React.FC<ModulesListProps> = ({ modules, loading }) => {
  const { Title, Text } = Typography;
  // Only show modules that are active and have an assigned adviser
  const filteredModules = modules.filter((m) => m.isActive && m.user);

  return (
    <>
      <Title level={3} style={{ textAlign: "center", marginBottom: 16 }}>
        Módulos de atención disponibles
      </Title>
      <Text style={{ textAlign: "center", marginBottom: 16 }}>
        Total de módulos activos: {filteredModules.length}
      </Text>

      {filteredModules.length === 0 && !loading ? (
        <Empty description="No hay módulos disponibles" />
      ) : (
        <Spin spinning={loading} tip="Cargando módulos...">
          <Row gutter={[16, 16]} justify="center">
            {filteredModules.map((module) => (
              <Col key={module.id} xs={24} sm={12} md={12} lg={12}>
                <ModuleCard module={module} loading={loading} />
              </Col>
            ))}
          </Row>
        </Spin>
      )}
    </>
  );
};

export default ModulesList;
