import { createContext, useContext } from "react";
import { useSession } from "next-auth/react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { data: session, status } = useSession();
  return (
    <AuthContext.Provider value={{ session, loading: status === "loading" }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
