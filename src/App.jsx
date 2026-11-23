import { useMemo, useState } from "react";

const PLANS = {
  Basic: { price: 999, perks: ["Gym floor access", "Locker room", "1 fitness assessment"] },
  Standard: { price: 1799, perks: ["Everything in Basic", "Group classes (yoga, Zumba)", "Steam room"] },
  Premium: { price: 2999, perks: ["Everything in Standard", "2 personal-training sessions / month", "Diet consultation"] },
};
const DURATIONS = { 1: 0, 3: 10, 6: 15, 12: 20 }; // months -> % discount
const GOALS = ["Weight Loss", "Muscle Gain", "General Fitness", "Flexibility", "Stamina"];

const initialForm = {
  name: "", email: "", phone: "", age: "", gender: "",
  height: "", weight: "", plan: "", duration: "", startDate: "",
  goals: [], terms: false,
};

function validate(f) {
  const e = {};
  if (!f.name.trim()) e.name = "Full name is required.";
  else if (!/^[A-Za-z][A-Za-z .'-]{1,49}$/.test(f.name.trim()))
    e.name = "Name must be 2–50 letters (no numbers or special characters).";

  if (!f.email.trim()) e.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim()))
    e.email = "Enter a valid email address (e.g. name@example.com).";

  if (!f.phone.trim()) e.phone = "Phone number is required.";
  else if (!/^[6-9]\d{9}$/.test(f.phone.trim()))
    e.phone = "Enter a valid 10-digit Indian mobile number (starts with 6–9).";

  if (f.age === "") e.age = "Age is required.";
  else if (!/^\d+$/.test(f.age) || Number(f.age) < 16 || Number(f.age) > 80)
    e.age = "Age must be a whole number between 16 and 80.";

  if (!f.gender) e.gender = "Select a gender.";

  if (f.height === "") e.height = "Height is required.";
  else if (!(Number(f.height) >= 100 && Number(f.height) <= 250))
    e.height = "Height must be between 100 and 250 cm.";

  if (f.weight === "") e.weight = "Weight is required.";
  else if (!(Number(f.weight) >= 30 && Number(f.weight) <= 250))
    e.weight = "Weight must be between 30 and 250 kg.";

  if (!f.plan) e.plan = "Select a membership plan.";
  if (!f.duration) e.duration = "Select a duration.";

  if (!f.startDate) e.startDate = "Select a start date.";
  else {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const max = new Date(today); max.setDate(max.getDate() + 60);
    const d = new Date(f.startDate);
    if (d < today) e.startDate = "Start date cannot be in the past.";
    else if (d > max) e.startDate = "Start date must be within the next 60 days.";
  }

  if (f.goals.length === 0) e.goals = "Choose at least one fitness goal.";
  if (!f.terms) e.terms = "You must accept the terms and conditions.";
  return e;
}

