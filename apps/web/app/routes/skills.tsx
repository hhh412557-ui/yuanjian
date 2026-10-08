import { Link } from "react-router";
import { SITE } from "@aihot/site";
import { pageMeta } from "../lib/seo";
import { AsideCard, ReadingLayout } from "../components/ui/Page";
import { Kicker } from "../components/ui/Kicker";
import { PhoneBar } from "../components/shell/PhoneBar";
import type { Screen } from "../components/shell/screens";
import { IconArrowUpRight, IconCode, IconDoc, IconGrid, IconShield, IconSparkles } from "../components/icons";

export const handle: Screen = { tab: "me", name: "自研 Skill" };

export function meta() {
  return pageMeta({
    title: "自研 Skill",
    description: `${SITE.name} 的自研 Skill 预留入口，后续接入信息简报、研究追踪和行业工作流能力。`,
    path: "/skills",
    image: "/og/pages/about.png",
    noindex: true,
  });
}

const PLANNED = [
  { title: "信息简报 Skill", text: "把精选结果整理成晨报、日报和专题摘要，支持按时间、主题和重要性输出。", icon: IconDoc },
  { title: "研究助手 Skill", text: "围绕一个主题持续追踪来源、事件和证据，形成可回看的研究线索。", icon: IconCode },
  { title: "行业雷达 Skill", text: "按行业、公司、产品或政策建立观察清单，减少重复搜索和信息遗漏。", icon: IconGrid },
  { title: "安全情报 Skill", text: "作为网络安全特色能力接入漏洞、威胁、勒索和监管信息工作流。", icon: IconShield },
];

function SkillRow({ item }: { item: (typeof PLANNED)[number] }) {
  const Icon = item.icon;
  return (
    <li className="flex gap-3.5 border-b border-line-soft py-5 first:pt-0 last:border-b-0 last:pb-0">
      <span className="grid size-10 shrink-0 place-items-center rounded-control bg-accent-softer text-accent">
        <Icon size={19} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-[15px] font-semibold text-ink">{item.title}</h2>
          <span className="rounded-full bg-bg-sunk px-2 py-0.5 text-[11px] text-ink-4">规划中</span>
        </div>
        <p className="mt-1.5 text-[13.5px] leading-[1.75] text-ink-3">{item.text}</p>
      </div>
    </li>
  );
}

export default function SkillsPage() {
  return (
    <>
      <PhoneBar back={{ to: "/more", label: "我的" }} title="自研 Skill" />
      <ReadingLayout
        aside={(
          <>
            <AsideCard title="当前状态">
              <div className="flex items-center gap-2 text-[13.5px] text-ink-2">
                <span className="size-2 rounded-full bg-amber" aria-hidden="true" />
                预留入口，暂未启用执行能力
              </div>
              <p className="mt-2.5 text-[13px] leading-[1.75] text-ink-3">后续 Skill 会复用同一套精选内容、主题和检索接口。</p>
            </AsideCard>
            <AsideCard title="先用现有能力">
              <nav className="-mx-2 -mb-1">
                <Link viewTransition to="/daily" className="group flex items-center gap-2 rounded-control px-2 py-2 text-[13.5px] text-ink-2 hover:bg-bg-sunk hover:text-ink">
                  <IconDoc size={16} />
                  <span className="flex-1">阅读最新日报</span>
                  <IconArrowUpRight size={13} className="text-ink-4" />
                </Link>
                <Link viewTransition to="/topics" className="group flex items-center gap-2 rounded-control px-2 py-2 text-[13.5px] text-ink-2 hover:bg-bg-sunk hover:text-ink">
                  <IconGrid size={16} />
                  <span className="flex-1">浏览全部主题</span>
                  <IconArrowUpRight size={13} className="text-ink-4" />
                </Link>
              </nav>
            </AsideCard>
          </>
        )}
      >
        <header>
          <Kicker>自研能力</Kicker>
          <h1 data-page-title="" className="mt-4 flex items-center gap-3 text-[28px] font-semibold leading-[1.3] text-ink sm:text-[32px]">
            <IconSparkles size={27} className="text-accent" />
            自研 Skill
          </h1>
          <p className="mt-3 max-w-[44em] text-[15px] leading-[1.85] text-ink-3">这里预留永信至诚后续自研的信息检索与工作流能力。产品主线仍然是从信息洪流中筛出有用内容，Skill 会在这条主线上提供更具体的整理、追踪和分析动作。</p>
        </header>

        <section className="card mt-7 p-5 sm:p-6" aria-labelledby="planned-skills">
          <div className="flex items-baseline justify-between gap-4 border-b border-line-soft pb-4">
            <div>
              <h2 id="planned-skills" className="text-[16px] font-semibold text-ink">计划接入</h2>
              <p className="mt-1 text-[12.5px] text-ink-4">先保留信息架构，后续按实际可用性逐项启用。</p>
            </div>
            <span className="num text-[12px] text-ink-4">{PLANNED.length} 项</span>
          </div>
          <ul className="pt-5">
            {PLANNED.map((item) => <SkillRow key={item.title} item={item} />)}
          </ul>
        </section>
      </ReadingLayout>
    </>
  );
}
