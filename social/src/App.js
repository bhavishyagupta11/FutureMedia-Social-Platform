import "./App.css";
import { Auth, SignUp } from "./pages/Auth/Auth";
import Home from "./pages/Auth/Home/Home";
import Profile from "./pages/Profile/Profile";
import Settings from "./pages/Settings/Settings";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import TechLogo from "./img/fsm-tech.svg";

const AppFrame = ({ children }) => (
  <div className="App">
    <div className="blur" style={{ top: "-18%", right: "0" }} />
    <div className="blur" style={{ top: "36%", left: "-8rem" }} />

    <div className="appTopBar">
      <div className="fsmBrandBadge">
        <img src={TechLogo} alt="FSM tech logo" />
        <div className="fsmBrandCopy">
          <strong>Future Social Media</strong>
          <span>Connected feeds. Faster signals. Smarter sharing.</span>
        </div>
        <div className="fsmBrandTag">FSM</div>
      </div>
      <div className="fsmBrandGlow" aria-hidden="true" />
    </div>

    <div className="appContent">{children}</div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <AppFrame>
              {localStorage.getItem("userId") ? <Navigate to="/home" replace /> : <Auth />}
            </AppFrame>
          }
        />

        <Route
          path="/profile"
          element={
            <AppFrame>
              <Profile />
            </AppFrame>
          }
        />

        <Route
          path="/home"
          element={
            <AppFrame>
              <Home />
            </AppFrame>
          }
        />

        <Route
          path="/signup"
          element={
            <AppFrame>
              <SignUp />
            </AppFrame>
          }
        />

        <Route
          path="/settings"
          element={
            <AppFrame>
              <Settings />
            </AppFrame>
          }
        />

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
