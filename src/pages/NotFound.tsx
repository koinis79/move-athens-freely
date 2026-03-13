import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[calc(100vh-var(--header-height))] items-center justify-center px-6 py-16">
      <div className="mx-auto max-w-md text-center">
        <span className="text-8xl select-none" aria-hidden="true">🗺️</span>

        <h1 className="mt-6 text-3xl font-heading font-bold text-foreground md:text-4xl">
          Oops! This page wandered off
        </h1>

        <p className="mt-3 text-muted-foreground text-lg">
          The page you're looking for doesn't exist or has moved.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="rounded-xl w-full sm:w-auto">
            <Link to="/equipment">Browse Equipment</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-xl w-full sm:w-auto">
            <Link to="/">Go Home</Link>
          </Button>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          Need help?{" "}
          <a
            href="https://wa.me/302109511750?text=Hi!%20I%20need%20help%20finding%20a%20page%20on%20your%20website."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Contact us on WhatsApp
          </a>
        </p>
      </div>
    </div>
  );
};

export default NotFound;
