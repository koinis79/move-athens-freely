import {
  Weight,
  Package,
  Ruler,
  FoldVertical,
  Armchair,
  Footprints,
  Circle,
  ShieldCheck,
  Battery,
  Gauge,
} from "lucide-react";
import type { SpecItem } from "@/data/equipmentSpecs";

const iconMap: Record<string, React.ElementType> = {
  Weight,
  Package,
  Ruler,
  FoldVertical,
  Armchair,
  Footprints,
  Circle,
  ShieldCheck,
  Battery,
  Gauge,
};

const SpecificationsSection = ({ specs }: { specs: SpecItem[] }) => {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-heading font-bold text-foreground">
        Specifications
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {specs.map((s) => {
          const Icon = iconMap[s.icon] ?? Circle;
          return (
            <div
              key={s.label}
              className="flex items-start gap-3 rounded-lg border bg-card p-4"
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="font-semibold text-foreground">{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default SpecificationsSection;
