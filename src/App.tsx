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
      <header className="studio-bar">
        <a className="wordmark" href="#studio" aria-label="Hushline home">Hushline</a>
        <h1 className="session-title">Vocal study</h1>
        <div className="header-actions">
          <p className="privacy-note"><span className="privacy-dot" aria-hidden="true" />Local &amp; private</p>
          <ExportPanel disabled={!studio.selectedTake || studio.isRecording} exporting={studio.isExporting}
            hasBacking={Boolean(studio.project.backing)}
            onExport={(format, target) => void studio.exportAudio(format, target)} />
          <button className="quiet-button" type="button" disabled={controlsDisabled}
            onClick={() => void studio.clearSession()} aria-label="Clear session">•••</button>
        </div>
      </header>

      {studio.error && <div className="error-banner" role="alert"><strong>That didn’t work.</strong> {studio.error}</div>}

      <main id="studio" className="studio-stage">
        <div className="studio-layout" aria-busy={!studio.isReady || studio.isExporting}>
          <div className="recording-column">
            <TrackWorkspace project={studio.project} selectedTake={studio.selectedTake}
              disabled={controlsDisabled} onBacking={(file) => void studio.importBacking(file)}
              onVocal={(file) => void studio.importVocal(file)} onRemoveBacking={studio.removeBacking}
              onChooseTake={studio.chooseTake} onRemoveTake={studio.removeTake}
              onNewTake={() => void studio.toggleRecording()}
              levels={studio.levels} onLevel={studio.updateLevel} onMonitoring={studio.updateMonitoring}
              transport={<Transport canPlay={canPlay} disabled={controlsDisabled} recording={studio.isRecording}
                playing={studio.isPlaying} positionSeconds={studio.positionSeconds}
                onRecord={() => void studio.toggleRecording()} onPlay={() => void studio.togglePreview()} />} />
            <div className="status-line" role="status" aria-live="polite">{studio.status}</div>
          </div>
          <EffectControls project={studio.project} disabled={controlsDisabled}
            onPreset={studio.choosePreset} onMacro={studio.updateMacro} onEffect={studio.updateEffect} />
        </div>
      </main>
    </div>
  );
}
