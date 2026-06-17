import logo from "../assets/Mt's logo.jpeg";

const QUICK_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Products", href: "#products" },
  { label: "About", href: "#about" },
  { label: "Order", href: "#order" },
];

export default function Footer({ business }) {
  return (
    <footer id="contact">
      <div className="footer-inner">
        <div className="footer-brand">
          <img src={logo} alt="MT's Foods" />
          <strong>MT's Foods</strong>
          <p>Authentic papads & snacks,<br />made in our own factory.</p>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            {QUICK_LINKS.map((l) => (
              <li key={l.label}><a href={l.href}>{l.label}</a></li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contact Us</h4>
          <p>{business?.phone || "9326455333"}</p>
          <p>Orders by phone call</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} MT's Foods. All rights reserved. Made with love.</p>
      </div>
    </footer>
  );
}
