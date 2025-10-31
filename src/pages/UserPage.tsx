import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/firebaseClient"; // frontend firebaseClient.ts
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Unlock } from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import axios from "axios";

const API_BASE = "http://localhost:3000/api/packages";

interface PackageType {
  id: string;
  trackingNumber: string;
  description: string;
  status: string;
  unlockRequested?: boolean;
}

const UserPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [packages, setPackages] = useState<PackageType[]>([]);
  const userId = user?.uid;

  // Real-time Firestore listener for user's packages
  useEffect(() => {
    if (!userId) return; // wait until user is loaded
    const q = query(collection(db, "packages"), where("userId", "==", userId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updated = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as PackageType)
      );
      setPackages(updated);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleUnlockPackage = async (id: string) => {
    try {
      const res = await axios.put(`${API_BASE}/${id}/unlock`);
      if (res.status !== 200) throw new Error("Unlock failed");

      toast({
        title: "Unlocked ✅",
        description: "Your package has been unlocked. ESP32 notified successfully.",
      });
    } catch (error) {
      toast({
        title: "Unlock Failed ❌",
        description: "Could not unlock the package. Try again.",
        variant: "destructive",
      });
    }
  };

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-screen text-lg font-semibold">
        Please log in to view your deliveries.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <h1 className="text-3xl font-bold text-center my-8">📬 My Deliveries</h1>

      {packages.length === 0 ? (
        <p className="text-center text-muted-foreground">No packages yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
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
                      pkg.status === "delivered"
                        ? "text-green-600"
                        : pkg.status === "pending_unlock"
                        ? "text-yellow-600"
                        : pkg.status === "unlocked"
                        ? "text-blue-600"
                        : "text-gray-600"
                    }
                  >
                    {pkg.status}
                  </span>
                </p>

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