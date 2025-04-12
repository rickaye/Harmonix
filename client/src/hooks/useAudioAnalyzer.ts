import { useState, useEffect, useRef } from 'react';
import { createAnalyserNode } from '@/lib/audio-context';

interface AudioAnalyzerOptions {
  fftSize?: number;
  smoothingTimeConstant?: number;
  minDecibels?: number;
  maxDecibels?: number;
}

export function useAudioAnalyzer(options: AudioAnalyzerOptions = {}) {
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Frequency data array
  const [frequencyData, setFrequencyData] = useState<Uint8Array>(new Uint8Array());
  
  // Time domain data array (waveform)
  const [timeData, setTimeData] = useState<Uint8Array>(new Uint8Array());
  
  // Loudness level (RMS)
  const [levelLeft, setLevelLeft] = useState(0);
  const [levelRight, setLevelRight] = useState(0);
  
  // Initialize analyzer
  useEffect(() => {
    if (!analyserRef.current) {
      const analyzer = createAnalyserNode();
      
      // Apply options
      if (options.fftSize) analyzer.fftSize = options.fftSize;
      if (options.smoothingTimeConstant) analyzer.smoothingTimeConstant = options.smoothingTimeConstant;
      if (options.minDecibels) analyzer.minDecibels = options.minDecibels;
      if (options.maxDecibels) analyzer.maxDecibels = options.maxDecibels;
      
      analyserRef.current = analyzer;
      
      // Initialize data arrays
      setFrequencyData(new Uint8Array(analyzer.frequencyBinCount));
      setTimeData(new Uint8Array(analyzer.fftSize));
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [options]);
  
  // Start analyzing
  const startAnalyzing = () => {
    if (!analyserRef.current || isAnalyzing) return;
    
    setIsAnalyzing(true);
    
    const analyzeFrame = () => {
      if (!analyserRef.current) return;
      
      // Get frequency data
      const newFrequencyData = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(newFrequencyData);
      setFrequencyData(newFrequencyData);
      
      // Get time domain data (waveform)
      const newTimeData = new Uint8Array(analyserRef.current.fftSize);
      analyserRef.current.getByteTimeDomainData(newTimeData);
      setTimeData(newTimeData);
      
      // Calculate RMS level
      let sumLeft = 0;
      let sumRight = 0;
      const length = newTimeData.length;
      
      // Assuming the time data has left/right channels interleaved
      for (let i = 0; i < length / 2; i++) {
        // Normalize from 0-255 to -1 to 1
        const sampleLeft = (newTimeData[i * 2] / 128) - 1;
        const sampleRight = (newTimeData[i * 2 + 1] / 128) - 1;
        
        sumLeft += sampleLeft * sampleLeft;
        sumRight += sampleRight * sampleRight;
      }
      
      // Root mean square calculation
      const rmsLeft = Math.sqrt(sumLeft / (length / 2));
      const rmsRight = Math.sqrt(sumRight / (length / 2));
      
      setLevelLeft(rmsLeft);
      setLevelRight(rmsRight);
      
      // Request next frame
      if (isAnalyzing) {
        animationFrameRef.current = requestAnimationFrame(analyzeFrame);
      }
    };
    
    // Start animation loop
    analyzeFrame();
  };
  
  // Stop analyzing
  const stopAnalyzing = () => {
    setIsAnalyzing(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };
  
  // Connect a source node to the analyzer
  const connectSource = (sourceNode: AudioNode) => {
    if (analyserRef.current) {
      sourceNode.connect(analyserRef.current);
    }
  };
  
  // Disconnect a source node from the analyzer
  const disconnectSource = (sourceNode: AudioNode) => {
    if (analyserRef.current) {
      sourceNode.disconnect(analyserRef.current);
    }
  };
  
  return {
    analyserNode: analyserRef.current,
    frequencyData,
    timeData,
    levelLeft,
    levelRight,
    isAnalyzing,
    startAnalyzing,
    stopAnalyzing,
    connectSource,
    disconnectSource
  };
}
