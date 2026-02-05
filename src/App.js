import "./App.css";
import { Auth, SignUp } from "./pages/Auth/Auth";
import Home from "./pages/Auth/Home/Home";
import Profile from "./pages/Profile/Profile";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div className="App">
              <div className="blur" style={{ top: "-18%", right: "0" }} />
              <div className="blur" style={{ top: "36%", left: "-8rem" }} />
              <Auth />
            </div>
          }
        />

        <Route
          path="/profile"
          element={
            <div className="App">
              <div className="blur" style={{ top: "-18%", right: "0" }} />
              <div className="blur" style={{ top: "36%", left: "-8rem" }} />
              <Profile />
            </div>
          }
        />

        <Route
          path="/home"
          element={
            <div className="App">
              <div className="blur" style={{ top: "-18%", right: "0" }} />
              <div className="blur" style={{ top: "36%", left: "-8rem" }} />
              <Home />
            </div>
          }
        />

        <Route
          path="/signup"
          element={
            <div className="App">
              <div className="blur" style={{ top: "-18%", right: "0" }} />
              <div className="blur" style={{ top: "36%", left: "-8rem" }} />
              <SignUp />
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;