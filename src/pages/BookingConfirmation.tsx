import { useParams } from "react-router-dom";
import PlaceholderPage from "@/components/PlaceholderPage";
const BookingConfirmation = () => {
  const { id } = useParams();
  return <PlaceholderPage title={`Booking Confirmation #${id}`} />;
};
export default BookingConfirmation;
