import React from "react";

const Logo = () => {
  return (
    <div className="relative">
      <h1 className="text-4xl font-extrabold text-[#304d5d] tracking-tight">
        Med <span className="text-[#67cffe] inline-block animate-float">H</span>{" "}
        Book
      </h1>
      <div className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#67cffe] to-transparent opacity-70"></div>
    </div>
  );
};

export default Logo;
