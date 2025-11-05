import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { QrCode, Send } from "lucide-react";
import axios from "axios";
import QrReader from "react-qr-reader";

const API_BASE = "http://localhost:3000/api/packages";

const DeliveryPage = () => {
  const { toast } = useToast();
  const [qrScanned, setQrScanned] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [description, setDescription] = useState("");
  const [userId, setUserId] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  const handleScan = (data: string | null) => {
    if (data) {
      setQrScanned(data);
      setShowScanner(false);
      toast({ title: "QR Code Scanned ✅", description: `Box ID: ${data}` });
    }
  };

  const handleError = (err: any) => console.error(err);

  const handleSubmit = async () => {
    if (!userId || !trackingNumber || !qrScanned) {
      toast({ title: "Missing Fields", description: "Fill all fields before submitting", variant: "destructive" });
      return;
    }

    try {
      await axios.post(`${API_BASE}`, {
        userId,
        boxId: qrScanned,
        trackingNumber,
        description,
      });
      toast({ title: "Request Sent", description: "User will be notified to unlock box" });
      setTrackingNumber("");
      setDescription("");
    } catch {
      toast({ title: "Error", description: "Could not send delivery request", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-bold text-center mb-6">🚚 Delivery Portal</h1>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Scan Box & Send Request</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {showScanner ? (
            <QrReader delay={300} onError={handleError} onScan={handleScan} />
          ) : (
            <Button onClick={() => setShowScanner(true)}>
              <QrCode className="w-4 h-4 mr-2" /> Scan QR
            </Button>
          )}

          <Input
            placeholder="User ID (for demo use a known ID)"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <Input
            placeholder="Tracking Number"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
          />
          <Input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Button onClick={handleSubmit}>
            <Send className="w-4 h-4 mr-2" /> Send Delivery Request
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryPage;