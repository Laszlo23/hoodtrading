import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { INITIAL_BALANCE, MARKET_MAP, MARKETS } from "../data/markets";
import { connectWallet, initialVitals, readVitals } from "../lib/chain";
import { getLast, setPrint, stepSeries } from "../lib/series";
import {
  availableOf,
  closeAll,
  closePosition,
  equityOf,
  queueOrder,
  settle,
  unrealized,
  usedMargin,
  type Account,
} from "../lib/trading";
import type {
  ChainVitals,
  ChartTab,
  DockTab,
  Draft,
  Page,
  Side,
  SizeMode,
  Timeframe,
  Toast,
} from "../types";

const STORAGE_KEY = "hood-perps-v1";

interface Persisted {
  account: Account;
  favorites: string[];
  skipConfirm: boolean;
  whatsNew: boolean;
}

interface StoreValue {
  rev: number;
  page: Page;
  marketId: string;
  side: Side;
  orderType: "market" | "limit" | "stop";
  leverage: number;
  size: string;
  sizeMode: SizeMode;
  limitPrice: string;
  reduceOnly: boolean;
  tpSl: boolean;
  tp: string;
  sl: string;
  groupIndex: number;
  timeframe: Timeframe;
  showSma: boolean;
  showVolume: boolean;
  chartTab: ChartTab;
  dockTab: DockTab;
  hideOther: boolean;
  favorites: string[];
  whatsNew: boolean;
  skipConfirm: boolean;
  draft: Draft | null;
  wallet: string | null;
  ethBalance: number | null;
  toasts: Toast[];
  chain: ChainVitals;
  account: Account;
  equity: number;
  available: number;
  upnl: number;
  margin: number;
  setPage: (page: Page) => void;
  selectMarket: (id: string) => void;
  setSide: (side: Side) => void;
  setOrderType: (type: "market" | "limit" | "stop") => void;
  setLeverage: (leverage: number) => void;
  setSize: (size: string) => void;
  setSizeMode: (mode: SizeMode) => void;
  setLimitPrice: (price: string) => void;
  setReduceOnly: (value: boolean) => void;
  setTpSl: (value: boolean) => void;
  setTp: (value: string) => void;
  setSl: (value: string) => void;
  setGroupIndex: (index: number) => void;
  setTimeframe: (tf: Timeframe) => void;
  setShowSma: (value: boolean) => void;
  setShowVolume: (value: boolean) => void;
  setChartTab: (tab: ChartTab) => void;
  setDockTab: (tab: DockTab) => void;
  setHideOther: (value: boolean) => void;
  toggleFavorite: (id: string) => void;
  dismissWhatsNew: () => void;
  setSkipConfirm: (value: boolean) => void;
  requestOrder: () => void;
  confirmOrder: () => void;
  cancelDraft: () => void;
  cancelOrder: (id: string) => void;
  closeOne: (id: string) => void;
  closeEverything: () => void;
  resetAccount: () => void;
  connect: () => Promise<void>;
  disconnect: () => void;
  toast: (title: string, body: string, tone?: Toast["tone"]) => void;
  applyPoolPrint: (base: string, price: number) => void;
  transferUsdg: (delta: number) => string | null;
}

const StoreContext = createContext<StoreValue | null>(null);

function emptyAccount(): Account {
  return {
    balance: INITIAL_BALANCE,
    positions: [],
    orders: [],
    fills: [],
    sessionEquity: INITIAL_BALANCE,
  };
}

function loadPersisted(): Persisted {
  const fallback: Persisted = {
    account: emptyAccount(),
    favorites: ["ETH-USDG", "NVDA-USDG", "AAPL-USDG", "TSLA-USDG"],
    skipConfirm: false,
    whatsNew: true,
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    if (!parsed.account || !Number.isFinite(parsed.account.balance)) return fallback;
    return {
      account: {
        balance: parsed.account.balance,
        positions: parsed.account.positions ?? [],
        orders: parsed.account.orders ?? [],
        fills: parsed.account.fills ?? [],
        sessionEquity: parsed.account.sessionEquity ?? INITIAL_BALANCE,
      },
      favorites: parsed.favorites ?? fallback.favorites,
      skipConfirm: parsed.skipConfirm ?? false,
      whatsNew: parsed.whatsNew ?? false,
    };
  } catch {
    return fallback;
  }
}

