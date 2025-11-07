// AuthProvider.jsx
import { useEffect, useState } from "react";
import AuthContext from "./AuthContext";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import auth from "../Firebase/firebase.init";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // includes Firebase + backend data
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const serverURL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

  // Create new user (Sign Up)
  const createUser = (email, password) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // Sign In user
  const signInUser = (email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Sign Out user
  const signOutUser = () => {
    setLoading(true);
    setIsAdmin(false);
    return signOut(auth);
  };

  // Handle user state + fetch backend data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser?.email) {
        try {
          // Fetch user list from backend
          const res = await fetch(`${serverURL}/user`);
          const data = await res.json();

          // Find the matching user by email
          const matchedUser = data.find((u) => u.email === firebaseUser.email);

          setUser({
            email: firebaseUser.email,
            name:
              matchedUser?.name ||
              firebaseUser.displayName ||
              firebaseUser.email.split("@")[0],
            uid: matchedUser?.uid || null, // ✅ Custom UID from backend
            img: matchedUser?.img
              ? `${serverURL}${matchedUser.img}`
              : "https://i.pravatar.cc/40?img=3",
            role: matchedUser?.role || "user",
          });

          // Handle admin role if applicable
          const idTokenResult = await firebaseUser.getIdTokenResult();
          setIsAdmin(!!idTokenResult.claims.admin);
        } catch (error) {
          console.error("Error fetching user details:", error);
          setUser(firebaseUser);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
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
  };

  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
