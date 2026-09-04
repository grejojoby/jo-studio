// @vitest-environment node
import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { createDefaultProject } from '../studio-model';
import { ProjectStore } from './project-store';

function newStore(): ProjectStore {
  return new ProjectStore(`hushline-test-${crypto.randomUUID()}`);
}

describe('ProjectStore', () => {
  it('persists project settings and audio blobs across database connections', async () => {
    const store = newStore();
    const project = createDefaultProject();
    project.backing = {
      name: 'piano.wav',
      blob: new Blob(['backing'], { type: 'audio/wav' }),
      durationSeconds: 42,
      peaks: [0.1, 0.7],
    };
    project.takes.push({
      id: 'take-1',
      name: 'Take 1',
      blob: new Blob(['voice'], { type: 'audio/webm' }),
      durationSeconds: 40,
      createdAt: 1_700_000_000_000,
      peaks: [0.2, 0.8],
    });
    project.selectedTakeId = 'take-1';

    await store.save(project);
    store.close();
    const restored = await store.load();

    expect(restored?.backing?.name).toBe('piano.wav');
    expect(await restored?.backing?.blob.text()).toBe('backing');
    expect(restored?.selectedTakeId).toBe('take-1');
    expect(await restored?.takes[0]?.blob.text()).toBe('voice');
  });

  it('clears the current local session', async () => {
    const store = newStore();
    await store.save(createDefaultProject());

    await store.clear();

    expect(await store.load()).toBeUndefined();
  });
});
