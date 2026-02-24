import { useEffect, useState } from "react";
import AuthContext from "./AuthContext";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth";
import auth from "../Firebase/firebase.init";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const serverURL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

  const createUser = async (email, password) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      // Send email verification
      await sendEmailVerification(userCredential.user);
      console.log("📧 Email verification sent to:", userCredential.user.email);
      return userCredential;
    } catch (error) {
      console.error("❌ Error creating user or sending verification:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationEmail = async () => {
    const currentUser = auth.currentUser;
    if (currentUser && !currentUser.emailVerified) {
      await sendEmailVerification(currentUser);
    }
  };

  const signInUser = async (email, password) => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = cred.user;

      // Check if email is verified
      if (!firebaseUser.emailVerified) {
        await signOut(auth);
        throw new Error(
          "Please verify your email before signing in. Check your inbox for the verification link.",
        );
      }

      // Get JWT token from backend
      const tokenResponse = await fetch(`${serverURL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: firebaseUser.email,
          firebaseUid: firebaseUser.uid,
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        throw new Error(
          errorData.error || "Failed to get authentication token",
        );
      }

      const tokenData = await tokenResponse.json();

      // Store JWT token in localStorage
      localStorage.setItem("authToken", tokenData.token);
      console.log("🔐 JWT token stored");

      await firebaseUser.getIdToken(true);
      const idTokenResult = await firebaseUser.getIdTokenResult();
      const adminFlag = !!idTokenResult.claims.admin;
      setIsAdmin(adminFlag);

      // Determine role from Firebase claims
      let userRole = "user"; // default
      if (idTokenResult.claims.admin) {
        userRole = "admin";
      } else if (idTokenResult.claims.doctor) {
        userRole = "doctor";
      } else if (idTokenResult.claims.role) {
        userRole = idTokenResult.claims.role;
      }

      // Fetch backend user info
      const res = await fetch(`${serverURL}/user`);
      const data = await res.json();
      const matchedUser = data.find((u) => u.email === firebaseUser.email);

      // Check if user is a doctor in doctorCollection
      const doctorRes = await fetch(
        `${serverURL}/doctor/${firebaseUser.email}`,
      );
      const doctorData = await doctorRes.json();
      if (doctorData && !idTokenResult.claims.doctor && userRole !== "admin") {
        userRole = "doctor";
      }

      console.log("Firebase claims:", idTokenResult.claims);
      console.log("Matched user:", matchedUser);
      console.log("Doctor profile:", doctorData);
      console.log("Final role:", userRole);

      setUser({
        email: firebaseUser.email,
        name:
          matchedUser?.name ||
          firebaseUser.displayName ||
          firebaseUser.email.split("@")[0],
        uid: matchedUser?.uid || null,
        img: matchedUser?.img || null,
        role: userRole,
      });

      console.log("User logged in with img:", matchedUser?.img);

      return firebaseUser;
    } catch (error) {
      setUser(null);
      setIsAdmin(false);
      localStorage.removeItem("authToken"); // Clear token on error
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = () => {
    setLoading(true);
    setIsAdmin(false);
    setUser(null);
    localStorage.removeItem("authToken"); // Clear JWT token
    console.log("🔐 JWT token cleared");
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

  // Refresh user data from backend
  const refreshUser = async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser?.email) {
      console.log("refreshUser - no firebase user");
      return;
    }

    try {
      console.log("refreshUser - fetching data for:", firebaseUser.email);
      const res = await fetch(`${serverURL}/user`);
      const data = await res.json();
      const matchedUser = data.find((u) => u.email === firebaseUser.email);

      console.log("refreshUser - matchedUser:", matchedUser);
      if (matchedUser) {
        setUser((prev) => ({
          ...prev,
          name: matchedUser.name || prev.name,
          img: matchedUser.img,
          uid: matchedUser.uid ?? prev.uid,
        }));
        console.log("User data refreshed - new img:", matchedUser.img);
      } else {
        console.log("refreshUser - user not found in database");
      }
    } catch (err) {
      console.error("Error refreshing user data:", err);
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

      // Check if email is verified - if not, don't set user state
      if (!firebaseUser.emailVerified) {
        console.log("Email not verified, clearing user state");
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
          img: matchedUser?.img || null,
          role: matchedUser?.role || "user",
        });

        console.log("Auth state changed - user img:", matchedUser?.img);
      } catch (err) {
        console.error("Error fetching user details:", err);
        // Ensure user object has role field even on error
        setUser({
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email.split("@")[0],
          uid: null,
          img: null,
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
    refreshUser,
    sendVerificationEmail,
  };

  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
