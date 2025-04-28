import React, { useContext, useState, useEffect } from "react";
import { Row, Col, Result } from "antd";
import ModulesList from "../components/ModulesList";
import useModules from "../hooks/useModules";
import { HeadquarterContext } from "../context/HeadquarterContext";
import GenericTicketsList from "../components/GenericTicketsList";
import useTicketGroups from "../hooks/useTicketGroups";

const HomePage: React.FC = () => {
  const { selectedHeadquarter, isLoading: hqLoading } =
    useContext(HeadquarterContext)!;
  const [showSelector, setShowSelector] = useState<boolean>(true);
  const [selectionFinished, setSelectionFinished] = useState<boolean>(false);

  const { modules, isLoading: modulesLoading } = useModules(
    selectedHeadquarter || 0
  );
  const loading = hqLoading || modulesLoading;

  const ticketsData = useTicketGroups(selectedHeadquarter || 0);

  useEffect(() => {
    if (selectedHeadquarter !== null) {
      setShowSelector(false);
      setSelectionFinished(true);
    }
  }, [selectedHeadquarter]);

  if (!selectedHeadquarter || (showSelector && !selectionFinished)) {
    return (
      <div style={{ padding: 20 }}>
        <Result title="Bienvenido, por favor selecciona una sede para continuar!" />
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      {selectedHeadquarter && !showSelector && selectionFinished && (
        <>
          <Row gutter={16}>
            <Col xs={24} lg={12}>
              <ModulesList modules={modules} loading={loading} />
            </Col>
            <Col xs={24} lg={12}>
              <Row gutter={16}>
                {ticketsData.map(
                  (
                    { tickets, isLoading, avgPending, avgProcessing },
                    index
                  ) => (
                    <Col key={index} xs={24} md={12}>
                      <GenericTicketsList
                        tickets={tickets}
                        isLoading={isLoading}
                        avgPending={avgPending}
                        avgProcessing={avgProcessing}
                        title={ticketsData[index].title}
                        tagColor={ticketsData[index].tagColor}
                        tagLabel={ticketsData[index].tagLabel}
                        emptyText={ticketsData[index].emptyText}
                        count={ticketsData[index].count}
                      />
                    </Col>
                  )
                )}
              </Row>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default HomePage;
