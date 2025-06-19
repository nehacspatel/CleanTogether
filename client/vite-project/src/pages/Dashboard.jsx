import Navbar from '/components/Navbar';

export default function Dashboard() {
  return (
    <>
      <Navbar />
      <div className="container">
        <h2>Welcome to CleanTogether</h2>
        <p>Manage events, log waste, and grow as an eco warrior.</p>
      </div>
    </>
  );
}
