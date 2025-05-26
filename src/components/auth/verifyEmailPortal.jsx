import React, { useEffect, useState } from 'react'
import { useAuth } from '../../utils/AuthenticationUtils'
import authApi from '../../api/authenticationAPI'
import { useParams, useNavigate } from 'react-router-dom';

function VerifyEmailPortal() {
    const [timer, setTimer] = useState(60);
    const {token} = useParams();
    const navigate = useNavigate();

    setInterval(()=>{
        setTimer(timer - 1);
    }, 1000)
    const verifyEmailByToken = async () => {
        try {
            await authApi.verifyEmail({token});
            console.log("Email verified successfully.");
            navigate("/login");
        } catch (e) {
            alert("Email verification failed. Please try again later.");
            // navigate("/signup");
            console.log("Error: ", e);
        }
    }
    useEffect(() => {
        verifyEmailByToken();
    },[]);
  return (
    <div>Please wait while we trying to verify your email. <br />{timer}s until timeout.</div>
  )
}

export default VerifyEmailPortal