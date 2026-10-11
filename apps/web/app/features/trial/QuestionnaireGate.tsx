import { useEffect, useState } from "react";
import { Wordmark } from "@yuanjian/site/brand/Logo.tsx";
import { IconArrowRight, IconExternal, IconRefresh, IconSparkles } from "../../components/icons";
import { buttonClass } from "../../components/ui/Controls";
import { CopyButton } from "../agent/CodeBlock";
import { finishOnboarding, getOnboardingProfile, resetOnboarding, saveOnboardingDemo, saveOnboardingProfile, useOnboardingState } from "../../lib/local-state";
import { selectTrialDemoItems, trialSurveySummary, TRIAL_THEMES, type TrialDemoItem, type TrialSurveyAnswers } from "./data";
import { TrialQuestionnaire } from "./Questionnaire";

function DemoRow({ item, index }: { item: TrialDemoItem; index: number }) {
  return <article className="border-t border-line py-5 first:border-t-0 first:pt-0 last:pb-0"><div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-ink-4"><span className="num text-[18px] font-semibold text-accent">{String(index + 1).padStart(2, "0")}</span><span className="chip">{item.group === "ai" ? "AI 领域" : "网络安全"}</span><span>{item.themeName}</span><time className="num" dateTime={item.publishedAt}>{item.publishedAt}</time></div><h3 className="mt-2 text-[18px] font-semibold leading-[1.45] text-ink">{item.title}</h3><div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-ink-4"><span className="font-medium text-ink-2">{item.source}</span><span>{item.sourceType}</span></div><p className="mt-3 text-[14px] leading-[1.8] text-ink-2">{item.summary}</p><p className="mt-2 text-[13px] leading-[1.75] text-ink-3"><span className="font-semibold text-ink-2">为什么值得关注：</span>{item.whyItMatters}</p><a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-accent hover:text-accent-ink">查看原始信源 <IconExternal size={14} /></a></article>;
}

function Demo({ selected, answers, token, profileBound, onBack, onFinish }: { selected: string[]; answers: TrialSurveyAnswers; token: string | null; profileBound: boolean; onBack: () => void; onFinish: () => void }) {
  const items = selectTrialDemoItems(selected);
  const selectedNames = TRIAL_THEMES.flatMap((group) => group.themes).filter((theme) => selected.includes(theme.id)).map((theme) => theme.name);
  return <div className="max-w-[820px]"><div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5"><div><p className="text-[12px] font-semibold text-accent">你的第一份主题情报</p><h1 className="mt-2 text-[30px] font-semibold leading-[1.2] text-ink sm:text-[38px]">元见已经替你筛了一遍。</h1><p className="mt-2 max-w-[62ch] text-[13.5px] leading-[1.8] text-ink-3">根据 {selectedNames.join("、")}，先展示 {items.length} 条方向验证样例。</p></div><button type="button" onClick={onBack} className={buttonClass("secondary")}><IconRefresh size={15} />调整主题画像</button></div><div className="mt-4 grid gap-3 border border-line bg-surface p-4 sm:grid-cols-[1fr_auto] sm:items-center"><div><p className="text-[11.5px] font-semibold text-ink-4">本次推送偏好</p><p className="mt-1.5 text-[13px] font-semibold text-ink">{trialSurveySummary(answers)}</p></div><span className="text-[12px] text-ink-3">已按画像生成演示</span></div>{token ? <section className="mt-4 border border-accent/35 bg-accent-soft p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-[14px] font-semibold text-accent-ink">专属 MCP Token 已生成</h2><p className="mt-1 text-[12px] leading-[1.7] text-ink-3">仅在此处显示一次。复制后填入 Agent 的 MCP Authorization，保存并重新连接。</p></div><CopyButton text={token} label="复制 Token" /></div><code className="mt-3 block break-all rounded-control border border-line bg-surface px-3 py-2.5 font-mono text-[12px] leading-[1.6] text-ink">{token}</code><p className="mt-2 text-[11.5px] leading-[1.65] text-ink-4">Token 不会写入浏览器本地存储；网页通过 HttpOnly Cookie 识别同一主题画像。请把它保存到你的 MCP 客户端配置中。</p></section> : profileBound ? <div className="mt-4 border border-line bg-surface p-4"><h2 className="text-[14px] font-semibold text-ink">主题画像已与 MCP 身份绑定</h2><p className="mt-1 text-[12px] leading-[1.7] text-ink-3">当前浏览器已识别已有 Token。继续使用原 Token 即可。</p></div> : null}<div className="mt-4 flex items-start gap-2 border-l-2 border-amber bg-amber-soft px-3 py-2.5 text-[12.5px] leading-[1.7] text-amber-ink"><span className="font-semibold">演示说明：</span><span>这是本轮人工整理的方向验证样例，不是实时采集结果；原文链接用于核验信源，不代表系统已自动接入。</span></div><div className="mt-7 border-b border-line">{items.map((item, index) => <DemoRow key={item.id} item={item} index={index} />)}</div><div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5"><p className="text-[13px] leading-[1.7] text-ink-3">试读完成后，进入元见的信息流继续阅读。</p><button type="button" onClick={onFinish} className={buttonClass("primary", "lg")}>进入元见 <IconArrowRight size={16} /></button></div></div>;
}

