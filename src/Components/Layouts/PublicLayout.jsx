import React from "react";
import Header from "../Shared/Header";
import Footer from "../Shared/Footer";

const PublicLayout = ({ children }) => {
  return (
    <div>
      <Header />
      {children}
      <Footer />
    </div>
  );
};

export default PublicLayout;
