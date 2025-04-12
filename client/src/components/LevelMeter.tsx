import { useEffect, useRef } from "react";

interface LevelMeterProps {
  level?: number; // 0-100
  width?: number;
  height?: string;
  className?: string;
}

const LevelMeter = ({
  level = 0,
  width = 4,
  height = "100%",
  className = ""
}: LevelMeterProps) => {
  const indicatorRef = useRef<HTMLDivElement>(null);

  // Update level indicator height
  useEffect(() => {
    if (indicatorRef.current) {
      indicatorRef.current.style.height = `${Math.max(0, Math.min(100, level))}%`;
    }
  }, [level]);

  return (
    <div 
      className={`level-meter ${className}`}
      style={{ width: `${width}px`, height }}
    >
      <div 
        ref={indicatorRef}
        className="level-indicator"
        style={{ height: `${level}%` }}
      ></div>
    </div>
  );
};

// Animated level meter that simulates random level changes
export const AnimatedLevelMeter = ({
  baseLevel = 60,
  variation = 15,
  updateInterval = 200,
  ...props
}: LevelMeterProps & {
  baseLevel?: number;
  variation?: number;
  updateInterval?: number;
}) => {
  const [level, setLevel] = useState(baseLevel);
  
  useEffect(() => {
    const interval = setInterval(() => {
      // Generate a level that varies around the base level
      const randomChange = (Math.random() - 0.5) * 2 * variation;
      const newLevel = Math.max(5, Math.min(100, baseLevel + randomChange));
      setLevel(newLevel);
    }, updateInterval);
    
    return () => clearInterval(interval);
  }, [baseLevel, variation, updateInterval]);
  
  return <LevelMeter level={level} {...props} />;
};

// Import useState
import { useState } from "react";

export default LevelMeter;
