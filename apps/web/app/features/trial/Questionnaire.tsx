import { useState } from "react";
import { IconArrowLeft, IconArrowRight, IconCheck, IconRefresh, IconSparkles } from "../../components/icons";
import { buttonClass } from "../../components/ui/Controls";
import {
  EMPTY_TRIAL_SURVEY_ANSWERS,
  TRIAL_SURVEY_CADENCES,
  TRIAL_SURVEY_DEPTHS,
  TRIAL_SURVEY_FOCUS,
  TRIAL_SURVEY_GOALS,
  TRIAL_THEMES,
  trialTopicsForFocus,
  type TrialSurveyAnswers,
  type TrialSurveyFocusId,
} from "./data";

type Step = 1 | 2 | 3;

export interface TrialQuestionnaireProps {
  selected: string[];
  answers: TrialSurveyAnswers;
  onTopicsChange: (topics: string[]) => void;
  onAnswersChange: (answers: TrialSurveyAnswers) => void;
  onGenerate: () => void;
  isSubmitting?: boolean;
}

function Progress({ step }: { step: Step }) {
  return (
    <div className="flex items-center gap-2 text-[12px] text-ink-4" aria-label={`主题画像进度：第 ${step} 步，共 3 步`}>
      {[1, 2, 3].map((item, index) => (
        <span key={item} className="inline-flex items-center gap-1.5">
          <span className={`grid size-6 place-items-center rounded-full border text-[11px] ${item <= step ? "border-accent bg-accent text-accent-contrast" : "border-line-strong"}`}>{item < step ? <IconCheck size={12} strokeWidth={2.5} /> : item}</span>
          <span className={item === step ? "font-semibold text-accent" : "hidden sm:inline"}>{["关注方向", "阅读偏好", "确认主题"][index]}</span>
          {item < 3 && <span className="mx-1 h-px w-5 bg-line" />}
        </span>
      ))}
    </div>
  );
}

function ChoiceCard({ name, description, selected, onSelect, multiple = false }: { name: string; description: string; selected: boolean; onSelect: () => void; multiple?: boolean }) {
  return (
    <button type="button" aria-pressed={selected} onClick={onSelect} className={`flex min-h-[82px] w-full items-start gap-3 rounded-card border p-4 text-left transition-[border-color,background-color,box-shadow] ${selected ? "border-accent bg-accent-soft shadow-[inset_3px_0_0_theme(colors.accent)]" : "border-line bg-surface hover:border-line-strong hover:bg-bg-sunk"}`}>
      <span aria-hidden="true" className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-control border ${selected ? "border-accent bg-accent text-accent-contrast" : "border-line-strong bg-bg"}`}>
        {selected && <IconCheck size={13} strokeWidth={2.5} />}
      </span>
      <span className="min-w-0"><span className={`block text-[14px] font-semibold ${selected ? "text-accent-ink" : "text-ink"}`}>{name}</span><span className="mt-1 block text-[12px] leading-[1.6] text-ink-3">{description}</span></span>
      {multiple && <span className="ml-auto shrink-0 pt-0.5 text-[10px] text-ink-4">多选</span>}
    </button>
  );
}

function TopicOption({ name, description, selected, onToggle }: { name: string; description: string; selected: boolean; onToggle: () => void }) {
  return (
    <label className={`flex min-h-[76px] cursor-pointer gap-3 rounded-card border p-3.5 transition-colors ${selected ? "border-accent bg-accent-soft" : "border-line bg-surface hover:border-line-strong hover:bg-bg-sunk"}`}>
      <input type="checkbox" checked={selected} onChange={onToggle} className="sr-only" />
      <span aria-hidden="true" className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-control border ${selected ? "border-accent bg-accent text-accent-contrast" : "border-line-strong bg-bg"}`}>
        {selected && <IconCheck size={13} strokeWidth={2.5} />}
      </span>
      <span className="min-w-0"><span className={`block text-[13px] font-semibold ${selected ? "text-accent-ink" : "text-ink"}`}>{name}</span><span className="mt-1 block text-[11.5px] leading-[1.55] text-ink-3">{description}</span></span>
    </label>
  );
}

function SectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="border-b border-line pb-4"><p className="text-[11.5px] font-semibold text-accent">{eyebrow}</p><h2 className="mt-1.5 text-[23px] font-semibold leading-[1.25] text-ink">{title}</h2><p className="mt-1.5 text-[13px] leading-[1.7] text-ink-3">{description}</p></div>;
}

