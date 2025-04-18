import { Input, InputNumber, Checkbox, Select } from "antd";
import { FormField } from "../types/forms/forms.types";
import { Headquarter } from "../types/medication/medication.types";

export const medicinesFormFields: FormField[] = [
  {
    name: "id",
    label: "",
    component: <Input />,
    hidden: true,
  },
  {
    name: "name",
    label: "Nombre",
    component: <Input />,
    rules: [{ required: true, message: "Por favor ingrese el nombre" }],
  },
  {
    name: "manufacturer",
    label: "Fabricante",
    component: <Input />,
    rules: [{ required: true, message: "Por favor ingrese el fabricante" }],
  },
  {
    name: "quantity",
    label: "Cantidad",
    component: <InputNumber min={0} style={{ width: "100%" }} />,
    rules: [{ required: true, message: "Por favor ingrese la cantidad" }],
  },
  {
    name: "unitOfMeasure",
    label: "Unidad de Medida",
    component: <Input />,
    rules: [
      { required: true, message: "Por favor ingrese la unidad de medida" },
    ],
  },
  {
    name: "quantityPerUnit",
    label: "Cantidad por Unidad",
    component: <InputNumber min={0} style={{ width: "100%" }} />,
    rules: [
      { required: true, message: "Por favor ingrese la cantidad por unidad" },
    ],
  },
  {
    name: "image",
    label: "URL de la Imagen",
    component: <Input />,
  },
  {
    name: "isActive",
    label: "Activo",
    component: <Checkbox />,
    valuePropName: "checked",
  },
];

export const headquarterFormField = (
  headquarters: Headquarter[]
): FormField => ({
  name: "headquarterId",
  label: "Sede",
  component: (
    <Select placeholder="Seleccione sede" style={{ width: "100%" }}>
      {headquarters.map((hq) => (
        <Select.Option key={hq.id} value={hq.id}>
          {hq.name}
        </Select.Option>
      ))}
    </Select>
  ),
  rules: [{ required: true, message: "Por favor seleccione la sede" }],
});
