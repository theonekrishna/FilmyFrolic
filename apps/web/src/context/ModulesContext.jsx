import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { publicAxios } from "../utils/AxiosInstance";
const ModulesContext = createContext({
  modules: null,
  ready: false,
  error: null,
  isEnabled: () => true,
});

export function ModulesProvider({ children }) {
  const [modules, setModules] = useState(null);
  const [ready, setReady] = useState(false); // ← NEW
  const [error, setError] = useState(null);

  const getModuleAccess = async () => {
    try {
      const res = await publicAxios.get("/api/side/module-access");
      const json = res.data;
      if (json.success && Array.isArray(json.data)) {
        const map = {};
        json.data.forEach((mod) => {
          map[mod.module_key] = mod.is_enabled;
        });
        setModules(map);
      } else {
        setError("Failed to load modules");
        setModules({});
      }
    } catch {
      setError("Network error");
      setModules({});
    } finally {
      setReady(true); // ← always flip ready, success or failure
    }
  };

  // useEffect(() => {
  //   fetchModules();
  //   // Supabase Realtime: re-fetch when app_modules table changes
  //   const channel = supabase
  //     .channel("app_modules_trigger")
  //     .on(
  //       "postgres_changes",
  //       { event: "*", schema: "public", table: "app_modules" },
  //       () => {
  //         fetchModules();
  //       },
  //     )
  //     .subscribe();

  //   return () => {
  //     supabase.removeChannel(channel);
  //   };
  // }, []);
  useEffect(() => {
    getModuleAccess();

    const channel = supabase
      .channel("app-modules")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "app_modules",
        },
        async (payload) => {
          await getModuleAccess();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const isEnabled = (key) => {
    if (!modules) return true;
    if (!(key in modules)) return true;
    return modules[key] === true;
  };

  return (
    <ModulesContext.Provider value={{ modules, ready, error, isEnabled }}>
      {children}
    </ModulesContext.Provider>
  );
}

export function useModules() {
  return useContext(ModulesContext);
}
