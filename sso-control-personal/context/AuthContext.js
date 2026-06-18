import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getMonitorProfile } from '../lib/monitors';
import { pinToPassword, usernameToEmail } from '../lib/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // usuario de Firebase Auth
  const [profile, setProfile] = useState(null); // doc de monitors/{uid}
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        try {
          const p = await getMonitorProfile(fbUser.uid);
          setProfile(p);
        } catch (err) {
          console.error('No se pudo cargar el perfil del usuario', err);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const loginWithUsernamePin = useCallback(async (username, pin) => {
    const email = usernameToEmail(username);
    const password = pinToPassword(pin);
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const p = await getMonitorProfile(cred.user.uid);
    setProfile(p);
    return p;
  }, []);

  const logout = useCallback(() => signOut(auth), []);

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, loginWithUsernamePin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
