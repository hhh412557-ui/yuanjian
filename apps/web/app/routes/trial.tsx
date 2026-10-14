import { useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import type { Route } from "./+types/trial";
import type { TrialDemoItem } from "@yuanjian/contracts/trial-profile";
import { SITE } from "@yuanjian/site";
import type { Screen } from "../components/shell/screens";
import { PhoneBar } from "../components/shell/PhoneBar";
import { IconArrowRight, IconCheck, IconRefresh, IconSparkles } from "../components/icons";
import { buttonClass } from "../components/ui/Controls";
import { ReadingLayout } from "../components/ui/Page";
import { pageMeta } from "../lib/seo";
import { ALL_TRIAL_THEME_IDS, TRIAL_THEMES } from "../features/trial/data";
import { useTrialDemo } from "../features/trial/useTrialDemo";

export const handle: Screen = { tab: "featured", name: "主题设置" };

export function meta() {
  return pageMeta({ title: "主题设置", description: `选择关注主题与阅读偏好，${SITE.name} 会据此整理个性化信息流。`, path: "/trial", noindex: true });
}

function readSelected(params: URLSearchParams): string[] {
  const allowed = new Set(ALL_TRIAL_THEME_IDS);
  return [...new Set((params.get("topics") ?? "").split(",").filter((id) => allowed.has(id)))];
}

function updateTopics(navigate: ReturnType<typeof useNavigate>, selected: string[], demo = false) {
  const next = new URLSearchParams();
  if (selected.length) next.set("topics", selected.join(","));
  if (demo && selected.length) next.set("demo", "1");
  navigate(next.toString() ? `/trial?${next}` : "/trial", { preventScrollReset: true });
}

function ThemeOption({ id, name, description, selected, onToggle }: { id: string; name: string; description: string; selected: boolean; onToggle: () => void }) {
  return (
    <label className={`group flex min-h-[104px] cursor-pointer gap-3 rounded-card border p-4 transition-colors ${selected ? "border-accent bg-accent-soft" : "border-line bg-surface hover:border-line-strong hover:bg-bg-sunk"}`}>
      <input type="checkbox" checked={selected} onChange={onToggle} className="sr-only" />
      <span aria-hidden="true" className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-control border transition-colors ${selected ? "border-accent bg-accent text-accent-contrast" : "border-line-strong bg-bg"}`}>
        {selected && <IconCheck size={14} strokeWidth={2.5} />}
      </span>
      <span className="min-w-0">
        <span className={`block text-[15px] font-semibold ${selected ? "text-accent-ink" : "text-ink"}`}>{name}</span>
        <span className="mt-1 block text-[12.5px] leading-[1.65] text-ink-3">{description}</span>
      </span>
    </label>
  );
}

function TopicPicker({ selected, onToggle, onGroupToggle, onClear, onGenerate }: { selected: string[]; onToggle: (id: string) => void; onGroupToggle: (group: (typeof TRIAL_THEMES)[number]) => void; onClear: () => void; onGenerate: () => void }) {
  const selectedSet = new Set(selected);
  return (
    <section className="mt-8" aria-labelledby="trial-topics-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="trial-topics-heading" className="text-[20px] font-semibold text-ink">选择关注主题</h2>
          <p className="mt-1 text-[13px] text-ink-3">建议先选 3–6 个，便于判断内容是否够聚焦。</p>
        </div>
        <button type="button" onClick={onClear} disabled={!selected.length} className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[12.5px] text-ink-3 transition-colors hover:bg-bg-sunk hover:text-ink disabled:opacity-40" title="清除所有选择"><IconRefresh size={14} />清除选择</button>
      </div>
      <div className="mt-5 space-y-5">
        {TRIAL_THEMES.map((group) => {
          const groupSelected = group.themes.filter((theme) => selectedSet.has(theme.id)).length;
          return (
            <section key={group.id} className="border-t border-line pt-4" aria-labelledby={`trial-${group.id}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div><h3 id={`trial-${group.id}`} className="text-[17px] font-semibold text-ink">{group.name}</h3><p className="mt-1 max-w-[66ch] text-[12.5px] leading-[1.7] text-ink-3">{group.description}</p></div>
                <button type="button" onClick={() => onGroupToggle(group)} className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3 text-[12px] text-ink-2 transition-colors hover:border-accent hover:text-accent" aria-label={`${groupSelected === group.themes.length ? "取消" : "选择"}${group.name}全部主题`}>{groupSelected === group.themes.length ? "取消全选" : "选择本组"}</button>
              </div>
              <div className="mt-3 grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">{group.themes.map((theme) => <ThemeOption key={theme.id} {...theme} selected={selectedSet.has(theme.id)} onToggle={() => onToggle(theme.id)} />)}</div>
            </section>
          );
        })}
      </div>
      <div className="sticky bottom-3 z-10 mt-7 flex flex-wrap items-center justify-between gap-3 rounded-panel border border-line-strong bg-surface/95 p-3 shadow-soft backdrop-blur lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-0">
        <p className="text-[12.5px] text-ink-3">已选择 <span className="num font-semibold text-ink">{selected.length}</span> 个主题</p>
        <button type="button" onClick={onGenerate} disabled={!selected.length} className={buttonClass("primary", "lg")}>查看主题内容 <IconArrowRight size={16} /></button>
      </div>
    </section>
  );
}

