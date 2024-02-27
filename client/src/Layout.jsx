import FooterComp from "./components/FooterComp";

import Header from "./components/Header";
import { Outlet } from "react-router-dom";
function Layout() {
  return (
    <>
      <Header />
      <Outlet />
      <FooterComp />
    </>
  );
}

export default Layout;
