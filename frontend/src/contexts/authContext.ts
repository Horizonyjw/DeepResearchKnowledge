import { createContext } from "react";

type AuthUser = {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  preferences?: {
    theme?: 'light' | 'dark' | 'auto';
    language?: string;
    notifications?: boolean;
  };
};

export const AuthContext = createContext({
  isAuthenticated: false,
  user: null as AuthUser | null,
  setUser: (_user: AuthUser | null) => {},
  setIsAuthenticated: (value: boolean) => {},
  logout: () => {},
});
