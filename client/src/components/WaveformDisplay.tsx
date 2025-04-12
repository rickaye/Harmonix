import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Volume2, VolumeX, Play, Pause, SkipForward, SkipBack } from "lucide-react";
import { initializeAudioContext } from "@/lib/audio-context";

interface WaveformDisplayProps {
  audioPath: string;
  color?: string;
  backgroundColor?: string;
  height?: number;
  className?: string;
  isAIGenerated?: boolean;
  showControls?: boolean;
  visualMode?: 'standard' | 'spectrum' | 'bars' | 'futuristic';
}

const WaveformDisplay = ({
  audioPath,
  color = "hsl(var(--primary))",
  backgroundColor = "transparent",
  height = 80,
  className = "",
  isAIGenerated = false,
  showControls = false,
  visualMode = 'standard'
}: WaveformDisplayProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [zoom, setZoom] = useState(1);

  // Initialize WaveSurfer with advanced settings
  useEffect(() => {
    let isMounted = true;
    
    // Initialize AudioContext and then set up WaveSurfer
    const setupWaveSurfer = async () => {
      if (!containerRef.current || !isMounted) return;
      
      try {
        // Ensure AudioContext is initialized before creating WaveSurfer
        await initializeAudioContext();
        
        // Clean up previous instance
        if (wavesurferRef.current) {
          wavesurferRef.current.destroy();
        }
      
        // Select waveform appearance based on visualMode
        let waveColor, progressColor, barWidth, barGap, barRadius, cursorWidth;
        let waveformOptions = {};

        switch(visualMode) {
          case 'spectrum':
            waveColor = `linear-gradient(to bottom, ${color}, hsl(var(--accent)))`;
            progressColor = `linear-gradient(to bottom, rgba(255,255,255,0.8), ${color})`;
            barWidth = 3;
            barGap = 1;
            barRadius = 3;
            cursorWidth = 2;
            break;
          case 'bars':
            waveColor = color;
            progressColor = "hsl(var(--secondary))";
            barWidth = 4;
            barGap = 2;
            barRadius = 2;
            cursorWidth = 0;
            break;
          case 'futuristic':
            waveColor = `linear-gradient(to top, hsl(var(--primary)), hsl(var(--accent)))`;
            progressColor = `linear-gradient(to top, hsl(var(--secondary)), hsl(var(--destructive)))`;
            barWidth = 2;
            barGap = 2;
            barRadius = 4;
            cursorWidth = 2;
            waveformOptions = {
              // Add special options for futuristic mode
              barWidth: 2,
              barGap: 2,
              barRadius: 4
            };
            break;
          default: // standard
            waveColor = color;
            progressColor = "rgba(255, 255, 255, 0.7)";
            barWidth = 2;
            barGap = 1;
            barRadius = 2;
            cursorWidth = 1;
        }

        // Create new WaveSurfer instance with advanced options
        const wavesurfer = WaveSurfer.create({
          container: containerRef.current,
          waveColor: waveColor,
          progressColor: progressColor,
          cursorColor: "rgba(255, 255, 255, 0.7)",
          cursorWidth: cursorWidth,
          barWidth: barWidth,
          barGap: barGap,
          barRadius: barRadius,
          height: height,
          normalize: true,
          // Use more compatible options
          fillParent: true,
          backend: "WebAudio",
          hideScrollbar: false,
          partialRender: true,
          pixelRatio: window.devicePixelRatio || 1,
          interact: true,
          autoCenter: true,
          ...waveformOptions
        });

        // Handle events
        wavesurfer.on("ready", () => {
          if (isMounted) {
            setIsLoaded(true);
            wavesurfer.setVolume(volume);
          }
        });

        wavesurfer.on("play", () => {
          if (isMounted) setIsPlaying(true);
        });

        wavesurfer.on("pause", () => {
          if (isMounted) setIsPlaying(false);
        });

        wavesurfer.on("error", (err) => {
          console.error("WaveSurfer error:", err);
          if (isMounted) {
            setError("Failed to load audio waveform");
            
            // Generate a placeholder waveform
            if (containerRef.current) {
              generatePlaceholderWaveform(containerRef.current, color, visualMode);
            }
          }
        });

        // Load audio
        try {
          // For development, if the path doesn't exist, we'll generate a placeholder
          // In production, real audio would be loaded
          if (audioPath && audioPath.startsWith('/')) {
            wavesurfer.load(audioPath);
          } else {
            // Generate placeholder for demo
            generatePlaceholderWaveform(containerRef.current, color, visualMode);
            setIsLoaded(true);
          }
        } catch (err) {
          console.error("Error loading audio:", err);
          if (isMounted) {
            setError("Failed to load audio");
            
            // Generate placeholder
            if (containerRef.current) {
              generatePlaceholderWaveform(containerRef.current, color, visualMode);
            }
          }
        }

        wavesurferRef.current = wavesurfer;
        
      } catch (err) {
        console.error("Error initializing WaveSurfer:", err);
        if (isMounted) {
          setError("Failed to initialize audio system");
          
          // Generate a placeholder in case of initialization error
          if (containerRef.current) {
            generatePlaceholderWaveform(containerRef.current, color, visualMode);
          }
        }
      }
    };
    
    // Start the setup process
    setupWaveSurfer();
    
    // Cleanup function
    return () => {
      isMounted = false;
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
    };
  }, [audioPath, color, height, visualMode]);

  // Handle play/pause
  const togglePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
      setIsPlaying(wavesurferRef.current.isPlaying());
    }
  };

  // Handle mute/unmute
  const toggleMute = () => {
    if (wavesurferRef.current) {
      const newMuteState = !isMuted;
      wavesurferRef.current.setMuted(newMuteState);
      setIsMuted(newMuteState);
    }
  };

  // Handle zoom in/out
  const handleZoomIn = () => {
    if (wavesurferRef.current) {
      const newZoom = Math.min(zoom + 0.5, 5);
      wavesurferRef.current.zoom(newZoom * 50);
      setZoom(newZoom);
    }
  };

  const handleZoomOut = () => {
    if (wavesurferRef.current) {
      const newZoom = Math.max(zoom - 0.5, 0.5);
      wavesurferRef.current.zoom(newZoom * 50);
      setZoom(newZoom);
    }
  };

  // Skip forward/backward
  const handleSkipForward = () => {
    if (wavesurferRef.current) {
      const currentTime = wavesurferRef.current.getCurrentTime();
      const duration = wavesurferRef.current.getDuration();
      wavesurferRef.current.seekTo(Math.min((currentTime + 5) / duration, 0.99));
    }
  };

  const handleSkipBackward = () => {
    if (wavesurferRef.current) {
      const currentTime = wavesurferRef.current.getCurrentTime();
      const duration = wavesurferRef.current.getDuration();
      wavesurferRef.current.seekTo(Math.max((currentTime - 5) / duration, 0));
    }
  };

  // Generate advanced placeholder waveforms based on visualMode
  const generatePlaceholderWaveform = (container: HTMLDivElement, color: string, mode: string) => {
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
      
      // Apply different drawing styles based on visualization mode
      switch(mode) {
        case 'spectrum':
          drawSpectrumPlaceholder(ctx, canvas, color);
          break;
        case 'bars':
          drawBarsPlaceholder(ctx, canvas, color);
          break;
        case 'futuristic':
          drawFuturisticPlaceholder(ctx, canvas, color, isAIGenerated);
          break;
        default:
          drawStandardPlaceholder(ctx, canvas, color, isAIGenerated);
      }
    }
  };

  const drawStandardPlaceholder = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, color: string, isAI: boolean) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    
    ctx.beginPath();
    const segments = Math.floor(canvas.width / 3);
    
    // Create a waveform pattern based on clip type
    for (let i = 0; i < segments; i++) {
      const x = (i / segments) * canvas.width;
      
      // Create different patterns for AI vs regular clips
      let y;
      if (isAI) {
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
  };

  const drawSpectrumPlaceholder = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, color: string) => {
    // Create a gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'hsl(var(--accent))');
    
    const barWidth = 3;
    const barGap = 1;
    const totalBars = Math.floor(canvas.width / (barWidth + barGap));
    
    for (let i = 0; i < totalBars; i++) {
      // Generate a random height for each bar
      const barHeight = Math.random() * (canvas.height * 0.8);
      const x = i * (barWidth + barGap);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, (canvas.height - barHeight) / 2, barWidth, barHeight);
    }
  };

  const drawBarsPlaceholder = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, color: string) => {
    ctx.fillStyle = color;
    
    const barWidth = 4;
    const barGap = 2;
    const totalBars = Math.floor(canvas.width / (barWidth + barGap));
    
    for (let i = 0; i < totalBars; i++) {
      const barHeight = Math.abs(Math.sin(i * 0.2) * canvas.height * 0.7);
      const x = i * (barWidth + barGap);
      
      ctx.fillRect(x, (canvas.height - barHeight) / 2, barWidth, barHeight);
    }
  };

  const drawFuturisticPlaceholder = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, color: string, isAI: boolean) => {
    // Create a cyberpunk-style waveform with glow effect
    
    // Set up the glowing effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'hsl(var(--accent))';
    
    const centerY = canvas.height / 2;
    const barWidth = 2;
    const barGap = 2;
    const totalBars = Math.floor(canvas.width / (barWidth + barGap));
    
    // Draw the main waveform
    for (let i = 0; i < totalBars; i++) {
      let height;
      
      if (isAI) {
        // Create a more chaotic pattern for AI-generated audio
        const noise1 = Math.sin(i * 0.1) * Math.cos(i * 0.05) * Math.sin(i * 0.02);
        const noise2 = Math.cos(i * 0.15) * Math.sin(i * 0.08);
        height = (noise1 * noise2 * canvas.height * 0.4);
      } else {
        // Create a cleaner pattern for regular audio
        height = Math.sin(i * 0.1) * Math.sin(i * 0.2) * canvas.height * 0.3;
      }
      
      const x = i * (barWidth + barGap);
      
      // Create a gradient for each bar
      const gradient = ctx.createLinearGradient(0, centerY - height/2, 0, centerY + height/2);
      gradient.addColorStop(0, 'hsl(var(--primary))');
      gradient.addColorStop(1, 'hsl(var(--accent))');
      
      ctx.fillStyle = gradient;
      
      // Draw rounded bars
      const radius = 2;
      const barHeight = Math.abs(height);
      const y = centerY - barHeight/2;
      
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + barWidth - radius, y);
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
      ctx.lineTo(x + barWidth, y + barHeight - radius);
      ctx.quadraticCurveTo(x + barWidth, y + barHeight, x + barWidth - radius, y + barHeight);
      ctx.lineTo(x + radius, y + barHeight);
      ctx.quadraticCurveTo(x, y + barHeight, x, y + barHeight - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();
    }
    
    // Add a subtle grid for cyberpunk effect
    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = 'hsl(var(--secondary))';
    ctx.lineWidth = 0.5;
    
    const gridSize = 10;
    for (let i = 0; i < canvas.width; i += gridSize) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    
    for (let i = 0; i < canvas.height; i += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }
    
    ctx.globalAlpha = 1;
  };

  // Apply special classes based on visualization mode
  const waveformClasses = `waveform-container ${isAIGenerated ? 'ai-generated' : ''} ${className}`;
  
  // Add pulsing animation and neon effects for AI-generated waveforms
  const animationClass = isAIGenerated ? "animate-pulse-slow neon-border" : "";

  return (
    <Card className={`bg-card/50 border-border/50 ${showControls ? 'p-4' : 'p-0'}`}>
      {showControls && (
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-1.5">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={togglePlayPause}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={handleSkipBackward}
              aria-label="Skip backwards"
            >
              <SkipBack size={16} />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={handleSkipForward}
              aria-label="Skip forwards"
            >
              <SkipForward size={16} />
            </Button>
          </div>
          
          <div className="flex items-center gap-1.5">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={handleZoomOut}
              aria-label="Zoom out"
              disabled={zoom <= 0.5}
            >
              <ZoomOut size={16} />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={handleZoomIn}
              aria-label="Zoom in"
              disabled={zoom >= 5}
            >
              <ZoomIn size={16} />
            </Button>
          </div>
        </div>
      )}
      
      <div 
        className={`${waveformClasses} ${animationClass} relative`}
        ref={containerRef}
      >
        {isAIGenerated && (
          <div className="ai-badge">AI</div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-destructive">
            {error}
          </div>
        )}
      </div>
    </Card>
  );
};

export default WaveformDisplay;
