import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Sweet {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  quantity: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface SweetFilters {
  name?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export function useSweets(filters?: SweetFilters) {
  return useQuery({
    queryKey: ["sweets", filters],
    queryFn: async () => {
      let query = supabase
        .from("sweets")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.name) {
        query = query.ilike("name", `%${filters.name}%`);
      }
      if (filters?.category) {
        query = query.eq("category", filters.category);
      }
      if (filters?.minPrice !== undefined) {
        query = query.gte("price", filters.minPrice);
      }
      if (filters?.maxPrice !== undefined) {
        query = query.lte("price", filters.maxPrice);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Sweet[];
    },
  });
}

export function useCreateSweet() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (sweet: Omit<Sweet, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("sweets")
        .insert(sweet)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sweets"] });
      toast({
        title: "Sweet added!",
        description: "The sweet has been added to inventory.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateSweet() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Sweet> & { id: string }) => {
      const { data, error } = await supabase
        .from("sweets")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sweets"] });
      toast({
        title: "Sweet updated!",
        description: "The sweet has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteSweet() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("sweets")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sweets"] });
      toast({
        title: "Sweet deleted!",
        description: "The sweet has been removed from inventory.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function usePurchaseSweet() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      sweetId,
      quantity,
      userId,
    }: {
      sweetId: string;
      quantity: number;
      userId: string;
    }) => {
      // First, get the current sweet to check stock and price
      const { data: sweet, error: fetchError } = await supabase
        .from("sweets")
        .select("*")
        .eq("id", sweetId)
        .single();

      if (fetchError) throw fetchError;
      if (!sweet) throw new Error("Sweet not found");
      if (sweet.quantity < quantity) throw new Error("Not enough stock");

      // Calculate total price
      const totalPrice = sweet.price * quantity;

      // Update the sweet quantity
      const { error: updateError } = await supabase
        .from("sweets")
        .update({ quantity: sweet.quantity - quantity })
        .eq("id", sweetId);

      if (updateError) throw updateError;

      // Create purchase record
      const { error: purchaseError } = await supabase
        .from("purchases")
        .insert({
          user_id: userId,
          sweet_id: sweetId,
          quantity,
          total_price: totalPrice,
        });

      if (purchaseError) throw purchaseError;

      return { sweet, totalPrice };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["sweets"] });
      toast({
        title: "Purchase successful!",
        description: `You purchased ${data.sweet.name} for $${data.totalPrice.toFixed(2)}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Purchase failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useRestockSweet() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      sweetId,
      quantity,
    }: {
      sweetId: string;
      quantity: number;
    }) => {
      // Get current quantity
      const { data: sweet, error: fetchError } = await supabase
        .from("sweets")
        .select("quantity, name")
        .eq("id", sweetId)
        .single();

      if (fetchError) throw fetchError;
      if (!sweet) throw new Error("Sweet not found");

      // Update quantity
      const { error: updateError } = await supabase
        .from("sweets")
        .update({ quantity: sweet.quantity + quantity })
        .eq("id", sweetId);

      if (updateError) throw updateError;

      return { name: sweet.name, newQuantity: sweet.quantity + quantity };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["sweets"] });
      toast({
        title: "Restock successful!",
        description: `${data.name} now has ${data.newQuantity} in stock.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Restock failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
