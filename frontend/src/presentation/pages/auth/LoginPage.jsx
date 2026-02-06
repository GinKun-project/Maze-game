import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout.jsx";
import TextInput from "../../components/auth/TextInput.jsx";
import PasswordInput from "../../components/auth/PasswordInput.jsx";
import loginUser from "../../../domain/usecases/loginUser.js";

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
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
      const user = await loginUser(form.username, form.password);
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
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="LOG IN"
      footer={
        <p>
          Don&apos;t have an account? <Link to="/signup">Sign up</Link>
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
          {loading ? "LOGGING IN..." : "LOG IN"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
