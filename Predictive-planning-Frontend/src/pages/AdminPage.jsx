import { useEffect, useState } from "react";
import http from "../api/http";

const AdminPage = () => {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await http.get("/auth/admin");
        setMessage(data.message);
      } catch (error) {
        setMessage(error.response?.data?.message || "Access failed");
      }
    };

    load();
  }, []);

  return (
    <section className="stack-panels">
      <article className="panel">
      <h2>Admin Page</h2>
      <p>{message}</p>
      <p>This route is protected by role-based authorization.</p>
      </article>
    </section>
  );
};

export default AdminPage;