export function QuestionnaireGate() {
  const state = useOnboardingState();
  const [selected, setSelected] = useState(state.topics);
  const [answers, setAnswers] = useState<TrialSurveyAnswers>(() => getOnboardingProfile());
  const [token, setToken] = useState<string | null>(null);
  const [profileBound, setProfileBound] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const demo = state.phase === "demo";

  useEffect(() => setSelected(state.topics), [state.phase, state.topics.join(",")]);

  useEffect(() => {
    if (!demo || profileBound) return;
    const controller = new AbortController();
    fetch("/api/site/mcp-profile", { signal: controller.signal }).then(async (response) => {
      if (response.ok) setProfileBound(true);
    }).catch(() => {});
    return () => controller.abort();
  }, [demo, profileBound]);

  const generate = async () => {
    if (!selected.length || !answers.focus.length || !answers.goal || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/site/mcp-profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ themes: selected, survey: answers }),
      });
      const result = await response.json() as { token?: string; detail?: string; issued?: boolean };
      if (!response.ok) throw new Error(result.detail ?? "主题画像绑定失败，请稍后重试。");
      setToken(typeof result.token === "string" ? result.token : null);
      setProfileBound(true);
      saveOnboardingProfile(answers);
      saveOnboardingDemo(selected);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "主题画像绑定失败，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  };
  const back = () => {
    saveOnboardingProfile(answers);
    resetOnboarding(selected);
  };
  const finish = () => {
    saveOnboardingProfile(answers);
    finishOnboarding(selected);
  };

  return <div className="fixed inset-0 z-[80] overflow-y-auto bg-bg"><div className="min-h-dvh"><header className="border-b border-line bg-surface/90"><div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4 px-5 py-4 lg:px-8"><Wordmark size={25} /><div className="flex items-center gap-2 text-[12px] text-ink-4"><IconSparkles size={14} className="text-accent" />公开资讯 · 人工整理 Demo</div></div></header><main className="mx-auto max-w-[1180px] px-5 py-9 sm:py-12 lg:px-8 lg:py-16">{demo ? <Demo selected={selected} answers={answers} token={token} profileBound={profileBound} onBack={back} onFinish={finish} /> : <><TrialQuestionnaire key="trial-questionnaire" selected={selected} answers={answers} onTopicsChange={setSelected} onAnswersChange={setAnswers} onGenerate={generate} isSubmitting={submitting} />{error && <p role="alert" className="mx-auto mt-5 max-w-[820px] border-l-2 border-red bg-red-soft px-3 py-2.5 text-[13px] leading-[1.7] text-red-ink">{error}</p>}</>}</main></div></div>;
}

