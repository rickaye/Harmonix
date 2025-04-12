import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Scissors, Trash2, Edit, RefreshCw } from "lucide-react";
import { AudioClip as AudioClipType } from "@shared/schema";
import WaveformDisplay from "./WaveformDisplay";
import { useToast } from "@/hooks/use-toast";

interface AudioClipProps {
  clip: AudioClipType;
  trackColor: string;
  pixelToTimeRatio: number;
}

const AudioClip = ({ clip, trackColor, pixelToTimeRatio }: AudioClipProps) => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [clipPosition, setClipPosition] = useState(clip.startTime / pixelToTimeRatio);
  const clipRef = useRef<HTMLDivElement>(null);

  // Update position when clip changes
  useEffect(() => {
    setClipPosition(clip.startTime / pixelToTimeRatio);
  }, [clip.startTime, pixelToTimeRatio]);

  // Calculate width based on duration
  const clipWidth = clip.duration / pixelToTimeRatio;

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    if (clipRef.current) {
      setIsDragging(true);
      const rect = clipRef.current.getBoundingClientRect();
      setDragOffset(e.clientX - rect.left);
      e.preventDefault();
    }
  };

  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && clipRef.current) {
        const parentRect = clipRef.current.parentElement?.getBoundingClientRect();
        if (parentRect) {
          const newPosition = e.clientX - parentRect.left - dragOffset;
          setClipPosition(Math.max(0, newPosition));
        }
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        // You would update the clip's startTime in a real app
        // updateClipStartTime(clip.id, clipPosition * pixelToTimeRatio);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, pixelToTimeRatio]);

  // Handle clip actions
  const handleCutClip = () => {
    toast({
      title: "Cut Audio Clip",
      description: `${clip.name} has been cut at the current playhead position.`
    });
  };

  const handleDeleteClip = () => {
    toast({
      title: "Deleted Audio Clip",
      description: `${clip.name} has been removed from the track.`
    });
  };

  const handleEditClip = () => {
    toast({
      title: "Edit Audio Clip",
      description: `Editing options for ${clip.name}.`
    });
  };

  const handleRegenerateAIClip = () => {
    if (clip.isAIGenerated) {
      toast({
        title: "Regenerating AI Clip",
        description: "Creating a new variation of this AI-generated clip."
      });
    }
  };

  // Calculate opacity for background based on isAIGenerated
  const bgOpacity = clip.isAIGenerated ? "opacity-30" : "opacity-50";
  
  // Style for AI-generated clips
  const clipBorderStyle = clip.isAIGenerated ? "border-dashed" : "border-solid";
  
  // Header background color
  const headerBgColor = clip.isAIGenerated ? "bg-primary bg-opacity-80" : `bg-opacity-90`;
  
  return (
    <div
      ref={clipRef}
      className={`absolute h-16 top-2 rounded-md overflow-hidden ${bgOpacity} border ${clipBorderStyle}`}
      style={{
        left: `${clipPosition}px`,
        width: `${clipWidth}px`,
        backgroundColor: trackColor,
        borderColor: trackColor,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="w-full h-full flex items-center">
        <WaveformDisplay
          className="w-full h-3/4"
          audioPath={clip.path}
          color={clip.isAIGenerated ? "rgba(124, 77, 255, 0.8)" : "rgba(255, 255, 255, 0.8)"}
          isAIGenerated={clip.isAIGenerated}
        />
      </div>
      
      <div 
        className={`absolute top-0 left-0 right-0 flex items-center justify-between px-2 py-0.5 ${headerBgColor}`}
        style={{ backgroundColor: clip.isAIGenerated ? undefined : trackColor }}
      >
        <div className="flex items-center">
          {clip.isAIGenerated && (
            <svg className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M12 4C8.68629 4 6 6.68629 6 10C6 13.3137 8.68629 16 12 16C15.3137 16 18 13.3137 18 10C18 6.68629 15.3137 4 12 4Z" 
                fill="currentColor"
              />
              <path 
                d="M19 17H5C3.89543 17 3 17.8954 3 19V21H21V19C21 17.8954 20.1046 17 19 17Z" 
                fill="currentColor"
              />
            </svg>
          )}
          <span className="text-xs truncate text-white">{clip.name}</span>
        </div>
        
        <div className="flex space-x-1">
          {clip.isAIGenerated ? (
            <>
              <button 
                className="text-xs opacity-80 hover:opacity-100 text-white"
                onClick={handleEditClip}
              >
                <Edit className="h-3 w-3" />
              </button>
              <button 
                className="text-xs opacity-80 hover:opacity-100 text-white"
                onClick={handleRegenerateAIClip}
              >
                <RefreshCw className="h-3 w-3" />
              </button>
            </>
          ) : (
            <>
              <button 
                className="text-xs opacity-80 hover:opacity-100 text-white"
                onClick={handleCutClip}
              >
                <Scissors className="h-3 w-3" />
              </button>
              <button 
                className="text-xs opacity-80 hover:opacity-100 text-white"
                onClick={handleDeleteClip}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioClip;
