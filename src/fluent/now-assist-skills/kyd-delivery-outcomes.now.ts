import '@servicenow/sdk/global'
import { NowAssistSkillConfig } from '@servicenow/sdk/core'

// Sezioni 3, 4, 6, 10 e 11: cosa è stato realizzato e con quali esiti.
// Invocata dal motore KYD a fine analisi (nessun deployment).
NowAssistSkillConfig(
    {
        $id: Now.ID['kyd_delivery_outcomes_skill'],
        state: 'published',
        name: 'KYD Delivery Outcomes',
        shortDescription: 'Work streams, outcomes and failure causes of a developer working with Build Agent',
        description:
            'Reads conversations, tool outcomes, build and install results, executed script intents, created metadata and update sets computed by a KYD Analysis and describes the work streams, the outcome of each goal and the main causes of failure.',
        inputs: [
            {
                $id: Now.ID['kyd_delivery_outcomes_analysis_data_input'],
                name: 'analysis data',
                description: 'JSON with conversations, tool outcomes, script intents, metadata and update sets',
                mandatory: true,
                dataType: 'string',
                testValues: '{"conversations":[],"tools":{"calls":0,"items":[]},"metadata":{"artifacts":[]},"updateSets":[]}',
            },
            {
                $id: Now.ID['kyd_delivery_outcomes_language_input'],
                name: 'output language',
                description: 'Language for all generated text (e.g. English, Italian)',
                mandatory: true,
                dataType: 'string',
                testValues: 'English',
            },
        ],
        securityControls: {
            userAccess: { $id: Now.ID['kyd_delivery_outcomes_user_access'], type: 'roles', roles: ['x_giss2_kyd.user'] },
            roleMap: ['x_giss2_kyd.user'],
        },
    },
    {
        providers: [
            {
                provider: 'Azure OpenAI',
                providerAPI: { type: 'sys_hub_flow', id: 'a55c1c6f530221106b38ddeeff7b12b1' },
                prompts: [
                    {
                        name: 'KYD Delivery Outcomes',
                        versions: [
                            {
                                $id: Now.ID['kyd_delivery_outcomes_prompt_v1'],
                                version: 1,
                                model: 'gpt-5.4',
                                temperature: 0.2,
                                maxTokens: 6000,
                                promptState: 'published',
                                prompt: (p) => `## Role
You are a senior ServiceNow technical architect. You reconstruct what a developer built on an instance with Build Agent, the ServiceNow AI coding assistant, and how each goal ended.

## Context
The data below was computed by KYD (Know Your Developer) for one developer over a period. It contains:
- conversations: Build Agent conversations with title, period, client, scope and message counts per sender;
- tools: calls, successes and failures per tool (run_script, run_query, build, install, ...);
- buildInstall: install, build and failed script outcomes with their messages;
- scriptIntents: the declared intent of each background script the agent executed;
- subAgents: tasks delegated to sub-agents;
- files: source files written or deleted;
- metadata: metadata records created (functional classes, named artifacts, new tables, dictionary changes);
- updateSets: update sets with state and number of updates.

Analysis data:
${p.input['analysis data']}

## Instructions
1. Group the work into streams (one per business goal or topic). For each stream give title, period, scope (e.g. Global or app scope), the key artifacts built and the outcome: "done", "partial", "blocked" or "advisory" (analysis only, nothing built).
2. List the outcome of each goal: "success", "partial" or "failed", with a short factual explanation.
3. List the main causes of failure (install, build, Flow Designer, scope issues, ...) with the evidence found in the messages.
4. Use only the data provided: cite artifact names, counts and dates. Never invent artifacts or results.
5. Write every text value in ${p.input['output language']}. Keep JSON keys and enum values in English.

## Output
Return only a JSON object, with no markdown fences and no text before or after it:
{
  "streams": [{ "title": "...", "period": "...", "scope": "...", "outcome": "done|partial|blocked|advisory", "summary": "...", "artifacts": ["..."] }],
  "outcomes": [{ "goal": "...", "status": "success|partial|failed", "detail": "..." }],
  "failureCauses": [{ "title": "...", "detail": "..." }]
}`,
                            },
                            {
                                $id: Now.ID['kyd_delivery_outcomes_prompt_v2'],
                                version: 2,
                                model: 'gpt-5.4',
                                temperature: 0.2,
                                maxTokens: 6000,
                                promptState: 'published',
                                prompt: (p) => `## Role
You are a senior ServiceNow technical architect. You reconstruct what a developer built on an instance with Build Agent, the ServiceNow AI coding assistant, and how each goal ended.

## Context
The data below was computed by KYD (Know Your Developer) for one developer over a period. It contains:
- organisation: company, e-mail domain and groups of the developer;
- conversations: Build Agent conversations with id, title, period, client, scope, prompt and tool counts and goal (the first prompt, up to 600 characters: titles can be generic, the goal tells what was really asked);
- prompts: the prompt history per conversation (texts truncated to 160 characters);
- tools: calls, successes and failures per tool (run_script, run_query, build, install, ...);
- buildInstall: install, build and failed script outcomes with their messages;
- scriptIntents: the declared intent of each background script the agent executed;
- subAgents: tasks delegated to sub-agents;
- files: source files written or deleted;
- metadata: metadata records created (functional classes, named artifacts, new tables, dictionary changes);
- updateSets: update sets with state and number of updates.

Analysis data:
${p.input['analysis data']}

## Instructions
1. Identify the real goal of each conversation from its goal and its prompts, not from the title alone.
2. Group the work into streams, one per business goal, largest first, at most 5. Put every conversation that built no artifact (questions, analysis, advice) into a single last stream titled "Advisory only" with outcome "advisory".
3. For each stream give: a short title (at most 5 words); the period (e.g. "3–5 Mar"); the scope (e.g. Global); prompts, the exact sum of the prompts of its conversations; components, one sentence listing the key artifacts with their counts (e.g. "1 custom table, 2 Script Includes, 2 scheduled jobs"); result, the outcome in at most 6 words (e.g. "Live after several install attempts", "Validated end-to-end; migration open", "1 closed, 1 blocked"); a short summary; the artifacts list.
4. Stream outcome: "done" when the prompts or the tests show it working, even after many failed attempts; "partial" when part of the goal remains open; "blocked" when the developer could not proceed because of an external constraint; "advisory" when nothing was built or requested.
5. List the outcome of each goal: "success", "partial" or "failed". A goal answered with advice is "success"; use "failed" only when the prompts show a request that was not met.
6. List the main causes of failure (install, build, Flow Designer, scope issues, ...) with the evidence found in the messages.
7. Give developerRole, a label of at most 4 words that combines the organisation (from the e-mail domain or the company) and the role shown by the work (e.g. "Acme platform engineer").
8. Use only the data provided: cite artifact names, counts and dates. Never invent artifacts or results. Put text in double quotes only when it is copied verbatim from the data.
9. Write every text value in ${p.input['output language']}. Keep JSON keys and enum values in English.

## Output
Return only a JSON object, with no markdown fences and no text before or after it:
{
  "developerRole": "...",
  "streams": [{ "title": "...", "period": "...", "scope": "...", "prompts": 0, "components": "...", "result": "...", "outcome": "done|partial|blocked|advisory", "summary": "...", "artifacts": ["..."] }],
  "outcomes": [{ "goal": "...", "status": "success|partial|failed", "detail": "..." }],
  "failureCauses": [{ "title": "...", "detail": "..." }]
}`,
                            },
                        ],
                    },
                ],
                defaultPrompt: 'KYD Delivery Outcomes',
                defaultPromptVersion: 2,
            },
        ],
    },
)