function DemoCard({ item, index }: { item: TrialDemoItem; index: number }) {
  const day = item.publishedAt ? item.publishedAt.slice(0, 10) : null;
  return (
    <article className="border-t border-line py-5 first:border-t-0 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-ink-4"><span className="num text-[18px] font-semibold text-accent">{String(index + 1).padStart(2, "0")}</span><span className="chip">{item.group === "ai" ? "AI 领域" : "网络安全"}</span><span>{item.themeName}</span>{item.categoryLabel && <span className="chip">{item.categoryLabel}</span>}{day && <time dateTime={item.publishedAt ?? undefined} className="num">{day}</time>}</div>
      <h3 className="mt-2 text-[18px] font-semibold leading-[1.45] text-ink">{item.title}</h3>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-ink-4"><span className="font-medium text-ink-2">{item.source}</span>{item.selected && <span>AI 精选</span>}</div>
      {item.summary && <p className="mt-3 text-[14px] leading-[1.8] text-ink-2">{item.summary}</p>}
      {item.reason && <p className="mt-2 text-[13px] leading-[1.75] text-ink-3"><span className="font-semibold text-ink-2">推荐理由：</span>{item.reason}</p>}
      <Link to={`/items/${item.id}`} className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-accent hover:text-accent-ink">在元见中查看 <IconArrowRight size={14} /></Link>
    </article>
  );
}

function DemoResult({ selected, items, onBack }: { selected: string[]; items: TrialDemoItem[]; onBack: () => void }) {
  const selectedNames = TRIAL_THEMES.flatMap((group) => group.themes).filter((theme) => selected.includes(theme.id)).map((theme) => theme.name);
  return (
    <section className="mt-8" aria-labelledby="trial-demo-heading">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4"><div><p className="text-[12px] font-semibold text-accent">你的主题信息流</p><h2 id="trial-demo-heading" className="mt-1.5 text-[24px] font-semibold text-ink">为你整理的内容</h2><p className="mt-1.5 text-[13px] leading-[1.7] text-ink-3">根据 {selectedNames.join("、")}，元见整理了 {items.length} 条相关内容。</p></div><button type="button" onClick={onBack} className={buttonClass("secondary")}><IconRefresh size={15} />调整关注主题</button></div>
      <div className="mt-4 border-y border-line py-3 text-[12.5px] leading-[1.7] text-ink-3"><span className="font-semibold text-ink-2">内容来源：</span>元见收录的公开信源，AI 精选内容优先；点开可查看中文摘要与推荐理由。</div>
      <div className="mt-7 border-b border-line">{items.map((item, index) => <DemoCard key={item.id} item={item} index={index} />)}</div>
      <div className="mt-6 grid gap-3 md:grid-cols-2">{[["关注方向", `${new Set(items.map((item) => item.group)).size} 个主题领域`], ["内容来源", `${new Set(items.map((item) => item.source)).size} 个信源`]].map(([label, value]) => <div key={label} className="border-t border-line pt-3"><div className="text-[11.5px] text-ink-4">{label}</div><div className="mt-1 text-[13.5px] font-semibold text-ink">{value}</div></div>)}</div>
    </section>
  );
}

export default function TrialPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const selected = useMemo(() => readSelected(params), [params]);
  const hasDemo = params.get("demo") === "1";
  const { items, loading, error } = useTrialDemo(selected, hasDemo);
  const toggle = (id: string) => updateTopics(navigate, selected.includes(id) ? selected.filter((value) => value !== id) : [...selected, id]);
  const toggleGroup = (group: (typeof TRIAL_THEMES)[number]) => { const ids = group.themes.map((theme) => theme.id); const allSelected = ids.every((id) => selected.includes(id)); updateTopics(navigate, allSelected ? selected.filter((id) => !ids.includes(id)) : [...new Set([...selected, ...ids])]); };
  const clear = () => updateTopics(navigate, []);
  return (
    <ReadingLayout aside={<section className="border-t border-line pt-3.5"><h2 className="text-[12px] font-semibold text-ink-3">你会看到什么</h2><ul className="mt-2.5 space-y-2 text-[13px] leading-[1.65] text-ink-3"><li>AI 与网络安全重点动态</li><li>来自公开信源的摘要与原文</li><li>按你的主题和阅读习惯整理</li></ul></section>}>
      <header><PhoneBar back={{ to: "/", label: "精选" }} title="主题设置" /><div className="hidden items-center justify-between gap-4 lg:flex"><div className="flex items-center gap-2 text-[12px] text-ink-4"><IconSparkles size={15} className="text-accent" />个性化信息流</div><span className="text-[12px] text-ink-4">按你的主题整理</span></div><div className="pt-2 lg:pt-5"><p className="text-[12px] font-semibold text-accent">设置你的信息流</p><h1 data-page-title="" className="mt-2 max-w-[24ch] text-[30px] font-semibold leading-[1.2] tracking-[-0.01em] text-ink sm:text-[36px]">先选你关心的，再开始阅读</h1><p className="mt-3 max-w-[56em] text-[14px] leading-[1.8] text-ink-3">选择 AI 和网络安全细分主题，元见会据此整理与你相关的内容。</p></div><div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-line py-3 text-[12px] text-ink-4"><span className="flex items-center gap-1.5"><span className="num text-[18px] font-semibold text-ink">{selected.length}</span> 个主题已选</span><span>{hasDemo ? (loading ? "正在整理…" : `已整理 ${items.length} 条`) : "选择主题后查看"}</span><span className="text-amber-ink">AI 精选与摘要</span></div></header>
      {!hasDemo ? <TopicPicker selected={selected} onToggle={toggle} onGroupToggle={toggleGroup} onClear={clear} onGenerate={() => selected.length && updateTopics(navigate, selected, true)} /> : loading ? <p className="mt-8 text-[14px] leading-[1.8] text-ink-3">正在整理你的信息流…</p> : error ? <div className="mt-8 border-t border-line pt-5"><p className="text-[14px] text-ink-2">暂时无法加载内容，请稍后重试。</p><button type="button" onClick={clear} className={`${buttonClass("secondary")} mt-4`}>重新选择</button></div> : items.length ? <DemoResult selected={selected} items={items} onBack={() => updateTopics(navigate, selected)} /> : <div className="mt-8 border-t border-line pt-5"><p className="text-[14px] text-ink-2">当前主题还没有相关内容，可以换几个主题试试。</p><button type="button" onClick={clear} className={`${buttonClass("secondary")} mt-4`}>重新选择</button></div>}
    </ReadingLayout>
  );
}
