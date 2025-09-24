import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Leaf, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const cropOptions = [
  "Wheat",
  "Rice",
  "Maize",
  "Sugarcane",
  "Cotton",
  "Vegetables",
  "Fruits",
  "Other"
];

const Registration = () => {
  const [form, setForm] = useState({
    name: "",
    city: "",
    state: "",
    crop: "",
    aadhar: "",
    password: ""
  });
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrResult, setOcrResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const farmer = sessionStorage.getItem("farmer");
    if (farmer) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAadhaarImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    setOcrProcessing(true);
    setOcrProgress(0);

    try {
      const formData = new FormData();
      formData.append('aadhaarImage', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setOcrProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('http://localhost:5000/api/ocr/extract-aadhaar', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setOcrProgress(100);

      const data = await response.json();
      
      if (data.success) {
        setOcrResult(data.extractedData);
      } else {
        alert('Failed to extract text from image');
      }
    } catch (error) {
      console.error('OCR Error:', error);
      alert('Error processing image');
    } finally {
      setOcrProcessing(false);
    }
  };

  const fillFormWithOCR = () => {
    if (!ocrResult) return;

    setForm(prev => ({
      ...prev,
      aadhar: ocrResult.aadhaarNumber || prev.aadhar,
      name: ocrResult.name || prev.name
    }));

    setOcrResult(null);
    alert('Form auto-filled with extracted data!');
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const res = await fetch("http://localhost:5000/api/farmers/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const data = await res.json();
      alert("Registration successful! Please login with your Aadhar.");
      navigate("/login");
    } else {
      const error = await res.json();
      alert("Error: " + error.error);
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  }
};



  return (
    <Layout>
      <div className="flex justify-center items-center min-h-screen bg-background">
        <Card className="w-full max-w-lg p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold">Farmer Registration</h2>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <Input
              name="city"
              placeholder="City"
              value={form.city}
              onChange={handleChange}
              required
            />
            <Input
              name="state"
              placeholder="State"
              value={form.state}
              onChange={handleChange}
              required
            />
            <div>
              <label className="block mb-1 text-sm font-medium">Type of Crop Grown</label>
              <select
                name="crop"
                value={form.crop}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              >
                <option value="">Select Crop</option>
                {cropOptions.map((crop) => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>
            </div>
            <Input
              name="aadhar"
              placeholder="Aadhar Card Number"
              value={form.aadhar}
              onChange={handleChange}
              pattern="[0-9]{12}"
              title="Please enter a valid 12-digit Aadhar number"
              required
            />
            
            <Input
              name="password"
              type="password"
              placeholder="Create Password (min 6 characters)"
              value={form.password}
              onChange={handleChange}
              minLength={6}
              required
            />
            
            {/* Aadhaar OCR Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Upload Aadhaar Card for Auto-Fill (Optional)</label>
              <Input
                type="file"
                className="cursor-pointer"
                accept=".jpg,.jpeg,.png"
                onChange={handleAadhaarImageUpload}
                disabled={ocrProcessing}
              />
              <p className="text-xs text-gray-500">
                Upload clear image of Aadhaar card to auto-fill details (JPG/PNG, max 5MB)
              </p>

              {ocrProcessing && (
                <div className="mt-2 p-3 bg-blue-50 rounded-md">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-300 border-t-blue-600"></div>
                    <span className="text-sm text-blue-700">Extracting text from Aadhaar card...</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${ocrProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {ocrResult && (
                <div className="mt-2 p-3 bg-green-50 rounded-md border border-green-200">
                  <p className="text-sm font-medium text-green-800 mb-2">✓ Text extracted successfully!</p>
                  <div className="space-y-1 text-xs text-green-700">
                    {ocrResult.aadhaarNumber && <p><strong>Aadhaar:</strong> {ocrResult.aadhaarNumber}</p>}
                    {ocrResult.name && <p><strong>Name:</strong> {ocrResult.name}</p>}
                    {ocrResult.dateOfBirth && <p><strong>DOB:</strong> {ocrResult.dateOfBirth}</p>}
                    {ocrResult.gender && <p><strong>Gender:</strong> {ocrResult.gender}</p>}
                  </div>
                  <Button 
                    type="button"
                    size="sm"
                    onClick={fillFormWithOCR}
                    className="mt-2 bg-green-600 hover:bg-green-700"
                  >
                    Auto-Fill Form
                  </Button>
                </div>
              )}
            </div>
            <Button type="submit" className="w-full flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              Register
            </Button>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default Registration;