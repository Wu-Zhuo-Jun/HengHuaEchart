import { createContext, useState, useContext, useMemo } from "react";

const SiteContext = createContext();

export const SiteProvider = ({ children }) => {
  const [siteId, setSiteId] = useState(null);
  const [businessHours, setBusinessHours] = useState([0, 24]);
  const [businessHoursBy5Minutes, setBusinessHoursBy5Minutes] = useState([0, 288]);
  return (
    <SiteContext.Provider
      value={useMemo(() => ({ siteId, setSiteId, businessHours, setBusinessHours, businessHoursBy5Minutes, setBusinessHoursBy5Minutes }), [siteId, businessHours, businessHoursBy5Minutes])}>
      {children}
    </SiteContext.Provider>
  );
};

export const useSite = () => {
  return useContext(SiteContext);
};
