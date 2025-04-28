import { useEffect, useState } from "react";
import useFetch from "./useFetch";
import { State } from "../types/locations/location.types";

/**
 * Custom hook for fetching and managing state data
 * @returns Object containing states data and loading state
 */
const useStates = () => {
  const [states, setStates] = useState<State[]>([]);
  const { get, isLoading, error } = useFetch<{ states?: State[] }>();

  useEffect(() => {
    const loadStates = async () => {
      try {
        const response = await get("/states");
        if (response?.states) {
          setStates(response.states);
        }
      } catch (error) {
        console.error("Error loading states:", error);
      }
    };

    loadStates();
  }, [get]);

  return {
    states,
    isLoading,
    error,
  };
};

export default useStates;
