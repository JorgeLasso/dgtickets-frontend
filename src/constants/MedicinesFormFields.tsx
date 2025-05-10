import { Input, InputNumber, Checkbox } from "antd";
import { FormField } from "../types/forms/forms.types";
import FileUploader from "../components/FileUploader";

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
    label: "Imagen",
    component: <FileUploader />,
    rules: [{ required: false, message: "Por favor seleccione una imagen" }],
  },
  {
    name: "isActive",
    label: "Activo",
    component: <Checkbox />,
    valuePropName: "checked",
  },
];
