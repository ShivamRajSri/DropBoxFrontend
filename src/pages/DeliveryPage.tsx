import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { QrCode, Send } from "lucide-react";
import axios from "axios";
import QrScanner from "react-qr-scanner";

const API_BASE = "http://localhost:3000/api/packages";

const DeliveryPage = () => {
  const { toast } = useToast();
  const [qrScanned, setQrScanned] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [description, setDescription] = useState("");
  const [userId, setUserId] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  // 🔹 Handle QR code scan
  const handleScan = (data: any) => {
    if (data) {
      setQrScanned(data.text || data);
      setShowScanner(false);
      toast({
        title: "QR Code Scanned ✅",
        description: `Box ID: ${data.text || data}`,
      });
    }
  };

  // 🔹 Handle QR error
  const handleError = (err: any) => {
    console.error("QR Error:", err);
    toast({
      title: "Camera Error ❌",
      description: "Unable to access camera or QR code not detected.",
      variant: "destructive",
    });
  };

  // 🔹 Send package request to user
  const handleSubmit = async () => {
    if (!userId || !trackingNumber || !qrScanned) {
      toast({
        title: "Missing Fields ❗",
        description: "Please fill all fields and scan the QR first.",
        variant: "destructive",
      });
      return;
    }

    try {
      await axios.post(`${API_BASE}`, {
        userId,
        boxId: qrScanned,
        trackingNumber,
        description,
      });

      toast({
        title: "Delivery Request Sent 🚚",
        description: "User has been notified to unlock the box.",
      });

      setTrackingNumber("");
      setDescription("");
      setQrScanned(null);
    } catch (error) {
      console.error("Error sending request:", error);
      toast({
        title: "Request Failed ❌",
        description: "Could not send delivery request.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-bold text-center mb-6">🚚 Delivery Portal</h1>

      <Card className="max-w-md mx-auto shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle>Scan Box & Send Request</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* QR Scanner */}
          {showScanner ? (
            <div className="flex flex-col items-center">
              <QrScanner
                delay={300}
                onError={handleError}
                onScan={handleScan}
                style={{ width: "100%", borderRadius: "12px" }}
              />
              <Button
                variant="secondary"
                className="mt-3"
                onClick={() => setShowScanner(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setShowScanner(true)}
              className="w-full flex justify-center items-center"
            >
              <QrCode className="w-4 h-4 mr-2" /> Scan QR Code
            </Button>
          )}

          {/* Show scanned box */}
          {qrScanned && (
            <p className="text-sm text-center text-muted-foreground">
              ✅ Scanned Box ID: <span className="font-semibold">{qrScanned}</span>
            </p>
          )}

          {/* Inputs */}
          <Input
            placeholder="User ID (for demo, use test user ID)"
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

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            className="w-full flex justify-center items-center"
          >
            <Send className="w-4 h-4 mr-2" /> Send Delivery Request
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryPage;