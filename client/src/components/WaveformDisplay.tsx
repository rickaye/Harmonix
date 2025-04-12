import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

interface WaveformDisplayProps {
  audioPath: string;
  color?: string;
  backgroundColor?: string;
  height?: number;
  className?: string;
  isAIGenerated?: boolean;
}

const WaveformDisplay = ({
  audioPath,
  color = "#ffffff",
  backgroundColor = "transparent",
  height = 80,
  className = "",
  isAIGenerated = false
}: WaveformDisplayProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize WaveSurfer
  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up previous instance
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }

    // Create new WaveSurfer instance
    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: color,
      progressColor: "rgba(255, 255, 255, 0.5)",
      cursorColor: "transparent",
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: height,
      normalize: true,
      responsive: true,
      fillParent: true,
      backend: "WebAudio"
    });

    // Handle events
    wavesurfer.on("ready", () => {
      setIsLoaded(true);
    });

    wavesurfer.on("error", (err) => {
      console.error("WaveSurfer error:", err);
      setError("Failed to load audio waveform");
      
      // Generate a placeholder waveform
      generatePlaceholderWaveform(containerRef.current, color);
    });

    // Load audio
    try {
      // For development, if the path doesn't exist, we'll generate a placeholder
      // In production, real audio would be loaded
      if (audioPath && audioPath.startsWith('/')) {
        wavesurfer.load(audioPath);
      } else {
        // Generate placeholder for demo
        generatePlaceholderWaveform(containerRef.current, color);
        setIsLoaded(true);
      }
    } catch (err) {
      console.error("Error loading audio:", err);
      setError("Failed to load audio");
      
      // Generate placeholder
      generatePlaceholderWaveform(containerRef.current, color);
    }

    wavesurferRef.current = wavesurfer;

    return () => {
      wavesurfer.destroy();
    };
  }, [audioPath, color, height]);

  // Generate a placeholder waveform when real audio can't be loaded
  const generatePlaceholderWaveform = (container: HTMLDivElement, color: string) => {
    // Clear previous content
    container.innerHTML = '';
    
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = container.clientWidth;
    canvas.height = height;
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      
      ctx.beginPath();
      const segments = Math.floor(canvas.width / 3);
      
      // Create a waveform pattern based on clip type
      for (let i = 0; i < segments; i++) {
        const x = (i / segments) * canvas.width;
        
        // Create different patterns for AI vs regular clips
        let y;
        if (isAIGenerated) {
          // More complex random-ish waveform for AI
          const randomFactor = Math.sin(i * 0.3) * Math.sin(i * 0.7) * Math.cos(i * 0.1);
          y = (randomFactor * canvas.height * 0.3) + (canvas.height / 2);
        } else {
          // Simple sine wave for regular clips
          y = (Math.sin(i * 0.2) * canvas.height * 0.25) + (canvas.height / 2);
        }
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();
    }
  };

  // Add pulsing animation for AI-generated waveforms
  const animationClass = isAIGenerated ? "animate-pulse-slow" : "";

  return (
    <div 
      className={`${className} ${animationClass} relative`}
      ref={containerRef}
    >
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-red-400">
          {error}
        </div>
      )}
    </div>
  );
};

export default WaveformDisplay;
