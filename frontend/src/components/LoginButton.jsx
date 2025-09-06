import React from "react";

export default function LoginButton() {
  const handleLogin = () => {
    window.location.href = "http://localhost:5000/auth/login";
  };

  return <button onClick={handleLogin}>Login with Spotify</button>;
}