import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

const CtaBanner = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-primary py-16 md:py-20">
      <div className="container flex flex-col items-center text-center">
        <h2 className="text-3xl font-heading font-bold text-primary-foreground md:text-4xl">
          {t("ctaBanner.title")}
        </h2>
        <p className="mt-4 max-w-xl text-lg text-primary-foreground/80">
          {t("ctaBanner.subtitle")}
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Button asChild size="lg" className="rounded-xl bg-accent px-8 text-base font-semibold text-accent-foreground hover:bg-accent/90">
            <a href="https://wa.me/306974633697?text=Hi!%20I%27m%20interested%20in%20renting%20mobility%20equipment%20in%20Athens." target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-5 w-5" />
              {t("ctaBanner.chatWhatsApp")}
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-xl border-2 border-primary-foreground bg-transparent px-8 text-base font-semibold text-primary-foreground hover:bg-primary-foreground hover:text-primary">
            <Link to="/contact">{t("ctaBanner.contactUs")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CtaBanner;
