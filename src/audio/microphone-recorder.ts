// Capture and recorder contracts:
// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
// https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
const RECORDER_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4;codecs=mp4a.40.2',
  'audio/mp4',
] as const;

// Browser noise suppression removes stationary room noise (fans, hum) at capture.
// Auto gain and echo cancellation stay off so vocal dynamics are untouched.
export const microphoneConstraints: MediaStreamConstraints = {
  audio: {
    autoGainControl: false,
    echoCancellation: false,
    noiseSuppression: true,
    channelCount: 1,
  },
  video: false,
};

export function pickRecorderMimeType(
  isSupported: (mimeType: string) => boolean,
): string | undefined {
  return RECORDER_TYPES.find((mimeType) => isSupported(mimeType));
}

export function stopMediaStream(stream: MediaStream): void {
  for (const track of stream.getTracks()) track.stop();
}

interface MediaRecorderConstructor {
  new (stream: MediaStream, options?: MediaRecorderOptions): MediaRecorder;
  isTypeSupported(mimeType: string): boolean;
}

interface RecorderDependencies {
  getUserMedia: (constraints: MediaStreamConstraints) => Promise<MediaStream>;
  MediaRecorderClass: MediaRecorderConstructor;
}

export class MicrophoneRecorder {
  private recorder?: MediaRecorder;
  private stream?: MediaStream;
  private chunks: Blob[] = [];

  constructor(private readonly dependencies?: RecorderDependencies) {}

  get activeStream(): MediaStream | undefined {
    return this.stream;
  }

  get isRecording(): boolean {
    return this.recorder?.state === 'recording';
  }

  dispose(): void {
    if (this.recorder && this.recorder.state !== 'inactive') this.recorder.stop();
    if (this.stream) stopMediaStream(this.stream);
    this.recorder = undefined;
    this.stream = undefined;
    this.chunks = [];
  }

  async start(): Promise<MediaStream> {
    if (this.isRecording) throw new Error('A recording is already in progress');

    const getUserMedia = this.dependencies?.getUserMedia
      ?? navigator.mediaDevices?.getUserMedia.bind(navigator.mediaDevices);
    const MediaRecorderClass = this.dependencies?.MediaRecorderClass ?? globalThis.MediaRecorder;

    if (!getUserMedia || !MediaRecorderClass) {
      throw new Error('This browser cannot record audio. Use a current version of Chrome or Edge.');
    }

    const stream = await getUserMedia(microphoneConstraints);
    try {
      const mimeType = pickRecorderMimeType(MediaRecorderClass.isTypeSupported.bind(MediaRecorderClass));
      this.chunks = [];
      this.recorder = new MediaRecorderClass(stream, mimeType ? { mimeType } : undefined);
      this.recorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) this.chunks.push(event.data);
      });
      this.stream = stream;
      this.recorder.start(1_000);
      return stream;
    } catch (error) {
      stopMediaStream(stream);
      throw error;
    }
  }

  async stop(): Promise<Blob> {
    const recorder = this.recorder;
    const stream = this.stream;
    if (!recorder || recorder.state === 'inactive') throw new Error('No recording is in progress');

    return new Promise((resolve, reject) => {
      recorder.addEventListener('stop', () => {
        const blob = new Blob(this.chunks, { type: recorder.mimeType || 'audio/webm' });
        if (stream) stopMediaStream(stream);
        this.recorder = undefined;
        this.stream = undefined;
        this.chunks = [];
        resolve(blob);
      }, { once: true });
      recorder.addEventListener('error', () => {
        if (stream) stopMediaStream(stream);
        reject(new Error('Recording failed'));
      }, { once: true });
      recorder.stop();
    });
  }
}
