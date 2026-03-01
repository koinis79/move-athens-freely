import { useParams } from "react-router-dom";
import PlaceholderPage from "@/components/PlaceholderPage";
const EquipmentDetail = () => {
  const { slug } = useParams();
  return <PlaceholderPage title={`Equipment: ${slug}`} />;
};
export default EquipmentDetail;
