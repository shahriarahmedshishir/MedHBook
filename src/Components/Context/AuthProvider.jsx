import { useEffect, useState } from "react";
import AuthContext from "./AuthContext";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import auth from "../Firebase/firebase.init";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const serverURL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

  const createUser = (email, password) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const signInUser = async (email, password) => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = cred.user;

      await firebaseUser.getIdToken(true);
      const idTokenResult = await firebaseUser.getIdTokenResult();
      const adminFlag = !!idTokenResult.claims.admin;
      setIsAdmin(adminFlag);

      // Fetch backend user info
      const res = await fetch(`${serverURL}/user`);
      const data = await res.json();
      const matchedUser = data.find((u) => u.email === firebaseUser.email);

      setUser({
        email: firebaseUser.email,
        name:
          matchedUser?.name ||
          firebaseUser.displayName ||
          firebaseUser.email.split("@")[0],
        uid: matchedUser?.uid || null,
        img: matchedUser?.img
          ? `${serverURL}${matchedUser.img}`
          : "https://i.pravatar.cc/40?img=3",
        role: matchedUser?.role || "user",
      });

      return firebaseUser;
    } catch (error) {
      setUser(null);
      setIsAdmin(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = () => {
    setLoading(true);
    setIsAdmin(false);
    setUser(null);
    return signOut(auth).finally(() => setLoading(false));
  };

  const resetPassword = async (email) => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (err) {
      console.error("Password reset error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // -------------------- AUTH STATE LISTENER --------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser?.email) {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        await firebaseUser.getIdToken(true);
        const idTokenResult = await firebaseUser.getIdTokenResult();
        const adminFlag = !!idTokenResult.claims.admin;
        setIsAdmin(adminFlag);

        const res = await fetch(`${serverURL}/user`);
        const data = await res.json();
        const matchedUser = data.find((u) => u.email === firebaseUser.email);

        setUser({
          email: firebaseUser.email,
          name:
            matchedUser?.name ||
            firebaseUser.displayName ||
            firebaseUser.email.split("@")[0],
          uid: matchedUser?.uid || null,
          img: matchedUser?.img
            ? `${serverURL}${matchedUser.img}`
            : "https://i.pravatar.cc/40?img=3",
          role: matchedUser?.role || "user",
        });
      } catch (err) {
        console.error("Error fetching user details:", err);
        // Ensure user object has role field even on error
        setUser({
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email.split("@")[0],
          uid: null,
          img: "https://i.pravatar.cc/40?img=3",
          role: "user", // Default to user role if backend fetch fails
        });
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const authInfo = {
    user,
    isAdmin,
    loading,
    createUser,
    signInUser,
    signOutUser,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
