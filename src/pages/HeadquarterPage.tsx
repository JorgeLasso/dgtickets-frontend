import React, { useState, useContext, useEffect } from "react";
import {
  Typography,
  Empty,
  Spin,
  Tooltip,
  Button,
  Select,
  Row,
  Col,
  Card,
} from "antd";
import {
  EditOutlined,
  PhoneOutlined,
  MailOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import CardList from "../components/CardList";
import useHideMenu from "../hooks/useHideMenu";
import { AuthContext } from "../auth/AuthContext";
import { ROLES } from "../constants/Roles";
import { NotificationContext } from "../context/NotificationContext";
import useHeadquarters from "../hooks/useHeadquarters";
import useCities from "../hooks/useCities";
import useStates from "../hooks/useStates";
import {
  HeadquarterDetail,
  HeadquarterFormValues,
} from "../types/headquarters/headquarter.types";
import HeadquarterFormModal from "../components/HeadquarterFormModal";

const { Title, Text } = Typography;

const HeadquarterPage: React.FC = () => {
  useHideMenu(false);
  const [selectedState, setSelectedState] = useState<number | null>(null);
  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  const [filteredHeadquarters, setFilteredHeadquarters] = useState<
    HeadquarterDetail[]
  >([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [selectedHeadquarter, setSelectedHeadquarter] =
    useState<HeadquarterDetail | null>(null);

  const authContext = useContext(AuthContext);
  if (!authContext)
    throw new Error("AuthContext must be used within AuthProvider");
  const { auth } = authContext;

  const notificationContext = useContext(NotificationContext);
  if (!notificationContext)
    throw new Error(
      "NotificationContext must be used within NotificationProvider"
    );
  const { openNotification } = notificationContext;

  const canEdit = auth.role ? [ROLES.ADMIN].includes(auth.role) : false;
  const {
    headquarters: headquartersData,
    isLoading,
    updateHeadquarterActiveStatus,
    filterHeadquarterByCity,
    updateHeadquarter,
    getHeadquarterById,
    createHeadquarter,
  } = useHeadquarters();

  // City and state filtering
  const { states, isLoading: statesLoading } = useStates();
  const {
    filteredCities,
    filterCitiesByState,
    isLoading: citiesLoading,
  } = useCities();

  // Convert Headquarter[] to HeadquarterDetail[]
  const headquarters: HeadquarterDetail[] =
    headquartersData as HeadquarterDetail[];
  useEffect(() => {
    // Initialize filtered headquarters
    setFilteredHeadquarters(headquarters);
  }, [headquarters]);

  // Filter cities when state changes
  useEffect(() => {
    filterCitiesByState(selectedState);
    // Reset city selection when state changes
    setSelectedCity(null);
  }, [selectedState, filterCitiesByState]);

  // Filter headquarters when city changes
  useEffect(() => {
    if (selectedCity) {
      filterHeadquarterByCity(selectedCity);
      // Update filtered headquarters from the result of filterHeadquarterByCity
      const filtered = headquarters.filter((hq) => hq.cityId === selectedCity);
      setFilteredHeadquarters(filtered);
    } else {
      // If no city is selected, show all headquarters
      setFilteredHeadquarters(headquarters);
    }
  }, [selectedCity, headquarters, filterHeadquarterByCity]);

  const toggleHeadquarterActiveStatus = async (
    headquarterId: number,
    currentStatus: boolean
  ) => {
    const success = await updateHeadquarterActiveStatus(
      headquarterId,
      !currentStatus
    );

    if (success) {
      openNotification(
        "success",
        currentStatus ? "Sede desactivada" : "Sede activada",
        `La sede ha sido ${
          currentStatus ? "desactivada" : "activada"
        } exitosamente`
      );
    } else {
      openNotification(
        "error",
        "Error en la operación",
        `No se pudo ${currentStatus ? "desactivar" : "activar"} la sede`
      );
    }
  };
  const handleEditHeadquarter = async (headquarterId: number) => {
    try {
      const headquarter = await getHeadquarterById(headquarterId);
      if (headquarter) {
        setSelectedHeadquarter(headquarter);
        setIsEditModalVisible(true);
      } else {
        openNotification(
          "error",
          "Error al cargar datos",
          "No se pudieron cargar los datos de la sede"
        );
      }
    } catch (error) {
      console.error("Error loading headquarter:", error);
      openNotification(
        "error",
        "Error al cargar datos",
        "No se pudieron cargar los datos de la sede"
      );
    }
  };
  const handleAddHeadquarter = () => {
    setIsCreateModalVisible(true);
  };
  const handleSubmitEditHeadquarter = async (
    values: HeadquarterFormValues
  ): Promise<boolean> => {
    if (!selectedHeadquarter) return false;

    try {
      const success = await updateHeadquarter(selectedHeadquarter.id, {
        name: values.name,
        address: values.address,
        phoneNumber: values.phoneNumber,
        email: values.email,
        isActive: values.isActive,
        cityId: values.cityId,
      });

      if (success) {
        openNotification(
          "success",
          "Sede actualizada",
          `La sede ${values.name} ha sido actualizada exitosamente`
        );
        setIsEditModalVisible(false);
        setSelectedHeadquarter(null);
        return true;
      } else {
        openNotification(
          "error",
          "Error al actualizar",
          "No se pudo actualizar la sede, por favor intente nuevamente"
        );
        return false;
      }
    } catch (error) {
      console.error("Error updating headquarter:", error);
      openNotification(
        "error",
        "Error al actualizar",
        "Ocurrió un error al intentar actualizar la sede"
      );
      return false;
    }
  };

  const handleSubmitCreateHeadquarter = async (
    values: HeadquarterFormValues
  ): Promise<boolean> => {
    try {
      const success = await createHeadquarter({
        name: values.name,
        address: values.address,
        phoneNumber: values.phoneNumber,
        email: values.email,
        isActive: values.isActive,
        cityId: values.cityId,
      });

      if (success) {
        openNotification(
          "success",
          "Sede creada",
          `La sede ${values.name} ha sido creada exitosamente`
        );
        setIsCreateModalVisible(false);
        return true;
      } else {
        openNotification(
          "error",
          "Error al crear",
          "No se pudo crear la sede, por favor intente nuevamente"
        );
        return false;
      }
    } catch (error) {
      console.error("Error creating headquarter:", error);
      openNotification(
        "error",
        "Error al crear",
        "Ocurrió un error al intentar crear la sede"
      );
      return false;
    }
  };

  const renderHeadquarterCard = (headquarter: HeadquarterDetail) => {
    return {
      loading: isLoading,
      title: headquarter.name,
      image: undefined,
      properties: [
        {
          label: "Dirección",
          value: headquarter.address || "No especificada",
        },
        {
          label: "Teléfono",
          value: headquarter.phoneNumber || "No especificado",
        },
        {
          label: "Email",
          value: headquarter.email || "No especificado",
        },
        {
          label: "Estado",
          value: headquarter.isActive ? (
            <span style={{ color: "green" }}>Activa</span>
          ) : (
            <span style={{ color: "red" }}>Inactiva</span>
          ),
        },
      ],
      actions: canEdit
        ? [
            <Tooltip key="edit-tooltip" title="Editar sede">
              <EditOutlined
                key="edit"
                onClick={() => {
                  handleEditHeadquarter(headquarter.id);
                }}
              />
            </Tooltip>,
            <Tooltip
              key="phone-tooltip"
              title={headquarter.phoneNumber || "No especificado"}
            >
              <PhoneOutlined key="phone" />
            </Tooltip>,
            <Tooltip
              key="email-tooltip"
              title={headquarter.email || "No especificado"}
            >
              <MailOutlined key="email" />
            </Tooltip>,
            headquarter.isActive ? (
              <Tooltip key="deactivate-tooltip" title="Desactivar sede">
                <CheckCircleOutlined
                  key="active"
                  style={{ color: "green" }}
                  onClick={() =>
                    toggleHeadquarterActiveStatus(
                      headquarter.id,
                      headquarter.isActive
                    )
                  }
                />
              </Tooltip>
            ) : (
              <Tooltip key="activate-tooltip" title="Activar sede">
                <CloseCircleOutlined
                  key="inactive"
                  style={{ color: "red" }}
                  onClick={() =>
                    toggleHeadquarterActiveStatus(
                      headquarter.id,
                      headquarter.isActive
                    )
                  }
                />
              </Tooltip>
            ),
          ]
        : [
            <Tooltip
              key="phone-tooltip"
              title={headquarter.phoneNumber || "No especificado"}
            >
              <PhoneOutlined key="phone" />
            </Tooltip>,
            <Tooltip
              key="email-tooltip"
              title={headquarter.email || "No especificado"}
            >
              <MailOutlined key="email" />
            </Tooltip>,
          ],
    };
  };

  if (isLoading && headquarters.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <Spin size="large" tip="Cargando sedes..." />
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
          Sedes
        </Title>
      </div>{" "}
      <div style={{ marginBottom: "20px" }}>
        <Row>
          <Col>
            <Card
              title="Filtrar por ubicación"
              size="small"
              style={{
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
              }}
            >
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "4px" }}>
                  Departamento
                </label>
                <Select
                  placeholder="Seleccionar Departamento"
                  style={{ width: "100%" }}
                  value={selectedState}
                  onChange={(value: number) => setSelectedState(value)}
                  allowClear
                  onClear={() => {
                    setSelectedState(null);
                    setSelectedCity(null);
                  }}
                  loading={statesLoading}
                >
                  {states.map((state) => (
                    <Select.Option key={state.id} value={state.id}>
                      {state.name}
                    </Select.Option>
                  ))}
                </Select>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "4px" }}>
                  Ciudad
                </label>
                <Select
                  placeholder="Seleccionar Ciudad"
                  style={{ width: "100%" }}
                  value={selectedCity}
                  onChange={(value: number) => setSelectedCity(value)}
                  disabled={!selectedState}
                  allowClear
                  onClear={() => setSelectedCity(null)}
                  loading={citiesLoading}
                >
                  {filteredCities.map((city) => (
                    <Select.Option key={city.id} value={city.id}>
                      {city.name}
                    </Select.Option>
                  ))}
                </Select>
              </div>
              <div style={{ textAlign: "right" }}>
                <Button
                  onClick={() => {
                    setSelectedState(null);
                    setSelectedCity(null);
                  }}
                  disabled={!selectedState && !selectedCity}
                >
                  Limpiar filtros
                </Button>
              </div>
            </Card>
          </Col>
        </Row>{" "}
      </div>
      <div
        style={{
          display: "flex",
          gap: "16px",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        {canEdit && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddHeadquarter}
          >
            Crear Sede
          </Button>
        )}
      </div>
      {filteredHeadquarters.length === 0 && !isLoading ? (
        <Empty
          description={
            selectedCity
              ? `No hay sedes disponibles en ${
                  filteredCities.find((city) => city.id === selectedCity)?.name
                }`
              : "No hay sedes disponibles"
          }
        />
      ) : (
        <>
          <CardList
            data={filteredHeadquarters}
            loading={isLoading || statesLoading || citiesLoading}
            renderItem={renderHeadquarterCard}
          />{" "}
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <Text>
              Mostrando {filteredHeadquarters.length} de {headquarters.length}{" "}
              sedes
              {selectedCity &&
                filteredCities.find((city) => city.id === selectedCity) && (
                  <span>
                    {" "}
                    en{" "}
                    {
                      filteredCities.find((city) => city.id === selectedCity)
                        ?.name
                    }
                  </span>
                )}
            </Text>{" "}
          </div>
        </>
      )}
      {/* Edit Headquarter Modal */}
      <HeadquarterFormModal
        isVisible={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          setSelectedHeadquarter(null);
        }}
        onSubmit={handleSubmitEditHeadquarter}
        initialValues={selectedHeadquarter || undefined}
        isLoading={isLoading}
        title="Editar Sede"
      />
      {/* Create Headquarter Modal */}
      <HeadquarterFormModal
        isVisible={isCreateModalVisible}
        onCancel={() => {
          setIsCreateModalVisible(false);
        }}
        onSubmit={handleSubmitCreateHeadquarter}
        isLoading={isLoading}
        title="Crear Sede"
      />
    </div>
  );
};

export default HeadquarterPage;
