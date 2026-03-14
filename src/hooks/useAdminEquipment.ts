import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface AdminEquipmentItem {
  id: string;
  name_en: string;
  name_el: string | null;
  slug: string;
  category_id: string;
  availability: string;
  price_tier1: number;
  price_tier2: number;
  price_tier3: number;
  price_tier4: number;
  deposit_amount: number;
  quantity_total: number;
  is_active: boolean;
  is_popular: boolean;
  images: string[];
  description_en: string | null;
  specifications: any;
  created_at: string;
  updated_at: string;
  equipment_categories: {
    name_en: string;
    slug: string;
  } | null;
}

export function useAdminEquipment() {
  const [equipment, setEquipment] = useState<AdminEquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEquipment = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from("equipment")
      .select(`*, equipment_categories(name_en, slug)`)
      .order("name_en");

    if (err) {
      setError(err.message);
      toast({ title: "Error loading equipment", description: err.message, variant: "destructive" });
    } else {
      setEquipment((data as AdminEquipmentItem[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const updateEquipmentAvailability = async (equipmentId: string, availability: string) => {
    const { error: err } = await supabase
      .from("equipment")
      .update({ availability })
      .eq("id", equipmentId);

    if (err) {
      toast({ title: "Error updating equipment", description: err.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Equipment updated", description: `Status changed to ${availability}` });
    await fetchEquipment();
    return true;
  };

  return { equipment, loading, error, refetch: fetchEquipment, updateEquipmentAvailability };
}
