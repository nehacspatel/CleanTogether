function Donate() {
  return (
    <div className="page">
      <h2>Support Our Cause</h2>
      <form>
        <label>Name: <input type="text" /></label><br />
        <label>Email: <input type="email" /></label><br />
        <label>Amount: <input type="number" /></label><br />
        <button type="submit">Donate</button>
      </form>
    </div>
  );
}
export default Donate;
