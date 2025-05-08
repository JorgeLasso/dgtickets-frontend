export interface MedicineStock {
  id: number;
  name: string;
  image: string;
  quantity: number;
  manufacturer: string;
  unitOfMeasure: string;
  quantityPerUnit: number;
  isActive: boolean;
}

export interface MedicineResponse {
  page: number;
  limit: number;
  total: number;
  next: string | null;
  prev: string | null;
  medicineStocks: MedicineStock[];
}