function Field({ label, error, hint, children }) {
  return (
    <div className={`field ${error ? "invalid" : ""}`}>
      <label>{label}</label>
      {children}
      {hint && !error && <small className="hint">{hint}</small>}
      {error && <small className="error" role="alert">⚠ {error}</small>}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function App() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [success, setSuccess] = useState(false);

  const bmi = useMemo(() => {
    const h = Number(form.height) / 100, w = Number(form.weight);
    if (!h || !w || h < 1 || w < 30) return null;
    const v = w / (h * h);
    const cat = v < 18.5 ? "Underweight" : v < 25 ? "Normal" : v < 30 ? "Overweight" : "Obese";
    return { value: v.toFixed(1), cat };
  }, [form.height, form.weight]);

  const pricing = useMemo(() => {
    if (!form.plan || !form.duration) return null;
    const months = Number(form.duration);
    const gross = PLANS[form.plan].price * months;
    const disc = DURATIONS[months];
    const discount = Math.round((gross * disc) / 100);
    const net = gross - discount;
    const gst = Math.round(net * 0.18);
    return { gross, disc, discount, net, gst, total: net + gst };
  }, [form.plan, form.duration]);

  const update = (next) => {
    setForm(next);
    if (submitted || Object.keys(touched).length) setErrors(validate(next));
  };

  const handleChange = (ev) => {
    const { name, value, type, checked } = ev.target;
    update({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const toggleGoal = (g) => {
    const goals = form.goals.includes(g) ? form.goals.filter((x) => x !== g) : [...form.goals, g];
    setTouched({ ...touched, goals: true });
    update({ ...form, goals });
  };

  const handleBlur = (ev) => {
    setTouched({ ...touched, [ev.target.name]: true });
    setErrors(validate(form));
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = validate(form);
    setErrors(e);
    setSubmitted(true);
    if (Object.keys(e).length === 0) {
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleReset = () => {
    setForm(initialForm); setErrors({}); setTouched({}); setSubmitted(false); setSuccess(false);
  };

  const show = (k) => (touched[k] || submitted ? errors[k] : undefined);
  const today = new Date().toISOString().split("T")[0];
  const memberId = useMemo(() => "FZ" + Math.floor(100000 + Math.random() * 900000), [success]);

  return (
    <div className="app">
      <nav className="navbar">
        <div className="brand">💪 FitZone</div>
        <span className="tag">Gym Membership Signup</span>
      </nav>

      <header className="hero">
        <h1>Start your fitness journey today</h1>
        <p>Choose a plan, check your BMI and join FitZone in under a minute.</p>
      </header>

      {success ? (
        <main className="container">
          <div className="success-banner" role="status">
            ✅ Welcome to FitZone, {form.name.trim()}! Your membership is confirmed.
            Confirmation sent to {form.email.trim()}.
          </div>

          <section className="panel">
            <h2>🪪 Membership Summary — ID {memberId}</h2>
            <div className="stats">
              <Stat label="Member" value={form.name.trim()} />
              <Stat label="Plan" value={form.plan} />
              <Stat label="Duration" value={`${form.duration} month(s)`} />
              <Stat label="Starts On" value={form.startDate} />
              <Stat label="Phone" value={form.phone} />
              <Stat label="Goals" value={form.goals.join(", ")} />
            </div>
          </section>

          <section className="panel">
            <h2>💳 Payment Details</h2>
            <div className="stats">
              <Stat label="Plan Cost" value={`₹${pricing.gross}`} />
              <Stat label={`Discount (${pricing.disc}%)`} value={`− ₹${pricing.discount}`} />
              <Stat label="GST (18%)" value={`₹${pricing.gst}`} />
              <Stat label="Total Payable" value={`₹${pricing.total}`} />
            </div>
          </section>

          {bmi && (
            <section className="panel">
              <h2>⚖ Health Snapshot</h2>
              <div className="stats">
                <Stat label="BMI" value={bmi.value} />
                <Stat label="Category" value={bmi.cat} />
              </div>
            </section>
          )}

          <button className="btn secondary" onClick={handleReset}>↺ New Registration</button>
        </main>
      ) : (
        <main className="container grid">
          <form className="panel" onSubmit={handleSubmit} noValidate>
            <h2>📝 Registration Form</h2>

            <Field label="Full Name" error={show("name")}>
              <input name="name" value={form.name} onChange={handleChange} onBlur={handleBlur} placeholder="e.g. Gaurav Patil" />
            </Field>
            <div className="row">
              <Field label="Email" error={show("email")}>
                <input name="email" type="email" value={form.email} onChange={handleChange} onBlur={handleBlur} placeholder="name@example.com" />
              </Field>
              <Field label="Phone" error={show("phone")}>
                <input name="phone" inputMode="numeric" maxLength={10} value={form.phone} onChange={handleChange} onBlur={handleBlur} placeholder="10-digit mobile" />
              </Field>
            </div>
            <div className="row">
              <Field label="Age" error={show("age")}>
                <input name="age" type="number" value={form.age} onChange={handleChange} onBlur={handleBlur} placeholder="16–80" />
              </Field>
              <Field label="Gender" error={show("gender")}>
                <select name="gender" value={form.gender} onChange={handleChange} onBlur={handleBlur}>
                  <option value="">-- Select --</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </Field>
            </div>
            <div className="row">
              <Field label="Height (cm)" error={show("height")}>
                <input name="height" type="number" value={form.height} onChange={handleChange} onBlur={handleBlur} placeholder="e.g. 172" />
              </Field>
              <Field label="Weight (kg)" error={show("weight")}>
                <input name="weight" type="number" value={form.weight} onChange={handleChange} onBlur={handleBlur} placeholder="e.g. 68" />
              </Field>
            </div>
            <div className="row">
              <Field label="Membership Plan" error={show("plan")}>
                <select name="plan" value={form.plan} onChange={handleChange} onBlur={handleBlur}>
                  <option value="">-- Select plan --</option>
                  {Object.keys(PLANS).map((p) => <option key={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Duration" error={show("duration")}>
                <select name="duration" value={form.duration} onChange={handleChange} onBlur={handleBlur}>
                  <option value="">-- Select --</option>
                  {Object.keys(DURATIONS).map((m) => <option key={m} value={m}>{m} month{m > 1 ? "s" : ""}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Start Date" error={show("startDate")} hint="Within the next 60 days">
              <input name="startDate" type="date" min={today} value={form.startDate} onChange={handleChange} onBlur={handleBlur} />
            </Field>

            <Field label="Fitness Goals" error={show("goals")}>
              <div className="chips">
                {GOALS.map((g) => (
                  <button type="button" key={g} className={`chip ${form.goals.includes(g) ? "on" : ""}`} onClick={() => toggleGoal(g)}>
                    {g}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="" error={show("terms")}>
              <label className="check">
                <input type="checkbox" name="terms" checked={form.terms} onChange={handleChange} onBlur={handleBlur} />
                I accept the terms and conditions
              </label>
            </Field>

            <div className="actions">
              <button type="submit" className="btn">Join FitZone</button>
              <button type="button" className="btn secondary" onClick={handleReset}>Reset</button>
            </div>
            {submitted && Object.keys(errors).length > 0 && (
              <div className="error-banner" role="alert">
                Please fix {Object.keys(errors).length} error(s) before submitting.
              </div>
            )}
          </form>

          <aside>
            <section className="panel">
              <h2>🏷 Plan Details</h2>
              {form.plan ? (
                <>
                  <p className="price">₹{PLANS[form.plan].price}<small> / month</small></p>
                  <ul className="perks">{PLANS[form.plan].perks.map((p) => <li key={p}>✔ {p}</li>)}</ul>
                </>
              ) : <p className="muted">Select a plan to see its benefits.</p>}
            </section>

            <section className="panel">
              <h2>🧮 Live Price</h2>
              {pricing ? (
                <div className="bill">
                  <div><span>Plan cost</span><span>₹{pricing.gross}</span></div>
                  <div><span>Discount ({pricing.disc}%)</span><span>− ₹{pricing.discount}</span></div>
                  <div><span>GST (18%)</span><span>₹{pricing.gst}</span></div>
                  <div className="total"><span>Total</span><span>₹{pricing.total}</span></div>
                </div>
              ) : <p className="muted">Pick a plan and duration to see the price.</p>}
            </section>

            <section className="panel">
              <h2>⚖ BMI Calculator</h2>
              {bmi ? (
                <p>Your BMI is <strong>{bmi.value}</strong> ({bmi.cat})</p>
              ) : <p className="muted">Enter height and weight to calculate BMI.</p>}
            </section>
          </aside>
        </main>
      )}

      <footer className="footer">
        Built with React components, state, events, useMemo and client-side validation. ·
        Gaurav Pravin Patil · Div A · Batch A2 · PRN 202401100049
      </footer>
    </div>
  );
}
