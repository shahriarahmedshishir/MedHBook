import { useState } from "react";
import { Plus, X, Clock, MapPin } from "lucide-react";

const ChamberManagement = ({ chambers = [], onChange }) => {
  const [localChambers, setLocalChambers] = useState(chambers);

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const addChamber = () => {
    const newChamber = {
      id: Date.now(),
      name: "",
      address: "",
      phone: "",
      startTime: "",
      endTime: "",
      workingDays: [],
    };
    const updated = [...localChambers, newChamber];
    setLocalChambers(updated);
    onChange(updated);
  };

  const removeChamber = (id) => {
    const updated = localChambers.filter((c) => c.id !== id);
    setLocalChambers(updated);
    onChange(updated);
  };

  const updateChamber = (id, field, value) => {
    const updated = localChambers.map((c) =>
      c.id === id ? { ...c, [field]: value } : c,
    );
    setLocalChambers(updated);
    onChange(updated);
  };

  const toggleDay = (chamberId, day) => {
    const updated = localChambers.map((c) => {
      if (c.id === chamberId) {
        const days = c.workingDays.includes(day)
          ? c.workingDays.filter((d) => d !== day)
          : [...c.workingDays, day];
        return { ...c, workingDays: days };
      }
      return c;
    });
    setLocalChambers(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#67cffe]" />
          Chamber Information
        </h3>
        <button
          type="button"
          onClick={addChamber}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#67cffe] to-[#304d5d] text-white rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Chamber
        </button>
      </div>

      {localChambers.length === 0 && (
        <p className="text-gray-500 text-center py-4">
          No chambers added yet. Click "Add Chamber" to get started.
        </p>
      )}

      {localChambers.map((chamber, index) => (
        <div
          key={chamber.id}
          className="bg-white border-2 border-[#67cffe]/20 rounded-xl p-4 space-y-4 relative"
        >
          {/* Remove Button */}
          <button
            type="button"
            onClick={() => removeChamber(chamber.id)}
            className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>

          <h4 className="font-semibold text-gray-700">Chamber {index + 1}</h4>

          {/* Chamber Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chamber Name
              </label>
              <input
                type="text"
                value={chamber.name}
                onChange={(e) =>
                  updateChamber(chamber.id, "name", e.target.value)
                }
                placeholder="e.g., City Hospital"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#67cffe] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={chamber.phone}
                onChange={(e) =>
                  updateChamber(chamber.id, "phone", e.target.value)
                }
                placeholder="Chamber contact number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#67cffe] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              value={chamber.address}
              onChange={(e) =>
                updateChamber(chamber.id, "address", e.target.value)
              }
              placeholder="Full chamber address"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#67cffe] focus:border-transparent"
            />
          </div>

          {/* Time Schedule */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Start Time
              </label>
              <input
                type="time"
                value={chamber.startTime}
                onChange={(e) =>
                  updateChamber(chamber.id, "startTime", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#67cffe] focus:border-transparent"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                End Time
              </label>
              <input
                type="time"
                value={chamber.endTime}
                onChange={(e) =>
                  updateChamber(chamber.id, "endTime", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#67cffe] focus:border-transparent"
              />
            </div>
          </div>

          {/* Working Days */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Working Days
            </label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(chamber.id, day)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    chamber.workingDays.includes(day)
                      ? "bg-gradient-to-r from-[#67cffe] to-[#304d5d] text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChamberManagement;
