import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  IndianRupee, 
  FileText, 
  CheckCircle, 
  Clock, 
  ExternalLink,
  Shield,
  Zap,
  Award,
  CreditCard,
  Lightbulb,
  TrendingUp
} from "lucide-react";

interface Scheme {
  id: string;
  name: string;
  fullName: string;
  description: string;
  benefit: string;
  eligibility: any;
  documents: string[];
  applyUrl: string;
  status: string;
  ministry: string;
  category: string;
  priority: string;
  eligibilityScore: number;
  applicationStatus: string;
  estimatedBenefit: {
    amount: number;
    period: string;
    description: string;
  };
}

const Schemes = () => {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [farmer, setFarmer] = useState<any>(null);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [showGuidance, setShowGuidance] = useState(false);

  useEffect(() => {
    fetchEligibleSchemes();
  }, []);

  const fetchEligibleSchemes = async () => {
    try {
      const farmerData = JSON.parse(sessionStorage.getItem("farmer") || '{}');
      if (!farmerData.id) {
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:5000/api/schemes/eligible/${farmerData.id}`);
      const data = await response.json();

      if (data.success) {
        setSchemes(data.schemes);
        setFarmer(data.farmer);
      }
    } catch (error) {
      console.error('Failed to fetch schemes:', error);
    } finally {
      setLoading(false);
    }
  };

  const showApplicationGuidance = async (scheme: Scheme) => {
    try {
      const response = await fetch(`http://localhost:5000/api/schemes/guidance/${scheme.id}`);
      const data = await response.json();
      
      if (data.success) {
        setSelectedScheme({ ...scheme, guidance: data.guidance });
        setShowGuidance(true);
      }
    } catch (error) {
      console.error('Failed to fetch guidance:', error);
      alert('Unable to fetch application guidance');
    }
  };



  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'income_support': return <IndianRupee className="h-5 w-5" />;
      case 'insurance': return <Shield className="h-5 w-5" />;
      case 'credit': return <CreditCard className="h-5 w-5" />;
      case 'energy': return <Zap className="h-5 w-5" />;
      case 'advisory': return <Lightbulb className="h-5 w-5" />;
      default: return <Award className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'income_support': return 'from-green-500 to-emerald-500';
      case 'insurance': return 'from-blue-500 to-indigo-500';
      case 'credit': return 'from-purple-500 to-pink-500';
      case 'energy': return 'from-yellow-500 to-orange-500';
      case 'advisory': return 'from-teal-500 to-cyan-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!farmer) {
    return (
      <Layout>
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <div className="text-center">
            <Building2 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-600 mb-2">Login Required</h2>
            <p className="text-gray-500">Please login to view eligible government schemes</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-poppins text-gray-900">
                🏛️ Government Schemes
              </h1>
              <p className="text-gray-600">
                Personalized schemes based on your Aadhaar, state, and crop type
              </p>
            </div>
          </div>
          
          {/* Farmer Info & Aadhaar Verification */}
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">
                    {farmer.name} • {farmer.state} • {farmer.crop}
                  </h3>
                  <p className="text-blue-700 text-sm">
                    Aadhaar: {farmer.aadhar} • {schemes.length} Eligible Schemes • State-Specific Matching
                  </p>
                </div>
              </div>
              
              <Badge className="bg-blue-500 text-white">
                <CheckCircle className="h-4 w-4 mr-1" />
                Ready to Apply
              </Badge>
            </div>
          </Card>
        </div>

        {/* Schemes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {schemes.map((scheme, index) => (
            <Card 
              key={scheme.id} 
              className="p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200 flex flex-col h-full"
            >
              {/* Scheme Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 bg-gradient-to-r ${getCategoryColor(scheme.category)} rounded-xl text-white`}>
                    {getCategoryIcon(scheme.category)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{scheme.name}</h3>
                    <p className="text-sm text-gray-600">{scheme.ministry}</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <Badge 
                    variant={scheme.priority === 'high' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {scheme.priority.toUpperCase()} PRIORITY
                  </Badge>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-bold text-green-600">
                        {scheme.eligibilityScore}% Match
                      </span>
                    </div>
                    {scheme.aadhaarMatch && (
                      <div className="flex items-center gap-1">
                        <Shield className="h-3 w-3 text-blue-600" />
                        <span className="text-xs font-medium text-blue-600">
                          Aadhaar: {scheme.aadhaarMatch}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-700 mb-4">{scheme.description}</p>

              {/* Benefit */}
              <div className="bg-green-50 p-3 rounded-lg mb-4 border border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <IndianRupee className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-green-800">Benefit</span>
                </div>
                <p className="text-green-700 font-bold">{scheme.benefit}</p>
                {scheme.estimatedBenefit.amount > 0 && (
                  <p className="text-sm text-green-600">
                    Estimated: ₹{scheme.estimatedBenefit.amount.toLocaleString()} 
                    {scheme.estimatedBenefit.period !== 'unknown' && ` (${scheme.estimatedBenefit.period})`}
                  </p>
                )}
              </div>

              {/* Documents Required */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Documents Required
                </h4>
                <div className="flex flex-wrap gap-2">
                  {scheme.documents.map((doc, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {doc}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Spacer to push buttons to bottom */}
              <div className="flex-grow"></div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 mt-4">
                <Button 
                  onClick={() => showApplicationGuidance(scheme)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  How to Apply
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => window.open(scheme.applyUrl, '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Apply Now
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {schemes.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">No Eligible Schemes Found</h3>
            <p className="text-gray-500">
              No government schemes match your current profile. Check back later for new schemes.
            </p>
          </div>
        )}

        {/* Application Guidance Modal */}
        {showGuidance && selectedScheme && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    How to Apply: {selectedScheme.name}
                  </h2>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setShowGuidance(false)}
                  >
                    ❌
                  </Button>
                </div>
                
                <div className="space-y-6">
                  {/* Important Notice */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      ⚠️ Important: Government Schemes are FREE
                    </h3>
                    <ul className="text-green-700 text-sm space-y-1">
                      <li>• All government schemes are completely FREE</li>
                      <li>• Never pay any fees to middlemen or agents</li>
                      <li>• Apply directly through official government portals only</li>
                      <li>• Keep your Aadhaar and bank account details ready</li>
                    </ul>
                  </div>
                  
                  {/* Application Steps */}
                  <div>
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Step-by-Step Application Process
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                        <p className="text-blue-800 font-medium">Visit the official website: {selectedScheme.applyUrl}</p>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                        <p className="text-blue-800 font-medium">Register/Login with your Aadhaar number</p>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                        <p className="text-blue-800 font-medium">Fill the online application form</p>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
                        <p className="text-blue-800 font-medium">Upload required documents</p>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">5</div>
                        <p className="text-blue-800 font-medium">Submit application and note down application ID</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Documents Required */}
                  <div>
                    <h3 className="font-bold text-gray-800 mb-3">Documents Required</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedScheme.documents.map((doc: string, i: number) => (
                        <Badge key={i} variant="outline" className="bg-yellow-50 border-yellow-200">
                          {doc}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Helpline Numbers */}
                  <div>
                    <h3 className="font-bold text-gray-800 mb-3">Helpline Numbers</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="font-medium text-gray-800">PM-KISAN</div>
                        <div className="text-blue-600 font-bold">155261</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="font-medium text-gray-800">General Agriculture</div>
                        <div className="text-blue-600 font-bold">1800-180-1551</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button 
                      onClick={() => window.open(selectedScheme.applyUrl, '_blank')}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Apply on Official Website
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setShowGuidance(false)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Schemes;