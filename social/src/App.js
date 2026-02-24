import "./App.css";
import { Auth, SignUp } from "./pages/Auth/Auth";
import Home from "./pages/Auth/Home/Home";
import Profile from "./pages/Profile/Profile";
import Settings from "./pages/Settings/Settings";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import BirdLogo from "./img/fsm-bird.svg";

const AppFrame = ({ children }) => (
  <div className="App">
    <div className="blur" style={{ top: "-18%", right: "0" }} />
    <div className="blur" style={{ top: "36%", left: "-8rem" }} />

    <div className="fsmBrandBadge">
      <img src={BirdLogo} alt="FSM bird logo" />
      <div>
        <strong>FSM</strong>
        <span>Future Social Media</span>
      </div>
    </div>

    {children}
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
