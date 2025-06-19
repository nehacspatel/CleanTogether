import '../Styles/Volunteer.css';
function Volunteer() {
  return (
    <div className="page">
      <h2>Join as a Volunteer</h2>
      <form>
        <label>Full Name: <input type="text" /></label><br />
        <label>Email: <input type="email" /></label><br />
        <label>Preferred Beach: <input type="text" /></label><br />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}
export default Volunteer;
