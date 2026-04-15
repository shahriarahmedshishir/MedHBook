import { useEffect, useState } from "react";
import AuthContext from "./AuthContext";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import auth from "../Firebase/firebase.init";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const serverURL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
  const googleProvider = new GoogleAuthProvider();

  const clearAuthSession = () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem("authToken");
  };

  const getProfileForEmail = async (firebaseUser, idTokenResult) => {
    const encodedEmail = encodeURIComponent(firebaseUser.email);

    const [userRes, doctorRes] = await Promise.all([
      fetch(`${serverURL}/user/${encodedEmail}`),
      fetch(`${serverURL}/doctor/${encodedEmail}`),
    ]);

    const matchedUser = userRes.ok ? await userRes.json() : null;
    const doctorData = doctorRes.ok ? await doctorRes.json() : null;

    // Block session if this email has no profile in either collection.
    if (!matchedUser && !doctorData) {
      return null;
    }

    let userRole = "user";
    if (idTokenResult?.claims?.admin) {
      userRole = "admin";
    } else if (idTokenResult?.claims?.doctor || doctorData) {
      userRole = "doctor";
    } else if (matchedUser?.role) {
      userRole = matchedUser.role;
    }

    return {
      email: firebaseUser.email,
      name:
        matchedUser?.name ||
        doctorData?.name ||
        firebaseUser.displayName ||
        firebaseUser.email.split("@")[0],
      uid: matchedUser?.uid || doctorData?.uid || null,
      img: matchedUser?.img || doctorData?.img || firebaseUser.photoURL || null,
      role: userRole,
    };
  };

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
      const normalizedEmail = email.trim().toLowerCase();
      const cred = await signInWithEmailAndPassword(
        auth,
        normalizedEmail,
        password,
      );
      const firebaseUser = cred.user;

      // Check if email is verified
      if (!firebaseUser.emailVerified) {
        await signOut(auth);
        throw new Error(
          "Please verify your email before signing in. Check your inbox for the verification link.",
        );
      }

      // Get Firebase claims first
      await firebaseUser.getIdToken(true);
      const idTokenResult = await firebaseUser.getIdTokenResult();
      const adminFlag = !!idTokenResult.claims.admin;

      // Get JWT token from backend and pass isAdmin flag
      const tokenResponse = await fetch(`${serverURL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: firebaseUser.email,
          firebaseUid: firebaseUser.uid,
          isAdmin: adminFlag,
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

      setIsAdmin(adminFlag);

      const profile = await getProfileForEmail(firebaseUser, idTokenResult);
      if (!profile) {
        throw new Error(
          "No user profile found for this email. Please sign up first.",
        );
      }

      setUser(profile);
      console.log("User logged in:", profile.email, "role:", profile.role);

      return firebaseUser;
    } catch (error) {
      clearAuthSession();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = () => {
    setLoading(true);
    clearAuthSession();
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

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      // Sign in with Google popup
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      console.log("✅ Google sign-in successful:", firebaseUser.email);

      // Check if this is a new user (first sign-in)
      const isNewUser = result.additionalUserInfo?.isNewUser;

      if (isNewUser) {
        console.log("📝 New Google user detected, creating profile...");

        // Create user profile in backend for new Google users
        const userData = new FormData();
        userData.append(
          "name",
          firebaseUser.displayName || firebaseUser.email.split("@")[0],
        );
        userData.append("email", firebaseUser.email);
        userData.append("mobileNo", ""); // Empty, user can update later
        userData.append("role", "user");

        // If Google account has a profile picture, we can fetch and save it
        if (firebaseUser.photoURL) {
          // Convert URL image to Blob and append
          try {
            const imgResponse = await fetch(firebaseUser.photoURL);
            const blob = await imgResponse.blob();
            const file = new File([blob], "profile.jpg", {
              type: "image/jpeg",
            });
            userData.append("img", file);
          } catch (imgError) {
            console.warn("Could not fetch Google profile picture:", imgError);
          }
        }

        try {
          const backendRes = await fetch(`${serverURL}/userdata`, {
            method: "POST",
            body: userData,
          });

          const backendData = await backendRes.json();
          if (!backendData.success) {
            console.warn(
              "Backend user creation returned non-success:",
              backendData,
            );
          } else {
            console.log("✅ User profile created in backend");
          }
        } catch (backendError) {
          console.warn("Error creating user in backend:", backendError);
          // Don't throw - continue with sign-in even if backend fails
        }
      }

      // Get Firebase claims first
      await firebaseUser.getIdToken(true);
      const idTokenResult = await firebaseUser.getIdTokenResult();
      const adminFlag = !!idTokenResult.claims.admin;

      // Get JWT token from backend and pass isAdmin flag
      const tokenResponse = await fetch(`${serverURL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: firebaseUser.email,
          firebaseUid: firebaseUser.uid,
          isAdmin: adminFlag,
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

      setIsAdmin(adminFlag);

      const profile = await getProfileForEmail(firebaseUser, idTokenResult);
      if (!profile) {
        throw new Error(
          "No user profile found for this email. Please sign up first.",
        );
      }

      setUser(profile);
      console.log("User logged in via Google:", profile.email);

      return firebaseUser;
    } catch (error) {
      console.error("❌ Google sign-in error:", error);
      clearAuthSession();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Refresh user data from backend
  const refreshUser = async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser?.email) {
      console.log("refreshUser - no firebase user");
      clearAuthSession();
      return;
    }

    try {
      console.log("refreshUser - fetching data for:", firebaseUser.email);
      const res = await fetch(
        `${serverURL}/user/${encodeURIComponent(firebaseUser.email)}`,
      );
      const matchedUser = res.ok ? await res.json() : null;

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
        clearAuthSession();
        await signOut(auth);
      }
    } catch (err) {
      console.error("Error refreshing user data:", err);
    }
  };

  // -------------------- AUTH STATE LISTENER --------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser?.email) {
        clearAuthSession();
        setLoading(false);
        return;
      }

      // Check if email is verified - if not, don't set user state
      if (!firebaseUser.emailVerified) {
        console.log("Email not verified, clearing user state");
        clearAuthSession();
        setLoading(false);
        return;
      }

      try {
        await firebaseUser.getIdToken(true);
        const idTokenResult = await firebaseUser.getIdTokenResult();
        const adminFlag = !!idTokenResult.claims.admin;
        setIsAdmin(adminFlag);

        // Re-issue JWT on refresh to keep token and Firebase session aligned.
        const tokenResponse = await fetch(`${serverURL}/api/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: firebaseUser.email,
            firebaseUid: firebaseUser.uid,
            isAdmin: adminFlag,
          }),
        });

        if (!tokenResponse.ok) {
          clearAuthSession();
          await signOut(auth);
          setLoading(false);
          return;
        }

        const tokenData = await tokenResponse.json();
        localStorage.setItem("authToken", tokenData.token);

        const profile = await getProfileForEmail(firebaseUser, idTokenResult);
        if (!profile) {
          clearAuthSession();
          await signOut(auth);
          setLoading(false);
          return;
        }

        setUser(profile);
        console.log("Auth state changed - user:", profile.email);
      } catch (err) {
        console.error("Error fetching user details:", err);
        clearAuthSession();
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
    signInWithGoogle,
  };

  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
