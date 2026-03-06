import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { categorySlugMap, type EquipmentItem } from "@/data/equipment";

// Shape returned by Supabase for equipment rows
interface EquipmentRow {
  id: string;
  slug: string;
  name_en: string;
  description_en: string | null;
  price_tier1: number;
  price_tier2: number;
  price_tier3: number;
  price_tier4: number;
  availability: string;
  is_popular: boolean;
  images: string[] | null;
  specifications: Record<string, string> | null;
  equipment_categories: {
    name_en: string;
    slug: string;
  } | null;
}

function mapRow(row: EquipmentRow): EquipmentItem {
  const catSlug = row.equipment_categories?.slug ?? "";
  return {
    id: row.id,
    slug: row.slug,
    name: row.name_en,
    category: categorySlugMap[catSlug] ?? "Wheelchair",
    categorySlug: catSlug,
    description: row.description_en ?? "",
    priceTier1: Number(row.price_tier1),
    priceTier2: Number(row.price_tier2),
    priceTier3: Number(row.price_tier3),
    priceTier4: Number(row.price_tier4),
    // pricePerDay / pricePerWeek kept for any legacy display usage
    pricePerDay: Number(row.price_tier1),
    pricePerWeek: Number(row.price_tier2),
    availability:
      row.availability === "available"
        ? "Available"
        : row.availability === "limited"
        ? "Limited"
        : "Unavailable",
    popular: row.is_popular ?? false,
  };
}

// ─── Hook: equipment listing ─────────────────────────────────────────────────

export function useEquipment(categorySlug?: string) {
  const [items, setItems] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchItems() {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from("equipment")
        .select("*, equipment_categories(name_en, slug)")
        .eq("is_active", true)
        .order("is_popular", { ascending: false });

      if (cancelled) return;

      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }

      let rows = (data as unknown as EquipmentRow[]) ?? [];

      // Filter by category slug client-side (dataset is small)
      if (categorySlug) {
        rows = rows.filter((r) => r.equipment_categories?.slug === categorySlug);
      }

      setItems(rows.map(mapRow));
      setLoading(false);
    }

    fetchItems();
    return () => {
      cancelled = true;
    };
  }, [categorySlug]);

  return { items, loading, error };
}

// ─── Hook: single equipment detail ──────────────────────────────────────────

export interface EquipmentDetailData {
  item: EquipmentItem;
  images: string[];
  specifications: Record<string, string>;
  longDescription: string;
}

export function useEquipmentDetail(slug: string | undefined) {
  const [data, setData] = useState<EquipmentDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    async function fetchDetail() {
      setLoading(true);
      setError(null);

      const { data: row, error: err } = await supabase
        .from("equipment")
        .select("*, equipment_categories(name_en, slug)")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (cancelled) return;

      if (err || !row) {
        setError(err?.message ?? "Equipment not found");
        setLoading(false);
        return;
      }

      const typed = row as unknown as EquipmentRow;

      setData({
        item: mapRow(typed),
        images: typed.images?.length ? typed.images : [],
        specifications: typed.specifications ?? {},
        longDescription: typed.description_en ?? "",
      });
      setLoading(false);
    }

    fetchDetail();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { data, loading, error };
}

// ─── Hook: related equipment (same category, excluding current) ──────────────

export function useRelatedEquipment(
  categorySlug: string | undefined,
  excludeId: string | undefined
) {
  const { items, loading } = useEquipment(categorySlug);
  const related = items.filter((i) => i.id !== excludeId).slice(0, 3);
  return { related, loading };
}
