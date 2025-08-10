import React, { createContext, useContext, useEffect, useState } from 'react';

const Ctx = createContext(null);
export const useAuth = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('AuthProvider missing');
  return v;
};

export function AuthProvider({ children }) {

  const [isAuthed, setIsAuthed] = useState(() => Boolean(localStorage.getItem('accessToken')));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIsAuthed(Boolean(localStorage.getItem('accessToken')));
    setReady(true);
  }, []);

  const login = (token) => {
    localStorage.setItem('accessToken', token);
    setIsAuthed(true);
  };
  const logout = () => {
    localStorage.removeItem('accessToken');
    setIsAuthed(false);
  };

  return <Ctx.Provider value={{ isAuthed, ready, login, logout }}>{children}</Ctx.Provider>;
}
