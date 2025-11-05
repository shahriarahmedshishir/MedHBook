import { createBrowserRouter } from "react-router";
import RootLayout from "../Components/Layouts/RootLayout";
import SignUp from "../Pages/SignUp";
import SignIn from "../Pages/SignIn";
const routes = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout/>,
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