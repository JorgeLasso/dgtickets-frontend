import React, { useState, useEffect } from "react";
import { Form, Input, Switch, Select } from "antd";
import GenericFormModal from "./GenericFormModal";
import useCities from "../hooks/useCities";
import useStates from "../hooks/useStates";
import { FormField } from "../types/forms/forms.types";
import {
  HeadquarterDetail,
  HeadquarterFormValues,
} from "../types/headquarters/headquarter.types";

interface HeadquarterFormModalProps {
  isVisible: boolean;
  onCancel: () => void;
  onSubmit: (values: HeadquarterFormValues) => Promise<boolean>;
  initialValues?: Partial<HeadquarterDetail>;
  isLoading: boolean;
  title?: string;
}

const HeadquarterFormModal: React.FC<HeadquarterFormModalProps> = ({
  isVisible,
  onCancel,
  onSubmit,
  initialValues,
  isLoading,
  title = "Editar Sede",
}) => {
  const [form] = Form.useForm<HeadquarterFormValues>();
  const [selectedState, setSelectedState] = useState<number | null>(null);

  const { states, isLoading: statesLoading } = useStates();
  const {
    filteredCities,
    filterCitiesByState,
    isLoading: citiesLoading,
  } = useCities();
  useEffect(() => {
    if (initialValues?.cityId) {
      const city = filteredCities.find(
        (city) => city.id === initialValues.cityId
      );

      if (city) {
        console.log("City found in filteredCities:", city);
        setSelectedState(city.stateId);
        form.setFieldsValue({
          ...initialValues,
          stateId: city.stateId,
        });
      } else {
        const findStateForCity = async () => {
          for (const state of states) {
            filterCitiesByState(state.id);

            // We need to wait for the cities to be filtered
            await new Promise((resolve) => setTimeout(resolve, 50));

            // Check if the city is in this state's cities
            const citiesInState = filteredCities;
            const cityFound = citiesInState.find(
              (c) => c.id === initialValues.cityId
            );

            if (cityFound) {
              console.log("Found city in state:", state.name);
              setSelectedState(state.id);
              form.setFieldsValue({
                ...initialValues,
                stateId: state.id,
              });
              break;
            }
          }
        };

        findStateForCity();
      }
    }
  }, [initialValues, filteredCities, states, filterCitiesByState, form]);

  useEffect(() => {
    if (selectedState) {
      filterCitiesByState(selectedState);
    }
  }, [selectedState, filterCitiesByState]);

  const handleStateChange = (value: number) => {
    setSelectedState(value);
    form.setFieldsValue({ cityId: undefined });
  };
  const handleSubmit = async (values: HeadquarterFormValues): Promise<void> => {
    const success = await onSubmit(values);
    if (success) {
      form.resetFields();
    }
  };

  const fields: FormField[] = [
    {
      name: "id",
      label: "ID",
      component: <Input disabled />,
      hidden: true,
    },
    {
      name: "stateId",
      label: "Departamento",
      component: (
        <Select
          placeholder="Seleccionar Departamento"
          loading={statesLoading}
          onChange={handleStateChange}
          allowClear
        >
          {states.map((state) => (
            <Select.Option key={state.id} value={state.id}>
              {state.name}
            </Select.Option>
          ))}
        </Select>
      ),
      rules: [
        { required: true, message: "Por favor seleccione un departamento" },
      ],
    },
    {
      name: "cityId",
      label: "Ciudad",
      component: (
        <Select
          placeholder="Seleccionar Ciudad"
          loading={citiesLoading}
          disabled={!selectedState}
          allowClear
        >
          {filteredCities.map((city) => (
            <Select.Option key={city.id} value={city.id}>
              {city.name}
            </Select.Option>
          ))}
        </Select>
      ),
      rules: [{ required: true, message: "Por favor seleccione una ciudad" }],
    },
    {
      name: "name",
      label: "Nombre",
      component: <Input placeholder="Nombre de la sede" />,
      rules: [
        { required: true, message: "Por favor ingrese el nombre de la sede" },
      ],
    },
    {
      name: "address",
      label: "Dirección",
      component: <Input placeholder="Dirección de la sede" />,
      rules: [
        {
          required: true,
          message: "Por favor ingrese la dirección de la sede",
        },
      ],
    },
    {
      name: "phoneNumber",
      label: "Teléfono",
      component: <Input placeholder="Teléfono de contacto" />,
      rules: [
        {
          required: true,
          message: "Por favor ingrese el teléfono de contacto",
        },
      ],
    },
    {
      name: "email",
      label: "Email",
      component: <Input placeholder="Email de contacto" type="email" />,
      rules: [
        { required: true, message: "Por favor ingrese el email de contacto" },
        { type: "email", message: "Por favor ingrese un email válido" },
      ],
    },
    {
      name: "isActive",
      label: "Activa",
      component: <Switch />,
      valuePropName: "checked",
    },
  ];
  return (
    <GenericFormModal<HeadquarterFormValues>
      title={title}
      open={isVisible}
      onCancel={onCancel}
      onSubmit={handleSubmit}
      fields={fields}
      loading={isLoading}
      form={form}
      initialValues={initialValues}
      width={600}
    />
  );
};

export default HeadquarterFormModal;
