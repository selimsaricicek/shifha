import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Her zaman giriş yapılmış gibi örnek kullanıcı
  const [user] = useState({ id: 'dev-user', name: 'Test User', role: 'admin' });
  const [token] = useState('dev-token');

  const login = () => {};
  const logout = () => {};

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
