import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

const CtaBanner = () => (
  <section className="bg-primary py-16 md:py-20">
    <div className="container flex flex-col items-center text-center">
      <h2 className="text-3xl font-heading font-bold text-primary-foreground md:text-4xl">
        Not sure what you need?
      </h2>
      <p className="mt-4 max-w-xl text-lg text-primary-foreground/80">
        Our team is here to help. Tell us about your trip and we'll recommend
        the right equipment.
      </p>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <Button
          asChild
          size="lg"
          className="rounded-xl bg-accent px-8 text-base font-semibold text-accent-foreground hover:bg-accent/90"
        >
          <a
            href="https://wa.me/30210XXXXXXX"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Chat on WhatsApp
          </a>
        </Button>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="rounded-xl border-primary-foreground/30 px-8 text-base font-semibold text-primary-foreground hover:bg-primary-foreground/10"
        >
          <Link to="/contact">Contact Us</Link>
        </Button>
      </div>
    </div>
  </section>
);

export default CtaBanner;
