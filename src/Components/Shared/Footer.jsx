import { Heart } from "lucide-react";
import Logo from "./Logo";

const Footer = () => {
  return (
    <footer className="w-full bg-linear-to-b from-[#d1f6ff] to-[#b9efff] text-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col items-center">
        {/* Logo Section */}
        <div className="flex items-center space-x-3 mb-6">
          <Logo />
        </div>

        {/* Description */}
        <p className="text-center max-w-xl text-sm font-normal leading-relaxed">
          Empowering creators worldwide with the most advanced AI content
          creation tools. Transform your ideas into reality.
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-[#8ee9ff]">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm font-medium flex flex-col sm:flex-row items-center justify-center gap-2">
          <p className="flex items-center gap-1">
            <a
              href="https://prebuiltui.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:text-[#007b8f] transition-colors"
            >
              pixelpatriotsbd
            </a>
            &nbsp;©2025. All rights reserved.
          </p>
          <span className="flex items-center gap-1 text-gray-600 text-xs">
            Made with <Heart size={14} className="text-pink-500" /> by
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
