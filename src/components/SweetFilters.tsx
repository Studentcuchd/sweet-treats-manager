import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { SweetFilters as Filters } from "@/hooks/use-sweets";

interface SweetFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  categories: string[];
}

export function SweetFilters({
  filters,
  onFiltersChange,
  categories,
}: SweetFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof Filters, value: string | number | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value === "" ? undefined : value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasFilters = Object.values(filters).some((v) => v !== undefined && v !== "");

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search sweets..."
            value={filters.name || ""}
            onChange={(e) => updateFilter("name", e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={filters.category || "all"}
          onValueChange={(value) =>
            updateFilter("category", value === "all" ? undefined : value)
          }
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={showAdvanced ? "bg-secondary" : ""}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {showAdvanced && (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center animate-fade-in">
          <div className="flex flex-1 items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Price:</span>
            <Input
              type="number"
              placeholder="Min"
              value={filters.minPrice ?? ""}
              onChange={(e) =>
                updateFilter(
                  "minPrice",
                  e.target.value ? parseFloat(e.target.value) : undefined
                )
              }
              className="w-24"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxPrice ?? ""}
              onChange={(e) =>
                updateFilter(
                  "maxPrice",
                  e.target.value ? parseFloat(e.target.value) : undefined
                )
              }
              className="w-24"
            />
          </div>
        </div>
      )}
    </div>
  );
}
