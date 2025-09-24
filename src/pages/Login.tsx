import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [aadhar, setAadhar] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aadhar, password }),
      });

      if (res.ok) {
        const data = await res.json();
        sessionStorage.setItem("farmer", JSON.stringify(data.farmer));
        navigate("/dashboard");
      } else {
        const error = await res.json();
        alert(error.error || "Login failed");
      }
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold">Farmer Login</h2>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            placeholder="Enter Aadhar Number"
            value={aadhar}
            onChange={(e) => setAadhar(e.target.value)}
            pattern="[0-9]{12}"
            required
          />
          <Input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full">Login</Button>
          <Button 
            type="button" 
            variant="outline" 
            className="w-full"
            onClick={() => navigate("/")}
          >
            New User? Register
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Login;