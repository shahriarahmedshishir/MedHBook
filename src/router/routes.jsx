import { createBrowserRouter } from "react-router";
import RootLayout from "../Components/Layouts/RootLayout";
import SignUp from "../Pages/SignUp";
import SignIn from "../Pages/SignIn";
import PatientHome from "../Pages/PatientHome";
import DoctorHome from "../Pages/DoctorHome";
import AllPatients from "../Pages/AllPatients";
import ViewReport from "../Pages/ViewReport";
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
        },
        {
          path:"/all-patients",
          element:<AllPatients/>
        },
        {
          path:"/report",
          element: <ViewReport/>
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