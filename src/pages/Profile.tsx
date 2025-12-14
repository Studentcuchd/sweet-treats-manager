import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { User, Package, Calendar, DollarSign, Loader2, Save } from "lucide-react";

interface Purchase {
  id: string;
  quantity: number;
  total_price: number;
  created_at: string;
  sweets: {
    name: string;
    category: string;
  } | null;
}

interface Profile {
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

export default function ProfilePage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfileAndPurchases();
    }
  }, [user]);

  const fetchProfileAndPurchases = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, email, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      setProfile(profileData);
      setFullName(profileData?.full_name || "");

      // Fetch purchases with sweet details
      const { data: purchaseData, error: purchaseError } = await supabase
        .from("purchases")
        .select(`
          id,
          quantity,
          total_price,
          created_at,
          sweets (
            name,
            category
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (purchaseError) throw purchaseError;
      setPurchases(purchaseData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been saved.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const totalSpent = purchases.reduce((sum, p) => sum + Number(p.total_price), 0);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">My Profile</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your account and view purchase history
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Profile Settings */}
          <div className="lg:col-span-1">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Account Settings
                </CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-candy-lavender text-2xl font-bold text-foreground">
                    {(fullName || user?.email)?.[0]?.toUpperCase() || "U"}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={isAdmin ? "default" : "secondary"}>
                    {isAdmin ? "Administrator" : "User"}
                  </Badge>
                </div>

                <Button 
                  onClick={handleUpdateProfile} 
                  className="w-full gap-2"
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="mt-6 shadow-card">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{purchases.length}</div>
                    <div className="text-sm text-muted-foreground">Total Orders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-candy-mint">${totalSpent.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">Total Spent</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Purchase History */}
          <div className="lg:col-span-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Purchase History
                </CardTitle>
                <CardDescription>Your recent sweet purchases</CardDescription>
              </CardHeader>
              <CardContent>
                {purchases.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Package className="h-12 w-12 text-muted-foreground/40" />
                    <h3 className="mt-4 font-display text-lg font-semibold">No purchases yet</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Start exploring our delicious sweets!
                    </p>
                    <Button className="mt-4" onClick={() => navigate("/dashboard")}>
                      Browse Sweets
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {purchases.map((purchase) => (
                      <div
                        key={purchase.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary/50"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">
                            {purchase.sweets?.name || "Unknown Sweet"}
                          </h4>
                          <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              Qty: {purchase.quantity}
                            </span>
                            <Separator orientation="vertical" className="h-4" />
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(purchase.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 font-display text-lg font-bold text-primary">
                            <DollarSign className="h-4 w-4" />
                            {Number(purchase.total_price).toFixed(2)}
                          </div>
                          <Badge variant="outline" className="mt-1">
                            {purchase.sweets?.category || "N/A"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
