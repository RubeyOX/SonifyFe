import { ChevronRight } from "lucide-react";
import { React, useEffect, useState } from "react";
import "./Signup.css";
import { useAuth } from "../../../utils/AuthenticationUtils";
import authApi from "../../../api/authenticationAPI";
import ErrorIcon from "@mui/icons-material/Error";
import { useNavigate } from "react-router-dom";
export default function Signup() {
  const navigate = useNavigate();
  const {
    setToken,
    error: authProviderError,
    isLoading: authProviderLoading,
  } = useAuth();
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorMessageDisplay, setErrorMessageDisplay] = useState(false);
  useEffect(() => {
    console.log("Checking for debouncer.")
    if(localStorage.getItem('emailVerifyRequested') == 'true'){
      localStorage.setItem('emailVerifyRequested', false);
      console.log("Reset debounce for email verification request successfully.")
    }
  },[])
  const signup = async () => {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    let signupPacket = {
      username: name,
      email: email,
      password: password,
      confirmPassword: password,
    };
    setEmailError(false);
    setPasswordError(false);
    setErrorMessageDisplay(false);
    
    try {
      let Response = await authApi.signup(signupPacket);
      setToken(Response.token);
      console.log("Signup success.");
      navigate("/verifyemail/"+email);
    } catch (e) {
      console.log("Error: ", e);
      if (e.errors) {
        e?.errors.forEach((err) => {
          if (err?.field == "email") {
            setEmailError(true);
            setErrorMessage("Fields can't be empty.");
            setErrorMessageDisplay(true);
          } else if (err?.field == "password") {
            setPasswordError(true);
            setErrorMessage("Fields can't be empty.");
            setErrorMessageDisplay(true);
          }
        });
      } else {
        if (e.message == "Invalid credentials.") {
          setErrorMessage("Please check your email & password");
          setErrorMessageDisplay(true);
        }
      }
    }
  };

  return (
    <div className="signup-layout">
      <div className="signup-container">
        <img src="/Sonify-logo.png" alt="logo" />
        <h1>Sign up</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            signup();
          }}
          className="form-container"
        >
          <div
            style={{
              marginTop: "10px",
              marginBottom: "10px",
              color: "white",
              fontWeight: "bold",
              backgroundColor: "#E57373",
              padding: "10px",
              borderRadius: "5px",
              display: "flex",
              gap: "10px",
              visibility: errorMessageDisplay ? "visible" : "hidden",
            }}

          >
            <ErrorIcon />{" "}
            <p style={{ transform: "translateY(3px)" }}>{errorMessage}</p>
          </div>
          <label htmlFor="name">Your name</label>
          <input type="text" id="name" placeholder="Your name" />
          <label
            htmlFor="email"
            style={{ border: emailError ? "1px solid  #E57373 " : "none" }}
          >
            Email address
          </label>
          <input type="text" id="email" placeholder="Email address" />
          <label htmlFor="password">Password</label>
          <input
            type="password"
            style={{ border: passwordError ? "1px solid  #E57373 " : "none" }}
            id="password"
            placeholder="Password"
          />
          <p className="forgot-pass">Forgot Password?</p>
          <div className="or-container">
            <span>OR</span>
          </div>
          <button className="signup-with">Signup with Facebook</button>
          <button className="signup-with">Signup with Google</button>
          <div className="remember-me-container">
            <label htmlFor="remember-me">Remember Me</label>
            <input type="checkbox" id="remember-me" />
          </div>
          <button className="signup" onClick={() => signup}>
            Signup
          </button>
          <div className="create-account">
            <p>Already have an account?</p>
            <p onClick={() => navigate("/login")} className="create-one">
              Log in{" "}
              <span>
                <ChevronRight />
              </span>
            </p>
          </div>
        </form>
      </div>
      <p className="allright">All rights reserved @ Snoify,2025</p>
    </div>
  );
}
