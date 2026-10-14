import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { IconChevronLeft, IconChevronRight } from "../icons";
import { IntentLink } from "./IntentLink";
import { useEntrance } from "../../lib/hydration";

/** Where each switch's thumb sat when it last left, relative to its track. */
const thumbs = new Map<string, { left: number; width: number; at: number }>();

function placeOf(el: HTMLElement) {
  const tab = el.parentElement!.getBoundingClientRect();
  const track = el.closest("[data-pill-track]")?.getBoundingClientRect();
  return { left: tab.left - (track?.left ?? 0), width: tab.width, at: Date.now() };
}

/**
 * The white thumb inside the chosen option. It is rendered in place (so it is right without
 * JavaScript) and, when the choice moves, glides over from where the previous thumb was.
 */
function Thumb({ id }: { id: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const entrance = useEntrance();
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const now = placeOf(el);
    const prev = thumbs.get(id);
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (entrance && !reduce && prev && now.at - prev.at < 1000 && (prev.left !== now.left || prev.width !== now.width) && el.animate) {
      el.animate(
        [{ transform: `translateX(${prev.left - now.left}px)`, width: `${prev.width}px` }, { transform: "translateX(0)", width: `${now.width}px` }],
        { duration: 300, easing: "cubic-bezier(0.25, 1, 0.5, 1)" },
      );
    }
    return () => {
      thumbs.set(id, placeOf(el));
    };
  }, [id, entrance]);
  return <span ref={ref} className="absolute inset-0 rounded-full bg-surface shadow-[var(--shadow-thumb)] ring-1 ring-line dark:bg-raised" />;
}

export interface TabItem {
  key: string;
  label: ReactNode;
  /** Link target; tabs without one call onSelect. */
  to?: string;
  prefetch?: "intent";
  replace?: boolean;
  /** Start the page it opens at the top (another page rather than another view of this one). */
  resetScroll?: boolean;
  count?: number | null;
}

const SIZES = {
  md: "h-11 px-4 text-[14px] lg:h-9",
  sm: "h-11 px-3.5 text-[13px] lg:h-8",
  xs: "h-11 px-3 text-[12.5px] lg:h-7",
} as const;

/** The chevron at either end of a long tab strip (only while there is more to see that way). */
function NudgeButton({ dir, onClick }: { dir: -1 | 1; onClick: () => void }) {
  const Icon = dir === -1 ? IconChevronLeft : IconChevronRight;
  return (
    <button
      type="button"
      aria-label={dir === -1 ? "向左查看更多" : "向右查看更多"}
      onClick={onClick}
      className="grid size-7 shrink-0 place-items-center rounded-full bg-surface text-ink-3 ring-1 ring-line-soft transition-colors hover:text-ink hover:ring-line-strong active:scale-95"
    >
      <Icon size={15} strokeWidth={2} />
    </button>
  );
}

/**
 * The site's one switch control: a grey pill track with a white thumb that glides to the chosen
 * option. Boards, categories, sources, report kinds, page sections and language all use it, so every
 * switch looks and moves the same. Scrolls sideways when it runs out of room; `fill` spreads the
 * options evenly across the available width.
 *
 * `scrollButtons` (long category rows) adds a chevron at each end while there is overflow and lets a
 * mouse drag the strip; the chosen option is scrolled into view on mount. Without it the control is a
 * plain sideways-scrolling row, as before.
 */
