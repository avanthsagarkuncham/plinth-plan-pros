import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { estimate, type Estimate, type Inputs, type RateData } from "./estimate";

const defaultInputs: Inputs = { projectName: "", buildingType: "Residential", areaMode: "perFloor", area: 1000, floors: 1, quality: "Standard", location: "Urban", state: "", city: "" };
const defaultData: RateData = { rates: {}, source: "", allocation: {}, allocationSource: "" };

interface Ctx { inputs: Inputs; setInputs: (p: Partial<Inputs>) => void; data: RateData; setData: (d: RateData) => void; result: Estimate }
const C = createContext<Ctx | null>(null);

export function EstimateProvider({ children }: { children: ReactNode }) {
  const [inputs, setI] = useState(defaultInputs);
  const [data, setD] = useState(defaultData);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try {
      const i = localStorage.getItem("pam.inputs"); if (i) setI({ ...defaultInputs, ...JSON.parse(i) });
      const d = localStorage.getItem("pam.data"); if (d) setD({ ...defaultData, ...JSON.parse(d) });
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) localStorage.setItem("pam.inputs", JSON.stringify(inputs)); }, [inputs, loaded]);
  useEffect(() => { if (loaded) localStorage.setItem("pam.data", JSON.stringify(data)); }, [data, loaded]);
  const result = useMemo(() => estimate(inputs, data), [inputs, data]);
  return <C.Provider value={{ inputs, setInputs: (p) => setI((s) => ({ ...s, ...p })), data, setData: setD, result }}>{children}</C.Provider>;
}
export const useEstimate = () => { const c = useContext(C); if (!c) throw new Error("no provider"); return c; };
