import { Card, CardContent } from "@/components/ui/card";

const EquipmentCardSkeleton = () => (
  <Card className="h-full overflow-hidden">
    <div className="relative aspect-[3/2] overflow-hidden bg-muted">
      <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-foreground/5 to-transparent" />
    </div>
    <CardContent className="flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="h-5 w-2/3 rounded bg-muted animate-pulse" />
        <div className="h-5 w-16 rounded-full bg-muted animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-3.5 w-full rounded bg-muted animate-pulse" />
        <div className="h-3.5 w-3/4 rounded bg-muted animate-pulse" />
      </div>
      <div className="h-5 w-24 rounded bg-muted animate-pulse mt-1" />
      <div className="h-10 w-full rounded-xl bg-muted animate-pulse mt-2" />
    </CardContent>
  </Card>
);

export default EquipmentCardSkeleton;
