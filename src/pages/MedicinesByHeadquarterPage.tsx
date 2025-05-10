import React, { useEffect, useState, useContext } from "react";
import { Typography, Empty, Row, Col, Spin } from "antd";
import CardList from "../components/CardList";
import GenericSearchBar from "../components/GenericSearchBar";
import Pagination from "../components/Pagination";
import useHeadquarters from "../hooks/useHeadquarters";
import { HeadquarterMedicine } from "../types/headquarters/headquarter.types";
import { HeadquarterContext } from "../context/HeadquarterContext";

const { Title } = Typography;

const MedicinesByHeadquarterPage: React.FC = () => {
  const headquarterContext = useContext(HeadquarterContext);
  if (!headquarterContext)
    throw new Error(
      "HeadquarterContext must be used within HeadquarterProvider"
    );
  const { selectedHeadquarter } = headquarterContext;
  const headquarterId = selectedHeadquarter;

  const [searchTerm, setSearchTerm] = useState("");
  const [medicines, setMedicines] = useState<HeadquarterMedicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const { getMedicinesByHeadquarter } = useHeadquarters();

  useEffect(() => {
    const fetchMedicines = async () => {
      if (headquarterId == null) return;
      setLoading(true);
      const result = await getMedicinesByHeadquarter(headquarterId);
      setMedicines(result || []);
      setLoading(false);
    };
    fetchMedicines();
  }, [headquarterId, getMedicinesByHeadquarter]);

  const filteredMedicines = medicines.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.medicine.name.toLowerCase().includes(term) ||
      item.medicine.manufacturer.toLowerCase().includes(term)
    );
  });

  const paginatedMedicines = filteredMedicines.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const renderMedicineCard = (item: HeadquarterMedicine) => {
    return {
      loading,
      title: item.medicine.name,
      image: item.medicine.image,
      properties: [
        { label: "Fabricante", value: item.medicine.manufacturer },
        { label: "Cantidad en sede", value: item.quantity },
        { label: "Unidad de medida", value: item.medicine.unitOfMeasure },
        { label: "Cantidad por unidad", value: item.medicine.quantityPerUnit },
      ],
      actions: [],
    };
  };

  return (
    <div style={{ padding: 20 }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: 30 }}>
        Medicamentos por Sede
      </Title>
      <Row
        gutter={[16, 16]}
        style={{ justifyContent: "center", display: "flex", marginBottom: 20 }}
      >
        <Col xs={24} sm={12} md={8}>
          <GenericSearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Nombre o fabricante"
          />
        </Col>
      </Row>
      {loading ? (
        <Spin style={{ display: "block", margin: "40px auto" }} />
      ) : paginatedMedicines.length === 0 ? (
        <Empty description="No hay medicamentos para esta sede" />
      ) : (
        <>
          <CardList
            data={paginatedMedicines}
            loading={loading}
            renderItem={renderMedicineCard}
          />
          <Pagination
            current={currentPage}
            total={filteredMedicines.length}
            pageSize={pageSize}
            onChange={setCurrentPage}
            showSizeChanger={false}
          />
        </>
      )}
    </div>
  );
};

export default MedicinesByHeadquarterPage;
