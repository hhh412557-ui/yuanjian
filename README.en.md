<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/assets/banner-dark.png">
    <img src="docs/assets/banner-light.png" alt="Yuanjian: useful AI, current affairs, general news and cybersecurity information selected from the information flood" width="100%">
  </picture>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-176b75?style=flat-square" alt="MIT License"></a>
  <img src="https://img.shields.io/badge/Node.js-24-176b75?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js 24">
  <img src="https://img.shields.io/badge/PostgreSQL-17-176b75?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL 17">
  <img src="https://img.shields.io/badge/Docker-Compose-176b75?style=flat-square&logo=docker&logoColor=white" alt="Docker Compose">
  <img src="https://img.shields.io/badge/product-Yuanjian-176b75?style=flat-square" alt="Yuanjian">
</p>

<p align="center">
  <b>Yuanjian Intelligent Service Center: an intelligence retrieval workbench for AI, current affairs, general news and cybersecurity.</b><br>
  It puts public sources, selection rules and topic onboarding into one locally verifiable workflow.
</p>

<p align="center">
  <a href="README.md">简体中文</a> · <b>English</b>
</p>

<p align="center">
  <a href="#run-it">Run it</a> ·
  <a href="#customize-sources">Customize sources</a> ·
  <a href="#how-it-works">How it works</a> ·
  <a href="#documentation">Documentation</a> ·
  <a href="https://github.com/hhh412557-ui/yuanjian/discussions">Discussions</a>
</p>

<br>

## What this is

