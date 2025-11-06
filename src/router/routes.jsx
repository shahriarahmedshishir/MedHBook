// src/Routes/routes.jsx
import { createBrowserRouter, Navigate } from "react-router";
import RootLayout from "../Components/Layouts/RootLayout";
import SignUp from "../Pages/SignUp";
import SignIn from "../Pages/SignIn";
import PatientHome from "../Pages/PatientHome";
import DoctorHome from "../Pages/DoctorHome";
import Prescriptions from "../Pages/Presciptions";
import Reports from "../Pages/Reports";

const routes = createBrowserRouter([
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/signin",
    element: <SignIn />,
  },
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/patient" replace />,
      },
      {
        path: "/patient",
        element: <PatientHome />,
      },
      // Add the new nested routes under /patient
      {
        path: "/patient/prescriptions", // Full path will be /patient/prescriptions
        element: <Prescriptions />,
      },
      {
        path: "/patient/reports", // Full path will be /patient/reports
        element: <Reports />,
      },
      {
        path: "/doctor",
        element: <DoctorHome />,
      },
    ],
  },
]);

export default routes;
