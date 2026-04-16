import React from "react";
import Header from "../Shared/Header";
import Footer from "../Shared/Footer";

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