[Yuanjian](https://github.com/hhh412557-ui/yuanjian), also named Yuanjian Intelligent Service Center, is an intelligence retrieval and selection workbench for an era of information overload. It collects AI, current affairs, general news and cybersecurity material from public sources, uses models to screen, summarize and group it, turns multiple reports of the same event into one readable intelligence item, and publishes selected briefings by day.

This repository is its engine and framework: the website, the admin, the selection pipeline, the clustering and heat algorithms, and **the full text of every prompt and every selection threshold**.

## Why Open Source

Yuanjian needs to make its sources, prompts, thresholds and runtime flow inspectable before it can be trusted as an intelligence entry point. This repository keeps those pieces visible and locally deployable instead of hiding them behind an opaque online service.

## Before You Start

- **The interface and everything the site writes are in Chinese.** The prompts in [`industry/prompts/`](industry/prompts/) set the output language; the interface text is in [`site/site.ts`](site/site.ts) and in the code. To run it in another language, ask your agent to translate those (see [Customize sources](#customize-sources)). The other documents in this repository are in Chinese too; coding agents read them without trouble.
- **This is an independent Yuanjian workspace.** It uses an established collection, selection, grouping and briefing flow, then adds Yuanjian's topic onboarding, AI and cybersecurity source layers, and later Skill extension points.
- **Sources and data are maintained by the local deployment.** Public source definitions live in `industry/sources.json`; runtime data goes into the local PostgreSQL database and does not depend on another online site's data endpoint.
- **Public content is summary-and-link first.** Source enablement, crawl frequency, authorization boundaries and full-text display must be checked before deployment.

## How it works

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/how-dark.png">
  <img src="docs/assets/how-light.png" alt="Six stages: collect, pre-screen, score twice, write, cluster, heat and publish" width="100%">
</picture>

An item comes in from a source, is checked for duplicates, and pre-screened. Items that might matter are scored twice, independently, get a headline and a summary, are clustered with other reports into an event, and count toward its heat. X posts with no text or only links keep their original links and media without a writing or translation model call. An item enters the selection only if its score clears the threshold and it doesn't repeat news already selected. The daily briefing is compiled from the day's top stories by rule; weekly and monthly reports are compiled from the dailies. Every step's prompt is in [`industry/prompts/`](industry/prompts/), so changing the standard doesn't mean changing code. See [Selection and calibration](docs/selection.md).

### Clustering and heat

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/cluster-dark.png">
  <img src="docs/assets/cluster-light.png" alt="Reports from five sources cluster into one event, and the event enters the current trending list" width="100%">
</picture>

The same thing happens once: the official site posts it, ten outlets repeat it, X argues about it all day. Readers only need to see it once. Yuanjian clusters these into one **event**. It looks for candidates from the past two weeks by embedding the headline and summary (or, without an embedding service, by text overlap), then asks a model whether they are the same story, a follow-up, or two different stories. When in doubt it merges, and before writing, a model reviews the merge again (the review can use a different provider; set `GROUP_REVIEW_MODEL`).

**Heat** is computed per event, not per article: within 48 hours, each independent source counts once, halving every 24 hours. Repeated fetches don't add up, and one outlet posting ten articles still counts once, so what ranks at the top is what many people are really talking about.

### Speed

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/perf-dark.png">
  <img src="docs/assets/perf-light.png" alt="Measured in a local validation environment: pages 10 ms median, 95% within 50 ms; API 6 ms median, 95% within 12 ms; article pages 95% within 14 ms" width="100%">
</picture>

## What you get

| | |
|---|---|
| **Six kinds of sources** | RSS, web listing pages, JSON APIs, X accounts, WeChat Official Accounts, and content your own scripts push in. Sources come in three tiers (official first-hand; official and semi-official accounts; media and individuals), each with its own selection threshold. Fetch frequency adjusts to how often a source publishes |
| **Selection** | A pre-screen, then two independent scores on the same rubric, then a threshold set by the source's tier. One piece of news takes one slot; the same news reworded doesn't get in. All prompts and thresholds are public and editable; calibrate them in SelectBench with samples you labelled yourself |
| **Writing** | Headlines, answer-first summaries, reasons to read, full translation of foreign-language text; categories, tags and news facts extracted separately; guards against the model putting companies the original never mentioned into a headline |
| **Clustering** | Reports of the same story from different sources become one event, with follow-ups under the same event and an overview on the event page. Follow-ups and the report timeline switch together between newest first and oldest first. Manual corrections to clustering are never overwritten |
| **Trending** | Heat per event: the more independent sources, the higher, and discussion on X counts too. Compared with six hours earlier, fast risers are marked rising and newcomers are marked new |
| **Daily, weekly and monthly reports** | A daily briefing every day (08:00 by default), compiled from the day's top stories by rule: one entry per story, a story already covered returns only when it has news, and no model is called. A weekly report every Monday and a monthly report on the 1st (10:00 and 10:30 by default), compiled from the dailies; the model writes only the overview and section introductions. Change the times in `EDITION_TIMES` in `site/site.ts` |
| **Topics and search** | Topic pages of three kinds: companies, directions and content formats; search over headlines and summaries, and full-text relevance search |
| **For agents** | RSS (selection, everything, full text, daily, weekly, monthly), a public API, MCP, Agent Markdown and `llms.txt`: the same content for people and for agents |
| **Admin** | Source management and trial fetches, content diagnostics, selection evaluation, a separate model for each step, budget breakers for paid services, run history and alerts |

## A quick look

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/shots-dark.png">
  <img src="docs/assets/shots-light.png" alt="The daily selection on the home page, and the river of sources on the about page" width="100%">
</picture>

<p align="center"><sub>Screenshots from the Yuanjian local validation environment; the current interface supports topic onboarding, intelligence trial reading and the full information feed.</sub></p>

## Run it

To create your own independent site, click [Use this template](https://github.com/hhh412557-ui/yuanjian/generate) and clone the repository it creates. To keep merging upstream updates or to contribute, fork it instead. The commands below are for trying it out directly.

You need [Docker](https://docs.docker.com/get-started/get-docker/), [Node.js 24](https://nodejs.org/en/download) (to run `init-env`, which generates the configuration), and an API key for any OpenAI-compatible model API (DeepSeek, Qwen, Zhipu GLM and so on).

`init-env` configures DeepSeek by default. For another provider, change `LLM_BASE_URL`, `LLM_MODEL` and `LLM_EXTRA_JSON` in `.env`, following the examples in `.env.example`. With a reasoning model (one that thinks before answering), also set `LLM_REASONING_TOKENS` to leave output room for the reasoning.

```bash
git clone https://github.com/hhh412557-ui/yuanjian.git yuanjian
cd yuanjian
node scripts/init-env.ts --llm-key <your model API key>
docker compose up -d --build
```

Open <http://localhost:3100> for the Docker deployment. Host port `3100` maps to the web container's internal port `3000`; local development uses <http://localhost:3000>. The admin is at `/admin`, and the admin password is `ADMIN_PASSWORD` in `.env`. Content starts to appear after a minute or two, and the first import takes about half an hour to process.

For machines without Node, servers in mainland China, domains and HTTPS, or running directly on Linux or macOS without Docker (WSL2 on Windows), see [Deployment](docs/deploy.md).

Once the site is up, `/agent` lets you copy how to connect over MCP, RSS or the API; agents that can only read web pages start from `/api/v1/agent`; the API description is at `/openapi-v1.json`.

## Customize Sources

The easiest way: open your coding agent (Claude Code or Codex both work), give it this repository, and say:

```text
Please read AGENTS.md and docs/customize.md, and adapt this site to the "XX" source and topic scope.
What I care about: … (the sources you want to watch, what news you think matters and what doesn't; the more specific the better).
If the site should be in English (or another language), also translate the interface text and rewrite the prompts in industry/prompts/ to write in that language.
When you're done, run npm run typecheck, npm test and node scripts/smoke.ts, and tell me which decisions are still mine to make.
```

Nearly everything to change is in the [`site/`](site/) and [`industry/`](industry/) folders; the code itself mostly stays as it is:

| File | What to change |
|---|---|
| `site/site.ts` | Site name, field terms, publishing times, home page copy, about page, the wording on items and reports, the categories of the public interfaces |
| `industry/taxonomy.ts`, `industry/topics.json` | Categories, tags, topics |
| `industry/sources.json` | The sources imported on first start |
| `industry/prompts/` | The selection standard and the writing requirements. **Your field's know-how goes here** |
| `industry/selection.ts` | Selection thresholds |
| `site/models.ts` | Which model each step uses by default (optional: otherwise every step uses the one in `.env`) |
| `site/brand/`, `site/pages/`, `site/public/`, `site/changelog.json` | Icons and logo, terms of use and privacy notice, files served from the site root such as `robots.txt`, the changelog |
| `modules/` | Features the framework doesn't have and only your site needs, as modules; see “模块” in [Architecture](docs/architecture.md#模块) |

What is most worth your time is the scoring rubric (`industry/prompts/selection-score.md`) and the thresholds: take one or two hundred items you labelled yourself, run them through `scripts/eval-selection.ts`, see how accurately it selects, and go back and adjust. How to do it is in [Selection and calibration](docs/selection.md).

## Documentation

The documents below are in Chinese.

| Document | Contents |
|---|---|
| [Make it your field](docs/customize.md) | Site name, categories, topics, sources, prompts, thresholds, models, brand, step by step |
| [Sources](docs/sources.md) | How to configure the six kinds of sources, tiers and full text, fetch frequency, older articles and archives, a fixed starting point with `publishedAfter`, the external push interface |
| [Selection and calibration](docs/selection.md) | How an item becomes a selection and goes into the daily, weekly and monthly reports, and how to calibrate with your own samples |
| [Event grouping and relation evaluation](docs/grouping.md) | How relations between events are judged, and how to evaluate with your own labelled pairs |
| [Overview evaluation](docs/story-digest-evaluation.md) | Before changing the event overview prompt, how to compare versions side by side on the same events |
| [Deployment](docs/deploy.md) | Docker, domains and HTTPS, mainland China, updates, backups, what it costs, and running on Linux or macOS (WSL2 on Windows) without Docker |
| [Architecture](docs/architecture.md) | Three processes, the rules that don't change, directories, modules, database migrations, public outputs, tests |

Stack: Node.js 24 · TypeScript · React Router (server-side rendering) · Fastify · PostgreSQL · pg-boss · Tailwind CSS · Docker Compose.

## Community and contributing

Questions about deploying and using it go to [Q&A](https://github.com/hhh412557-ui/yuanjian/discussions/categories/q-a), new ideas to [Ideas](https://github.com/hhh412557-ui/yuanjian/discussions/categories/ideas), and you're welcome to share the news site you built for your field in [Show and tell](https://github.com/hhh412557-ui/yuanjian/discussions/categories/show-and-tell). Writing in English is fine.

For a bug or a concrete feature request, [open an issue](https://github.com/hhh412557-ui/yuanjian/issues/new/choose). Before changing code, read the [contributing guide](CONTRIBUTING.md); report security vulnerabilities through the [private reporting channel](SECURITY.md).

## License

The code is under the [MIT License](LICENSE). The Yuanjian name, marks and bundled fonts have their own notices; see [NOTICE](NOTICE).
