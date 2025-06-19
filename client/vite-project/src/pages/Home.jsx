// src/pages/Home.jsx
import '../Styles/Home.css';

function Home() {
  return (
    <section className="hero">
      <div className="hero-text">
        <h1>CLEAN SHORES<br />MUMBAI</h1>
        <p>Fighting marine pollution and waste along Mumbai’s shoreline</p>
      </div>
      <div className="hero-image">
        <img src="/beach-cleanup.jpg" alt="Beach Cleanup" />
      </div>
    </section>
  );
}

export default Home;
