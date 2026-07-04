import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const HomePage = () => {
  const { user } = useAuth();

  return (
    <section className="card auth-card">
      <h1>Predictive Planning</h1>
      <p>
        A modern demand intelligence workspace with secure authentication and role-based
        access.
      </p>
      {!user ? (
        <div className="row">
          <Link to="/login" className="soft-btn">
            Login
          </Link>
          <Link to="/register" className="soft-btn">
            Register
          </Link>
        </div>
      ) : (
        <div className="row">
          <Link to="/dashboard" className="soft-btn">
            Enter workspace
          </Link>
          {user.role === "admin" && <Link to="/admin">Admin</Link>}
        </div>
      )}
    </section>
  );
};

export default HomePage;
