import { useState, useEffect, useCallback } from "react";
import useFetch from "./useFetch";
import {
  ModulesByHeadquarterResponse,
  Module,
  ModuleResponse,
} from "../types/modules/modules.types";
import { BASE_WS_URL } from "../services/api";

const useModules = (headquarterId: number) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [wsModules, setWsModules] = useState<Module[] | null>(null);
  const { get, put, post, isLoading } = useFetch<
    ModulesByHeadquarterResponse | ModuleResponse
  >();

  const fetchModules = useCallback(async () => {
    try {
      const data = (await get(
        `modules/headquarter/${headquarterId}`
      )) as ModulesByHeadquarterResponse;
      if (data) setModules(data.module);
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  }, [get, headquarterId]);

  const updateModuleActiveStatus = useCallback(
    async (moduleId: number, isActive: boolean) => {
      try {
        const isActiveString = isActive.toString();
        const response = (await put(`modules/${moduleId}`, {
          isActive: isActiveString,
        })) as ModuleResponse;

        if (response && response.module) {
          setModules((prevModules) =>
            prevModules.map((mod) =>
              mod.id === moduleId
                ? { ...mod, isActive: response.module.isActive }
                : mod
            )
          );
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error updating module:", error);
        return false;
      }
    },
    [put]
  );
  const updateModuleAdviser = useCallback(
    async (moduleId: number, userId: number | null) => {
      try {
        // Get the current module to preserve its isActive status
        const currentModule = modules.find((mod) => mod.id === moduleId);
        if (!currentModule) {
          console.error("Module not found:", moduleId);
          return false;
        }

        const isActiveString = currentModule.isActive.toString();
        const response = (await put(`modules/${moduleId}`, {
          userId: userId === null ? null : userId,
          isActive: isActiveString,
        })) as ModuleResponse;

        if (response && response.module) {
          setModules((prevModules) =>
            prevModules.map((mod) =>
              mod.id === moduleId
                ? {
                    ...mod,
                    userId: response.module.userId,
                    user: response.module.user,
                  }
                : mod
            )
          );
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error updating module adviser:", error);
        return false;
      }
    },
    [put, modules]
  );

  useEffect(() => {
    if (headquarterId) fetchModules();
  }, [fetchModules, headquarterId]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const socket = new WebSocket(BASE_WS_URL);

    socket.onopen = () => {
      console.log("WebSocket connected for modules");
    };

    socket.onmessage = (event) => {
      const { type, payload } = JSON.parse(event.data);
      if (type !== "on-modules") return;
      setWsModules(payload.module || payload);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed for modules");
    };

    return () => {
      socket.close();
    };
  }, []);
  const currentModules = wsModules || modules;

  const createModule = useCallback(
    async (name: string) => {
      try {
        const response = (await post("modules", {
          name,
          headquarterId,
        })) as ModuleResponse;

        if (response && response.module) {
          setModules((prevModules) => [...prevModules, response.module]);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error creating module:", error);
        return false;
      }
    },
    [post, headquarterId]
  );

  return {
    modules: currentModules,
    isLoading,
    updateModuleActiveStatus,
    updateModuleAdviser,
    createModule,
  };
};

export default useModules;
