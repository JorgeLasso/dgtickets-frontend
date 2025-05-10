export interface Headquarter {
  id: number;
  name: string;
  cityId: number;
}

export interface HeadquarterDetail extends Headquarter {
  address: string;
  phoneNumber: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  headquarterMedicines: HeadquarterMedicine[];
}

export interface HeadquarterMedicine {
  id: number;
  headquarterId: number;
  medicineId: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  medicine: HeadquarterMedicineDetail;
}

export interface HeadquarterMedicineDetail {
  id: number;
  name: string;
  image: string;
  quantity: number;
  manufacturer: string;
  unitOfMeasure: string;
  quantityPerUnit: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HeadquarterDetailResponse {
  headquarter: HeadquarterDetail;
}

export interface HeadquarterFormValues {
  id?: number;
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  isActive: boolean;
  cityId: number;
  stateId?: number;
}
