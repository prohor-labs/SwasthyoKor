import { CheckCircle, Delivery, ShieldTick, Tree } from "@/components/icons";

const features = [
  {
    icon: Tree,
    label: "নিজস্ব বাগান",
  },
  {
    icon: ShieldTick,
    label: "কেমিক্যাল মুক্ত",
  },
  {
    icon: CheckCircle,
    label: "হাতে বাছাইকৃত",
  },
  {
    icon: Delivery,
    label: "নিরাপদ ডেলিভারি",
  },
];

function FeatureBar() {
  return (
    <section className="border-b border-border/80 bg-muted/40 backdrop-blur-xs">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 text-center sm:grid-cols-4 sm:gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.label}
              className="flex flex-col items-center gap-2"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                <Icon className="size-5" />
              </div>
              <span className="text-xs font-bold text-foreground sm:text-sm">
                {feature.label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
