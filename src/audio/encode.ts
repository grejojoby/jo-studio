import { Mp3Encoder } from '@breezystack/lamejs';

type AudioPcmBuffer = Pick<AudioBuffer, 'numberOfChannels' | 'sampleRate' | 'getChannelData'>;

function writeAscii(view: DataView, offset: number, value: string): void {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
}

export function floatToPcm16(samples: Float32Array): Int16Array {
  return Int16Array.from(samples, (sample) => {
    const clamped = Math.max(-1, Math.min(1, sample));
    return clamped < 0 ? Math.round(clamped * 0x8000) : Math.round(clamped * 0x7fff);
  });
}

export function encodeWavBuffer(channels: Float32Array[], sampleRate: number): ArrayBuffer {
  if (channels.length < 1 || channels.length > 2) {
    throw new Error('WAV export supports one or two channels');
  }

  const frameCount = Math.min(...channels.map((channel) => channel.length));
  const bytesPerSample = 2;
  const dataLength = frameCount * channels.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);

  writeAscii(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeAscii(view, 8, 'WAVE');
  writeAscii(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels.length, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * channels.length * bytesPerSample, true);
  view.setUint16(32, channels.length * bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeAscii(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  let offset = 44;
  for (let frame = 0; frame < frameCount; frame += 1) {
    for (const channel of channels) {
      const sample = Math.max(-1, Math.min(1, channel[frame] ?? 0));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += bytesPerSample;
    }
  }

  return buffer;
}

export function encodeWavBlob(audioBuffer: AudioPcmBuffer): Blob {
  const channels = Array.from(
    { length: Math.min(audioBuffer.numberOfChannels, 2) },
    (_, index) => audioBuffer.getChannelData(index),
  );
  return new Blob([encodeWavBuffer(channels, audioBuffer.sampleRate)], { type: 'audio/wav' });
}

export function encodeMp3Blob(audioBuffer: AudioPcmBuffer, kbps = 192): Blob {
  const channelCount = Math.min(audioBuffer.numberOfChannels, 2);
  const left = floatToPcm16(audioBuffer.getChannelData(0));
  const right = channelCount === 2 ? floatToPcm16(audioBuffer.getChannelData(1)) : undefined;
  const encoder = new Mp3Encoder(channelCount, audioBuffer.sampleRate, kbps);
  const chunks: BlobPart[] = [];
  const frameSize = 1_152;

  for (let offset = 0; offset < left.length; offset += frameSize) {
    const encoded = encoder.encodeBuffer(
      left.subarray(offset, offset + frameSize),
      right?.subarray(offset, offset + frameSize),
    );
    if (encoded.length > 0) chunks.push(new Uint8Array(encoded));
  }

  const finalChunk = encoder.flush();
  if (finalChunk.length > 0) chunks.push(new Uint8Array(finalChunk));
  return new Blob(chunks, { type: 'audio/mpeg' });
}
