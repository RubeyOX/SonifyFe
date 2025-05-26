import { React, useState } from "react";
import "./Login.css";
import { AlignCenter, AlignCenterIcon, AlignVerticalDistributeCenter, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../utils/AuthenticationUtils";
import authApi from "../../../api/authenticationAPI";
import ErrorIcon from '@mui/icons-material/Error';
export default function Login() {
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

  const login = async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    let loginPacket = {
      email: email,
      password: password,
    };
    setEmailError(false);
    setPasswordError(false);
    setErrorMessageDisplay(false);

    try {
      let Response = await authApi.login(loginPacket);
      console.log("Response: ", Response);
      setToken(Response.data.token);
      console.log("Login success.");
      navigate("/");
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
    <div className="login-layout">
      <div className="login-container">
        <img src="/Sonify-logo.png" alt="logo" />
        <h1>Login to continue</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            login();
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
            <ErrorIcon/> <p style={{transform:"translateY(3px)"}}>{errorMessage}</p>
          </div>
          <label htmlFor="email">Email address</label>
          <input
            type="text"
            style={{ border: emailError ? "1px solid  #E57373 " : "none" }}
            id="email"
            placeholder="Email address"
          />
          <label htmlFor="password">Password</label>
          <input
            type="password"
            style={{ border: passwordError ? "1px solid  #E57373 " : "none" }}
            id="password"
            placeholder="Password"
          />
          <p onClick={() => navigate("/forgot-pass")} className="forgot-pass">
            Forgot Password?
          </p>
          <div className="or-container">
            <span>OR</span>
          </div>
          <button
            className="login-with"
            onClick={() => console.log("Feature comming soon.")}
          >
            Login with Facebook
          </button>
          <button
            className="login-with"
            onClick={() => console.log("Feature comming soon.")}
          >
            Login with Google
          </button>
          <div className="remember-me-container">
            <label htmlFor="remember-me">Remember Me</label>
            <input type="checkbox" id="remember-me" />
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              login();
            }}
            className="login"
          >
            Login
          </button>
          <div className="create-account">
            <p>Don't have an account?</p>
            <p
              onClick={(e) => {
                e.preventDefault();
                navigate("/signup");
              }}
              className="create-one"
            >
              Create one{" "}
              <span>
                <ChevronRight />
              </span>
            </p>
          </div>
        </form>
      </div>
      <p className="allright">All rights reserved © Snoify, 2025</p>
    </div>
  );
}
