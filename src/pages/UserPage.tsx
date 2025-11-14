import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/firebaseClient";
import { collection, onSnapshot } from "firebase/firestore";
import {
  Unlock,
  Package,
  PackageCheck,
  Clock,
  CheckCircle,
  Trash2,
  XCircle,
} from "lucide-react";
import axios from "axios";

const API_BASE = "http://192.168.43.130:3000/api/packages";

// ===============================
//  PACKAGE TYPE FIX
// ===============================
interface PackageType {
  id: string;
  trackingNumber: string;
  description: string;
  status: string;
  unlockRequested?: boolean;
  createdAt?: string;
  deliveredAt?: string;
  failedAt?: string;
}

const UserPage = () => {
  const { toast } = useToast();
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [lastStatuses, setLastStatuses] = useState<Record<string, string>>({});

// Status cache using ref (no re-renders, always up-to-date)
const prevStatuses = React.useRef<Record<string, string>>({});

useEffect(() => {
  const q = collection(db, "packages");

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const updated: PackageType[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as PackageType),
    }));

    updated.forEach((pkg) => {
      const oldStatus = prevStatuses.current[pkg.id];
      const newStatus = pkg.status;

      // 🔥 Detect status change
      if (oldStatus && oldStatus !== newStatus) {
        if (newStatus === "delivered") {
          toast({
            title: "📦 Parcel Delivered",
            description: "Your parcel is inside the Dropbox.",
          });
        }

        if (newStatus === "failed_delivery") {
          toast({
            title: "❌ Parcel Not Received",
            description: "Delivery person closed box without parcel.",
            variant: "destructive",
          });
        }
      }

      // store new status
      prevStatuses.current[pkg.id] = newStatus;
    });

    setPackages(updated);
  });

  return () => unsubscribe();
}, []);    // <-- IMPORTANT: empty dependency !


  // Global unlock
  const handleGlobalUnlock = async () => {
    try {
      await axios.put(`${API_BASE}/unlock-box`);
      toast({
        title: "Dropbox Unlocked",
        description: "Command sent to ESP32.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to unlock Dropbox.",
        variant: "destructive",
      });
    }
  };
const handleGlobalLock = async () => {
  try {
    await axios.put(`${API_BASE}/lock-box`);
    toast({
      title: "Dropbox Locked",
      description: "Command sent to ESP32.",
    });
  } catch {
    toast({
      title: "Error",
      description: "Failed to lock Dropbox.",
      variant: "destructive",
    });
  }
};

  // Package unlock
  const handlePackageUnlock = async (id: string) => {
    try {
      await axios.put(`${API_BASE}/${id}/unlock`);
      toast({
        title: "Unlocking...",
        description: "Request sent to ESP32",
      });
    } catch {
      toast({
        title: "Error",
        description: "Could not unlock package.",
        variant: "destructive",
      });
    }
  };

  // Delete package
  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_BASE}/${id}`);
      toast({ title: "Package Deleted" });
    } catch {
      toast({
        title: "Error",
        description: "Could not delete package.",
        variant: "destructive",
      });
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending_unlock":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "unlocked":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-300";
      case "failed_delivery":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending_unlock":
        return <Clock className="w-4 h-4 mr-1" />;
      case "unlocked":
        return <Unlock className="w-4 h-4 mr-1" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4 mr-1" />;
      case "failed_delivery":
        return <XCircle className="w-4 h-4 mr-1" />;
      default:
        return <PackageCheck className="w-4 h-4 mr-1" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-8">
      <h1 className="text-4xl font-extrabold text-center mb-6 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
        📬 All Deliveries
      </h1>

    <div className="flex justify-center gap-4 mb-8">

     {/* UNLOCK BUTTON */}
       <Button
       onClick={handleGlobalUnlock}
       className="bg-green-600 hover:bg-green-700 text-white text-lg px-6 py-3 rounded-xl"
       >
       <Unlock className="w-5 h-5 mr-2" /> Unlock Dropbox
      </Button>

     {/* LOCK BUTTON */}
     <Button
      onClick={handleGlobalLock}
      className="bg-red-600 hover:bg-red-700 text-white text-lg px-6 py-3 rounded-xl"
      >
      <XCircle className="w-5 h-5 mr-2" /> Lock Dropbox
   </Button>
</div>
      {/* PACKAGE CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="shadow-lg rounded-2xl bg-white">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 p-3 rounded-full">
                  <Package className="text-indigo-600 w-6 h-6" />
                </div>
                <CardTitle className="text-lg">
                  {pkg.trackingNumber || "No Tracking"}
                </CardTitle>
              </div>

              <div className="flex justify-between items-center mt-2">
                <div
                  className={`text-xs px-2 py-1 rounded-full border flex items-center ${getStatusStyle(
                    pkg.status
                  )}`}
                >
                  {getStatusIcon(pkg.status)} {pkg.status.replace("_", " ")}
                </div>

                {pkg.status === "pending_unlock" && (
                  <Button
                    size="sm"
                    onClick={() => handlePackageUnlock(pkg.id)}
                    className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full"
                  >
                    <Unlock className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-gray-600 text-sm">{pkg.description}</p>

              <Button
                onClick={() => handleDelete(pkg.id)}
                className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white rounded-xl"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserPage;
