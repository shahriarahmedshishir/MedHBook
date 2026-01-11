// src/Routes/routes.jsx
import { createBrowserRouter, Navigate } from "react-router-dom"; // <-- should be from react-router-dom, not "react-router"
import RootLayout from "../Components/Layouts/RootLayout";
import PublicLayout from "../Components/Layouts/PublicLayout";
import SignUp from "../Pages/SignUp";
import SignIn from "../Pages/SignIn";
import PatientHome from "../Pages/PatientHome";
import DoctorHome from "../Pages/DoctorHome";
import PatientDetails from "../Pages/PatientDetails";
import Prescriptions from "../Pages/Presciptions";
import Reports from "../Pages/Reports";
import EditDoctorProfile from "../Pages/EditDoctorProfile";
import EditUserProfile from "../Pages/EditUserProfile";
import DoctorProfile from "../Pages/DoctorProfile";
import PrivateRouter from "../Components/PrivateRouter/PrivateRoter";
import PatientRouter from "../Components/PrivateRouter/PatientRouter";
import Xrays from "../Pages/Xrays";
import SearchDoctor from "../Pages/SearchDoctor";
import Chat from "../Pages/Chat";
import Blogs from "../Pages/Blogs";
import CreateBlog from "../Pages/CreateBlog";
import BlogDetail from "../Pages/BlogDetail";

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
  {
    path: "/search-doctor",
    element: (
      <PublicLayout>
        <SearchDoctor />
      </PublicLayout>
    ),
  },
  {
    path: "/doctor-profile/:id",
    element: (
      <PublicLayout>
        <DoctorProfile />
      </PublicLayout>
    ),
  },
  {
    path: "/chat",
    element: (
      <PublicLayout>
        <Chat />
      </PublicLayout>
    ),
  },
  {
    path: "/blogs",
    element: (
      <PublicLayout>
        <Blogs />
      </PublicLayout>
    ),
  },
  {
    path: "/blogs/:id",
    element: (
      <PublicLayout>
        <BlogDetail />
      </PublicLayout>
    ),
  },
  {
    path: "/create-blog",
    element: (
      <PrivateRouter>
        <CreateBlog />
      </PrivateRouter>
    ),
  },

  // Protected (layout) routes
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "patient",
        element: (
          <PatientRouter>
            <PatientHome />
          </PatientRouter>
        ),
      },
      {
        path: "patient/prescriptions",
        element: (
          <PatientRouter>
            <Prescriptions />
          </PatientRouter>
        ),
      },
      {
        path: "patient/reports",
        element: (
          <PatientRouter>
            <Reports />
          </PatientRouter>
        ),
      },
      {
        path: "patient/xrays",
        element: (
          <PatientRouter>
            <Xrays />
          </PatientRouter>
        ),
      },
      {
        path: "doctor",
        element: (
          <PrivateRouter>
            <DoctorHome />
          </PrivateRouter>
        ),
      },
      {
        path: "patient-details",
        element: (
          <PrivateRouter>
            <PatientDetails />
          </PrivateRouter>
        ),
      },
      {
        path: "/edit-doctor-profile",
        element: <EditDoctorProfile />,
      },
      {
        path: "/edit-user-profile",
        element: (
          <PatientRouter>
            <EditUserProfile />
          </PatientRouter>
        ),
      },
    ],
  },
]);

export default routes;
