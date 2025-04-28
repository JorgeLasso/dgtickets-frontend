import React, { useContext, useEffect, useState } from "react";
import {
  Steps,
  Select,
  Button,
  Card,
  Typography,
  Row,
  Col,
  Empty,
  Spin,
} from "antd";
import { HeadquarterContext } from "../context/HeadquarterContext";
import {
  ArrowRightOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import useStates from "../hooks/useStates";
import useCities from "../hooks/useCities";

const { Title, Text } = Typography;
const { Option } = Select;

interface HeadquarterSelectorProps {
  onFinish?: () => void;
}

const HeadquarterSelector: React.FC<HeadquarterSelectorProps> = ({
  onFinish,
}) => {
  const [selectedState, setSelectedState] = useState<number | null>(null);
  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const { states, isLoading: statesLoading } = useStates();
  const {
    filteredCities,
    filterCitiesByState,
    isLoading: citiesLoading,
  } = useCities();

  const {
    filteredHeadquarters,
    filterHeadquarterByCity,
    setSelectedHeadquarter,
    isLoading: hqLoading,
  } = useContext(HeadquarterContext)!;

  useEffect(() => {
    filterCitiesByState(selectedState);
  }, [selectedState, filterCitiesByState]);

  useEffect(() => {
    filterHeadquarterByCity(selectedCity);
  }, [selectedCity, filterHeadquarterByCity]);

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const selectHeadquarter = (id: number) => {
    setSelectedHeadquarter(id);
    setCurrentStep(currentStep + 1);
  };

  const resetSelection = () => {
    setSelectedState(null);
    setSelectedCity(null);
    setCurrentStep(0);
  };

  const handleFinish = () => {
    if (onFinish) {
      onFinish();
    }
    resetSelection();
  };

  const steps = [
    {
      title: "Departamento",
      content: (
        <div>
          <Title level={4}>Selecciona un departamento</Title>
          <Select
            placeholder="Seleccionar Departamento"
            style={{ width: "100%" }}
            value={selectedState || undefined}
            onChange={(value: number) => setSelectedState(value)}
          >
            {states.map((state) => (
              <Option key={state.id} value={state.id}>
                {state.name}
              </Option>
            ))}
          </Select>
        </div>
      ),
    },
    {
      title: "Ciudad",
      content: (
        <div>
          <Title level={4}>Selecciona una ciudad</Title>
          <Select
            placeholder="Seleccionar Ciudad"
            style={{ width: "100%" }}
            value={selectedCity || undefined}
            onChange={(value: number) => setSelectedCity(value)}
          >
            {filteredCities.map((city) => (
              <Option key={city.id} value={city.id}>
                {city.name}
              </Option>
            ))}
          </Select>
        </div>
      ),
    },
    {
      title: "Sede",
      content: (
        <div>
          <Title level={4}>Selecciona una sede</Title>
          <Row gutter={[16, 16]}>
            {filteredHeadquarters.length > 0 ? (
              filteredHeadquarters.map((hq) => (
                <Col key={hq.id} xs={24} sm={12} md={8}>
                  <Card
                    hoverable
                    onClick={() => selectHeadquarter(hq.id)}
                    style={{ textAlign: "center" }}
                  >
                    <Title level={5}>{hq.name}</Title>
                  </Card>
                </Col>
              ))
            ) : (
              <Col span={24}>
                <Empty description="No hay sedes disponibles" />
              </Col>
            )}
          </Row>
        </div>
      ),
    },
    {
      title: "Confirmación",
      content: (
        <div style={{ textAlign: "center" }}>
          <CheckCircleOutlined
            style={{ fontSize: 48, color: "#52c41a", marginBottom: 16 }}
          />
          <Title level={4}>Sede seleccionada correctamente</Title>
          <Text>
            Puedes cambiar la sede en cualquier momento usando el enlace en la
            página principal.
          </Text>
          <div
            style={{
              marginTop: 24,
              display: "flex",
              justifyContent: "center",
              gap: "16px",
            }}
          >
            <Button onClick={resetSelection}>Seleccionar otra sede</Button>
            <Button type="primary" onClick={handleFinish}>
              Finalizar
            </Button>
          </div>
        </div>
      ),
    },
  ];

  const isNextDisabled = () => {
    if (currentStep === 0) return !selectedState;
    if (currentStep === 1) return !selectedCity;
    return false;
  };

  const isLoading = statesLoading || citiesLoading || hqLoading;

  return (
    <Spin spinning={isLoading}>
      <Card title="Selección de sede" bordered={false}>
        <Steps
          current={currentStep}
          items={steps.map((step) => ({ title: step.title }))}
        />

        <div style={{ marginTop: 32, marginBottom: 32 }}>
          {steps[currentStep].content}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {currentStep > 0 && currentStep < 3 && (
            <Button icon={<ArrowLeftOutlined />} onClick={prevStep}>
              Anterior
            </Button>
          )}

          {currentStep < 2 && (
            <Button
              type="primary"
              onClick={nextStep}
              disabled={isNextDisabled()}
              style={{ marginLeft: "auto" }}
            >
              Siguiente <ArrowRightOutlined />
            </Button>
          )}
        </div>
      </Card>
    </Spin>
  );
};

export default HeadquarterSelector;