export function TrialQuestionnaire({ selected, answers, onTopicsChange, onAnswersChange, onGenerate, isSubmitting = false }: TrialQuestionnaireProps) {
  const [step, setStep] = useState<Step>(1);
  const selectedSet = new Set(selected);
  const focusNames = TRIAL_SURVEY_FOCUS.filter((item) => answers.focus.includes(item.id)).map((item) => item.name);

  const toggleFocus = (id: TrialSurveyFocusId) => {
    const focus = answers.focus.includes(id) ? answers.focus.filter((value) => value !== id) : [...answers.focus, id];
    onAnswersChange({ ...answers, focus });
    onTopicsChange(trialTopicsForFocus(focus));
  };

  const toggleTopic = (id: string) => onTopicsChange(selected.includes(id) ? selected.filter((value) => value !== id) : [...selected, id]);
  const clear = () => { onAnswersChange(EMPTY_TRIAL_SURVEY_ANSWERS); onTopicsChange([]); setStep(1); };
  const next = () => {
    if (step === 1 && answers.focus.length) setStep(2);
    else if (step === 2 && answers.goal) setStep(3);
    else if (step === 3 && selected.length) onGenerate();
  };
  const canContinue = step === 1 ? answers.focus.length > 0 : step === 2 ? answers.goal !== null : selected.length > 0;

  return (
    <section className="grid gap-8 lg:grid-cols-[minmax(210px,0.62fr)_minmax(0,1.38fr)] lg:gap-14" aria-labelledby="trial-questionnaire-title">
      <div className="self-start lg:sticky lg:top-8"><p className="flex items-center gap-2 text-[12px] font-semibold text-accent"><IconSparkles size={15} />元见主题画像</p><h1 id="trial-questionnaire-title" className="mt-4 max-w-[12ch] text-[38px] font-semibold leading-[1.12] tracking-[-0.025em] text-ink sm:text-[46px]">先回答几个问题，再开始看信息。</h1><p className="mt-5 max-w-[34em] text-[14px] leading-[1.85] text-ink-2">元见会把你的回答转换成关注主题，再由你最后确认。以后接入 MCP 时，这份画像也可以直接作为初始化参数。</p><div className="mt-8 border-t border-line pt-4 text-[12.5px] leading-[1.7] text-ink-3"><span className="font-semibold text-ink-2">当前范围</span><br />AI 是主线，网络安全是特色补充；本轮只使用公开资讯，不接入暗网和敏感数据。</div></div>
      <div className="min-w-0"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><Progress step={step} /><button type="button" onClick={clear} className="inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[12px] text-ink-3 hover:bg-bg-sunk hover:text-ink" title="清空问卷"><IconRefresh size={13} />重新开始</button></div>
        {step === 1 && <div><SectionTitle eyebrow="第一步 · 关注方向" title="你最想先看到哪类信息？" description="可以多选，元见会据此先生成一组主题。" /><div className="mt-5 grid gap-2.5 sm:grid-cols-2">{TRIAL_SURVEY_FOCUS.map((item) => <ChoiceCard key={item.id} {...item} selected={answers.focus.includes(item.id)} onSelect={() => toggleFocus(item.id)} multiple />)}</div></div>}
        {step === 2 && <div><SectionTitle eyebrow="第二步 · 阅读偏好" title="你希望元见怎么帮你？" description="这些选择会影响后续推送的组织方式。" /><div className="mt-5"><h3 className="text-[13px] font-semibold text-ink-2">你主要想解决什么问题？</h3><div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">{TRIAL_SURVEY_GOALS.map((item) => <ChoiceCard key={item.id} {...item} selected={answers.goal === item.id} onSelect={() => onAnswersChange({ ...answers, goal: item.id })} />)}</div><h3 className="mt-7 text-[13px] font-semibold text-ink-2">信息看多深？</h3><div className="mt-2.5 grid gap-2.5 md:grid-cols-3">{TRIAL_SURVEY_DEPTHS.map((item) => <ChoiceCard key={item.id} {...item} selected={answers.depth === item.id} onSelect={() => onAnswersChange({ ...answers, depth: item.id })} />)}</div><h3 className="mt-7 text-[13px] font-semibold text-ink-2">你希望多久看一次？</h3><div className="mt-2.5 grid gap-2.5 md:grid-cols-3">{TRIAL_SURVEY_CADENCES.map((item) => <ChoiceCard key={item.id} {...item} selected={answers.cadence === item.id} onSelect={() => onAnswersChange({ ...answers, cadence: item.id })} />)}</div></div></div>}
        {step === 3 && <div><SectionTitle eyebrow="第三步 · 确认主题" title="这是你的主题画像" description="系统已经根据回答预选主题，你可以继续增删，最后再生成 Demo。" /><div className="mt-5 border border-line bg-surface p-4"><p className="text-[11.5px] font-semibold text-ink-4">关注方向</p><p className="mt-1.5 text-[14px] font-semibold text-ink">{focusNames.join("、") || "自定义关注"}</p><p className="mt-2 text-[12px] leading-[1.7] text-ink-3">已为你匹配 <span className="num font-semibold text-ink">{selected.length}</span> 个主题，可在下方微调。</p></div><div className="mt-6 space-y-6">{TRIAL_THEMES.map((group) => <fieldset key={group.id}><legend className="text-[15px] font-semibold text-ink">{group.name}</legend><div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">{group.themes.map((theme) => <TopicOption key={theme.id} {...theme} selected={selectedSet.has(theme.id)} onToggle={() => toggleTopic(theme.id)} />)}</div></fieldset>)}</div></div>}
        <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4"><button type="button" onClick={() => setStep((current) => current === 1 ? 1 : current - 1 as Step)} disabled={step === 1 || isSubmitting} className={buttonClass("secondary")}><IconArrowLeft size={15} />上一步</button><div className="flex items-center gap-3"><span className="text-[12px] text-ink-3">{step === 3 ? `已选 ${selected.length} 个主题` : "可随时返回修改"}</span><button type="button" onClick={next} disabled={!canContinue || isSubmitting} className={buttonClass("primary", "lg")}>{isSubmitting ? "正在绑定主题画像…" : step === 3 ? "确认主题并生成 Token" : "下一步"}<IconArrowRight size={16} /></button></div></div>
      </div>
    </section>
  );
}
