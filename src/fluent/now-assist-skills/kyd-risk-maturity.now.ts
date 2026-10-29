import '@servicenow/sdk/global'
import { NowAssistSkillConfig } from '@servicenow/sdk/core'

// Sezione 12 più gli output delle altre due skill: rischi, maturità e raccomandazioni.
// Invocata dal motore KYD a fine analisi (nessun deployment).
NowAssistSkillConfig(
    {
        $id: Now.ID['kyd_risk_maturity_skill'],
        state: 'published',
        name: 'KYD Risk and Maturity',
        shortDescription: 'Risk observations, maturity levels and recommendations for a developer working with Build Agent',
        description:
            'Combines the governance indicators computed by a KYD Analysis with the behaviour profile and the delivery outcomes, and produces risk observations with severity, a maturity level per dimension and operational recommendations.',
        inputs: [
            {
                $id: Now.ID['kyd_risk_maturity_analysis_data_input'],
                name: 'analysis data',
                description: 'JSON with governance indicators, key facts, behaviour profile and delivery outcomes',
                mandatory: true,
                dataType: 'string',
                testValues: '{"governance":{"atfTests":0,"checklist":[]},"facts":{},"behaviourProfile":null,"deliveryOutcomes":null}',
            },
            {
                $id: Now.ID['kyd_risk_maturity_language_input'],
                name: 'output language',
                description: 'Language for all generated text (e.g. English, Italian)',
                mandatory: true,
                dataType: 'string',
                testValues: 'English',
            },
        ],
        securityControls: {
            userAccess: { $id: Now.ID['kyd_risk_maturity_user_access'], type: 'roles', roles: ['x_giss2_kyd.user'] },
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
                        name: 'KYD Risk and Maturity',
                        versions: [
                            {
                                $id: Now.ID['kyd_risk_maturity_prompt_v1'],
                                version: 1,
                                model: 'gpt-5.4',
                                temperature: 0.2,
                                maxTokens: 4000,
                                promptState: 'published',
                                prompt: (p) => `## Role
You are a ServiceNow platform governance lead. You assess the risks left on an instance by a developer working with Build Agent, the ServiceNow AI coding assistant, and the maturity of their way of working.

## Context
The data below was computed by KYD (Know Your Developer) for one developer over a period. It contains:
- governance: background scripts approved, ATF tests created, conversations in Global scope, failed installs and builds, friction prompts and a verification checklist;
- facts: key numbers (update sets in progress and their size, scratch np$ tables, dictionary changes on platform tables, tool success rate, prompt quality shares);
- behaviourProfile: the behavioural profile produced by the KYD Behaviour Profile skill (may be null);
- deliveryOutcomes: the work streams and outcomes produced by the KYD Delivery Outcomes skill (may be null).

Analysis data:
${p.input['analysis data']}

## Instructions
1. List the risk observations left on the instance or in the way of working, each with a severity ("high", "medium", "low" or "monitor") and a concrete action. Order them from the most to the least severe.
2. Rate the maturity from 1 (weak) to 5 (excellent) on exactly these dimensions, in this order: Platform knowledge; Governance (naming, update sets); Initial prompting quality; Iterative prompting; Verification of results; Test automation; Frustration tolerance. Give a one-sentence rationale grounded in the data for each score.
3. Give a short overall classification (e.g. "Power user / senior platform engineer").
4. Give between 3 and 6 operational recommendations, most important first.
5. Use only the data provided; cite numbers as evidence. Never invent facts.
6. Write every text value in ${p.input['output language']}, including the dimension names. Keep JSON keys and enum values in English.

## Output
Return only a JSON object, with no markdown fences and no text before or after it:
{
  "classification": "...",
  "risks": [{ "finding": "...", "severity": "high|medium|low|monitor", "action": "..." }],
  "maturity": [{ "dimension": "...", "score": 1, "rationale": "..." }],
  "recommendations": ["..."]
}`,
                            },
                            {
                                $id: Now.ID['kyd_risk_maturity_prompt_v2'],
                                version: 2,
                                model: 'gpt-5.4',
                                temperature: 0.2,
                                maxTokens: 4000,
                                promptState: 'published',
                                prompt: (p) => `## Role
You are a ServiceNow platform governance lead. You assess the risks left on an instance by a developer working with Build Agent, the ServiceNow AI coding assistant, and the maturity of their way of working.

## Context
The data below was computed by KYD (Know Your Developer) for one developer over a period. It contains:
- governance: background scripts approved, ATF tests created, conversations in Global scope, failed installs and builds, friction prompts and a verification checklist;
- facts: key numbers (update sets in progress and their size, scratch np$ tables, dictionary changes on platform tables, tool success rate, prompt quality shares);
- conversations: id, title, scope and goal (the first prompt) of each conversation;
- prompts: the prompt history per conversation (texts truncated to 160 characters);
- behaviourProfile: the behavioural profile produced by the KYD Behaviour Profile skill (may be null);
- deliveryOutcomes: the work streams and outcomes produced by the KYD Delivery Outcomes skill (may be null).

Analysis data:
${p.input['analysis data']}

## Instructions
1. List the risk observations left on the instance or in the way of working, each with a concrete action, from the most to the least severe. Include incidents reported by the developer in the prompts (e.g. damaged form layouts, fields created without approval) with their evidence. Use this severity scale:
   - "high": left on the instance and blocking a safe promotion, or with a concrete impact on production data or processes;
   - "medium": cleanup or quality debt to fix before the next release;
   - "low": an improvement of the way of working;
   - "monitor": acceptable by design but to keep under observation (e.g. background scripts tracked with a rollback context, intentional work in Global scope).
2. Rate the maturity from 1 (weak) to 5 (excellent) on exactly these dimensions, in this order, with a one-sentence rationale grounded in the data:
   - Platform knowledge: depth of platform and legacy knowledge shown in the prompts;
   - Governance (naming, update sets): discipline and intent shown by the developer (dedicated update sets per topic, naming conventions, scope choices, access controls requested); open or oversized update sets lower the score only as far as they result from the developer's choices;
   - Initial prompting quality: completeness of the first prompt of each conversation (context, constraints, definition of done);
   - Iterative prompting: quality of the follow-up prompts; ultra-short prompts ("go", "yes") and duplicates lower the score;
   - Verification of results: how outcomes are verified (tests on real records, screenshots, challenging unproven claims); manual verification counts fully;
   - Test automation: ATF tests and automated checks;
   - Frustration tolerance: ability to keep the collaboration productive under friction.
3. Give a short overall classification (role and approach, e.g. "Power user / senior platform engineer, architect-reviewer approach"). Keep the competence of the developer distinct from the governance of the artifacts produced.
4. Give between 3 and 6 operational recommendations, most important first.
5. Use only the data provided; cite numbers as evidence. Never invent facts. Put text in double quotes only when it is copied verbatim from the data.
6. Write every text value in ${p.input['output language']}, including the dimension names. Keep JSON keys and enum values in English.

## Output
Return only a JSON object, with no markdown fences and no text before or after it:
{
  "classification": "...",
  "risks": [{ "finding": "...", "severity": "high|medium|low|monitor", "action": "..." }],
  "maturity": [{ "dimension": "...", "score": 1, "rationale": "..." }],
  "recommendations": ["..."]
}`,
                            },
                        ],
                    },
                ],
                defaultPrompt: 'KYD Risk and Maturity',
                defaultPromptVersion: 2,
            },
        ],
    },
)
