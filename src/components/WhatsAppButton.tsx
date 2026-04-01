import { MessageCircle } from "lucide-react";

const WHATSAPP_URL =
  "https://wa.me/306974633697?text=Hi!%20I%27m%20interested%20in%20renting%20mobility%20equipment%20in%20Athens.";

const WhatsAppButton = () => (
  <a
    href={WHATSAPP_URL}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chat with us on WhatsApp"
    className="fixed bottom-24 right-6 z-50 md:bottom-6 flex h-[60px] w-[60px] items-center justify-center rounded-full shadow-lg transition-transform duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:right-6 max-md:h-[50px] max-md:w-[50px]"
    style={{ backgroundColor: "#25D366" }}
  >
    <MessageCircle className="h-7 w-7 max-md:h-6 max-md:w-6 text-white" fill="white" />
  </a>
);

export default WhatsAppButton;
