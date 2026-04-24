import { ShieldCheck } from "lucide-react";

const KoinisTrust = () => (
  <section className="bg-blue-50/60 dark:bg-blue-950/20 border-y border-blue-100 dark:border-blue-900/40 py-6">
    <div className="container flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
        <ShieldCheck className="h-5 w-5 text-blue-700 dark:text-blue-300" />
      </div>
      <p className="text-sm sm:text-base text-gray-700 dark:text-gray-200">
        <span className="font-semibold text-gray-900 dark:text-white">Backed by Koinis Healthcare</span>
        <span className="text-gray-600 dark:text-gray-300">
          {" — over 30 years serving mobility needs in Greece."}
        </span>
      </p>
    </div>
  </section>
);

export default KoinisTrust;
