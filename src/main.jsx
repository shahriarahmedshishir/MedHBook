import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
<<<<<<< HEAD

import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

import App from "./App.jsx";
import AuthProvider from "./Components/Context/AuthProvider.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App></App>,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />,{" "}
    </AuthProvider>
=======
import { RouterProvider } from "react-router/dom";
import routes from "./router/routes.jsx";
import "./App.css";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={routes} />
>>>>>>> feature-branch
  </StrictMode>
);
