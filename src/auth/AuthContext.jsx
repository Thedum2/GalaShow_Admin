import React, { createContext, useContext, useEffect, useState } from 'react';

const Ctx = createContext(null);

export const useAuth = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('AuthProvider missing');
  return v;
};

export function AuthProvider({ children }) {
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    setIsAuthed(Boolean(localStorage.getItem('accessToken')));
  }, []);

  const login = (token) => {
    localStorage.setItem('accessToken', token);
    setIsAuthed(true);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setIsAuthed(false);
  };

  return (
    <Ctx.Provider value={{ isAuthed, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}
