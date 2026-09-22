import { QuoteUp } from "@/components/icons";

function QuoteSection() {
  return (
    <section
      id="kotha"
      className="relative overflow-hidden border-y border-border/80 bg-neutral-950 py-16 text-neutral-100 sm:py-20 md:py-24"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] opacity-15 [background-size:20px_20px]" />
      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6">
        <div className="mx-auto mb-6 flex size-12 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400">
          <QuoteUp className="size-6" />
        </div>
        <p
          className="mb-6 font-serif text-2xl leading-relaxed text-amber-400 sm:text-3xl md:text-4xl"
          dir="rtl"
          lang="ar"
        >
          يَا أَيُّهَا النَّاسُ كُلُوا مِمَّا فِي الْأَرْضِ حَلَالًا طَيِّبًا
        </p>
        <p className="mb-5 text-lg font-medium leading-relaxed text-neutral-200 sm:text-xl md:text-2xl">
          “হে মানুষ! পৃথিবীতে যা কিছু হালাল ও পবিত্র বস্তু রয়েছে তা থেকে তোমরা আহার করো।”
        </p>
        <p className="font-mono text-xs tracking-widest text-amber-400/90 uppercase sm:text-sm">
          — সূরা আল-বাকারা: ১৬৮
        </p>
      </div>
    </section>
  );
}
