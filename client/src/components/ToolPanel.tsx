import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Mic, Upload, AudioWaveform, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

interface AIJobsState {
  voiceCloning: {
    status: "ready" | "active" | "completed" | "error";
    progress: number;
    fileName: string | null;
  };
  stemSeparation: {
    status: "ready" | "active" | "completed" | "error";
    progress: number;
    fileName: string | null;
  };
  musicGeneration: {
    status: "ready" | "active" | "completed" | "error";
    prompt: string;
  };
}

const ToolPanel = () => {
  const { toast } = useToast();
  const [aiJobs, setAiJobs] = useState<AIJobsState>({
    voiceCloning: {
      status: "ready",
      progress: 0,
      fileName: null
    },
    stemSeparation: {
      status: "active",
      progress: 68,
      fileName: "Summer_Vibes.mp3"
    },
    musicGeneration: {
      status: "ready",
      prompt: ""
    }
  });
  
  // File upload refs
  const voiceSampleInputRef = useState<HTMLInputElement | null>(null);
  const audioFileInputRef = useState<HTMLInputElement | null>(null);
  
  // Handle voice sample upload
  const handleVoiceSampleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAiJobs(prev => ({
        ...prev,
        voiceCloning: {
          ...prev.voiceCloning,
          fileName: file.name
        }
      }));
      
      toast({
        title: "Voice sample uploaded",
        description: `${file.name} is ready for cloning.`
      });
    }
  };
  
  // Handle audio file upload for stem separation
  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Start separation process
      setAiJobs(prev => ({
        ...prev,
        stemSeparation: {
          status: "active",
          progress: 0,
          fileName: file.name
        }
      }));
      
      // Simulate progress
      const interval = setInterval(() => {
        setAiJobs(prev => {
          const newProgress = Math.min(prev.stemSeparation.progress + 10, 100);
          
          if (newProgress === 100) {
            clearInterval(interval);
            
            setTimeout(() => {
              setAiJobs(prev => ({
                ...prev,
                stemSeparation: {
                  ...prev.stemSeparation,
                  status: "completed"
                }
              }));
              
              toast({
                title: "Stem separation completed",
                description: `${file.name} has been separated into individual tracks.`
              });
            }, 500);
          }
          
          return {
            ...prev,
            stemSeparation: {
              ...prev.stemSeparation,
              progress: newProgress
            }
          };
        });
      }, 800);
    }
  };
  
  // Handle music generation
  const handleMusicGeneration = () => {
    const prompt = aiJobs.musicGeneration.prompt;
    if (!prompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a description for the music you want to create.",
        variant: "destructive"
      });
      return;
    }
    
    setAiJobs(prev => ({
      ...prev,
      musicGeneration: {
        ...prev.musicGeneration,
        status: "active"
      }
    }));
    
    // Simulate AI generation
    setTimeout(() => {
      setAiJobs(prev => ({
        ...prev,
        musicGeneration: {
          ...prev.musicGeneration,
          status: "completed"
        }
      }));
      
      toast({
        title: "Music generation completed",
        description: "Your AI-generated music is ready to use in the project."
      });
    }, 4000);
  };
  
  // Cancel stem separation job
  const cancelStemSeparation = () => {
    setAiJobs(prev => ({
      ...prev,
      stemSeparation: {
        status: "ready",
        progress: 0,
        fileName: null
      }
    }));
    
    toast({
      title: "Job cancelled",
      description: "Stem separation has been cancelled."
    });
  };
  
  // Clone voice button handler
  const cloneVoice = () => {
    if (!aiJobs.voiceCloning.fileName) {
      toast({
        title: "No sample selected",
        description: "Please upload a voice sample first.",
        variant: "destructive"
      });
      return;
    }
    
    setAiJobs(prev => ({
      ...prev,
      voiceCloning: {
        ...prev.voiceCloning,
        status: "active"
      }
    }));
    
    // Simulate voice cloning process
    setTimeout(() => {
      setAiJobs(prev => ({
        ...prev,
        voiceCloning: {
          ...prev.voiceCloning,
          status: "completed"
        }
      }));
      
      toast({
        title: "Voice cloning completed",
        description: "Your voice model is ready to use."
      });
    }, 3000);
  };
  
  return (
    <div className="h-[120px] bg-background border-b border-border p-4 flex space-x-4">
      {/* Voice Cloning Panel */}
      <Card className="w-[360px] bg-card">
        <CardContent className="p-3 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-sm">Voice Cloning</h3>
            <Badge 
              variant={aiJobs.voiceCloning.status === "active" ? "secondary" : "outline"}
              className={`
                text-xs px-2 py-0.5 rounded-full
                ${aiJobs.voiceCloning.status === "active" 
                  ? "bg-secondary/20 text-secondary" 
                  : "bg-primary/20 text-primary"}
              `}
            >
              {aiJobs.voiceCloning.status === "active" ? "Processing" : "Ready"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="w-8 h-8 rounded-full"
                onClick={() => voiceSampleInputRef[1]?.click()}
              >
                <Mic className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="icon" 
                className="w-8 h-8 rounded-full"
                onClick={() => voiceSampleInputRef[1]?.click()}
              >
                <Upload className="h-4 w-4" />
              </Button>
              
              <input 
                type="file" 
                className="hidden" 
                accept="audio/*" 
                ref={ref => voiceSampleInputRef[1] = ref}
                onChange={handleVoiceSampleUpload}
              />
              
              <span className="text-xs text-muted-foreground">
                {aiJobs.voiceCloning.fileName || "No Sample Selected"}
              </span>
            </div>
            
            <Button 
              variant={aiJobs.voiceCloning.fileName ? "default" : "outline"}
              className="px-3 py-1.5 text-sm font-medium"
              disabled={!aiJobs.voiceCloning.fileName || aiJobs.voiceCloning.status === "active"}
              onClick={cloneVoice}
            >
              Clone Voice
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Stem Separation Panel */}
      <Card className="w-[360px] bg-card">
        <CardContent className="p-3 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-sm">Stem Separation</h3>
            <Badge 
              variant={aiJobs.stemSeparation.status === "active" ? "secondary" : "outline"}
              className={`
                text-xs px-2 py-0.5 rounded-full
                ${aiJobs.stemSeparation.status === "active" 
                  ? "bg-secondary/20 text-secondary" 
                  : "bg-primary/20 text-primary"}
              `}
            >
              {aiJobs.stemSeparation.status === "active" ? "Active" : "Ready"}
            </Badge>
          </div>
          
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex items-center space-x-2">
              <Progress 
                value={aiJobs.stemSeparation.progress} 
                className="flex-1 h-2" 
                indicatorClassName="bg-secondary" 
              />
              <span className="text-xs font-mono">{aiJobs.stemSeparation.progress}%</span>
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <div className="text-xs text-muted-foreground">
                {aiJobs.stemSeparation.fileName 
                  ? `Processing: ${aiJobs.stemSeparation.fileName}` 
                  : "No file selected"}
              </div>
              
              {aiJobs.stemSeparation.status === "active" ? (
                <Button 
                  variant="outline" 
                  className="px-3 py-1 text-xs"
                  onClick={cancelStemSeparation}
                >
                  Cancel
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="px-3 py-1 text-xs"
                  onClick={() => audioFileInputRef[1]?.click()}
                >
                  Upload
                </Button>
              )}
              
              <input 
                type="file" 
                className="hidden" 
                accept="audio/*" 
                ref={ref => audioFileInputRef[1] = ref}
                onChange={handleAudioFileUpload}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* AI Music Generation Panel */}
      <Card className="w-[360px] bg-card">
        <CardContent className="p-3 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-sm">AI Music Generation</h3>
            <Badge 
              variant={aiJobs.musicGeneration.status === "active" ? "secondary" : "outline"}
              className={`
                text-xs px-2 py-0.5 rounded-full
                ${aiJobs.musicGeneration.status === "active" 
                  ? "bg-secondary/20 text-secondary" 
                  : "bg-primary/20 text-primary"}
              `}
            >
              {aiJobs.musicGeneration.status === "active" ? "Processing" : "Ready"}
            </Badge>
          </div>
          
          <div className="flex-1 flex flex-col relative">
            <Textarea 
              className="w-full bg-background border border-border rounded-md px-2 py-1.5 text-sm placeholder-muted-foreground resize-none"
              placeholder="Describe the music you want to create..."
              rows={2}
              value={aiJobs.musicGeneration.prompt}
              onChange={e => setAiJobs(prev => ({
                ...prev,
                musicGeneration: {
                  ...prev.musicGeneration,
                  prompt: e.target.value
                }
              }))}
              disabled={aiJobs.musicGeneration.status === "active"}
            />
            
            <div className="absolute right-2 bottom-2 flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="p-1 rounded"
              >
                <AudioWaveform className="h-5 w-5" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="p-1 rounded"
                onClick={handleMusicGeneration}
                disabled={aiJobs.musicGeneration.status === "active" || !aiJobs.musicGeneration.prompt.trim()}
              >
                <Send className="h-5 w-5 text-primary" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ToolPanel;
