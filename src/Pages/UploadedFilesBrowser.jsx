// components/UploadedFilesBrowser.jsx
import React from "react";
import { Trash2 } from "lucide-react";

const UploadedFilesBrowser = ({ prescriptions, testReports }) => {
  const allFiles = [
    ...prescriptions.map((file) => ({ type: "Prescription", file })),
    ...testReports.map((file) => ({ type: "Test Report", file })),
  ];

  if (allFiles.length === 0) return null;

  return (
    <div className="mt-8 flex justify-center w-full px-4">
      {/* A4-inspired responsive container */}
      <div
        className="w-full max-w-[210mm] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
        style={{ minHeight: '297mm' }}
      >
        <div className="p-6">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-5 text-center">
            Uploaded Files Preview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {allFiles.map((item, idx) => {
              const url = URL.createObjectURL(item.file);

              const handleRevoke = () => {
                URL.revokeObjectURL(url);
              };

              return (
                <div
                  key={idx}
                  className="flex flex-col items-center bg-gray-50 rounded-lg border border-gray-200 overflow-hidden"
                >
                  {/* Preview container: flexible height, responsive */}
                  <div className="w-full  max-h-[210mm] flex justify-center items-center bg-white">
                    {item.file.type.startsWith("image/") ? (
                      <img
                        src={url}
                        alt={item.file.name}
                        className="w-full h-full object-contain p-2"
                        onLoad={handleRevoke}
                        onError={handleRevoke}
                      />
                    ) : item.file.type === "application/pdf" ? (
                      <iframe
                        src={url}
                        title={item.file.name}
                        className="w-full h-full"
                        onLoad={handleRevoke}
                      />
                    ) : (
                      <div className="text-center px-3 py-2">
                        <p className="text-gray-500 text-sm font-mono truncate">
                          {item.file.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Unsupported preview</p>
                      </div>
                    )}
                  </div>

                  <div className="w-full p-3 text-center">
                    <p className="text-sm text-gray-700 font-medium truncate px-1">
                      {item.file.name}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadedFilesBrowser;