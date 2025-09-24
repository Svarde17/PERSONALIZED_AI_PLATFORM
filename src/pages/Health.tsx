import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Activity } from "lucide-react";

const Health = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Crop Health</h1>
        </div>
        <Card className="p-6">
          <p className="text-muted-foreground">Crop health monitoring feature coming soon...</p>
        </Card>
      </div>
    </Layout>
  );
};

export default Health;