import { useState, useEffect } from "react";
import axios from "axios";
import { Search, MapPin, Mail, Phone, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

const getFullImageURL = (imgPath) => {
  if (!imgPath) return null;
  if (imgPath.startsWith("http")) return imgPath;
  const serverURL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
  return `${serverURL}${imgPath}`;
};

// Words to ignore while searching
const IGNORE_WORDS = [
  "doctor",
  "specialist",
  "surgeon",
  "physician",
  "consultant",
  "dr",
  "clinic",
  "hospital",
  "ডাক্তার",
  "ডা",
  "বিশেষজ্ঞ",
  "সার্জন",
  "চিকিৎসক",
  "হাসপাতাল",
  "ক্লিনিক",
];

// Specialty mapping with symptoms, organs, and aliases
const SPECIALTIES = [
  /* ================= GENERAL ================= */
  {
    name: "General Physician",
    organs: [],
    symptoms: [
      "fever",
      "cold",
      "cough",
      "weakness",
      "body pain",
      "infection",
      "জ্বর",
      "সর্দি",
      "কাশি",
      "দুর্বলতা",
      "শরীর ব্যথা",
    ],
    aliases: [
      "general physician",
      "general doctor",
      "medicine doctor",
      "জেনারেল ডাক্তার",
      "মেডিসিন ডাক্তার",
    ],
  },
  {
    name: "Internist",
    organs: [],
    symptoms: ["chronic disease", "complex illness", "দীর্ঘমেয়াদি রোগ"],
    aliases: ["internist", "internal medicine", "ইন্টারনিস্ট"],
  },

  /* ================= CARDIO ================= */
  {
    name: "Cardiologist",
    organs: ["heart", "হার্ট", "হৃদয়"],
    symptoms: [
      "chest pain",
      "pulse",
      "palpitation",
      "bp",
      "blood pressure",
      "বুক ব্যথা",
      "প্রেসার",
      "ধড়ফড়",
    ],
    aliases: [
      "cardiologist",
      "cardio",
      "heart doctor",
      "হার্ট ডাক্তার",
      "কার্ডিওলজিস্ট",
    ],
  },
  {
    name: "Pediatric Cardiologist",
    organs: ["heart", "child heart", "শিশুর হার্ট"],
    symptoms: ["child heart problem", "জন্মগত হার্ট"],
    aliases: ["pediatric cardiologist", "child heart doctor"],
  },
  {
    name: "Cardiac Surgeon",
    organs: ["heart"],
    symptoms: ["bypass", "heart surgery", "valve problem"],
    aliases: ["cardiac surgeon", "heart surgeon", "হার্ট সার্জন"],
  },

  /* ================= NEURO ================= */
  {
    name: "Neurologist",
    organs: ["brain", "nerve", "মস্তিষ্ক", "স্নায়ু"],
    symptoms: [
      "headache",
      "migraine",
      "seizure",
      "stroke",
      "paralysis",
      "মাথাব্যথা",
      "খিঁচুনি",
      "স্ট্রোক",
    ],
    aliases: [
      "neurologist",
      "neuro",
      "brain doctor",
      "নিউরোলজিস্ট",
      "নার্ভ ডাক্তার",
    ],
  },
  {
    name: "Pediatric Neurologist",
    organs: ["brain", "child brain"],
    symptoms: ["autism", "development delay", "শিশুর খিঁচুনি"],
    aliases: ["pediatric neurologist", "child brain doctor"],
  },
  {
    name: "Neurosurgeon",
    organs: ["brain", "spine", "মস্তিষ্ক"],
    symptoms: ["brain surgery", "spine surgery"],
    aliases: ["neurosurgeon", "brain surgeon", "নিউরো সার্জন"],
  },

  /* ================= ENDO ================= */
  {
    name: "Endocrinologist",
    organs: ["hormone", "thyroid"],
    symptoms: [
      "diabetes",
      "thyroid",
      "sugar",
      "hormone",
      "ডায়াবেটিস",
      "থাইরয়েড",
    ],
    aliases: ["endocrinologist", "diabetes doctor", "এন্ডোক্রাইনোলজিস্ট"],
  },

  /* ================= GASTRO / LIVER ================= */
  {
    name: "Gastroenterologist",
    organs: ["stomach", "intestine", "পেট"],
    symptoms: ["gas", "acidity", "ulcer", "diarrhea", "পেট ব্যথা", "গ্যাস"],
    aliases: ["gastroenterologist", "gastro", "পেটের ডাক্তার"],
  },
  {
    name: "Hepatologist",
    organs: ["liver", "লিভার", "যকৃত"],
    symptoms: ["jaundice", "hepatitis", "জন্ডিস"],
    aliases: ["hepatologist", "liver doctor", "লিভার ডাক্তার"],
  },

  /* ================= LUNG ================= */
  {
    name: "Pulmonologist",
    organs: ["lung", "chest", "ফুসফুস"],
    symptoms: ["asthma", "breathing problem", "cough", "হাঁপানি", "শ্বাসকষ্ট"],
    aliases: ["pulmonologist", "chest specialist", "ফুসফুস ডাক্তার"],
  },

  /* ================= KIDNEY / URINE ================= */
  {
    name: "Nephrologist",
    organs: ["kidney", "কিডনি"],
    symptoms: ["creatinine", "dialysis", "kidney pain", "ডায়ালাইসিস"],
    aliases: ["nephrologist", "kidney doctor", "কিডনি ডাক্তার"],
  },
  {
    name: "Urologist",
    organs: ["urine", "bladder", "প্রস্রাব"],
    symptoms: ["urine burning", "stone", "blood in urine", "প্রস্রাবে জ্বালা"],
    aliases: ["urologist", "urine doctor", "ইউরোলজিস্ট"],
  },
  {
    name: "Andrologist",
    organs: ["male organ"],
    symptoms: ["male infertility", "sexual weakness"],
    aliases: ["andrologist", "male specialist"],
  },

  /* ================= RHEUM / BLOOD / IMMUNE ================= */
  {
    name: "Rheumatologist",
    organs: ["joint", "immune"],
    symptoms: ["arthritis", "joint pain", "লুপাস"],
    aliases: ["rheumatologist", "joint specialist"],
  },
  {
    name: "Hematologist",
    organs: ["blood"],
    symptoms: ["anemia", "blood cancer", "রক্তস্বল্পতা"],
    aliases: ["hematologist", "blood doctor"],
  },
  {
    name: "Immunologist",
    organs: ["immune"],
    symptoms: ["immune disease", "allergy"],
    aliases: ["immunologist"],
  },

  /* ================= WOMEN ================= */
  {
    name: "Gynecologist",
    organs: ["uterus", "women"],
    symptoms: ["period pain", "pcos", "women problem", "মাসিক সমস্যা"],
    aliases: ["gynecologist", "women doctor", "গাইনি ডাক্তার"],
  },
  {
    name: "Obstetrician",
    organs: ["pregnancy"],
    symptoms: ["pregnancy", "delivery", "গর্ভাবস্থা"],
    aliases: ["obstetrician", "pregnancy doctor"],
  },
  {
    name: "Gynecologist & Obstetrician (OB-GYN)",
    organs: ["women", "pregnancy"],
    symptoms: ["pregnancy", "pcos", "delivery"],
    aliases: ["ob gyn", "obstetrician gynecologist"],
  },

  /* ================= CHILD ================= */
  {
    name: "Pediatrician",
    organs: ["child", "baby"],
    symptoms: ["child fever", "vaccination", "baby cold"],
    aliases: ["pediatrician", "child doctor", "শিশু ডাক্তার"],
  },
  {
    name: "Neonatologist",
    organs: ["newborn"],
    symptoms: ["nicu", "premature baby"],
    aliases: ["neonatologist"],
  },

  /* ================= SURGERY ================= */
  {
    name: "General Surgeon",
    organs: [],
    symptoms: ["surgery", "appendix", "hernia"],
    aliases: ["general surgeon"],
  },
  {
    name: "Orthopedic Surgeon",
    organs: ["bone", "joint", "হাড়"],
    symptoms: ["fracture", "joint pain", "back pain", "হাড় ভাঙা"],
    aliases: ["orthopedic", "bone doctor", "অর্থোপেডিক"],
  },
  {
    name: "Plastic Surgeon",
    organs: [],
    symptoms: ["cosmetic surgery", "reconstruction"],
    aliases: ["plastic surgeon"],
  },
  {
    name: "Laparoscopic Surgeon",
    organs: [],
    symptoms: ["keyhole surgery"],
    aliases: ["laparoscopic surgeon"],
  },
  {
    name: "Trauma Surgeon",
    organs: [],
    symptoms: ["accident injury", "trauma"],
    aliases: ["trauma surgeon"],
  },
  {
    name: "Vascular Surgeon",
    organs: ["blood vessel"],
    symptoms: ["varicose vein"],
    aliases: ["vascular surgeon"],
  },

  /* ================= EYE / ENT / DENTAL ================= */
  {
    name: "Ophthalmologist",
    organs: ["eye", "চোখ"],
    symptoms: ["vision problem", "cataract", "eye pain", "ছানি"],
    aliases: ["ophthalmologist", "eye doctor", "চোখের ডাক্তার"],
  },
  {
    name: "ENT Specialist (Otolaryngologist)",
    organs: ["ear", "nose", "throat", "কান", "নাক", "গলা"],
    symptoms: ["sinus", "tonsil", "ear pain", "কান ব্যথা"],
    aliases: ["ent", "ear nose throat", "ইএনটি"],
  },
  {
    name: "Audiologist",
    organs: ["ear"],
    symptoms: ["hearing loss", "কানে কম শোনা"],
    aliases: ["audiologist"],
  },
  {
    name: "Dentist",
    organs: ["tooth", "দাঁত"],
    symptoms: ["tooth pain", "gum bleeding", "দাঁত ব্যথা"],
    aliases: ["dentist", "tooth doctor", "ডেন্টিস্ট"],
  },
  {
    name: "Orthodontist",
    organs: ["tooth"],
    symptoms: ["braces", "teeth alignment"],
    aliases: ["orthodontist"],
  },
  {
    name: "Oral & Maxillofacial Surgeon",
    organs: ["jaw"],
    symptoms: ["jaw surgery"],
    aliases: ["oral surgeon"],
  },

  /* ================= SKIN ================= */
  {
    name: "Dermatologist",
    organs: ["skin", "ত্বক", "চামড়া"],
    symptoms: ["rash", "acne", "itch", "fungal", "দাদ", "চুলকানি", "ব্রণ"],
    aliases: ["dermatologist", "skin doctor", "চর্মরোগ বিশেষজ্ঞ"],
  },
  {
    name: "Cosmetologist",
    organs: ["skin"],
    symptoms: ["beauty treatment"],
    aliases: ["cosmetologist"],
  },
  {
    name: "Aesthetic Medicine Specialist",
    organs: ["skin"],
    symptoms: ["botox", "filler"],
    aliases: ["aesthetic doctor"],
  },

  /* ================= MENTAL ================= */
  {
    name: "Psychiatrist",
    organs: ["mind", "mental"],
    symptoms: [
      "depression",
      "anxiety",
      "panic",
      "insomnia",
      "ডিপ্রেশন",
      "স্ট্রেস",
    ],
    aliases: ["psychiatrist", "mental doctor", "সাইকিয়াট্রিস্ট"],
  },
  {
    name: "Clinical Psychologist",
    organs: ["mind"],
    symptoms: ["therapy"],
    aliases: ["clinical psychologist"],
  },
  {
    name: "Counseling Psychologist",
    organs: ["mind"],
    symptoms: ["counseling"],
    aliases: ["counseling psychologist"],
  },
  {
    name: "Child & Adolescent Psychiatrist",
    organs: ["child mind"],
    symptoms: ["child behavior problem"],
    aliases: ["child psychiatrist"],
  },
  {
    name: "Addiction Specialist",
    organs: ["brain"],
    symptoms: ["drug addiction", "alcohol addiction"],
    aliases: ["addiction specialist"],
  },

  /* ================= CANCER / LAB ================= */
  {
    name: "Oncologist",
    organs: [],
    symptoms: ["cancer", "tumor"],
    aliases: ["oncologist", "cancer doctor"],
  },
  {
    name: "Medical Oncologist",
    organs: [],
    symptoms: ["chemotherapy"],
    aliases: ["medical oncologist"],
  },
  {
    name: "Surgical Oncologist",
    organs: [],
    symptoms: ["cancer surgery"],
    aliases: ["surgical oncologist"],
  },
  {
    name: "Radiation Oncologist",
    organs: [],
    symptoms: ["radiotherapy"],
    aliases: ["radiation oncologist"],
  },
  {
    name: "Radiologist",
    organs: [],
    symptoms: ["xray", "ct scan", "mri"],
    aliases: ["radiologist"],
  },
  {
    name: "Pathologist",
    organs: [],
    symptoms: ["biopsy", "lab report"],
    aliases: ["pathologist"],
  },
  {
    name: "Nuclear Medicine Specialist",
    organs: [],
    symptoms: ["pet scan"],
    aliases: ["nuclear medicine"],
  },

  /* ================= ICU / PAIN / SPORTS ================= */
  {
    name: "Anesthesiologist",
    organs: [],
    symptoms: ["anesthesia"],
    aliases: ["anesthesiologist"],
  },
  {
    name: "Critical Care Specialist (ICU)",
    organs: [],
    symptoms: ["icu", "ventilator"],
    aliases: ["critical care", "icu doctor"],
  },
  {
    name: "Pain Management Specialist",
    organs: [],
    symptoms: ["chronic pain"],
    aliases: ["pain specialist"],
  },
  {
    name: "Sports Medicine Specialist",
    organs: [],
    symptoms: ["sports injury"],
    aliases: ["sports doctor"],
  },
  {
    name: "Physiotherapist",
    organs: ["muscle", "joint"],
    symptoms: ["rehab", "physiotherapy"],
    aliases: ["physiotherapist", "physical therapist"],
  },
  {
    name: "Chiropractor",
    organs: ["spine"],
    symptoms: ["spine adjustment"],
    aliases: ["chiropractor"],
  },

  /* ================= OTHER ================= */
  {
    name: "Sexologist",
    organs: [],
    symptoms: ["sexual problem"],
    aliases: ["sexologist"],
  },
  {
    name: "Sleep Medicine Specialist",
    organs: [],
    symptoms: ["sleep disorder", "insomnia"],
    aliases: ["sleep doctor"],
  },
  {
    name: "Occupational Medicine Specialist",
    organs: [],
    symptoms: ["work related disease"],
    aliases: ["occupational medicine"],
  },
  {
    name: "Public Health Specialist",
    organs: [],
    symptoms: ["community health"],
    aliases: ["public health"],
  },
];

// Function to clean and tokenize search query
const cleanQuery = (query) => {
  return query
    .toLowerCase()
    .split(/[\s,]+/)
    .filter((word) => word.length > 0 && !IGNORE_WORDS.includes(word));
};

// Function to find matching specialties based on user input
const findMatchingSpecialties = (query) => {
  const cleanedTokens = cleanQuery(query);
  if (cleanedTokens.length === 0) return [];

  const matchedSpecialties = new Set();

  SPECIALTIES.forEach((specialty) => {
    let matchScore = 0;

    // Check each token against specialty data
    cleanedTokens.forEach((token) => {
      // Check symptoms
      if (
        specialty.symptoms.some(
          (symptom) =>
            symptom.toLowerCase().includes(token) ||
            token.includes(symptom.toLowerCase()),
        )
      ) {
        matchScore += 3;
      }

      // Check organs
      if (
        specialty.organs.some(
          (organ) =>
            organ.toLowerCase().includes(token) ||
            token.includes(organ.toLowerCase()),
        )
      ) {
        matchScore += 3;
      }

      // Check aliases
      if (
        specialty.aliases.some(
          (alias) =>
            alias.toLowerCase().includes(token) ||
            token.includes(alias.toLowerCase()),
        )
      ) {
        matchScore += 2;
      }

      // Check specialty name
      if (
        specialty.name.toLowerCase().includes(token) ||
        token.includes(specialty.name.toLowerCase())
      ) {
        matchScore += 1;
      }
    });

    if (matchScore > 0) {
      matchedSpecialties.add(specialty.name);
    }
  });

  return Array.from(matchedSpecialties);
};

const SearchDoctor = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  // Fetch initial 10 doctors on component mount
  useEffect(() => {
    const fetchInitialDoctors = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/search/doctors",
          {
            params: { limit: 10 },
          },
        );
        setDoctors(response.data.slice(0, 10));
      } catch (err) {
        console.error("Error fetching initial doctors:", err);
      }
    };
    fetchInitialDoctors();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError("Please enter a search term");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = {};

      // Search by name
      params.name = searchQuery;

      // Find matching specialties using intelligent matching
      const matchedSpecialties = findMatchingSpecialties(searchQuery);

      if (matchedSpecialties.length === 0) {
        // If no specialty matches, still try direct search
        params.specialty = searchQuery;
      } else {
        // Pass matched specialties as comma-separated string
        params.specialty = matchedSpecialties.join(",");
      }

      const response = await axios.get("http://localhost:3000/search/doctors", {
        params,
      });

      setDoctors(response.data);
      setSearched(true);

      if (response.data.length === 0) {
        setError("No doctors found matching your search.");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to search doctors. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentClick = (doctor) => {
    navigate(`/appointment/${doctor._id}`, { state: { doctor } });
  };

  const handleContactDoctor = (doctor) => {
    navigate("/chat", {
      state: {
        doctorEmail: doctor.email,
        doctorName: doctor.name,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0f7fa] via-[#b2ebf2] to-[#d1f6ff] py-12 px-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-[#67cffe] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      <div
        className="absolute bottom-20 left-10 w-96 h-96 bg-[#304d5d] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#304d5d] to-[#67cffe] bg-clip-text text-transparent mb-3">
            Find a Doctor
          </h1>
          <p className="text-[#304d5d] font-medium">
            Search by name, specialty, chamber area, symptoms, organs, or
            conditions
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 mb-8 border border-white/20 animate-scaleIn">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by doctor name, specialty, chamber location/area, symptoms, organs (e.g., Dr. Smith, Dhaka, Gulshan, cardiologist, chest pain, heart)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-4 pl-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#67cffe] focus:shadow-lg focus:shadow-[#67cffe]/20 transition-all duration-300 bg-white"
              />
              <Search
                className="absolute left-4 top-4 text-[#67cffe]"
                size={20}
              />
            </div>

            {/* Search Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#304d5d] to-[#67cffe] hover:shadow-xl hover:shadow-[#67cffe]/30 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Searching...
                </span>
              ) : (
                "Search"
              )}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-300 text-red-700 px-5 py-4 rounded-xl mb-6 animate-fadeIn font-medium">
            {error}
          </div>
        )}

        {/* Results */}
        {searched && doctors.length > 0 && (
          <div className="mb-6 animate-fadeIn">
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#304d5d] to-[#67cffe] bg-clip-text text-transparent mb-6">
              Found {doctors.length} Doctor{doctors.length !== 1 ? "s" : ""}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {doctors.map((doctor, index) => (
                <div
                  key={index}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl hover:shadow-[#67cffe]/20 transition-all duration-300 transform hover:-translate-y-1 border border-white/20 animate-scaleIn"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="bg-gradient-to-r from-[#304d5d] to-[#67cffe] h-24"></div>

                  <div className="p-6 -mt-12 relative">
                    {/* Doctor Avatar */}
                    {doctor.img && getFullImageURL(doctor.img) ? (
                      <img
                        src={getFullImageURL(doctor.img)}
                        alt={doctor.name}
                        className="w-20 h-20 rounded-full border-4 border-white mb-4 object-cover shadow-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full border-4 border-white bg-gradient-to-br from-[#67cffe]/20 to-[#304d5d]/10 mb-4 flex items-center justify-center shadow-lg">
                        <span className="text-2xl font-bold text-[#304d5d]">
                          {doctor.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Doctor Info */}
                    <h3 className="text-xl font-bold text-[#304d5d] mb-3">
                      {doctor.name || "N/A"}
                    </h3>

                    {doctor.doctorType && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(doctor.doctorType) ? (
                            doctor.doctorType.map((type, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 bg-[#67cffe]/10 text-[#304d5d] border border-[#67cffe]/30 px-3 py-1 rounded-full text-xs font-semibold"
                              >
                                <Award size={12} />
                                {type}
                              </span>
                            ))
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-[#67cffe]/10 text-[#304d5d] border border-[#67cffe]/30 px-3 py-1 rounded-full text-xs font-semibold">
                              <Award size={12} />
                              {doctor.doctorType}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {doctor.specialization && (
                      <div className="text-gray-700 mb-3">
                        <p className="text-xs text-gray-600 font-semibold">
                          Specialization:
                        </p>
                        <p className="text-sm font-bold text-[#67cffe]">
                          {doctor.specialization}
                        </p>
                      </div>
                    )}

                    {doctor.degree && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-600 mb-1 font-semibold">
                          Degree:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(doctor.degree) ? (
                            doctor.degree.map((deg, idx) => (
                              <span
                                key={idx}
                                className="bg-[#304d5d]/10 text-[#304d5d] border border-[#304d5d]/20 px-2 py-0.5 rounded-full text-xs font-semibold"
                              >
                                {deg}
                              </span>
                            ))
                          ) : (
                            <span className="bg-[#304d5d]/10 text-[#304d5d] border border-[#304d5d]/20 px-2 py-0.5 rounded-full text-xs font-semibold">
                              {doctor.degree}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {doctor.college && (
                      <div className="text-gray-700 mb-3">
                        <p className="text-xs text-gray-600 font-semibold">
                          College:
                        </p>
                        <p className="text-sm font-medium">{doctor.college}</p>
                      </div>
                    )}

                    {doctor.yearsOfExperience && (
                      <div className="text-gray-700 mb-3">
                        <p className="text-xs text-gray-600 font-semibold">
                          Experience:
                        </p>
                        <p className="text-sm font-bold text-[#67cffe]">
                          {doctor.yearsOfExperience} years
                        </p>
                      </div>
                    )}

                    {doctor.email && (
                      <div className="flex items-center text-gray-700 mb-2">
                        <Mail size={16} className="mr-2 text-[#67cffe]" />
                        <p className="text-sm break-all">{doctor.email}</p>
                      </div>
                    )}

                    {doctor.phone && (
                      <div className="flex items-center text-gray-700 mb-2">
                        <Phone size={16} className="mr-2 text-[#67cffe]" />
                        <p className="text-sm">{doctor.phone}</p>
                      </div>
                    )}

                    {doctor.location && (
                      <div className="flex items-center text-gray-700 mb-4">
                        <MapPin size={16} className="mr-2 text-[#67cffe]" />
                        <p className="text-sm">{doctor.location}</p>
                      </div>
                    )}

                    {doctor.experience && (
                      <p className="text-sm text-gray-700 mb-4">
                        <span className="font-bold">Experience:</span>{" "}
                        {doctor.experience} years
                      </p>
                    )}

                    {doctor.bio && (
                      <p className="text-sm text-gray-600 mb-4 italic">
                        {doctor.bio}
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <button
                        onClick={() =>
                          navigate(`/doctor-profile/${doctor._id}`, {
                            state: { doctor },
                          })
                        }
                        className="bg-gradient-to-r from-[#304d5d] to-[#67cffe] hover:shadow-lg hover:shadow-[#67cffe]/30 text-white font-bold py-2 rounded-lg transition-all duration-300 hover:-translate-y-0.5 text-sm"
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => handleAppointmentClick(doctor)}
                        className="bg-gradient-to-r from-[#67cffe] to-[#304d5d] hover:shadow-lg hover:shadow-[#304d5d]/30 text-white font-bold py-2 rounded-lg transition-all duration-300 hover:-translate-y-0.5 text-sm"
                      >
                        Appointment
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results State */}
        {searched && doctors.length === 0 && !error && (
          <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 animate-fadeIn">
            <Search size={48} className="mx-auto text-[#67cffe] mb-4" />
            <p className="text-[#304d5d] text-lg font-semibold">
              No doctors found. Try a different search.
            </p>
          </div>
        )}

        {/* Initial State - Show 10 doctors by default */}
        {!searched && doctors.length > 0 && (
          <div className="mb-6 animate-fadeIn">
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#304d5d] to-[#67cffe] bg-clip-text text-transparent mb-6">
              Available Doctors
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {doctors.map((doctor, index) => (
                <div
                  key={index}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl hover:shadow-[#67cffe]/20 transition-all duration-300 transform hover:-translate-y-1 border border-white/20 animate-scaleIn"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="bg-gradient-to-r from-[#304d5d] to-[#67cffe] h-24"></div>

                  <div className="p-6 -mt-12 relative">
                    {/* Doctor Avatar */}
                    {doctor.img && getFullImageURL(doctor.img) ? (
                      <img
                        src={getFullImageURL(doctor.img)}
                        alt={doctor.name}
                        className="w-20 h-20 rounded-full border-4 border-white mb-4 object-cover shadow-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full border-4 border-white bg-gradient-to-br from-[#67cffe]/20 to-[#304d5d]/10 mb-4 flex items-center justify-center shadow-lg">
                        <span className="text-2xl font-bold text-[#304d5d]">
                          {doctor.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Doctor Info */}
                    <h3 className="text-xl font-bold text-[#304d5d] mb-3">
                      {doctor.name || "N/A"}
                    </h3>

                    {doctor.doctorType && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(doctor.doctorType) ? (
                            doctor.doctorType.map((type, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 bg-[#67cffe]/10 text-[#304d5d] border border-[#67cffe]/30 px-3 py-1 rounded-full text-xs font-semibold"
                              >
                                <Award size={12} />
                                {type}
                              </span>
                            ))
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-[#67cffe]/10 text-[#304d5d] border border-[#67cffe]/30 px-3 py-1 rounded-full text-xs font-semibold">
                              <Award size={12} />
                              {doctor.doctorType}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {doctor.specialization && (
                      <div className="text-gray-700 mb-3">
                        <p className="text-xs text-gray-600 font-semibold">
                          Specialization:
                        </p>
                        <p className="text-sm font-bold text-[#67cffe]">
                          {doctor.specialization}
                        </p>
                      </div>
                    )}

                    {doctor.chambers && doctor.chambers.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-600 mb-1 font-semibold flex items-center gap-1">
                          <MapPin size={12} />
                          Chamber Locations:
                        </p>
                        <div className="space-y-1">
                          {doctor.chambers.slice(0, 2).map((chamber, idx) => (
                            <div
                              key={idx}
                              className="text-xs text-gray-700 bg-gray-50 p-2 rounded"
                            >
                              <p className="font-semibold">{chamber.name}</p>
                              <p className="text-gray-600">{chamber.address}</p>
                            </div>
                          ))}
                          {doctor.chambers.length > 2 && (
                            <p className="text-xs text-[#67cffe] font-semibold">
                              +{doctor.chambers.length - 2} more
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {doctor.email && (
                      <div className="flex items-center text-gray-700 mb-2">
                        <Mail size={16} className="mr-2 text-[#67cffe]" />
                        <p className="text-sm break-all">{doctor.email}</p>
                      </div>
                    )}

                    {doctor.phone && (
                      <div className="flex items-center text-gray-700 mb-2">
                        <Phone size={16} className="mr-2 text-[#67cffe]" />
                        <p className="text-sm">{doctor.phone}</p>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <button
                        onClick={() =>
                          navigate(`/doctor-profile/${doctor._id}`, {
                            state: { doctor },
                          })
                        }
                        className="bg-gradient-to-r from-[#304d5d] to-[#67cffe] hover:shadow-lg hover:shadow-[#67cffe]/30 text-white font-bold py-2 rounded-lg transition-all duration-300 hover:-translate-y-0.5 text-sm"
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => handleAppointmentClick(doctor)}
                        className="bg-gradient-to-r from-[#67cffe] to-[#304d5d] hover:shadow-lg hover:shadow-[#304d5d]/30 text-white font-bold py-2 rounded-lg transition-all duration-300 hover:-translate-y-0.5 text-sm"
                      >
                        Appointment
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!searched && doctors.length === 0 && (
          <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
            <Search
              size={48}
              className="mx-auto text-[#67cffe] mb-4 animate-float"
            />
            <p className="text-[#304d5d] text-lg font-semibold">
              Loading doctors...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchDoctor;
