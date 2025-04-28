import React, { createContext, useState, ReactNode } from "react";
import useHeadquarters from "../hooks/useHeadquarters";
import { Headquarter } from "../types/headquarters/headquarter.types";

interface HeadquarterContextProps {
  headquarters: Headquarter[];
  filteredHeadquarters: Headquarter[];
  filterHeadquarterByCity: (cityId: number | null) => void;
  selectedHeadquarter: number | null;
  setSelectedHeadquarter: (id: number | null) => void;
  isLoading: boolean;
  error: Error | null;
}

const SELECTED_HEADQUARTER_KEY = "dgtickets-selected-headquarter";

const HeadquarterContext = createContext<HeadquarterContextProps | undefined>(
  undefined
);

const HeadquarterProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const {
    headquarters,
    filteredHeadquarters,
    filterHeadquarterByCity,
    isLoading,
    error,
  } = useHeadquarters();

  const [selectedHeadquarter, setSelectedHeadquarterState] = useState<
    number | null
  >(() => {
    const savedHeadquarter = localStorage.getItem(SELECTED_HEADQUARTER_KEY);
    return savedHeadquarter ? parseInt(savedHeadquarter, 10) : null;
  });

  const setSelectedHeadquarter = (id: number | null) => {
    setSelectedHeadquarterState(id);
    if (id !== null) {
      localStorage.setItem(SELECTED_HEADQUARTER_KEY, id.toString());
    } else {
      localStorage.removeItem(SELECTED_HEADQUARTER_KEY);
    }
  };

  return (
    <HeadquarterContext.Provider
      value={{
        headquarters,
        filteredHeadquarters,
        filterHeadquarterByCity,
        selectedHeadquarter,
        setSelectedHeadquarter,
        isLoading,
        error,
      }}
    >
      {children}
    </HeadquarterContext.Provider>
  );
};
export { HeadquarterProvider, HeadquarterContext };
