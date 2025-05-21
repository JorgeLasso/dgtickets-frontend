import { utils, writeFile } from "xlsx";
import { Ticket } from "../types/ticket/ticket.types";
import { MedicineStock } from "../types/medication/medication.types";
import { Headquarter } from "../types/headquarters/headquarter.types";
import { KPIsExport } from "../types/kpis/kpis.types";

export const exportTicketsToExcelUnified = (
  allTickets: Ticket[],
  headquarters: Headquarter[],
  fileName = "tickets-report.xlsx"
) => {
  const getHeadquarterName = (id: number) => {
    const hq = headquarters.find((h) => h.id === id);
    return hq ? hq.name : id || "N/A";
  };

  const data = allTickets.map((ticket) => ({
    ID: ticket.id,
    Tipo: ticket.ticketType,
    Prioridad: ticket.priority ? "SI" : "NO",
    "Tiempo Espera (seg)": ticket.pendingTimeInSeconds || 0,
    "Tiempo Atención (seg)": ticket.processingTimeInSeconds || 0,
    Usuario: ticket.user
      ? `${ticket.user.firstName} ${ticket.user.lastName}`
      : ticket.userId,
    Sede: getHeadquarterName(ticket.headquarterId),
    Módulo: ticket.moduleId || "N/A",
    "Fecha Creación": new Date(ticket.createdAt).toLocaleString(),
    "Fecha Completado": ticket.updatedAt
      ? new Date(ticket.updatedAt).toLocaleString()
      : "",
    Medicamentos: ticket.ticketMedicines
      ? ticket.ticketMedicines
          .map((tm) => `${tm.medicine.name} (${tm.quantity})`)
          .join(", ")
      : "",
    Valoración: ticket.rating?.value ?? "",
    "Comentario Valoración": ticket.rating?.description ?? "",
  }));

  const workbook = utils.book_new();
  const worksheet = utils.json_to_sheet(data);
  utils.book_append_sheet(workbook, worksheet, "Tickets");
  writeFile(workbook, fileName);
};

function isHeadquarterMedicine(
  obj: unknown
): obj is {
  medicine: MedicineStock;
  quantity: number;
  headquarterId?: number;
} {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "medicine" in obj &&
    "quantity" in obj
  );
}

export const exportMedicinesToExcelUnified = (
  medicines: (
    | MedicineStock
    | { medicine: MedicineStock; quantity: number; headquarterId?: number }
  )[],
  headquarters: Headquarter[],
  fileName = "medicines-report.xlsx"
) => {
  const getHeadquarterName = (id: number) => {
    const hq = headquarters.find((h) => h.id === id);
    return hq ? hq.name : id || "N/A";
  };
  const medicineData = medicines.map((med) => {
    if (isHeadquarterMedicine(med)) {
      return {
        ID: med.medicine.id,
        Nombre: med.medicine.name,
        Cantidad: med.quantity,
        Fabricante: med.medicine.manufacturer,
        "Unidad de Medida": med.medicine.unitOfMeasure,
        "Cantidad por Unidad": med.medicine.quantityPerUnit,
        Activo: med.medicine.isActive ? "Sí" : "No",
        Sede: med.headquarterId ? getHeadquarterName(med.headquarterId) : "",
      };
    } else {
      const m = med as MedicineStock;
      return {
        ID: m.id,
        Nombre: m.name,
        Cantidad: m.quantity,
        Fabricante: m.manufacturer,
        "Unidad de Medida": m.unitOfMeasure,
        "Cantidad por Unidad": m.quantityPerUnit,
        Activo: m.isActive ? "Sí" : "No",
        Sede: "",
      };
    }
  });
  const workbook = utils.book_new();
  const worksheet = utils.json_to_sheet(medicineData);
  utils.book_append_sheet(workbook, worksheet, "Medicamentos");
  writeFile(workbook, fileName);
};

export const exportKPIsToExcelUnified = (
  kpis: KPIsExport,
  fileName = "kpis-report.xlsx"
) => {
  const kpiData = Object.entries(kpis).map(([key, value]) => ({
    Métrica: key,
    Valor: value,
  }));
  const workbook = utils.book_new();
  const worksheet = utils.json_to_sheet(kpiData);
  utils.book_append_sheet(workbook, worksheet, "KPIs");
  writeFile(workbook, fileName);
};
