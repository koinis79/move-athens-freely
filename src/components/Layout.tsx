import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import ChatLauncher from "./chat/ChatLauncher";
import CookieConsent from "./CookieConsent";

const Layout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ChatLauncher />
      <CookieConsent />
    </div>
  );
};

export default Layout;
