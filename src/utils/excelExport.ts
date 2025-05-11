import { utils, writeFile } from "xlsx";
import { Ticket } from "../types/ticket/ticket.types";
import { MedicineStock } from "../types/medication/medication.types";

export const exportTicketsToExcel = (
  pendingTickets: Ticket[],
  inProgressTickets: Ticket[],
  completedTickets: Ticket[],
  fileName = "tickets-report.xlsx"
) => {
  const pendingData = pendingTickets.map((ticket) => ({
    ID: ticket.id,
    Tipo: ticket.ticketType,
    Prioridad: ticket.priority ? "SI" : "NO",
    "Tiempo Espera (seg)": ticket.pendingTimeInSeconds || 0,
    Usuario: `${ticket.user.firstName} ${ticket.user.lastName}`,
    "Fecha Creación": new Date(ticket.createdAt).toLocaleString(),
  }));

  const inProgressData = inProgressTickets.map((ticket) => ({
    ID: ticket.id,
    Tipo: ticket.ticketType,
    Prioridad: ticket.priority ? "SI" : "NO",
    "Tiempo Espera (seg)": ticket.pendingTimeInSeconds || 0,
    Usuario: `${ticket.user.firstName} ${ticket.user.lastName}`,
    "Fecha Creación": new Date(ticket.createdAt).toLocaleString(),
    Módulo: ticket.moduleId || "N/A",
  }));

  const completedData = completedTickets.map((ticket) => ({
    ID: ticket.id,
    Tipo: ticket.ticketType,
    Prioridad: ticket.priority ? "SI" : "NO",
    "Tiempo Espera (seg)": ticket.pendingTimeInSeconds || 0,
    "Tiempo Atención (seg)": ticket.processingTimeInSeconds || 0,
    Usuario: `${ticket.user.firstName} ${ticket.user.lastName}`,
    "Fecha Creación": new Date(ticket.createdAt).toLocaleString(),
    "Fecha Completado": new Date(ticket.updatedAt).toLocaleString(),
    Valoración: ticket.rating?.value || "N/A",
  }));

  const workbook = utils.book_new();

  if (pendingData.length > 0) {
    const worksheetPending = utils.json_to_sheet(pendingData);
    utils.book_append_sheet(workbook, worksheetPending, "Tickets Pendientes");
  }

  if (inProgressData.length > 0) {
    const worksheetInProgress = utils.json_to_sheet(inProgressData);
    utils.book_append_sheet(
      workbook,
      worksheetInProgress,
      "Tickets En Progreso"
    );
  }

  if (completedData.length > 0) {
    const worksheetCompleted = utils.json_to_sheet(completedData);
    utils.book_append_sheet(
      workbook,
      worksheetCompleted,
      "Tickets Completados"
    );
  }

  writeFile(workbook, fileName);
};

export const exportMedicinesToExcel = (
  medicines: MedicineStock[],
  fileName = "medicines-report.xlsx"
) => {
  const medicineData = medicines.map((med) => ({
    ID: med.id,
    Nombre: med.name,
    Cantidad: med.quantity,
    Fabricante: med.manufacturer,
    "Unidad de Medida": med.unitOfMeasure,
    "Cantidad por Unidad": med.quantityPerUnit,
    Activo: med.isActive ? "Sí" : "No",
  }));

  const workbook = utils.book_new();

  if (medicineData.length > 0) {
    const worksheet = utils.json_to_sheet(medicineData);
    utils.book_append_sheet(workbook, worksheet, "Medicamentos");
  }

  writeFile(workbook, fileName);
};

export const exportKPIsToExcel = (
  kpis: {
    totalPendingTickets: number;
    totalInProgressTickets: number;
    totalCompletedTickets: number;
    medicinesWithLowStock: number;
    totalMedicineQuantity: number;
    avgPriorityWaitTime: number;
    avgNormalWaitTime: number;
    avgCompletionTime: number;
    medicinesDeliveredCount: number;
  },
  fileName = "kpis-report.xlsx"
) => {
  const kpiData = [
    {
      Categoría: "Tickets",
      Métrica: "Tickets Pendientes",
      Valor: kpis.totalPendingTickets,
    },
    {
      Categoría: "Tickets",
      Métrica: "Tickets En Progreso",
      Valor: kpis.totalInProgressTickets,
    },
    {
      Categoría: "Tickets",
      Métrica: "Tickets Completados",
      Valor: kpis.totalCompletedTickets,
    },
    {
      Categoría: "Tiempos",
      Métrica: "Tiempo Espera Prioritarios (seg)",
      Valor: kpis.avgPriorityWaitTime,
    },
    {
      Categoría: "Tiempos",
      Métrica: "Tiempo Espera Normal (seg)",
      Valor: kpis.avgNormalWaitTime,
    },
    {
      Categoría: "Tiempos",
      Métrica: "Tiempo Atención Promedio (seg)",
      Valor: kpis.avgCompletionTime,
    },
    {
      Categoría: "Medicamentos",
      Métrica: "Medicamentos Stock Bajo",
      Valor: kpis.medicinesWithLowStock,
    },
    {
      Categoría: "Medicamentos",
      Métrica: "Cantidad Total Inventario",
      Valor: kpis.totalMedicineQuantity,
    },
    {
      Categoría: "Medicamentos",
      Métrica: "Medicamentos Entregados",
      Valor: kpis.medicinesDeliveredCount,
    },
  ];

  const workbook = utils.book_new();

  const worksheet = utils.json_to_sheet(kpiData);
  utils.book_append_sheet(workbook, worksheet, "KPIs");

  const date = new Date().toISOString().split("T")[0];

  writeFile(workbook, `${date}-${fileName}`);
};
