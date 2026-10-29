# KYD - Know Your Developer

KYD is a ServiceNow scoped application that shows how a developer works with **Build Agent**, the ServiceNow AI coding assistant, on an instance. For a developer and a period it reads the Build Agent conversations, the tools the agent used, the metadata and update sets produced and the governance signals left on the instance. It then presents the result as a Developer Card, a point-by-point report, an estimate of how much Build Agent accelerated the work and a relationship graph of everything that was touched.

![Developer Passport](docs/images/developer-passport.png)

## What it does

- **Request an analysis:** a wizard picks a developer with at least one Build Agent conversation and a period. The analysis runs in the background; the list of analysed developers shows its stage and offers View and Refresh. Every analysis is kept, so a developer can have many.
- **Developer Card:** headline, key indicators and work streams on the Overview tab.
- **Report:** findings computed from the data with explicit thresholds, plus a written reading produced by three Now Assist skills (behaviour profile, delivery outcomes, risks and maturity).
- **Acceleration:** the manual effort of the artifacts built with Build Agent, estimated with configurable weights, compared with the time spent in Build Agent sessions. Customer stories cited in the work are shown with the statistics of their team. Story points are never converted to hours.
- **Detail tabs:** conversations and prompts, tools and outcomes, work done, behaviour, components and update sets, governance, relationship graph.
- **Explanation:** the "How the analysis works" dialog describes every step and the tables it reads.
- **Internationalisation:** every UI text goes through `sn-translate`, so the platform translates it in the user's language (`sys_ui_message`); dates and numbers follow the session language.

## How it works

1. The wizard calls the KYD REST API, which creates a **KYD Analysis** record (`x_giss2_kyd_analysis`) in the queued state.
2. A business rule fires the `x_giss2_kyd.analysis.requested` event; a script action runs the engine in the background and updates the stage while it works.
3. The engine reads the data, estimates the effort, builds the graph, calls the Now Assist skills and stores the result as JSON on the record.
4. The React UI page reads the analyses through the REST API.

**Data read:** `sn_build_agent_conversation`, `sn_build_agent_message`, `sn_build_agent_checkpoint`, `sn_build_agent_script_request`, `sn_build_agent_task_telemetry`, `sys_rollback_sequence`, `sys_user`, `sys_user_grmember`, `sys_user_has_role`, `sys_metadata`, `sys_db_object`, `sys_dictionary`, `sys_update_set`, `sys_update_xml`, `sys_atf_test`, `rm_story`. An analysis only writes its own KYD Analysis record.

## Technology

- [ServiceNow SDK](https://www.npmjs.com/package/@servicenow/sdk) (Fluent) for all the platform metadata
- UI page in React 19 with Chakra UI, Recharts and Cytoscape.js
- Server logic as TypeScript modules
- Now Assist Skill Kit skills on Azure OpenAI GPT-5.4

## Project structure

```
src/
  client/    React UI page: views, tabs, components, REST service, data contract (types.ts)
  fluent/    platform metadata: tables, REST API, roles and ACLs, event, business rule,
             script action, UI page, menu, Now Assist skills, cross-scope privileges
  server/    engine (analysis/), effort estimate (effort/), Now Assist calls (insights/),
             REST handlers (rest/), business rule and script action entry points
```

## Getting started

Requirements: Node.js 24.14.1 or later, pnpm, and a ServiceNow instance with Build Agent and the Now Assist Skill Kit.

```bash
pnpm install
pnpm build
pnpm run deploy   # now-sdk install on the authenticated instance
```

Use `pnpm run deploy`: `pnpm deploy` is a built-in pnpm command. The app can also be installed by linking the repository to the instance.

After the install:

1. Give the `x_giss2_kyd.user` role to the people who use KYD and `x_giss2_kyd.admin` to those who manage it.
2. Open **KYD - Know Your Developer** in the navigator and start an analysis.
3. Optionally, in **KYD - Know Your Developer > Effort weights**, click **Load KYD default weights** to get editable copies of the default weights.

## Configuration

- **Effort weights:** the KYD Effort Weight table overrides, per artifact class, the default weights in `src/server/analysis/config.ts`: base hours, size driver (script lines, table fields, flow or action steps, catalog variables) and hours per unit. A new deploy never overwrites the rows of the table.
- **Effort parameters:** optional system properties `x_giss2_kyd.effort.hours_per_day`, `range_low`, `range_high`, `session_gap_minutes` and `session_lead_minutes`.
- **Now Assist skills:** KYD Behaviour Profile, KYD Delivery Outcomes and KYD Risk and Maturity, in `src/fluent/now-assist-skills/`. They are deployed as published; a change to a published prompt is made as a new prompt version.

## Limits

- The manual effort is an estimate from configurable weights, not validated against actuals.
- Session time is derived from prompt timestamps and does not include work done outside the chat.
- The texts written by Now Assist are AI-generated: verify them against the data before acting on them.
- KYD analyses individual people: use it for coaching and adoption, and check the rules on employee monitoring that apply where it is used.
