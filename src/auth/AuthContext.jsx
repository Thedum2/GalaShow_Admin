import React, { createContext, useContext, useEffect, useState } from 'react';

const Ctx = createContext(null);
export const useAuth = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('AuthProvider missing');
  return v;
};

export function AuthProvider({ children }) {

  const [isAuthed, setIsAuthed] = useState(() => Boolean(sessionStorage.getItem('accessToken')));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIsAuthed(Boolean(sessionStorage.getItem('accessToken')));
    setReady(true);
  }, []);

  const login = (token) => {
    if (token) sessionStorage.setItem('accessToken', token);
    setIsAuthed(true);
  };

  const logout = () => {
    sessionStorage.removeItem('accessToken');
    setIsAuthed(false);
  };

  return <Ctx.Provider value={{ isAuthed, ready, login, logout }}>{children}</Ctx.Provider>;
}
