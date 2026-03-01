import { useParams, Navigate } from "react-router-dom";
import EquipmentListing from "@/components/equipment/EquipmentListing";
import { categorySlugMap } from "@/data/equipment";

const validSlugs = Object.keys(categorySlugMap);

const EquipmentCategory = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();

  if (!categorySlug || !validSlugs.includes(categorySlug)) {
    return <Navigate to="/equipment" replace />;
  }

  return <EquipmentListing categorySlug={categorySlug} />;
};

export default EquipmentCategory;
