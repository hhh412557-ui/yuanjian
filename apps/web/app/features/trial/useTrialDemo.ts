import { useEffect, useState } from "react";
import type { TrialDemoItem } from "@yuanjian/contracts/trial-profile";

export interface TrialDemoState {
  /** 真实情报小样（精选优先，已收录补齐）。 */
  items: TrialDemoItem[];
  /** 取到内容的主题 id。 */
  covered: string[];
  /** 库里暂时没有内容的主题 id。 */
  missing: string[];
  loading: boolean;
  error: boolean;
}

const EMPTY: TrialDemoState = { items: [], covered: [], missing: [], loading: false, error: false };

/**
 * 按所选主题拉取真实情报小样（/api/site/trial-demo）。enabled 为 false（还没生成）时不请求；
 * 主题一变就重新取，组件卸载或主题再变时中断上一个请求。
 */
export function useTrialDemo(themes: string[], enabled: boolean): TrialDemoState {
  const key = themes.join(",");
  const [state, setState] = useState<TrialDemoState>(EMPTY);
  useEffect(() => {
    if (!enabled || !key) {
      setState(EMPTY);
      return;
    }
    const controller = new AbortController();
    setState({ ...EMPTY, loading: true });
    fetch(`/api/site/trial-demo?themes=${encodeURIComponent(key)}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json() as Promise<{ items?: TrialDemoItem[]; covered?: string[]; missing?: string[] }>;
      })
      .then((data) => setState({ items: data.items ?? [], covered: data.covered ?? [], missing: data.missing ?? [], loading: false, error: false }))
      .catch(() => {
        if (controller.signal.aborted) return;
        setState({ ...EMPTY, error: true });
      });
    return () => controller.abort();
  }, [key, enabled]);
  return state;
}
