import { useEffect, useRef, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { EQBand } from "@/lib/track-types";

interface EqualizerProps {
  settings: {
    bands: EQBand[];
  };
}

const Equalizer = ({ settings }: EqualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bands, setBands] = useState<EQBand[]>(settings.bands || [
    { frequency: 80, gain: 3 },
    { frequency: 240, gain: -2 },
    { frequency: 2500, gain: 5 },
    { frequency: 10000, gain: 0 }
  ]);

  // Handle band gain changes
  const handleGainChange = (index: number, gain: number) => {
    const newBands = [...bands];
    newBands[index].gain = gain;
    setBands(newBands);
  };

  // Draw EQ visualization curve
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to match the container's dimensions
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background grid
    drawGrid(ctx, canvas.width, canvas.height);

    // Draw EQ curve
    drawEQCurve(ctx, canvas.width, canvas.height, bands);

    // Draw control points
    drawControlPoints(ctx, canvas.width, canvas.height, bands);
  }, [bands]);

  // Draw background grid
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 0.5;

    // Horizontal lines (gain levels)
    for (let i = 0; i <= 5; i++) {
      const y = (i / 5) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Vertical lines (frequency ranges)
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
  };

  // Draw EQ curve
  const drawEQCurve = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    bands: EQBand[]
  ) => {
    ctx.strokeStyle = 'hsl(var(--primary))';
    ctx.lineWidth = 2;
    ctx.beginPath();

    // Map frequency to x position (logarithmic scale)
    const freqToX = (freq: number) => {
      // Frequency range: 20Hz to 20kHz (logarithmic)
      const minFreq = 20;
      const maxFreq = 20000;
      const logMin = Math.log10(minFreq);
      const logMax = Math.log10(maxFreq);
      const logFreq = Math.log10(freq);
      
      return width * (logFreq - logMin) / (logMax - logMin);
    };

    // Map gain to y position (-12dB to +12dB)
    const gainToY = (gain: number) => {
      // Gain range: -12dB to +12dB
      const minGain = -12;
      const maxGain = 12;
      
      return height * (1 - (gain - minGain) / (maxGain - minGain));
    };

    // Create control points from bands
    const points = bands.map(band => ({
      x: freqToX(band.frequency),
      y: gainToY(band.gain)
    }));

    // Add edge points
    points.unshift({ x: 0, y: height / 2 });
    points.push({ x: width, y: height / 2 });

    // Sort points by x position
    points.sort((a, b) => a.x - b.x);

    // Draw curve
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      const xc = (points[i-1].x + points[i].x) / 2;
      const yc = (points[i-1].y + points[i].y) / 2;
      ctx.quadraticCurveTo(points[i-1].x, points[i-1].y, xc, yc);
    }

    ctx.quadraticCurveTo(
      points[points.length-2].x, 
      points[points.length-2].y, 
      points[points.length-1].x, 
      points[points.length-1].y
    );

    ctx.stroke();
  };

  // Draw control points
  const drawControlPoints = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    bands: EQBand[]
  ) => {
    // Map frequency to x position (logarithmic scale)
    const freqToX = (freq: number) => {
      // Frequency range: 20Hz to 20kHz (logarithmic)
      const minFreq = 20;
      const maxFreq = 20000;
      const logMin = Math.log10(minFreq);
      const logMax = Math.log10(maxFreq);
      const logFreq = Math.log10(freq);
      
      return width * (logFreq - logMin) / (logMax - logMin);
    };

    // Map gain to y position (-12dB to +12dB)
    const gainToY = (gain: number) => {
      // Gain range: -12dB to +12dB
      const minGain = -12;
      const maxGain = 12;
      
      return height * (1 - (gain - minGain) / (maxGain - minGain));
    };

    // Draw each control point
    bands.forEach(band => {
      const x = freqToX(band.frequency);
      const y = gainToY(band.gain);

      ctx.fillStyle = 'hsl(var(--primary))';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  // Format frequency as Hz or kHz
  const formatFrequency = (freq: number) => {
    if (freq >= 1000) {
      return `${(freq / 1000).toFixed(1)} kHz`;
    }
    return `${freq} Hz`;
  };

  return (
    <div className="p-3">
      <div className="w-full h-32 bg-background rounded-md relative overflow-hidden mb-2">
        <canvas 
          ref={canvasRef}
          className="w-full h-full"
        />
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {bands.map((band, index) => (
          <div key={index}>
            <div className="text-xs text-center mb-1">{formatFrequency(band.frequency)}</div>
            <div className="flex flex-col items-center">
              <span className="text-xs mb-1">{band.gain > 0 ? "+" : ""}{band.gain} dB</span>
              <Slider
                orientation="vertical"
                value={[band.gain]}
                min={-12}
                max={12}
                step={1}
                className="h-16"
                onValueChange={([value]) => handleGainChange(index, value)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Equalizer;
