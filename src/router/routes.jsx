import { createBrowserRouter } from "react-router";
import RootLayout from "../Components/Layouts/RootLayout";
import SignUp from "../Pages/SignUp";
import SignIn from "../Pages/SignIn";
import PatientHome from "../Pages/PatientHome";
import DoctorHome from "../Pages/DoctorHome";
const routes = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout/>,
    children:[
        {
          path:"/patient-home",
          element:<PatientHome/>
        },
        {
            path:"/",
            element: <DoctorHome/>
        }
    ]
  },
  {
    path: "/signup",
    element: <SignUp/>,
  },
  {
    path: "/signin",
    element: <SignIn/>,
  }
]);

export default routes;