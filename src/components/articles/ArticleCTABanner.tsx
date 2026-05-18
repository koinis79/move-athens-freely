import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle } from "lucide-react";

const WA_URL = "https://wa.me/306974633697?text=Hi!%20I%27m%20interested%20in%20renting%20mobility%20equipment%20in%20Athens.";

export default function ArticleCTABanner() {
  return (
    <aside className="not-prose my-8 overflow-hidden rounded-2xl bg-primary text-primary-foreground shadow-lg">
      <div className="grid items-center gap-4 p-6 md:grid-cols-[1fr_auto] md:p-8">
        <div>
          <h3 className="text-lg md:text-xl font-heading font-bold leading-tight">
            Need mobility equipment for your Athens trip?
          </h3>
          <p className="mt-1 text-sm text-primary-foreground/85">
            Wheelchairs, scooters, and rollators — delivered to your hotel. Takes 2 minutes to book.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 md:flex-row">
          <Link
            to="/equipment"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white text-primary px-5 py-2.5 text-sm font-bold hover:bg-white/90 transition-colors"
          >
            Browse Equipment <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/10 text-white border border-white/30 px-5 py-2.5 text-sm font-semibold hover:bg-white/20 transition-colors"
          >
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Us
          </a>
        </div>
      </div>
    </aside>
  );
}
