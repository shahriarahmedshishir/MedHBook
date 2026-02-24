// Example: How to update components to use JWT-authenticated API

// ❌ OLD WAY (without JWT)
const fetchPrescriptions = async () => {
  const response = await fetch(
    `http://localhost:3000/prescriptions?email=${email}`,
  );
  const data = await response.json();
  setPrescriptions(data);
};

// ✅ NEW WAY (with JWT)
import { authGet } from "../utils/api";

const fetchPrescriptions = async () => {
  try {
    const response = await authGet(`/prescriptions?email=${email}`);
    const data = await response.json();
    setPrescriptions(data);
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    // Handle error (e.g., show error message to user)
  }
};

// ==========================================
// Example: Upload with FormData
// ==========================================

// ❌ OLD WAY
const uploadPrescription = async (formData) => {
  const response = await fetch("http://localhost:3000/prescriptions", {
    method: "POST",
    body: formData,
  });
  const data = await response.json();
  return data;
};

// ✅ NEW WAY
import { authPost } from "../utils/api";

const uploadPrescription = async (formData) => {
  try {
    const response = await authPost("/prescriptions", formData);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error uploading:", error);
    throw error;
  }
};

// ==========================================
// Example: Update User Profile
// ==========================================

// ❌ OLD WAY
const updateProfile = async (email, userData) => {
  const response = await fetch(`http://localhost:3000/user/${email}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
  return response.json();
};

// ✅ NEW WAY
import { authPut } from "../utils/api";

const updateProfile = async (email, userData) => {
  try {
    const response = await authPut(`/user/${email}`, userData);
    return response.json();
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

// ==========================================
// Example: Delete Item
// ==========================================

// ❌ OLD WAY
const deleteReport = async (id) => {
  const response = await fetch(`http://localhost:3000/reports/${id}`, {
    method: "DELETE",
  });
  return response.json();
};

// ✅ NEW WAY
import { authDelete } from "../utils/api";

const deleteReport = async (id) => {
  try {
    const response = await authDelete(`/reports/${id}`);
    return response.json();
  } catch (error) {
    console.error("Error deleting report:", error);
    throw error;
  }
};

// ==========================================
// Example: Complete Component Migration
// ==========================================

// BEFORE:
import { useState, useEffect } from "react";

const Prescriptions = ({ userEmail }) => {
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `http://localhost:3000/prescriptions?email=${userEmail}`,
      );
      const data = await response.json();
      setPrescriptions(data);
    };
    fetchData();
  }, [userEmail]);

  return <div>{/* Render prescriptions */}</div>;
};

// AFTER:
import { useState, useEffect } from "react";
import { authGet } from "../utils/api";

const Prescriptions = ({ userEmail }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await authGet(`/prescriptions?email=${userEmail}`);
        const data = await response.json();
        setPrescriptions(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching prescriptions:", err);
        setError("Failed to load prescriptions");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userEmail]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <div>{/* Render prescriptions */}</div>;
};
