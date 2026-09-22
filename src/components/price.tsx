export default function Price({
  amount,
  className,
  currencyCode = "BDT",
  currencyCodeClassName,
}: {
  amount: string;
  className?: string;
  currencyCode?: string;
  currencyCodeClassName?: string;
} & React.ComponentProps<"p">) {
  const numericAmount = parseFloat(amount);
  const formatted = Number.isNaN(numericAmount)
    ? "০"
    : new Intl.NumberFormat("bn-BD", {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
      }).format(numericAmount);

  return (
    <p suppressHydrationWarning={true} className={className}>
      <span className={currencyCodeClassName}>
        {currencyCode === "BDT" ? "৳" : `${currencyCode} `}
      </span>
      <span>{formatted}</span>
    </p>
  );
}
