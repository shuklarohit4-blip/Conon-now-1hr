import { useEffect, useRef, useState } from "react";
import { Search, MapPin, Loader2, X } from "lucide-react";
import {
  fetchAutocomplete,
  fetchPlaceDetails,
  newSessionToken,
  type PlacePrediction,
  type PlaceDetails,
} from "@/lib/mapsApi";

const GREEN = "#2a7a3b";

interface AddressAutocompleteProps {
  onSelect: (place: PlaceDetails) => void;
  placeholder?: string;
  initialValue?: string;
  autoFocus?: boolean;
}

/**
 * Google Places-powered address search. Talks ONLY to our server proxy, so the
 * Maps API key is never shipped to the browser. Debounces input, shows a
 * predictions dropdown, and resolves the chosen place to coordinates.
 */
export function AddressAutocomplete({
  onSelect,
  placeholder = "Search your delivery address…",
  initialValue = "",
  autoFocus = false,
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(initialValue);
  const [preds, setPreds] = useState<PlacePrediction[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tokenRef = useRef(newSessionToken());
  const abortRef = useRef<AbortController | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const justPickedRef = useRef(false);

  useEffect(() => {
    if (autoFocus) setTimeout(() => inputRef.current?.focus(), 120);
  }, [autoFocus]);

  // Debounced predictions.
  useEffect(() => {
    if (justPickedRef.current) {
      justPickedRef.current = false;
      return;
    }
    const q = query.trim();
    if (q.length < 3) {
      setPreds([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const ac = new AbortController();
    abortRef.current?.abort();
    abortRef.current = ac;
    const t = setTimeout(async () => {
      try {
        const list = await fetchAutocomplete(q, tokenRef.current, ac.signal);
        if (ac.signal.aborted) return;
        setPreds(list);
        setOpen(true);
      } catch (e) {
        if ((e as { name?: string })?.name !== "AbortError") {
          setError("Couldn't load suggestions. Check your connection.");
          setPreds([]);
        }
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    }, 300);
    return () => {
      clearTimeout(t);
      ac.abort();
    };
  }, [query]);

  // Close dropdown on outside click.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const pick = async (p: PlacePrediction) => {
    justPickedRef.current = true;
    setQuery(p.description);
    setOpen(false);
    setPreds([]);
    setResolving(true);
    setError(null);
    try {
      const details = await fetchPlaceDetails(p.placeId, tokenRef.current);
      tokenRef.current = newSessionToken(); // new billing session after a selection
      onSelect(details);
    } catch {
      setError("Couldn't fetch that address. Please pick another.");
    } finally {
      setResolving(false);
    }
  };

  const clear = () => {
    setQuery("");
    setPreds([]);
    setOpen(false);
    setError(null);
    inputRef.current?.focus();
  };

  return (
    <div ref={boxRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => preds.length > 0 && setOpen(true)}
          className="w-full pl-10 pr-10 py-3.5 rounded-2xl border-2 border-slate-200 text-sm font-bold focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition"
        />
        {(loading || resolving) && (
          <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />
        )}
        {!loading && !resolving && query && (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear address"
            className="absolute right-3 top-1/2 -translate-y-1/2 active:scale-90 transition"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>

      {error && (
        <p className="mt-1.5 text-[11px] font-semibold text-red-500">{error}</p>
      )}

      {open && preds.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-h-72 overflow-y-auto">
          {preds.map((p) => (
            <button
              key={p.placeId}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(p)}
              className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-green-50 active:bg-green-100 transition border-b border-slate-50 last:border-0"
            >
              <MapPin
                className="w-4 h-4 mt-0.5 shrink-0"
                style={{ color: GREEN }}
              />
              <span className="min-w-0">
                <span className="block text-sm font-bold text-slate-800 truncate">
                  {p.mainText}
                </span>
                {p.secondaryText && (
                  <span className="block text-[11px] text-slate-400 font-semibold truncate">
                    {p.secondaryText}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
