import '@servicenow/sdk/global'
import { NowAssistSkillConfig } from '@servicenow/sdk/core'

// Sezioni 3, 4, 6, 10 e 11: cosa è stato realizzato e con quali esiti.
// Invocata dal motore KYD a fine analisi (nessun deployment).
NowAssistSkillConfig(
    {
        $id: Now.ID['kyd_delivery_outcomes_skill'],
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
                                model: 'gpt-5.4',
                                temperature: 0.2,
                                maxTokens: 6000,
                                promptState: 'draft',
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
                        ],
                    },
                ],
            },
        ],
    },
)
