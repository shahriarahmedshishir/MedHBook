import { Heart } from "lucide-react";
import Logo from "./Logo";

const Footer = () => {
  return (
    <footer className="w-full bg-linear-to-b from-[#d1f6ff] to-[#b9efff] text-gray-800 shrink-0">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col items-center">
        {/* Logo Section */}
        <div className="flex items-center space-x-3 mb-2">
          <Logo />
        </div>

        {/* Description */}
        <p className="text-center max-w-xl text-xs font-normal leading-relaxed">
          Empowering creators worldwide with advanced AI tools.
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-[#8ee9ff]">
        <div className="max-w-7xl mx-auto px-6 py-2 text-center text-xs font-medium flex flex-col sm:flex-row items-center justify-center gap-1">
          <p className="flex items-center gap-1">
            <a
              href="blank"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:text-[#007b8f] transition-colors"
            >
              novamatrix
            </a>
            &nbsp;©2025.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
