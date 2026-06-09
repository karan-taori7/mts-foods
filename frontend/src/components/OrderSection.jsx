export default function OrderSection({ products, form, setForm, submitting, onSubmit, orderTotal }) {
  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function adjustQty(delta) {
    setForm((f) => ({ ...f, quantity: Math.max(1, Number(f.quantity) + delta) }));
  }

  return (
    <section className="order-section" id="order">
      <div className="order-copy">
        <p className="section-label">Quick Order</p>
        <h2>Bring MT's Foods Home</h2>
        <span>
          Select your favourite product, enter your details, and we'll confirm
          your order by phone.
        </span>
        {orderTotal !== null && (
          <div className="order-preview">
            <span>Estimated Total</span>
            <strong>₹{orderTotal}</strong>
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="order-form">
        <div className="form-field">
          <label htmlFor="customer_name">Your Name</label>
          <input
            id="customer_name"
            name="customer_name"
            placeholder="e.g. Priya Sharma"
            value={form.customer_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="phone_number">Phone Number</label>
          <input
            id="phone_number"
            name="phone_number"
            placeholder="10-digit number"
            value={form.phone_number}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="product_name">Product</label>
          <select
            id="product_name"
            name="product_name"
            value={form.product_name}
            onChange={handleChange}
            required
          >
            <option value="">Select a product</option>
            {products.map((p) => (
              <option key={p.id} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label>Quantity</label>
          <div className="qty-row">
            <button type="button" className="qty-btn" onClick={() => adjustQty(-1)}>−</button>
            <input
              name="quantity"
              type="number"
              min="1"
              value={form.quantity}
              onChange={handleChange}
              required
            />
            <button type="button" className="qty-btn" onClick={() => adjustQty(1)}>+</button>
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={submitting}>
          {submitting ? "Placing order…" : "Confirm Order →"}
        </button>
      </form>
    </section>
  );
}
