import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/firebaseClient";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Unlock } from "lucide-react";
import axios from "axios";

const API_BASE = "http://localhost:3000/api/packages";

const UserPage = () => {
  const { toast } = useToast();
  const [packages, setPackages] = useState<any[]>([]);

  // Hardcoded demo user ID (same as backend)
  const userId = "demouser123";

  // 🔹 Real-time listener for user packages
  useEffect(() => {
    const q = query(collection(db, "packages"), where("userId", "==", userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updated = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPackages(updated);
      console.log("📦 Live package updates:", updated);
    });

    return () => unsubscribe();
  }, []);

  // 🔹 Unlock package (notify backend -> ESP32)
  const handleUnlockPackage = async (id: string) => {
    try {
      const res = await axios.put(`${API_BASE}/${id}/unlock`);
      if (res.status === 200) {
        toast({
          title: "Box Unlocked ✅",
          description: "ESP32 has been notified to unlock.",
        });
      }
    } catch (error) {
      console.error("Unlock error:", error);
      toast({
        title: "Unlock Failed ❌",
        description: "Could not unlock the box. Try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-bold text-center mb-6">📬 My Deliveries</h1>

      {packages.length === 0 ? (
        <p className="text-center text-gray-500">No deliveries yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <Card key={pkg.id}>
              <CardHeader>
                <CardTitle>{pkg.trackingNumber}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{pkg.description}</p>
                <p className="mt-2 font-medium">
                  Status:{" "}
                  <span
                    className={
                      pkg.status === "pending_unlock"
                        ? "text-yellow-600"
                        : pkg.status === "unlocked"
                        ? "text-blue-600"
                        : pkg.status === "delivered"
                        ? "text-green-600"
                        : "text-gray-600"
                    }
                  >
                    {pkg.status}
                  </span>
                </p>

                {/* Show unlock button only when delivery requests unlock */}
                {pkg.unlockRequested && pkg.status === "pending_unlock" && (
                  <Button
                    onClick={() => handleUnlockPackage(pkg.id)}
                    className="mt-4 bg-green-600 text-white hover:bg-green-700"
                  >
                    <Unlock className="w-4 h-4 mr-2" /> Unlock Package
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserPage;