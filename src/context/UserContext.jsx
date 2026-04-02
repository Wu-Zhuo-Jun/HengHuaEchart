import { createContext, useState, useContext, useMemo, use } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  return <UserContext.Provider value={useMemo(() => ({ userId, setUserId }), [userId])}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  return useContext(UserContext);
};
