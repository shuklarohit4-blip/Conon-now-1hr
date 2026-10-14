import { useGetMandiPrices, getGetMandiPricesQueryKey } from "@workspace/api-client-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function MandiTicker() {
  const { data: prices, isLoading } = useGetMandiPrices({
    query: { queryKey: getGetMandiPricesQueryKey(), refetchInterval: 30000 },
  });

  if (isLoading) {
    return (
      <div className="h-8 bg-slate-900 flex items-center justify-center text-[9px] font-black uppercase tracking-widest italic text-slate-500">
        Loading Live Market Rates…
      </div>
    );
  }

  if (!prices || prices.length === 0) {
    return (
      <div className="h-8 bg-slate-900 flex items-center justify-center text-[9px] font-black uppercase tracking-widest italic text-slate-500">
        Market rates unavailable
      </div>
    );
  }

  const items = [...prices, ...prices, ...prices];

  return (
    <div className="h-8 bg-slate-900 text-white flex items-center overflow-hidden relative shrink-0">
      <div className="flex whitespace-nowrap animate-ticker w-max items-center">
        {items.map((p, i) => (
          <span key={`${p.material}-${i}`} className="flex items-center gap-1.5 px-5 text-[9px] font-black uppercase tracking-widest italic">
            {p.trend === "up"   && <TrendingUp  className="w-2.5 h-2.5 text-emerald-400 shrink-0" />}
            {p.trend === "down" && <TrendingDown className="w-2.5 h-2.5 text-rose-400 shrink-0" />}
            {p.trend === "stable" && <Minus className="w-2.5 h-2.5 text-slate-400 shrink-0" />}
            <span className="text-slate-300">{p.material}:</span>
            <span className="text-white">₹{p.currentPrice}</span>
            <span
              className={
                p.trend === "up"   ? "text-emerald-400" :
                p.trend === "down" ? "text-rose-400"    : "text-slate-400"
              }
            >
              {p.trend === "up" ? "↑" : p.trend === "down" ? "↓" : "–"}
              {Math.abs(p.changePercent)}%
            </span>
            <span className="text-slate-700 mx-2">|</span>
          </span>
        ))}
      </div>
    </div>
  );
}
