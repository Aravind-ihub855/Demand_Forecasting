import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-page">
      <section className="card auth-card">
        <h2>Create account</h2>
        <p className="subtle">Create your account and start planning smarter.</p>
        <form onSubmit={onSubmit} className="form">
          <input
            name="name"
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={onChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={onChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password (min 8 chars)"
            value={form.password}
            onChange={onChange}
            required
          />
          {error && <p className="error">{error}</p>}
          <button type="submit">Create account</button>
        </form>
        <p className="subtle">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </div>
  );
};

export default RegisterPage;
