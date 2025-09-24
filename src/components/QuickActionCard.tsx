import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  color?: "primary" | "earth" | "success" | "warning";
}

const QuickActionCard = ({ 
  title, 
  description, 
  icon: Icon, 
  path, 
  color = "primary" 
}: QuickActionCardProps) => {
  const navigate = useNavigate();

  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    earth: "bg-earth/10 text-earth",
    success: "bg-success/10 text-success", 
    warning: "bg-warning/10 text-warning"
  };

  return (
    <Card className="p-6 card-hover cursor-pointer" onClick={() => navigate(path)}>
      <div className="flex flex-col items-center text-center">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${colorClasses[color]}`}>
          <Icon className="h-8 w-8" />
        </div>
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm mb-4">{description}</p>
        <Button variant="farmer" size="sm" className="w-full">
          Open
        </Button>
      </div>
    </Card>
  );
};

export default QuickActionCard;