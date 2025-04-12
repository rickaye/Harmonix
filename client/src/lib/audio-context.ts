// Singleton AudioContext for the application
let audioContext: AudioContext | null = null;
let initializationPromise: Promise<AudioContext> | null = null;
let isUserInteractionRequired = true;

export function getAudioContext(): AudioContext {
  if (!audioContext) {
    // Create a new AudioContext when it doesn't exist
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Check if context is in suspended state (browser autoplay policy)
    if (audioContext.state === 'suspended') {
      isUserInteractionRequired = true;
    } else {
      isUserInteractionRequired = false;
    }
  }
  return audioContext;
}

// Function to initialize AudioContext with user interaction
export function initializeAudioContext(): Promise<AudioContext> {
  if (!initializationPromise) {
    initializationPromise = new Promise((resolve) => {
      const context = getAudioContext();
      
      if (context.state === 'running') {
        // Already running, resolve immediately
        resolve(context);
        return;
      }
      
      // Set up event listeners for user interaction
      const handleInteraction = () => {
        context.resume().then(() => {
          console.log('AudioContext started successfully');
          resolve(context);
          
          // Remove event listeners once started
          ['click', 'touchstart', 'keydown'].forEach(event => {
            document.removeEventListener(event, handleInteraction);
          });
        });
      };
      
      // Add event listeners for common user interactions
      ['click', 'touchstart', 'keydown'].forEach(event => {
        document.addEventListener(event, handleInteraction, { once: true });
      });
      
      console.log('Waiting for user interaction to start AudioContext...');
    });
  }
  
  return initializationPromise;
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
  // Ensure AudioContext is initialized before decoding
  await initializeAudioContext();
  
  return new Promise((resolve, reject) => {
    try {
      const context = getAudioContext();
      // Handle both callback and promise-based implementations
      const decodePromise = context.decodeAudioData(
        arrayBuffer,
        (buffer) => resolve(buffer),
        (error) => reject(error || new Error('Failed to decode audio data'))
      );
      
      // Some browsers return a promise
      if (decodePromise && decodePromise instanceof Promise) {
        decodePromise.then(resolve).catch(reject);
      }
    } catch (err) {
      reject(err || new Error('Failed to decode audio data'));
    }
  });
}

// Helper to load audio file
export async function loadAudioFile(url: string): Promise<AudioBuffer> {
  try {
    // Ensure AudioContext is running before fetching
    await initializeAudioContext();
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load audio file: ${response.status} ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    return await decodeAudioData(arrayBuffer);
  } catch (error) {
    console.error('Error loading audio file:', error);
    throw error;
  }
}
