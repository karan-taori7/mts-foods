import masala from "../assets/RajasthaniMasalaPapad.jpeg";

export default function About() {
  return (
    <section className="about-section" id="about">
      <div className="about-content">
        <p className="section-label">Our Story</p>
        <h2>From a Home Kitchen<br />to Our Own Factory</h2>
        <p className="about-text">
          MT's Foods started as a small home kitchen operation in Nagpur, built
          on a passion for authentic Indian flavours. What began with traditional
          recipes passed down through the family grew into something bigger.
        </p>
        <p className="about-text">
          Today we manufacture in our own factory — with the same recipes, the
          same care, and an unwavering focus on quality. Our specialities are
          Garlic Papad and Rajasthani Masala Papad, crafted to deliver the
          authentic taste Nagpur knows and loves.
        </p>
        <div className="about-highlights">
          <div>
            <strong>Own Factory</strong>
            <span>Nagpur made</span>
          </div>
          <div>
            <strong>Garlic & Masala</strong>
            <span>Our speciality</span>
          </div>
          <div>
            <strong>Since Day 1</strong>
            <span>Same recipes</span>
          </div>
        </div>
      </div>
      <div className="about-image">
        <img src={masala} alt="MT's Foods — Rajasthani Masala Papad" />
      </div>
    </section>
  );
}
