import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Send, CheckCircle } from "lucide-react";
import axios from "axios";

const API_BASE = "http://localhost:3000/api/packages";

const DeliveryPage = () => {
  const { toast } = useToast();
  const [packages, setPackages] = useState<any[]>([]);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch all packages for demo user
  const fetchPackages = async () => {
    try {
      const res = await fetch(`${API_BASE}/demoUser123`);
      const data = await res.json();
      setPackages(data);
    } catch (err) {
      console.error("Error fetching packages:", err);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  // 🔹 Create a new package
  const handleCreate = async () => {
    if (!trackingNumber) {
      toast({ title: "Missing Tracking Number ❗", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE}`, { trackingNumber, description });
      toast({ title: "Package Created 📦" });
      setTrackingNumber("");
      setDescription("");
      await fetchPackages(); // <-- refresh the list immediately
    } catch (error) {
      toast({ title: "Error ❌", description: "Could not create package", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Request unlock
  const handleRequestUnlock = async (id: string) => {
    try {
      await axios.put(`${API_BASE}/${id}/request-unlock`);
      toast({ title: "Unlock Requested 🔓", description: "User has been notified." });
      await fetchPackages();
    } catch {
      toast({ title: "Error ❌", description: "Could not request unlock", variant: "destructive" });
    }
  };

  // 🔹 Mark as delivered
  const handleMarkDelivered = async (id: string) => {
    try {
      await axios.put(`${API_BASE}/${id}/mark-delivered`);
      toast({ title: "Package Delivered ✅" });
      await fetchPackages();
    } catch {
      toast({ title: "Error ❌", description: "Could not mark as delivered", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-bold text-center mb-6">🚚 Delivery Portal</h1>

      {/* Create new package */}
      <Card className="max-w-md mx-auto mb-8">
        <CardHeader>
          <CardTitle>Create New Package</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Tracking Number"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
          />
          <Input
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button
            onClick={handleCreate}
            className="w-full"
            disabled={loading}
          >
            {loading ? "Creating..." : <><Send className="w-4 h-4 mr-2" /> Create Package</>}
          </Button>
        </CardContent>
      </Card>

      {/* Existing packages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.length === 0 ? (
          <p className="text-center text-gray-500 col-span-full">No packages yet.</p>
        ) : (
          packages.map((pkg) => (
            <Card key={pkg.id} className="shadow-md">
              <CardHeader>
                <CardTitle>{pkg.trackingNumber}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{pkg.description}</p>
                <p className="mt-1 text-sm">
                  Status: <b>{pkg.status}</b>
                </p>

                <div className="flex gap-2 mt-3">
                  <Button onClick={() => handleRequestUnlock(pkg.id)}>
                    Request Unlock
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleMarkDelivered(pkg.id)}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Delivered
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default DeliveryPage;