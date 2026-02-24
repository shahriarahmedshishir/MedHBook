import React from "react";

// Unified prescription card for both creation and download

const PrescriptionCard = ({
  doctorInfo = {},
  patient = {},
  medicines = [],
  createdAt,
  showSignature = true,
  showFooter = true,
  appName = "MedHBook",
  tagline = "Your Health. Your Records. One Book.",
  inlineStyles = false,
  compact = false, // new prop for minimal display
}) => {
  // Helper for conditional style/class
  const styleOrClass = (className, styleObj) =>
    inlineStyles ? { style: styleObj } : { className };

  // Standard A4 px: 794 x 1123 at 96dpi
  const exportWidth = 794;
  const exportHeight = 1123;
  if (compact) {
    // Minimal card: just doctor, patient, and medicines
    return (
      <div
        {...styleOrClass(
          "bg-white border border-gray-200 p-4 rounded-lg w-full",
          {
            background: "#fff",
            border: "1px solid #e5e7eb",
            padding: 16,
            borderRadius: 12,
            width: "100%",
            margin: "0 auto",
          },
        )}
      >
        <div {...styleOrClass("mb-2", { marginBottom: 8 })}>
          <span
            {...styleOrClass("font-semibold text-gray-800", {
              fontWeight: 600,
              color: "#1f2937",
            })}
          >
            Dr. {doctorInfo.name || doctorInfo.doctorName}
          </span>
          <span
            {...styleOrClass("ml-2 text-gray-500 text-xs", {
              marginLeft: 8,
              color: "#6b7280",
              fontSize: 12,
            })}
          >
            {doctorInfo.specialty || doctorInfo.doctorSpecialty}
          </span>
        </div>
        <div {...styleOrClass("mb-2", { marginBottom: 8 })}>
          <span
            {...styleOrClass("font-semibold text-gray-700", {
              fontWeight: 600,
              color: "#374151",
            })}
          >
            Patient:
          </span>{" "}
          {patient.name}
        </div>
        <div {...styleOrClass("mb-2", { marginBottom: 8 })}>
          <span
            {...styleOrClass("font-semibold text-gray-700", {
              fontWeight: 600,
              color: "#374151",
            })}
          >
            Date:
          </span>{" "}
          {createdAt ? new Date(createdAt).toLocaleDateString() : "-"}
        </div>
        <div>
          <span
            {...styleOrClass("font-semibold text-gray-700", {
              fontWeight: 600,
              color: "#374151",
            })}
          >
            Medicines:
          </span>
          <ul className="list-disc ml-5" style={{ marginLeft: 20 }}>
            {medicines.map((medicine, idx) => (
              <li key={medicine.id || idx} className="text-sm text-gray-800">
                {medicine.name} ({medicine.duration})
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div
      {...styleOrClass(
        "bg-white border-2 border-gray-300 p-8 rounded-lg",
        inlineStyles
          ? {
              background: "#fff",
              border: "2px solid #d1d5db",
              padding: 32,
              borderRadius: 16,
              width: exportWidth,
              height: exportHeight,
              boxSizing: "border-box",
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
            }
          : {
              background: "#fff",
              border: "2px solid #d1d5db",
              padding: 32,
              borderRadius: 16,
              minHeight: 800,
              maxWidth: 700,
              margin: "0 auto",
            },
      )}
    >
      {/* Header */}
      <div
        {...styleOrClass("text-center border-b-2 border-gray-300 pb-4 mb-6", {
          textAlign: "center",
          borderBottom: "2px solid #d1d5db",
          paddingBottom: 16,
          marginBottom: 24,
        })}
      >
        <h1
          {...styleOrClass("text-3xl font-bold text-[#304d5d] mb-2", {
            fontSize: 32,
            fontWeight: 700,
            color: "#304d5d",
            marginBottom: 8,
          })}
        >
          {appName}
        </h1>
        <p
          {...styleOrClass("text-sm text-gray-600", {
            fontSize: 14,
            color: "#4b5563",
          })}
        >
          {tagline}
        </p>
      </div>

      {/* Doctor Info */}
      <div {...styleOrClass("mb-6", { marginBottom: 24 })}>
        <h2
          {...styleOrClass("text-xl font-bold text-gray-800", {
            fontSize: 20,
            fontWeight: 700,
            color: "#1f2937",
          })}
        >
          {doctorInfo.name || doctorInfo.doctorName}
        </h2>
        <p {...styleOrClass("text-gray-600", { color: "#4b5563" })}>
          {doctorInfo.specialty || doctorInfo.doctorSpecialty}
        </p>
        {doctorInfo.chamber && (
          <p
            {...styleOrClass("text-sm text-gray-600 mt-1", {
              fontSize: 14,
              color: "#4b5563",
              marginTop: 4,
            })}
          >
            <span {...styleOrClass("font-semibold", { fontWeight: 600 })}>
              Chamber:
            </span>{" "}
            {doctorInfo.chamber}
          </p>
        )}
        {doctorInfo.phone && (
          <p
            {...styleOrClass("text-sm text-gray-600", {
              fontSize: 14,
              color: "#4b5563",
            })}
          >
            <span {...styleOrClass("font-semibold", { fontWeight: 600 })}>
              Phone:
            </span>{" "}
            {doctorInfo.phone}
          </p>
        )}
        <p
          {...styleOrClass("text-sm text-gray-500 mt-2", {
            fontSize: 14,
            color: "#6b7280",
            marginTop: 8,
          })}
        >
          <span {...styleOrClass("font-semibold", { fontWeight: 600 })}>
            Date:
          </span>{" "}
          {createdAt
            ? new Date(createdAt).toLocaleDateString()
            : new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Patient Info */}
      <div
        {...styleOrClass("bg-gray-50 p-3 rounded mb-6", {
          background: "#f9fafb",
          padding: 12,
          borderRadius: 8,
          marginBottom: 24,
        })}
      >
        <p {...styleOrClass("text-sm", { fontSize: 14 })}>
          <span {...styleOrClass("font-semibold", { fontWeight: 600 })}>
            Patient:
          </span>{" "}
          {patient.name}
        </p>
        <p {...styleOrClass("text-sm", { fontSize: 14 })}>
          <span {...styleOrClass("font-semibold", { fontWeight: 600 })}>
            UID:
          </span>{" "}
          {patient.uid}
        </p>
      </div>

      {/* Rx Symbol */}
      <div {...styleOrClass("mb-4", { marginBottom: 16 })}>
        <p
          {...styleOrClass("text-4xl font-serif text-[#67cffe]", {
            fontSize: 32,
            fontFamily: "serif",
            color: "#67cffe",
          })}
        >
          Rx
        </p>
      </div>

      {/* Medicines */}
      <div
        {...styleOrClass("space-y-4 mb-8 min-h-[400px]", {
          marginBottom: 32,
          minHeight: 400,
        })}
      >
        {medicines.map((medicine, index) => (
          <div
            key={medicine.id || index}
            {...styleOrClass("border-l-4 border-[#67cffe] pl-4", {
              borderLeft: "4px solid #67cffe",
              paddingLeft: 16,
              marginBottom: 16,
              background: "#fff",
              borderRadius: 8,
            })}
          >
            <p
              {...styleOrClass("font-semibold text-gray-800", {
                fontWeight: 600,
                color: "#1f2937",
              })}
            >
              {index + 1}. {medicine.name || "Medicine Name"}
            </p>
            <p
              {...styleOrClass("text-sm text-gray-600 mt-1", {
                fontSize: 14,
                color: "#4b5563",
                marginTop: 4,
              })}
            >
              <span {...styleOrClass("font-medium", { fontWeight: 500 })}>
                Duration:
              </span>{" "}
              {medicine.duration || "Duration"}
            </p>
            <p
              {...styleOrClass("text-sm text-gray-600", {
                fontSize: 14,
                color: "#4b5563",
              })}
            >
              <span {...styleOrClass("font-medium", { fontWeight: 500 })}>
                Dosage:
              </span>{" "}
              {[
                medicine.morning && "Morning",
                medicine.afternoon && "Afternoon",
                medicine.evening && "Evening",
              ]
                .filter(Boolean)
                .join(" + ") || "As directed"}
            </p>
          </div>
        ))}
      </div>

      {/* Doctor Signature */}
      {showSignature && (
        <div
          {...styleOrClass("mt-12 pt-4 border-t border-gray-300", {
            marginTop: 48,
            paddingTop: 16,
            borderTop: "1px solid #d1d5db",
          })}
        >
          <div {...styleOrClass("text-right", { textAlign: "right" })}>
            <div {...styleOrClass("inline-block", { display: "inline-block" })}>
              <p
                {...styleOrClass("font-bold text-gray-800 text-lg mb-1", {
                  fontWeight: 700,
                  color: "#1f2937",
                  fontSize: 18,
                  marginBottom: 4,
                })}
              >
                {doctorInfo.name || doctorInfo.doctorName}
              </p>
              <p
                {...styleOrClass("text-sm text-gray-600", {
                  fontSize: 14,
                  color: "#4b5563",
                })}
              >
                {doctorInfo.specialty || doctorInfo.doctorSpecialty}
              </p>
              <div
                {...styleOrClass("border-t border-gray-400 mt-2 pt-1", {
                  borderTop: "1px solid #9ca3af",
                  marginTop: 8,
                  paddingTop: 4,
                })}
              >
                <p
                  {...styleOrClass("text-xs text-gray-500", {
                    fontSize: 12,
                    color: "#6b7280",
                  })}
                >
                  Doctor's Signature
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      {showFooter && (
        <div
          {...styleOrClass(
            "mt-8 text-center text-xs text-gray-500 border-t pt-4",
            inlineStyles
              ? {
                  marginTop: "auto",
                  textAlign: "center",
                  fontSize: 12,
                  color: "#6b7280",
                  borderTop: "1px solid #d1d5db",
                  paddingTop: 16,
                }
              : {
                  marginTop: 32,
                  textAlign: "center",
                  fontSize: 12,
                  color: "#6b7280",
                  borderTop: "1px solid #d1d5db",
                  paddingTop: 16,
                },
          )}
        >
          <p
            {...styleOrClass("font-semibold text-[#304d5d]", {
              fontWeight: 600,
              color: "#304d5d",
            })}
          >
            MedHBook - Digital Medical Records Platform
          </p>
          <p {...styleOrClass("mt-1", { marginTop: 4 })}>
            Email: contact@medhbook.com | www.medhbook.com
          </p>
        </div>
      )}
    </div>
  );
};

export default PrescriptionCard;
