import heroImage from "../assets/finance-drag-drop-hero.png";

const exercises = [
  {
    href: "#/income-statement",
    title: "Income Statement",
    description: "Arrange income statement items and values in the correct order.",
  },
  {
    href: "#/balance-sheet",
    title: "Balance Sheet",
    description: "Place 2025 balance sheet items into their correct sections.",
  },
  {
    href: "#/profitability-ratios",
    title: "Profitability Ratios",
    description: "Build and calculate profitability ratios with financial statement values.",
  },
];

export default function HomePage() {
  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="home-eyebrow">Interactive Finance Practice</p>
          <h1>Drag and Drop Finance Exercises</h1>
          <p>
            Practice organizing financial statements and calculating ratios through
            interactive drag-and-drop activities.
          </p>
        </div>
        <img
          className="home-hero-image"
          src={heroImage}
          alt="Financial statement cards being dragged into a drop zone beside charts, coins, and a calculator"
        />
      </section>

      <section className="home-exercises" aria-labelledby="exercise-heading">
        <h2 id="exercise-heading">Choose an Exercise</h2>
        <div className="home-exercise-grid">
          {exercises.map((exercise, index) => (
            <a className="home-exercise-card" href={exercise.href} key={exercise.href}>
              <span className="home-exercise-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3>{exercise.title}</h3>
              <p>{exercise.description}</p>
              <span className="home-card-action">Start exercise →</span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
