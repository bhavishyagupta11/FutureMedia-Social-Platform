import React, { useEffect, useState } from "react";
import "./Auth.css";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/api";
import BirdLogo from "../../img/fsm-bird.svg";

const Auth = () => {
  return (
    <div className="Auth">
      <LogIn />
    </div>
  );
};

const AuthBrand = ({ title, subtitle }) => {
  return (
    <div className="authBrandCard">
      <div className="brandTop">
        <img src={BirdLogo} alt="FSM bird logo" className="authBirdLogo" />
        <div>
          <h1>FSM</h1>
          <p>Future Social Media</p>
        </div>
      </div>
      <h2>{title}</h2>
      <p className="brandSubtitle">{subtitle}</p>
      <div className="authStats">
        <div>
          <strong>2M+</strong>
          <span>Daily Vibes</span>
        </div>
        <div>
          <strong>860K+</strong>
          <span>Creators</span>
        </div>
        <div>
          <strong>150+</strong>
          <span>Countries</span>
        </div>
      </div>
    </div>
  );
};

function LogIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("userId")) {
      localStorage.removeItem("userId");
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const normalizedUsername = username.trim();
    if (!normalizedUsername || !password) {
      setError("Username and password are required.");
      return;
    }

    setIsSubmitting(true);

    const formData = {
      username: normalizedUsername,
      password,
    };

    try {
      const response = await apiFetch("/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const resp = await response.json();
        localStorage.setItem("userId", resp.data._id);
        localStorage.setItem("image", resp.data.img);
        localStorage.setItem(
          "followersList",
          JSON.stringify(resp.data.followersList || [])
        );
        localStorage.setItem(
          "name",
          `${resp.data.firstName} ${resp.data.lastName}`
        );
        navigate("/home");
      } else {
        let message = "Login failed. Please try again.";
        try {
          const errorData = await response.json();
          message = errorData?.error || message;
        } catch (_) {}
        setError(message);
      }
    } catch (apiError) {
      setError("Unable to reach server. Please check backend connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="authShell">
      <AuthBrand
        title="Welcome Back"
        subtitle="Catch up with your network, share your story, and keep your world in motion."
      />
      <div className="a-right">
        <form className="infoForm authForm" onSubmit={handleLogin}>
          <h3>Log In</h3>
          <p className="authHint">Log in to continue your FSM journey.</p>

          <div className="inputGroup">
            <label htmlFor="login-username">Username</label>
            <input
              id="login-username"
              type="text"
              placeholder="@username"
              className="infoInput"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="inputGroup">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="infoInput"
              placeholder="Enter your password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="authFooterRow">
            <span className="switchAuthText">
              New on FSM? <Link to={"/signup"}>Create account</Link>
            </span>
            <button className="button infoButton" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </div>
          {error ? <div className="authError">{error}</div> : null}
        </form>
      </div>
    </div>
  );
}

const SignUp = () => {
  useEffect(() => {
    if (localStorage.getItem("userId")) {
      localStorage.removeItem("userId");
    }
  }, []);

  return <Authenticate />;
};

function Authenticate() {
  const [username, setUsername] = useState("");
  const [lastname, setLastname] = useState("");
  const [firstName, setFirstName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (event) => {
    event.preventDefault();
    setError("");

    const payload = {
      firstName: firstName.trim(),
      lastName: lastname.trim(),
      username: username.trim(),
      password,
    };

    if (!payload.firstName || !payload.lastName || !payload.username || !payload.password) {
      setError("All fields are required.");
      return;
    }

    if (payload.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (payload.password !== confirmPassword) {
      setError("Password and confirm password do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiFetch("/api/user/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const loginResponse = await apiFetch("/api/user/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: payload.username,
            password: payload.password,
          }),
        });

        if (loginResponse.ok) {
          const resp = await loginResponse.json();
          localStorage.setItem("userId", resp.data._id);
          localStorage.setItem("image", resp.data.img);
          localStorage.setItem(
            "followersList",
            JSON.stringify(resp.data.followersList || [])
          );
          localStorage.setItem(
            "name",
            `${resp.data.firstName} ${resp.data.lastName}`
          );
          navigate("/home");
          return;
        }

        navigate("/");
      } else {
        let message = "Signup failed. Please try again.";
        try {
          const errorData = await response.json();
          message = errorData?.error || message;
        } catch (_) {}
        setError(message);
      }
    } catch (apiError) {
      setError("Unable to reach server. Please check backend connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="authShell">
      <AuthBrand
        title="Start Your Story"
        subtitle="Join creators, friends, and communities that make every day feel alive."
      />
      <div className="a-right">
        <form className="infoForm authForm" onSubmit={handleSignup}>
          <h3>Create Account</h3>
          <p className="authHint">Build your profile and start sharing in seconds.</p>

          <div className="splitInput">
            <div className="inputGroup">
              <label htmlFor="signup-firstname">First Name</label>
              <input
                id="signup-firstname"
                type="text"
                placeholder="First Name"
                className="infoInput"
                name="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="inputGroup">
              <label htmlFor="signup-lastname">Last Name</label>
              <input
                id="signup-lastname"
                type="text"
                placeholder="Last Name"
                className="infoInput"
                name="lastName"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
              />
            </div>
          </div>

          <div className="inputGroup">
            <label htmlFor="signup-username">Username</label>
            <input
              id="signup-username"
              type="text"
              className="infoInput"
              name="username"
              placeholder="@username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="splitInput">
            <div className="inputGroup">
              <label htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                type="password"
                className="infoInput"
                name="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="inputGroup">
              <label htmlFor="signup-confirm-password">Confirm Password</label>
              <input
                id="signup-confirm-password"
                type="password"
                className="infoInput"
                name="confirmPassword"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="authFooterRow">
            <span className="switchAuthText">
              Already on FSM? <Link to={"/"}>Log in</Link>
            </span>
            <button className="button infoButton" disabled={isSubmitting}>
              {isSubmitting ? "Signing up..." : "Sign up"}
            </button>
          </div>
          {error ? <div className="authError">{error}</div> : null}
        </form>
      </div>
    </div>
  );
}

export { Auth, SignUp };
