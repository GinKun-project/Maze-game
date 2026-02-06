import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout.jsx";
import TextInput from "../../components/auth/TextInput.jsx";
import PasswordInput from "../../components/auth/PasswordInput.jsx";
import registerUser from "../../../domain/usecases/registerUser.js";

const SignupPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await registerUser(
        form.username,
        form.email,
        form.password
      );
      if (user?.token) {
        localStorage.setItem("maze_auth_token", user.token);
        localStorage.setItem(
          "maze_auth_user",
          JSON.stringify({
            id: user.id,
            username: user.username,
            email: user.email,
          })
        );
      }
      navigate("/home");
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="SIGN UP"
      footer={
        <p>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="auth-form-inner">
        <TextInput
          name="username"
          label="USER"
          placeholder="ENTER NAME"
          value={form.username}
          onChange={handleChange}
          required
        />
        <TextInput
          name="email"
          label="MAIL"
          placeholder="ENTER SIGNAL"
          value={form.email}
          onChange={handleChange}
          type="email"
          required
        />
        <PasswordInput
          name="password"
          label="PASS"
          placeholder="ENTER CODE"
          value={form.password}
          onChange={handleChange}
          required
        />
        {error ? <p className="auth-error">{error}</p> : null}
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? "SIGNING UP..." : "SIGN UP"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default SignupPage;
