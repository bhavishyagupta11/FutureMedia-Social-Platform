import React, { useEffect, useState } from "react";
import "./Auth.css";
import Logo from "../../img/logo.png";
import { Link, useNavigate } from "react-router-dom";

// Top-level Auth component used on the "/" route
const Auth = () => {
  return (
    <div className="Auth">
      <LogIn />
    </div>
  );
};

// Login component
function LogIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("userId")) {
      localStorage.removeItem("userId");
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent the default form submission

    const formData = {
      username: username,
      password: password,
    };

    console.log("FormData", formData);

    try {
      const response = await fetch("http://localhost:8080/api/user/login", {
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
        localStorage.setItem("followersList", resp.data.followersList);
        localStorage.setItem(
          "name",
          `${resp.data.firstName} ${resp.data.lastName}`
        );
        navigate("/home");
        console.log("User logged in successfully", resp.data);
      } else {
        const errorData = await response.json();
        console.error("Error:", errorData.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="a-right">
      <form className="infoForm authForm" onSubmit={handleLogin}>
        <h3>Log In</h3>

        <div>
          <input
            type="text"
            placeholder="Username"
            className="infoInput"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div>
          <input
            type="password"
            className="infoInput"
            placeholder="Password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <span style={{ fontSize: "12px" }}>
            Don't have an account? <Link to={"/signup"}>Sign up</Link>
          </span>
          <button className="button infoButton">Login</button>
        </div>
      </form>
    </div>
  );
}

// Wrapper for the SignUp flow
const SignUp = () => {
  useEffect(() => {
    if (localStorage.getItem("userId")) {
      localStorage.removeItem("userId");
    }
  }, []);

  return <Authenticate />;
};

// Actual SignUp form component
function Authenticate() {
  const [username, setUsername] = useState("");
  const [lastname, setLastname] = useState("");
  const [firstName, setFirstName] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (event) => {
    event.preventDefault(); // Prevent the default form submission

    const formData = {
      firstName: firstName,
      lastName: lastname,
      username: username,
      password: password,
    };

    console.log("FormData", formData);

    try {
      const response = await fetch("http://localhost:8080/api/user/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log("User signed up successfully");
        // Redirect or show success message
      } else {
        const errorData = await response.json();
        console.error("Error:", errorData.error);
        // Handle error (e.g., show error message to the user)
      }
    } catch (error) {
      console.error("Error:", error);
      // Handle error (e.g., show error message to the user)
    }
  };

  return (
    <div className="a-right">
      <form className="infoForm authForm" onSubmit={handleSignup}>
        <h3>Sign up</h3>

        <div>
          <input
            type="text"
            placeholder="First Name"
            className="infoInput"
            name="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Last Name"
            className="infoInput"
            name="lastName"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
          />
        </div>

        <div>
          <input
            type="text"
            className="infoInput"
            name="username"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div>
          <input
            type="password"
            className="infoInput"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            className="infoInput"
            name="confirmPassword"
            placeholder="Confirm Password"
          />
        </div>

        <div>
          <span style={{ fontSize: "12px" }}>
            Already have an account? <Link to={"/"}>Log in</Link>
          </span>
        </div>

        <button className="button infoButton">Signup</button>
      </form>
    </div>
  );
}

export { Auth, SignUp };