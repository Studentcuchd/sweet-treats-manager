import { useState, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { SweetCard } from "@/components/SweetCard";
import { SweetFilters } from "@/components/SweetFilters";
import { useSweets, SweetFilters as Filters } from "@/hooks/use-sweets";
import { Loader2, Candy } from "lucide-react";

export default function Dashboard() {
  const [filters, setFilters] = useState<Filters>({});
  const { data: sweets, isLoading, error } = useSweets(filters);

  const categories = useMemo(() => {
    if (!sweets) return [];
    const uniqueCategories = [...new Set(sweets.map((s) => s.category))];
    return uniqueCategories.sort();
  }, [sweets]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            Browse Sweets
          </h1>
          <p className="mt-2 text-muted-foreground">
            Discover our delicious collection of candies and treats
          </p>
        </div>

        <div className="mb-8">
          <SweetFilters
            filters={filters}
            onFiltersChange={setFilters}
            categories={categories}
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-lg text-destructive">Failed to load sweets</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
        ) : sweets && sweets.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sweets.map((sweet, index) => (
              <div
                key={sweet.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <SweetCard sweet={sweet} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
              <Candy className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground">
              No sweets found
            </h3>
            <p className="mt-2 text-muted-foreground">
              {Object.keys(filters).length > 0
                ? "Try adjusting your filters"
                : "Check back later for delicious treats!"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
