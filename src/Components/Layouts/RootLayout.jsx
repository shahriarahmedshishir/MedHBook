// RootLayout.jsx
import React, { useContext } from "react";
import { Outlet } from "react-router-dom";
import Header from "../Shared/Header";
import Footer from "../Shared/Footer";
import SignIn from "../../Pages/SignIn";
import AuthContext from "../Context/AuthContext";

const RootLayout = () => {
  const { user, loading } = useContext(AuthContext);

  // Show loading while auth or users data is not ready
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect to SignIn if not logged in
  if (!user) {
    return <SignIn />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default RootLayout;
