import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/firebaseClient";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Unlock } from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import axios from "axios";

const API_BASE = "http://localhost:3000/api/packages";

const UserPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [packages, setPackages] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(collection(db, "packages"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updated = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPackages(updated);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const handleUnlock = async (id: string) => {
    try {
      await axios.put(`${API_BASE}/${id}/unlock`);
      toast({ title: "Box Unlocked ✅", description: "ESP32 device triggered." });
    } catch {
      toast({ title: "Failed ❌", description: "Could not unlock box", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <h1 className="text-3xl font-bold text-center mb-6">📬 My Deliveries</h1>

      {packages.length === 0 ? (
        <p className="text-center text-muted-foreground">No deliveries yet</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <Card key={pkg.id}>
              <CardHeader>
                <CardTitle>{pkg.trackingNumber}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{pkg.description}</p>
                <p>Status: <b>{pkg.status}</b></p>

                {pkg.unlockRequested && pkg.status === "pending_unlock" && (
                  <Button className="mt-3 bg-green-600 text-white hover:bg-green-700" onClick={() => handleUnlock(pkg.id)}>
                    <Unlock className="w-4 h-4 mr-2" /> Unlock Box
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