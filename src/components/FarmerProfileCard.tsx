import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, User } from "lucide-react";

const FarmerProfileCard = () => {
  return (
    <Card className="p-6 earth-gradient text-white">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 border-2 border-white/20">
          <AvatarFallback className="bg-white/10 text-white text-lg font-semibold">
            <User className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-1">राम प्रसाद शर्मा</h3>
          <p className="text-white/80 mb-2">Ram Prasad Sharma</p>
          <div className="flex items-center gap-2 text-white/90">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">Nashik, Maharashtra</span>
          </div>
          <div className="flex gap-2 mt-3">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              Wheat
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              Sugarcane
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FarmerProfileCard;