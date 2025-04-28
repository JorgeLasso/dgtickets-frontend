import { useState, useEffect, useCallback } from "react";
import useFetch from "./useFetch";
import {
  ModulesByHeadquarterResponse,
  Module,
} from "../types/modules/modules.types";

const useModules = (headquarterId: number) => {
  const [modules, setModules] = useState<Module[]>([]);
  const { get, isLoading } = useFetch<ModulesByHeadquarterResponse>();

  const fetchModules = useCallback(async () => {
    try {
      const data = await get(`modules/headquarter/${headquarterId}`);
      if (data) setModules(data.module);
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  }, [get, headquarterId]);

  useEffect(() => {
    if (headquarterId) fetchModules();
  }, [fetchModules, headquarterId]);

  return { modules, isLoading };
};

export default useModules;