function cloneAccount(account: Account): Account {
  return {
    balance: account.balance,
    sessionEquity: account.sessionEquity,
    positions: account.positions.map((position) => ({ ...position })),
    orders: account.orders.map((order) => ({ ...order })),
    fills: account.fills.map((fill) => ({ ...fill })),
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const persisted = useRef(loadPersisted());
  const [rev, setRev] = useState(0);
  const [page, setPage] = useState<Page>("home");
  const [marketId, setMarketId] = useState("ETH-USDG");
  const [side, setSide] = useState<Side>("buy");
  const [orderType, setOrderType] = useState<"market" | "limit" | "stop">("market");
  const [leverage, setLeverageState] = useState(10);
  const [size, setSize] = useState("");
  const [sizeMode, setSizeMode] = useState<SizeMode>("usd");
  const [limitPrice, setLimitPrice] = useState("");
  const [reduceOnly, setReduceOnly] = useState(false);
  const [tpSl, setTpSl] = useState(false);
  const [tp, setTp] = useState("");
  const [sl, setSl] = useState("");
  const [groupIndex, setGroupIndex] = useState(0);
  const [timeframe, setTimeframe] = useState<Timeframe>("1h");
  const [showSma, setShowSma] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [chartTab, setChartTab] = useState<ChartTab>("chart");
  const [dockTab, setDockTab] = useState<DockTab>("positions");
  const [hideOther, setHideOther] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(persisted.current.favorites);
  const [whatsNew, setWhatsNew] = useState(persisted.current.whatsNew);
  const [skipConfirm, setSkipConfirm] = useState(persisted.current.skipConfirm);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [wallet, setWallet] = useState<string | null>(null);
  const [ethBalance, setEthBalance] = useState<number | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [chain, setChain] = useState<ChainVitals>(initialVitals);
  const [account, setAccount] = useState<Account>(persisted.current.account);
  const accountRef = useRef(account);
  accountRef.current = account;
  const fundedAt = useRef(Date.now());

  const toast = useCallback((title: string, body: string, tone: Toast["tone"] = "info") => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((current) => [...current.slice(-4), { id, title, body, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3400);
  }, []);

  useEffect(() => {
    const payload: Persisted = { account, favorites, skipConfirm, whatsNew };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [account, favorites, skipConfirm, whatsNew]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timer = window.setInterval(() => {
      stepSeries();
      const next = cloneAccount(accountRef.current);
      const notes = settle(next, Date.now() - fundedAt.current);
      fundedAt.current = Date.now();
      const changed =
        next.balance !== accountRef.current.balance ||
        next.positions.length !== accountRef.current.positions.length ||
        next.orders.length !== accountRef.current.orders.length ||
        next.fills.length !== accountRef.current.fills.length;
      if (changed) setAccount(next);
      if (notes.length) {
        notes.forEach((note) => toast(note, "Paper desk", note.includes("liquidat") ? "bad" : "ok"));
      }
      setRev((value) => value + 1);
    }, media.matches ? 1600 : 320);
    return () => window.clearInterval(timer);
  }, [toast]);

  useEffect(() => {
    let stop = false;
    const pull = () => {
      readVitals(chain)
        .then((next) => {
          if (!stop) setChain(next);
        })
        .catch(() => undefined);
    };
    pull();
    const timer = window.setInterval(pull, 4000);
    return () => {
      stop = true;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const market = MARKET_MAP[marketId];
    const last = getLast(marketId);
    document.title = `${last.toLocaleString("en-US", { maximumFractionDigits: 1 })} ${market?.base ?? "HOOD"} – HOOD`;
  }, [marketId, rev]);

  const metrics = useMemo(
    () => ({
      equity: equityOf(account),
      available: availableOf(account),
      upnl: unrealized(account),
      margin: usedMargin(account),
    }),
    [account, rev],
  );

  const buildDraft = useCallback((): Draft | null => {
    const market = MARKET_MAP[marketId];
    if (!market) return null;
    const last = getLast(marketId);
    const parsed = Number(size);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast("Size required", "Enter a position value to trade.", "bad");
      return null;
    }
    const notional = sizeMode === "usd" ? parsed : parsed * last;
    const typedPrice = Number(limitPrice);
    const price = orderType === "market" ? last : typedPrice;
    if (orderType !== "market" && (!Number.isFinite(price) || price <= 0)) {
      toast("Price required", "Limit and stop orders need a trigger.", "bad");
      return null;
    }
    const take = tpSl ? Number(tp) : undefined;
    const stop = tpSl ? Number(sl) : undefined;
    if (tpSl && take && stop) {
      const buy = side === "buy";
      if (buy && !(take > last && stop < last)) {
        toast("Check TP/SL", "Longs need a take profit above and a stop below.", "bad");
        return null;
      }
      if (!buy && !(take < last && stop > last)) {
        toast("Check TP/SL", "Shorts need a take profit below and a stop above.", "bad");
        return null;
      }
    }
    return {
      marketId,
      side,
      type: orderType,
      leverage,
      notional,
      price,
      reduceOnly,
      tp: take && take > 0 ? take : undefined,
      sl: stop && stop > 0 ? stop : undefined,
    };
  }, [limitPrice, leverage, marketId, orderType, reduceOnly, side, size, sizeMode, sl, toast, tp, tpSl]);

  const place = useCallback(
    (next: Draft) => {
      const copy = cloneAccount(accountRef.current);
      const error = queueOrder(copy, next);
      if (error) {
        toast("Order rejected", error, "bad");
        return;
      }
      setAccount(copy);
      setDraft(null);
      setDockTab(next.type === "market" ? "positions" : "orders");
      const market = MARKET_MAP[next.marketId];
      toast(
        next.type === "market" ? "Order filled" : "Order working",
        `${next.side === "buy" ? "Buy" : "Sell"} ${market?.base ?? ""} · ${next.leverage}x`,
        "ok",
      );
    },
    [toast],
  );

  const requestOrder = useCallback(() => {
    const next = buildDraft();
    if (!next) return;
    if (skipConfirm) {
      place(next);
      return;
    }
    setDraft(next);
  }, [buildDraft, place, skipConfirm]);

  const value = useMemo<StoreValue>(
    () => ({
      rev,
      page,
      marketId,
      side,
      orderType,
      leverage,
      size,
      sizeMode,
      limitPrice,
      reduceOnly,
      tpSl,
      tp,
      sl,
      groupIndex,
      timeframe,
      showSma,
      showVolume,
      chartTab,
      dockTab,
      hideOther,
      favorites,
      whatsNew,
      skipConfirm,
      draft,
      wallet,
      ethBalance,
      toasts,
      chain,
      account,
      ...metrics,
      setPage,
      selectMarket: (id: string) => {
        if (!MARKET_MAP[id]) return;
        setMarketId(id);
        setPage("perps");
        setGroupIndex(0);
        const max = MARKET_MAP[id].maxLev;
        setLeverageState((current) => Math.min(current, max));
      },
      setSide,
      setOrderType,
      setLeverage: (next: number) => {
        const max = MARKET_MAP[marketId]?.maxLev ?? 1;
        setLeverageState(Math.min(max, Math.max(1, Math.round(next))));
      },
      setSize,
      setSizeMode,
      setLimitPrice,
      setReduceOnly,
      setTpSl,
      setTp,
      setSl,
      setGroupIndex,
      setTimeframe,
      setShowSma,
      setShowVolume,
      setChartTab,
      setDockTab,
      setHideOther,
      toggleFavorite: (id: string) => {
        setFavorites((current) =>
          current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
        );
      },
      dismissWhatsNew: () => setWhatsNew(false),
      setSkipConfirm,
      requestOrder,
      confirmOrder: () => {
        if (draft) place(draft);
      },
      cancelDraft: () => setDraft(null),
      cancelOrder: (id: string) => {
        setAccount((current) => ({ ...current, orders: current.orders.filter((order) => order.id !== id) }));
      },
      closeOne: (id: string) => {
        const copy = cloneAccount(accountRef.current);
        const error = closePosition(copy, id);
        if (error) {
          toast("Close failed", error, "bad");
          return;
        }
        setAccount(copy);
        toast("Position closed", "Filled at the mark.", "ok");
      },
      closeEverything: () => {
        const copy = cloneAccount(accountRef.current);
        closeAll(copy, hideOther ? marketId : undefined);
        setAccount(copy);
        toast("Positions closed", "Market close sent.", "ok");
      },
      resetAccount: () => {
        setAccount(emptyAccount());
        toast("Paper account reset", "Balance restored to 25,000 USDG.", "info");
      },
      connect: async () => {
        try {
          const result = await connectWallet();
          setWallet(result.address);
          setEthBalance(result.eth);
          toast("Wallet connected", result.address, "ok");
        } catch (error) {
          toast("Wallet", error instanceof Error ? error.message : "Connection failed", "bad");
        }
      },
      disconnect: () => {
        setWallet(null);
        setEthBalance(null);
      },
      toast,
      transferUsdg: (delta: number) => {
        if (accountRef.current.balance + delta < -1e-6) return "Not enough free USDG";
        setAccount((current) => ({ ...current, balance: current.balance + delta }));
        return null;
      },
      applyPoolPrint: (base: string, price: number) => {
        const market = MARKETS.find((item) => item.base.toLowerCase() === base.toLowerCase());
        if (!market) return;
        setPrint(market.id, price);
        setRev((current) => current + 1);
      },
    }),
    [
      account,
      chain,
      chartTab,
      dockTab,
      draft,
      ethBalance,
      favorites,
      groupIndex,
      hideOther,
      leverage,
      limitPrice,
      marketId,
      metrics,
      orderType,
      page,
      place,
      reduceOnly,
      requestOrder,
      rev,
      showSma,
      showVolume,
      side,
      size,
      sizeMode,
      skipConfirm,
      sl,
      timeframe,
      toasts,
      tp,
      tpSl,
      wallet,
      whatsNew,
      toast,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("Store missing");
  return ctx;
}

