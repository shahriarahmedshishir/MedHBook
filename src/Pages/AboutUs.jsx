import React from "react";
import { Mail, Github, Linkedin, Code, Phone } from "lucide-react";

const AboutUs = () => {
  const developers = [
    {
      name: "Shahriar Shishir",
      role: "Full Stack Developer",
      email: "developer@medhbook.com",
      phone: "+880 1234-567890",
      github: "https://github.com/shishir",
      linkedin: "https://linkedin.com/in/shishir",
      description: "Passionate about creating innovative healthcare solutions",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 py-12 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16 animate-slideInLeft">
          <h1 className="text-5xl font-bold text-[#304d5d] mb-4">
            About <span className="text-[#67cffe]">MedHBook</span>
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-[#304d5d] to-[#67cffe] mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your Digital Health Record Management System
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-12 animate-slideInRight backdrop-blur-sm bg-opacity-90">
          <div className="flex items-center gap-3 mb-6">
            <Code className="w-8 h-8 text-[#67cffe]" />
            <h2 className="text-3xl font-bold text-[#304d5d]">Our Mission</h2>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            MedHBook is dedicated to revolutionizing healthcare record
            management by providing a secure, accessible, and user-friendly
            platform for patients and doctors. We bridge the gap between
            healthcare providers and patients through innovative digital
            solutions.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Our platform enables seamless management of medical records,
            prescriptions, reports, and X-rays while facilitating easy
            communication between patients and healthcare professionals.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-scaleIn">
            <div className="w-12 h-12 bg-gradient-to-br from-[#304d5d] to-[#67cffe] rounded-xl flex items-center justify-center mb-4">
              <span className="text-white text-2xl">🏥</span>
            </div>
            <h3 className="text-xl font-bold text-[#304d5d] mb-2">
              For Patients
            </h3>
            <p className="text-gray-600">
              Store and access your medical records, prescriptions, and reports
              anytime, anywhere.
            </p>
          </div>

          <div
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-scaleIn"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#304d5d] to-[#67cffe] rounded-xl flex items-center justify-center mb-4">
              <span className="text-white text-2xl">👨‍⚕️</span>
            </div>
            <h3 className="text-xl font-bold text-[#304d5d] mb-2">
              For Doctors
            </h3>
            <p className="text-gray-600">
              Efficiently manage patient information and provide better
              healthcare services.
            </p>
          </div>

          <div
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-scaleIn"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#304d5d] to-[#67cffe] rounded-xl flex items-center justify-center mb-4">
              <span className="text-white text-2xl">🔒</span>
            </div>
            <h3 className="text-xl font-bold text-[#304d5d] mb-2">
              Secure & Private
            </h3>
            <p className="text-gray-600">
              Your health data is protected with industry-standard security
              measures.
            </p>
          </div>
        </div>

        {/* Developer Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-[#304d5d] text-center mb-10">
            Meet the <span className="text-[#67cffe]">Developer</span>
          </h2>
          <div className="grid md:grid-cols-1 gap-8 max-w-2xl mx-auto">
            {developers.map((dev, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-bounceIn backdrop-blur-sm bg-opacity-90"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex flex-col items-center text-center">
                  {/* Avatar Placeholder */}
                  <div className="w-32 h-32 bg-gradient-to-br from-[#304d5d] to-[#67cffe] rounded-full flex items-center justify-center mb-6 shadow-lg">
                    <span className="text-white text-5xl font-bold">
                      {dev.name.charAt(0)}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-[#304d5d] mb-2">
                    {dev.name}
                  </h3>
                  <p className="text-[#67cffe] font-semibold mb-4">
                    {dev.role}
                  </p>
                  <p className="text-gray-600 mb-6">{dev.description}</p>

                  {/* Contact Information */}
                  <div className="w-full space-y-4">
                    <a
                      href={`mailto:${dev.email}`}
                      className="flex items-center justify-center gap-3 w-full py-3 px-6 bg-gradient-to-r from-[#304d5d] to-[#67cffe] text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      <Mail className="w-5 h-5" />
                      <span className="font-medium">{dev.email}</span>
                    </a>

                    <a
                      href={`tel:${dev.phone}`}
                      className="flex items-center justify-center gap-3 w-full py-3 px-6 bg-gradient-to-r from-[#67cffe] to-[#304d5d] text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      <Phone className="w-5 h-5" />
                      <span className="font-medium">{dev.phone}</span>
                    </a>

                    <div className="flex gap-4 justify-center">
                      <a
                        href={dev.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition-all duration-300 hover:scale-105"
                      >
                        <Github className="w-5 h-5" />
                        <span className="font-medium">GitHub</span>
                      </a>

                      <a
                        href={dev.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 hover:scale-105"
                      >
                        <Linkedin className="w-5 h-5" />
                        <span className="font-medium">LinkedIn</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
