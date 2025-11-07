// src/Routes/routes.jsx
import { createBrowserRouter, Navigate } from "react-router-dom"; // <-- should be from react-router-dom, not "react-router"
import RootLayout from "../Components/Layouts/RootLayout";
import SignUp from "../Pages/SignUp";
import SignIn from "../Pages/SignIn";
import PatientHome from "../Pages/PatientHome";
import DoctorHome from "../Pages/DoctorHome";
import PatientDetails from "../Pages/PatientDetails";
import Prescriptions from "../Pages/Presciptions";
import Reports from "../Pages/Reports";

// Example of a fake auth check (replace with your real one)
const isAuthenticated = false; // later, you’ll use Firebase or context here

const routes = createBrowserRouter([
  // Redirect root to either dashboard or signin
  {
    path: "/",
    element: isAuthenticated ? (
      <Navigate to="/patient" replace />
    ) : (
      <Navigate to="/signin" replace />
    ),
  },

  // Public routes
  { path: "/signup", element: <SignUp /> },
  { path: "/signin", element: <SignIn /> },

  // Protected (layout) routes
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { path: "patient", element: <PatientHome /> },
      { path: "patient/prescriptions", element: <Prescriptions /> },
      { path: "patient/reports", element: <Reports /> },
      { path: "doctor", element: <DoctorHome /> },
      { path: "patient-details", element: <PatientDetails /> },
    ],
  },
]);

export default routes;
