import Sidebar from "../components/Sidebar";

function AdminDashboard() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div>
        <h1>Dashboard Admin</h1>
      </div>
    </div>
  );
}

export default AdminDashboard;