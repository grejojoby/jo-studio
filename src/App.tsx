export function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="wordmark" href="#studio" aria-label="Hushline home">
          Hushline<span aria-hidden="true"> /</span>
        </a>
        <p className="privacy-note">
          <span className="privacy-dot" aria-hidden="true" />
          Local and private
        </p>
      </header>

      <main id="studio" className="studio-empty">
        <p className="eyebrow">A quieter vocal studio</p>
        <h1>Make room for your voice.</h1>
        <p className="intro">
          Record gently, add only what helps, and leave with a vocal that still sounds like you.
        </p>

        <section className="empty-workspace" aria-labelledby="workspace-title">
          <div>
            <p className="section-number">01 / source</p>
            <h2 id="workspace-title">Begin with a backing track or your voice.</h2>
          </div>
          <div className="empty-actions">
            <button className="primary-button" type="button" disabled>
              Record a take
            </button>
            <p>Microphone setup arrives in the next slice.</p>
          </div>
        </section>

        <p className="local-promise">Audio stays in this browser. Nothing is uploaded.</p>
      </main>
    </div>
  );
}