export function PillTabs({
  items, active, onSelect, layoutId, size = "md", label, fill = false, scrollButtons = false, className = "",
}: {
  items: TabItem[];
  active: string;
  onSelect?: (key: string) => void;
  /** Unique per control on a page, for the gliding thumb. */
  layoutId: string;
  size?: keyof typeof SIZES;
  label?: string;
  fill?: boolean;
  /** Long rows: chevron buttons at the ends and mouse drag, so no option stays out of reach. */
  scrollButtons?: boolean;
  className?: string;
}) {
  const links = items.some((t) => t.to);
  const Track = links ? "nav" : "div";
  const scroller = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: false, end: false });
  const drag = useRef({ active: false, moved: false });
  const swallowed = useRef(false);

  /** Which ways there is more to see; hidden options must never be unreachable. */
  const measure = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const start = el.scrollLeft > 1;
    const end = el.scrollWidth - el.clientWidth - el.scrollLeft > 1;
    setEdges((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
  }, []);

  useEffect(() => {
    if (!scrollButtons) return;
    const el = scroller.current;
    if (!el) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    for (const child of Array.from(el.children)) observer.observe(child);
    return () => observer.disconnect();
  }, [scrollButtons, measure, items.length]);

  // On mount (and whenever the choice changes) bring the chosen option into the strip, without
  // touching the page's own scroll.
  useEffect(() => {
    if (!scrollButtons) return;
    const el = scroller.current;
    const on = el?.querySelector<HTMLElement>('[aria-current="page"], [aria-selected="true"]');
    if (!el || !on) return;
    const strip = el.getBoundingClientRect();
    const tab = on.getBoundingClientRect();
    if (tab.left < strip.left) el.scrollLeft += tab.left - strip.left - 8;
    else if (tab.right > strip.right) el.scrollLeft += tab.right - strip.right + 8;
  }, [scrollButtons, active, layoutId, items.length]);

  const nudge = (dir: -1 | 1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(160, el.clientWidth * 0.6), behavior: "smooth" });
  };

  return (
    <div className={`flex max-w-full items-center gap-1 ${className}`}>
      {scrollButtons && edges.start && <NudgeButton dir={-1} onClick={() => nudge(-1)} />}
      <div
        ref={scroller}
        onScroll={scrollButtons ? measure : undefined}
        // A tab is a link, and a link is natively draggable: left alone, the browser would start its
        // own drag after a few pixels and stop our move stream. The strip drags instead.
        onDragStart={(e) => {
          if (scrollButtons) e.preventDefault();
        }}
        onPointerDown={(e) => {
          if (!scrollButtons || e.pointerType !== "mouse" || e.button !== 0) return;
          const el = scroller.current;
          if (!el) return;
          swallowed.current = false;
          const startX = e.clientX;
          const startLeft = el.scrollLeft;
          const onMove = (move: PointerEvent) => {
            const dx = move.clientX - startX;
            if (!drag.current.moved) {
              if (Math.abs(dx) < 4) return;
              drag.current.moved = true;
              el.classList.add("cursor-grabbing");
            }
            el.scrollLeft = startLeft - dx;
          };
          // On window: the pointer may leave the strip mid-drag, and it must still be followed.
          const onEnd = () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onEnd);
            window.removeEventListener("pointercancel", onEnd);
            el.classList.remove("cursor-grabbing");
            if (drag.current.moved) {
              swallowed.current = true;
              measure();
            }
            drag.current.active = false;
            drag.current.moved = false;
          };
          drag.current = { active: true, moved: false };
          window.addEventListener("pointermove", onMove);
          window.addEventListener("pointerup", onEnd);
          window.addEventListener("pointercancel", onEnd);
        }}
        onClickCapture={(e) => {
          // A drag ends with a click on whatever the pointer was over; it is not a choice.
          if (!swallowed.current) return;
          swallowed.current = false;
          e.preventDefault();
          e.stopPropagation();
        }}
        className={`scrollbar-none max-w-full min-w-0 overflow-x-auto ${scrollButtons ? "cursor-grab" : ""} ${fill ? "w-full" : ""}`}
      >
        <Track
          data-pill-track=""
          aria-label={label}
          role={links ? undefined : "tablist"}
          className={`${fill ? "grid w-full" : "inline-flex w-max"} gap-0.5 rounded-full bg-bg-sunk p-0.5 lg:p-[3px] ring-1 ring-inset ring-line-soft dark:bg-bg-muted/60`}
          style={fill ? { gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` } : undefined}
        >
          {items.map((t) => {
            const on = t.key === active;
            const inner = (
              <>
                {on && <Thumb id={layoutId} />}
                <span className="relative inline-flex items-center gap-1">
                  {t.label}
                  {t.count !== undefined && t.count !== null && <span className={`num text-[0.86em] font-normal ${on ? "text-ink-3" : "text-ink-4"}`}>{t.count}</span>}
                </span>
              </>
            );
            const cls = `relative inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-full font-medium outline-offset-1 transition-colors duration-150 active:scale-[0.98] ${SIZES[size]} ${on ? "text-ink" : "text-ink-3 hover:text-ink"}`;
            const TabLink = t.prefetch === "intent" ? IntentLink : Link;
            return t.to ? (
              <TabLink key={t.key} to={t.to} replace={t.replace} preventScrollReset={!t.resetScroll} aria-current={on ? "page" : undefined} className={cls}>
                {inner}
              </TabLink>
            ) : (
              <button key={t.key} type="button" role="tab" aria-selected={on} onClick={() => onSelect?.(t.key)} className={cls}>
                {inner}
              </button>
            );
          })}
        </Track>
      </div>
      {scrollButtons && edges.end && <NudgeButton dir={1} onClick={() => nudge(1)} />}
    </div>
  );
}
