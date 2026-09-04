import { EffectControls } from './components/EffectControls';
import { ExportPanel } from './components/ExportPanel';
import { TrackWorkspace } from './components/TrackWorkspace';
import { Transport } from './components/Transport';
import { useStudio } from './hooks/useStudio';

export function App() {
  const studio = useStudio();
  const controlsDisabled = studio.isRecording || studio.isExporting;
  const canPlay = Boolean(studio.selectedTake || studio.project.backing);

  return (
    <div className="app-shell studio-console">
      <header className="site-header">
        <a className="wordmark" href="#studio" aria-label="Hushline home">
          Hushline<span aria-hidden="true"> /</span><small>studio one</small>
        </a>
        <div className="session-marker" aria-hidden="true">
          <span>Session</span><strong>Vocal study</strong>
        </div>
        <div className="header-actions">
          <p className="privacy-note"><span className="privacy-dot" aria-hidden="true" />Local and private</p>
          <button className="quiet-button" type="button" disabled={controlsDisabled}
            onClick={() => void studio.clearSession()}>Clear session</button>
        </div>
      </header>

      {studio.error && <div className="error-banner" role="alert"><strong>That didn’t work.</strong> {studio.error}</div>}

      <main id="studio" className="studio-stage">
        <div className="studio-grid" aria-busy={!studio.isReady || studio.isExporting}>
          <div className="workspace-column">
            <section className="studio-intro" aria-labelledby="page-title">
              <div>
                <p className="eyebrow">Private recording room · 01</p>
                <h1 id="page-title">Voice in focus.</h1>
              </div>
              <div className="intro-copy">
                <p>One vocal. One backing track. Only the polish you need.</p>
                <p className="local-promise"><span aria-hidden="true">●</span> Audio stays in this browser.</p>
              </div>
            </section>

            <TrackWorkspace project={studio.project} selectedTake={studio.selectedTake}
              disabled={controlsDisabled} onBacking={(file) => void studio.importBacking(file)}
              onVocal={(file) => void studio.importVocal(file)} onRemoveBacking={studio.removeBacking}
              onChooseTake={studio.chooseTake} onRemoveTake={studio.removeTake}
              onLevel={studio.updateLevel} onMonitoring={studio.updateMonitoring} />
            <ExportPanel disabled={!studio.selectedTake || studio.isRecording} exporting={studio.isExporting}
              hasBacking={Boolean(studio.project.backing)}
              onExport={(format, target) => void studio.exportAudio(format, target)} />
          </div>
          <EffectControls project={studio.project} disabled={controlsDisabled}
            onPreset={studio.choosePreset} onMacro={studio.updateMacro} onEffect={studio.updateEffect} />
        </div>
      </main>

      <footer className="console-footer">
        <div className="status-line" role="status" aria-live="polite">{studio.status}</div>
        <Transport canPlay={canPlay} disabled={controlsDisabled} recording={studio.isRecording}
          playing={studio.isPlaying} positionSeconds={studio.positionSeconds}
          onRecord={() => void studio.toggleRecording()} onPlay={() => void studio.togglePreview()} />
      </footer>
    </div>
  );
}
