import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // install with the npm package; npm install jwt-decode


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const authServiceURL = "https://tigertix-user-authentication-17z1.onrender.com/";

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch(`${authServiceURL}api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        const token = data.token;

        // Decode JWT and check expiration
        const payload = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (payload.exp < currentTime) {
          setMessage("Session expired, please log in again.");
          return;
        }

        // Store token and email in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("userEmail", payload.email);

        navigate("/"); // redirect to events page
      } else {
        setMessage(data.error || "Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error. Try again later.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      <h2>Login to TigerTix</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br /><br />
        <button type="submit">Login</button>
      </form>
      <p style={{ color: "red" }}>{message}</p>
      <p>
        Don’t have an account? <a href="/register">Register</a>
      </p>
      {/* Add Home Button */}
      <p>
         <a href="/" style={{ textDecoration: "none" }}>
            <button type="button">Home</button>
         </a>
      </p>
      <img
          src="/tigerpaw.png"
          alt="Clemson Tiger Paw logo"
          className="ClemsonLogo"
        />
    </div>
  );
}
