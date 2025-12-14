import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { useSweets, useCreateSweet, useUpdateSweet, useDeleteSweet, useRestockSweet, Sweet } from "@/hooks/use-sweets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Package, Loader2, RefreshCw } from "lucide-react";

const CATEGORIES = ["Chocolate", "Candy", "Gummy", "Lollipop", "Cake"];

interface SweetFormData {
  name: string;
  description: string;
  category: string;
  price: string;
  quantity: string;
  image_url: string;
}

const emptyForm: SweetFormData = {
  name: "",
  description: "",
  category: "",
  price: "",
  quantity: "",
  image_url: "",
};

export default function AdminPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { data: sweets, isLoading } = useSweets();
  const createMutation = useCreateSweet();
  const updateMutation = useUpdateSweet();
  const deleteMutation = useDeleteSweet();
  const restockMutation = useRestockSweet();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false);
  const [selectedSweet, setSelectedSweet] = useState<Sweet | null>(null);
  const [formData, setFormData] = useState<SweetFormData>(emptyForm);
  const [restockAmount, setRestockAmount] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/dashboard");
    }
  }, [user, authLoading, isAdmin, navigate]);

  const handleInputChange = (field: keyof SweetFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSweet = async () => {
    await createMutation.mutateAsync({
      name: formData.name,
      description: formData.description || null,
      category: formData.category,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity) || 0,
      image_url: formData.image_url || null,
    });
    setIsAddDialogOpen(false);
    setFormData(emptyForm);
  };

  const handleEditSweet = async () => {
    if (!selectedSweet) return;
    await updateMutation.mutateAsync({
      id: selectedSweet.id,
      name: formData.name,
      description: formData.description || null,
      category: formData.category,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity) || 0,
      image_url: formData.image_url || null,
    });
    setIsEditDialogOpen(false);
    setSelectedSweet(null);
    setFormData(emptyForm);
  };

  const handleDeleteSweet = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const handleRestock = async () => {
    if (!selectedSweet || !restockAmount) return;
    await restockMutation.mutateAsync({
      sweetId: selectedSweet.id,
      quantity: parseInt(restockAmount),
    });
    setIsRestockDialogOpen(false);
    setSelectedSweet(null);
    setRestockAmount("");
  };

  const openEditDialog = (sweet: Sweet) => {
    setSelectedSweet(sweet);
    setFormData({
      name: sweet.name,
      description: sweet.description || "",
      category: sweet.category,
      price: String(sweet.price),
      quantity: String(sweet.quantity),
      image_url: sweet.image_url || "",
    });
    setIsEditDialogOpen(true);
  };

  const openRestockDialog = (sweet: Sweet) => {
    setSelectedSweet(sweet);
    setRestockAmount("");
    setIsRestockDialogOpen(true);
  };

  const isFormValid = formData.name && formData.category && formData.price;

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const totalInventory = sweets?.reduce((sum, s) => sum + s.quantity, 0) || 0;
  const lowStockItems = sweets?.filter((s) => s.quantity < 20).length || 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Admin Panel</h1>
            <p className="mt-2 text-muted-foreground">Manage your sweet shop inventory</p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Sweet
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Sweet</DialogTitle>
                <DialogDescription>Add a new item to your inventory</DialogDescription>
              </DialogHeader>
              <SweetForm formData={formData} onChange={handleInputChange} />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddSweet} disabled={!isFormValid || createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Sweet
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card className="shadow-card">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{sweets?.length || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-candy-mint/20">
                <RefreshCw className="h-6 w-6 text-candy-mint" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Inventory</p>
                <p className="text-2xl font-bold">{totalInventory}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                <Package className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold">{lowStockItems}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Inventory</CardTitle>
            <CardDescription>Manage all sweets in your shop</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sweets?.map((sweet) => (
                      <TableRow key={sweet.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {sweet.image_url ? (
                              <img
                                src={sweet.image_url}
                                alt={sweet.name}
                                className="h-10 w-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                                <Package className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            <span className="font-medium">{sweet.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{sweet.category}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${Number(sweet.price).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={sweet.quantity < 20 ? "destructive" : "secondary"}>
                            {sweet.quantity}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openRestockDialog(sweet)}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(sweet)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete {sweet.name}?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the
                                    sweet from your inventory.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteSweet(sweet.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Sweet</DialogTitle>
              <DialogDescription>Update the sweet details</DialogDescription>
            </DialogHeader>
            <SweetForm formData={formData} onChange={handleInputChange} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditSweet} disabled={!isFormValid || updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Restock Dialog */}
        <Dialog open={isRestockDialogOpen} onOpenChange={setIsRestockDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Restock {selectedSweet?.name}</DialogTitle>
              <DialogDescription>
                Current stock: {selectedSweet?.quantity}. How many units to add?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="restockAmount">Quantity to Add</Label>
              <Input
                id="restockAmount"
                type="number"
                min="1"
                value={restockAmount}
                onChange={(e) => setRestockAmount(e.target.value)}
                placeholder="Enter quantity"
                className="mt-2"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRestockDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleRestock}
                disabled={!restockAmount || restockMutation.isPending}
                variant="mint"
              >
                {restockMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Restock
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

function SweetForm({
  formData,
  onChange,
}: {
  formData: SweetFormData;
  onChange: (field: keyof SweetFormData, value: string) => void;
}) {
  return (
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder="Chocolate Truffles"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="Delicious hand-crafted chocolates..."
          rows={2}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select value={formData.category} onValueChange={(v) => onChange("category", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => onChange("price", e.target.value)}
            placeholder="9.99"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Initial Stock</Label>
          <Input
            id="quantity"
            type="number"
            min="0"
            value={formData.quantity}
            onChange={(e) => onChange("quantity", e.target.value)}
            placeholder="50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="image_url">Image URL</Label>
          <Input
            id="image_url"
            value={formData.image_url}
            onChange={(e) => onChange("image_url", e.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>
    </div>
  );
}
