import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sweet, usePurchaseSweet } from "@/hooks/use-sweets";
import { useAuth } from "@/lib/auth-context";
import { ShoppingCart, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface SweetCardProps {
  sweet: Sweet;
  onPurchaseComplete?: () => void;
}

const categoryColors: Record<string, string> = {
  chocolate: "bg-candy-orange/20 text-candy-orange border-candy-orange/30",
  candy: "bg-candy-pink/20 text-primary border-primary/30",
  gummy: "bg-candy-mint/20 text-accent-foreground border-candy-mint/30",
  lollipop: "bg-candy-lavender/20 text-candy-lavender border-candy-lavender/30",
  cake: "bg-candy-yellow/20 text-secondary-foreground border-candy-yellow/30",
  default: "bg-muted text-muted-foreground border-border",
};

export function SweetCard({ sweet, onPurchaseComplete }: SweetCardProps) {
  const { user } = useAuth();
  const purchaseMutation = usePurchaseSweet();
  const [isHovered, setIsHovered] = useState(false);

  const handlePurchase = async () => {
    if (!user) return;
    await purchaseMutation.mutateAsync({
      sweetId: sweet.id,
      quantity: 1,
      userId: user.id,
    });
    onPurchaseComplete?.();
  };

  const outOfStock = sweet.quantity === 0;
  const categoryColor = categoryColors[sweet.category.toLowerCase()] || categoryColors.default;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        isHovered && "shadow-hover -translate-y-1",
        outOfStock && "opacity-75"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-secondary to-muted">
        {sweet.image_url ? (
          <img
            src={sweet.image_url}
            alt={sweet.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-16 w-16 text-muted-foreground/40" />
          </div>
        )}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <Badge variant="destructive" className="text-sm font-semibold">
              Out of Stock
            </Badge>
          </div>
        )}
        <Badge
          variant="outline"
          className={cn(
            "absolute left-3 top-3 backdrop-blur-sm border",
            categoryColor
          )}
        >
          {sweet.category}
        </Badge>
      </div>

      <CardContent className="p-4">
        <h3 className="font-display text-lg font-semibold text-foreground line-clamp-1">
          {sweet.name}
        </h3>
        {sweet.description && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {sweet.description}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <span className="font-display text-2xl font-bold text-primary">
            ${Number(sweet.price).toFixed(2)}
          </span>
          <span className="text-sm text-muted-foreground">
            {sweet.quantity} in stock
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full gap-2"
          disabled={outOfStock || !user || purchaseMutation.isPending}
          onClick={handlePurchase}
          variant={outOfStock ? "secondary" : "default"}
        >
          <ShoppingCart className="h-4 w-4" />
          {purchaseMutation.isPending
            ? "Processing..."
            : outOfStock
            ? "Out of Stock"
            : user
            ? "Add to Cart"
            : "Sign in to Buy"}
        </Button>
      </CardFooter>
    </Card>
  );
}
