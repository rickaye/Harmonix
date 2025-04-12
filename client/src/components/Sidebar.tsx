import { Button } from "@/components/ui/button";
import { 
  Home, 
  Scissors, 
  Mic, 
  Wand2, 
  SlidersHorizontal,
  Database,
  Download,
  Share
} from "lucide-react";
import { useState } from "react";

type ToolType = 
  | "home" 
  | "stem-separation" 
  | "voice-cloning" 
  | "music-generation" 
  | "effects"
  | "samples";

const Sidebar = () => {
  const [activeTool, setActiveTool] = useState<ToolType>("voice-cloning");
  
  const isActive = (tool: ToolType) => activeTool === tool;
  
  return (
    <aside className="w-16 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-3 flex-shrink-0">
      <Button
        variant={isActive("home") ? "secondary" : "ghost"}
        size="icon"
        className={`w-10 h-10 mb-4 rounded-md ${
          isActive("home") 
            ? "bg-primary text-primary-foreground" 
            : "hover:bg-sidebar-accent"
        }`}
        onClick={() => setActiveTool("home")}
      >
        <Home className="h-5 w-5" />
      </Button>
      
      <div className="space-y-4 flex flex-col items-center">
        <Button
          variant={isActive("stem-separation") ? "secondary" : "ghost"}
          size="icon"
          className={`w-10 h-10 rounded-md ${
            isActive("stem-separation") 
              ? "bg-primary text-primary-foreground" 
              : "hover:bg-sidebar-accent"
          }`}
          onClick={() => setActiveTool("stem-separation")}
        >
          <Scissors className="h-5 w-5" />
        </Button>
        
        <Button
          variant={isActive("voice-cloning") ? "secondary" : "ghost"}
          size="icon"
          className={`w-10 h-10 rounded-md ${
            isActive("voice-cloning") 
              ? "bg-primary/20 text-primary" 
              : "hover:bg-sidebar-accent"
          }`}
          onClick={() => setActiveTool("voice-cloning")}
        >
          <Mic className="h-5 w-5" />
        </Button>
        
        <Button
          variant={isActive("music-generation") ? "secondary" : "ghost"}
          size="icon"
          className={`w-10 h-10 rounded-md ${
            isActive("music-generation") 
              ? "bg-primary text-primary-foreground" 
              : "hover:bg-sidebar-accent"
          }`}
          onClick={() => setActiveTool("music-generation")}
        >
          <Wand2 className="h-5 w-5" />
        </Button>
        
        <Button
          variant={isActive("effects") ? "secondary" : "ghost"}
          size="icon"
          className={`w-10 h-10 rounded-md ${
            isActive("effects") 
              ? "bg-primary text-primary-foreground" 
              : "hover:bg-sidebar-accent"
          }`}
          onClick={() => setActiveTool("effects")}
        >
          <SlidersHorizontal className="h-5 w-5" />
        </Button>
        
        <Button
          variant={isActive("samples") ? "secondary" : "ghost"}
          size="icon"
          className={`w-10 h-10 rounded-md ${
            isActive("samples") 
              ? "bg-primary text-primary-foreground" 
              : "hover:bg-sidebar-accent"
          }`}
          onClick={() => setActiveTool("samples")}
        >
          <Database className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="mt-auto space-y-4 flex flex-col items-center">
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-md hover:bg-sidebar-accent"
        >
          <Download className="h-5 w-5" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-md hover:bg-sidebar-accent"
        >
          <Share className="h-5 w-5" />
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
