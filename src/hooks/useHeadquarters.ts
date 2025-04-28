import { useState, useEffect } from "react";
import useFetch from "./useFetch";
import { Headquarter } from "../types/headquarters/headquarter.types";

export interface UseHeadquartersResult {
  headquarters: Headquarter[];
  isLoading: boolean;
  error: Error | null;
}

const useHeadquarters = (): UseHeadquartersResult => {
  const [headquarters, setHeadquarters] = useState<Headquarter[]>([]);
  const { get, isLoading, error } = useFetch<{ headquarters: Headquarter[] }>();

  useEffect(() => {
    const load = async () => {
      try {
        const response = await get("/headquarters");
        setHeadquarters(response.headquarters);
      } catch (err) {
        console.error("Error fetching headquarters:", err);
      }
    };
    load();
  }, [get]);

  return { headquarters, isLoading, error };
};

export default useHeadquarters;
