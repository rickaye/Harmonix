// Singleton AudioContext for the application
let audioContext: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!audioContext) {
    // Create a new AudioContext when it doesn't exist
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

export function suspendAudioContext(): void {
  if (audioContext) {
    audioContext.suspend();
  }
}

export function resumeAudioContext(): void {
  if (audioContext) {
    audioContext.resume();
  }
}

// Create various audio nodes
export function createGainNode(): GainNode {
  return getAudioContext().createGain();
}

export function createAnalyserNode(): AnalyserNode {
  const analyser = getAudioContext().createAnalyser();
  analyser.fftSize = 2048;
  return analyser;
}

export function createBiquadFilter(type: BiquadFilterType, frequency: number, gain: number): BiquadFilterNode {
  const filter = getAudioContext().createBiquadFilter();
  filter.type = type;
  filter.frequency.value = frequency;
  filter.gain.value = gain;
  return filter;
}

export function createConvolver(): ConvolverNode {
  return getAudioContext().createConvolver();
}

export function createDynamicsCompressor(): DynamicsCompressorNode {
  return getAudioContext().createDynamicsCompressor();
}

// Helper to decode audio data
export async function decodeAudioData(arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
  return new Promise((resolve, reject) => {
    getAudioContext().decodeAudioData(
      arrayBuffer,
      (buffer) => resolve(buffer),
      (error) => reject(error)
    );
  });
}

// Helper to load audio file
export async function loadAudioFile(url: string): Promise<AudioBuffer> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return await decodeAudioData(arrayBuffer);
}
