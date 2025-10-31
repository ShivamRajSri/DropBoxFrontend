import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Truck,
  Package,
  CheckCircle,
  Clock,
  MapPin,
  Send,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";

// ===============================
// 🔥 Firebase Frontend Config
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyDZqzf4-86ouuiFxS_cnzY-6o0o5qOb-5o",
  authDomain: "react-46589.firebaseapp.com",
  projectId: "react-46589",
  storageBucket: "react-46589.firebasestorage.app",
  messagingSenderId: "180036666051",
  appId: "1:180036666051:web:65a18631204c3803995876",
  measurementId: "G-JMTLTG9SZ4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===============================
// 🔹 Types
// ===============================
interface DeliveryPackage {
  id: string;
  trackingNumber: string;
  customerName: string;
  address: string;
  status: "in_transit" | "delivered" | "pending_unlock" | "unlocked" | "collected";
  unlockRequested?: boolean;
  userId?: string;
  description?: string;
}

// ===============================
// 🚚 Delivery Dashboard
// ===============================
const DeliveryPage = () => {
  const deliveryPersonId = "delivery123"; // Replace with actual delivery user ID
  const { toast } = useToast();

  const [packages, setPackages] = useState<DeliveryPackage[]>([]);
  const [newPackage, setNewPackage] = useState({
    trackingNumber: "",
    customerName: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);

  // ========================================
  // 🔥 Real-time Firestore Listener
  // ========================================
  useEffect(() => {
    const q = query(collection(db, "packages"), where("userId", "==", deliveryPersonId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const pkgList: DeliveryPackage[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as DeliveryPackage),
        }));
        setPackages(pkgList);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore listener error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [deliveryPersonId]);

  // ========================================
  // ➕ Add New Package
  // ========================================
  const addNewPackage = async () => {
    if (!newPackage.trackingNumber || !newPackage.customerName || !newPackage.address) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addDoc(collection(db, "packages"), {
        userId: deliveryPersonId,
        trackingNumber: newPackage.trackingNumber,
        customerName: newPackage.customerName,
        address: newPackage.address,
        description: `Package for ${newPackage.customerName}`,
        status: "in_transit",
        unlockRequested: false,
        deliveryDate: new Date().toISOString().split("T")[0],
      });

      toast({ title: "Package Added", description: "Added to delivery queue." });
      setNewPackage({ trackingNumber: "", customerName: "", address: "" });
    } catch (error) {
      console.error("Error adding package:", error);
      toast({
        title: "Error",
        description: "Could not add the package.",
        variant: "destructive",
      });
    }
  };

  // ========================================
  // 🚦 Delivery Actions
  // ========================================
  const handleMarkDelivered = async (id: string) => {
    await updateDoc(doc(db, "packages", id), { status: "delivered" });
    toast({ title: "Marked Delivered", description: "Package delivered to address." });
  };

  const handleRequestUnlock = async (id: string) => {
    await updateDoc(doc(db, "packages", id), {
      status: "pending_unlock",
      unlockRequested: true,
    });
    toast({ title: "Unlock Requested", description: "Customer notified for unlock." });
  };

  const handleMarkCollected = async (id: string) => {
    await updateDoc(doc(db, "packages", id), {
      status: "collected",
      unlockRequested: false,
    });
    toast({ title: "Package Collected", description: "Package has been collected." });
  };

  // ========================================
  // 🎨 UI Helpers
  // ========================================
  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_transit":
        return "bg-blue-500 text-white";
      case "delivered":
        return "bg-green-500 text-white";
      case "pending_unlock":
        return "bg-yellow-500 text-black";
      case "unlocked":
        return "bg-cyan-600 text-white";
      case "collected":
        return "bg-gray-400 text-white";
      default:
        return "bg-gray-300 text-black";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "in_transit":
        return <Truck className="w-4 h-4" />;
      case "delivered":
        return <Package className="w-4 h-4" />;
      case "pending_unlock":
        return <Clock className="w-4 h-4" />;
      case "collected":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  // ========================================
  // 🧱 Render UI
  // ========================================
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-500 shadow-md">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center">
            <Truck className="w-8 h-8 text-white mr-4" />
            <div>
              <h1 className="text-3xl font-bold text-white">Delivery Dashboard</h1>
              <p className="text-white/80 mt-2">
                Manage packages and communicate unlock requests in real-time
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Package Section */}
      <div className="container mx-auto px-6 py-8">
        <Card className="mb-8 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold">
              <Package className="w-5 h-5 mr-2" /> Add New Package
            </CardTitle>
            <CardDescription>Add a new delivery to your route</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <Label>Tracking Number</Label>
                <Input
                  value={newPackage.trackingNumber}
                  onChange={(e) =>
                    setNewPackage({ ...newPackage, trackingNumber: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Customer Name</Label>
                <Input
                  value={newPackage.customerName}
                  onChange={(e) =>
                    setNewPackage({ ...newPackage, customerName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  value={newPackage.address}
                  onChange={(e) =>
                    setNewPackage({ ...newPackage, address: e.target.value })
                  }
                />
              </div>
            </div>
            <Button onClick={addNewPackage}>Add Package</Button>
          </CardContent>
        </Card>

        {/* Packages Grid */}
        {loading ? (
          <p className="text-center text-muted-foreground">Loading packages...</p>
        ) : packages.length === 0 ? (
          <p className="text-center text-muted-foreground">No packages found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <Card key={pkg.id} className="shadow-md hover:shadow-lg transition">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{pkg.trackingNumber}</CardTitle>
                    <Badge className={`${getStatusColor(pkg.status)} flex gap-1`}>
                      {getStatusIcon(pkg.status)}
                      {pkg.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <CardDescription>{pkg.customerName}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground mb-2 flex gap-2">
                    <MapPin className="w-4 h-4" /> {pkg.address}
                  </div>

                  {pkg.status === "in_transit" && (
                    <Button
                      onClick={() => handleMarkDelivered(pkg.id)}
                      className="w-full bg-green-600 text-white"
                    >
                      Mark Delivered
                    </Button>
                  )}

                  {pkg.status === "delivered" && (
                    <Button
                      onClick={() => handleRequestUnlock(pkg.id)}
                      className="w-full bg-blue-600 text-white"
                    >
                      Request Unlock
                    </Button>
                  )}

                  {pkg.status === "pending_unlock" && (
                    <div className="space-y-2">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-700">
                          Waiting for customer approval...
                        </p>
                      </div>
                      <Button
                        onClick={() => handleMarkCollected(pkg.id)}
                        className="w-full bg-green-600 text-white"
                      >
                        Mark Collected
                      </Button>
                    </div>
                  )}

                  {pkg.status === "unlocked" && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-700">
                        ✅ Box unlocked — ready to collect
                      </p>
                      <Button
                        onClick={() => handleMarkCollected(pkg.id)}
                        className="w-full mt-2 bg-green-600 text-white"
                      >
                        Mark Collected
                      </Button>
                    </div>
                  )}

                  {pkg.status === "collected" && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <p className="text-sm text-gray-700">
                        📦 Package successfully collected
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryPage;