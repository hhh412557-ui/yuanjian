import { useEffect, useState } from "react";
import { Wordmark } from "@yuanjian/site/brand/Logo.tsx";
import { IconArrowRight, IconCheck, IconExternal, IconRefresh, IconSparkles } from "../../components/icons";
import { buttonClass } from "../../components/ui/Controls";
import { finishOnboarding, resetOnboarding, saveOnboardingDemo, useOnboardingState } from "../../lib/local-state";
import { selectTrialDemoItems, TRIAL_THEMES, type TrialDemoItem } from "./data";

function Progress({ demo }: { demo: boolean }) {
  return (
    <div className="flex items-center gap-2 text-[12px] text-ink-4" aria-label={`初始化进度：第 ${demo ? 2 : 1} 步，共 2 步`}>
      <span className={`inline-flex items-center gap-1.5 ${!demo ? "font-semibold text-accent" : ""}`}><span className="grid size-5 place-items-center rounded-full border border-current text-[11px]">1</span>选择主题</span>
      <span className="h-px w-8 bg-line" />
      <span className={`inline-flex items-center gap-1.5 ${demo ? "font-semibold text-accent" : ""}`}><span className="grid size-5 place-items-center rounded-full border border-current text-[11px]">2</span>情报试读</span>
    </div>
  );
}

function TopicOption({ name, description, selected, onToggle }: { name: string; description: string; selected: boolean; onToggle: () => void }) {
  return (
    <label className={`group flex min-h-[88px] cursor-pointer gap-3 border p-3.5 transition-colors ${selected ? "border-accent bg-accent-soft" : "border-line bg-surface hover:border-line-strong hover:bg-bg-sunk"}`}>
      <input type="checkbox" checked={selected} onChange={onToggle} className="sr-only" />
      <span aria-hidden="true" className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-control border ${selected ? "border-accent bg-accent text-accent-contrast" : "border-line-strong bg-bg"}`}>
        {selected && <IconCheck size={14} strokeWidth={2.5} />}
      </span>
      <span className="min-w-0">
        <span className={`block text-[14px] font-semibold ${selected ? "text-accent-ink" : "text-ink"}`}>{name}</span>
        <span className="mt-1 block text-[12px] leading-[1.55] text-ink-3">{description}</span>
      </span>
    </label>
  );
}

function Picker({ selected, onToggle, onGroupToggle, onClear, onGenerate }: { selected: string[]; onToggle: (id: string) => void; onGroupToggle: (ids: string[]) => void; onClear: () => void; onGenerate: () => void }) {
  const selectedSet = new Set(selected);
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(250px,0.72fr)_minmax(0,1.28fr)] lg:gap-16">
      <div className="self-start lg:sticky lg:top-8">
        <p className="flex items-center gap-2 text-[12px] font-semibold text-accent"><IconSparkles size={15} />元见初始化</p>
        <h1 className="mt-4 max-w-[12ch] text-[38px] font-semibold leading-[1.12] tracking-[-0.025em] text-ink sm:text-[48px]">先选你关心的，元见替你过滤噪声。</h1>
        <p className="mt-5 max-w-[34em] text-[15px] leading-[1.85] text-ink-2">信息太多，不必从所有新闻开始。选择你想持续关注的方向，先看一份按主题整理的情报试读，再决定是否进入完整信息流。</p>
        <div className="mt-8 border-t border-line pt-4 text-[12.5px] leading-[1.7] text-ink-3"><span className="font-semibold text-ink-2">本轮验证</span><br />AI 是主线，网络安全是特色补充；只使用公开资讯，不接入暗网和敏感数据。</div>
      </div>
      <div>
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4"><div><h2 className="text-[22px] font-semibold text-ink">你想每天看到什么？</h2><p className="mt-1.5 text-[13px] text-ink-3">可多选，建议先选 3–6 个主题。</p></div><button type="button" onClick={onClear} disabled={!selected.length} className="inline-flex h-9 items-center gap-1.5 px-2 text-[12px] text-ink-3 hover:text-ink disabled:opacity-40" title="清除所有选择"><IconRefresh size={14} />清除</button></div>
        <div className="mt-5 space-y-7">
          {TRIAL_THEMES.map((group) => {
            const ids = group.themes.map((theme) => theme.id);
            const groupSelected = ids.filter((id) => selectedSet.has(id)).length;
            return <fieldset key={group.id} className="border-t border-line pt-4"><div className="flex items-baseline justify-between gap-3"><div><legend className="text-[17px] font-semibold text-ink">{group.name}</legend><p className="mt-1 text-[12.5px] leading-[1.65] text-ink-3">{group.description}</p></div><button type="button" onClick={() => onGroupToggle(ids)} className="shrink-0 text-[12px] text-accent hover:text-accent-ink">{groupSelected === ids.length ? "取消全选" : "选择本组"}</button></div><div className="mt-3 grid gap-2.5 sm:grid-cols-2">{group.themes.map((theme) => <TopicOption key={theme.id} name={theme.name} description={theme.description} selected={selectedSet.has(theme.id)} onToggle={() => onToggle(theme.id)} />)}</div></fieldset>;
          })}
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4"><p className="text-[12.5px] text-ink-3">已选择 <span className="num font-semibold text-ink">{selected.length}</span> 个主题</p><button type="button" onClick={onGenerate} disabled={!selected.length} className={buttonClass("primary", "lg")}>生成我的情报 <IconArrowRight size={16} /></button></div>
      </div>
    </div>
  );
}

function DemoRow({ item, index }: { item: TrialDemoItem; index: number }) {
  return <article className="border-t border-line py-5 first:border-t-0 first:pt-0 last:pb-0"><div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-ink-4"><span className="num text-[18px] font-semibold text-accent">{String(index + 1).padStart(2, "0")}</span><span className="chip">{item.group === "ai" ? "AI 领域" : "网络安全"}</span><span>{item.themeName}</span><time className="num" dateTime={item.publishedAt}>{item.publishedAt}</time></div><h3 className="mt-2 text-[18px] font-semibold leading-[1.45] text-ink">{item.title}</h3><div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-ink-4"><span className="font-medium text-ink-2">{item.source}</span><span>{item.sourceType}</span></div><p className="mt-3 text-[14px] leading-[1.8] text-ink-2">{item.summary}</p><p className="mt-2 text-[13px] leading-[1.75] text-ink-3"><span className="font-semibold text-ink-2">为什么值得关注：</span>{item.whyItMatters}</p><a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-accent hover:text-accent-ink">查看原始信源 <IconExternal size={14} /></a></article>;
}

function Demo({ selected, onBack, onFinish }: { selected: string[]; onBack: () => void; onFinish: () => void }) {
  const items = selectTrialDemoItems(selected);
  const selectedNames = TRIAL_THEMES.flatMap((group) => group.themes).filter((theme) => selected.includes(theme.id)).map((theme) => theme.name);
  return <div className="max-w-[820px]"><div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5"><div><p className="text-[12px] font-semibold text-accent">你的第一份主题情报</p><h1 className="mt-2 text-[30px] font-semibold leading-[1.2] text-ink sm:text-[38px]">元见已经替你筛了一遍。</h1><p className="mt-2 max-w-[62ch] text-[13.5px] leading-[1.8] text-ink-3">根据 {selectedNames.join("、")}，先展示 {items.length} 条方向验证样例。</p></div><button type="button" onClick={onBack} className={buttonClass("secondary")}><IconRefresh size={15} />重新选择</button></div><div className="mt-4 flex items-start gap-2 border-l-2 border-amber bg-amber-soft px-3 py-2.5 text-[12.5px] leading-[1.7] text-amber-ink"><span className="font-semibold">演示说明：</span><span>这是本轮人工整理的方向验证样例，不是实时采集结果；原文链接用于核验信源，不代表系统已自动接入。</span></div><div className="mt-7 border-b border-line">{items.map((item, index) => <DemoRow key={item.id} item={item} index={index} />)}</div><div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5"><p className="text-[13px] leading-[1.7] text-ink-3">试读完成后，进入元见的信息流继续阅读。</p><button type="button" onClick={onFinish} className={buttonClass("primary", "lg")}>进入元见 <IconArrowRight size={16} /></button></div></div>;
}

export function OnboardingGate() {
  const state = useOnboardingState();
  const [selected, setSelected] = useState(state.topics);
  const demo = state.phase === "demo";
  useEffect(() => setSelected(state.topics), [state.phase, state.topics.join(",")]);
  const toggle = (id: string) => setSelected((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  const toggleGroup = (ids: string[]) => setSelected((current) => ids.every((id) => current.includes(id)) ? current.filter((id) => !ids.includes(id)) : [...new Set([...current, ...ids])]);
  const clear = () => setSelected([]);
  const generate = () => { if (!selected.length) return; saveOnboardingDemo(selected); };
  const back = () => resetOnboarding(selected);
  const finish = () => finishOnboarding(selected);
  return <div className="fixed inset-0 z-[80] overflow-y-auto bg-bg"><div className="min-h-dvh"><header className="border-b border-line bg-surface/90"><div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4 px-5 py-4 lg:px-8"><Wordmark size={25} /><div className="flex items-center gap-5"><Progress demo={demo} /><span className="hidden text-[12px] text-ink-4 sm:inline">公开资讯 · 人工整理 Demo</span></div></div></header><main className="mx-auto max-w-[1180px] px-5 py-9 sm:py-12 lg:px-8 lg:py-16">{demo ? <Demo selected={selected} onBack={back} onFinish={finish} /> : <Picker selected={selected} onToggle={toggle} onGroupToggle={toggleGroup} onClear={clear} onGenerate={generate} />}</main></div></div>;
}
