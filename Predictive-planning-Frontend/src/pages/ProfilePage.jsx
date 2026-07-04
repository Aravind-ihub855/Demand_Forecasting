import useAuth from "../hooks/useAuth";

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <section className="stack-panels">
      <article className="panel">
        <h3>Profile</h3>
        <p>Name: {user?.name}</p>
        <p>Email: {user?.email}</p>
        <p>Role: {user?.role}</p>
      </article>
      <article className="panel">
        <h3>Team Access</h3>
        <p>Role-based capabilities and organization membership summary.</p>
      </article>
    </section>
  );
};

export default ProfilePage;
