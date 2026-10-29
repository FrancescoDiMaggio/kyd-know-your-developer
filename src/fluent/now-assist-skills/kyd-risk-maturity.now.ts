import '@servicenow/sdk/global'
import { NowAssistSkillConfig } from '@servicenow/sdk/core'

// Sezione 12 più gli output delle altre due skill: rischi, maturità e raccomandazioni.
// Invocata dal motore KYD a fine analisi (nessun deployment).
NowAssistSkillConfig(
    {
        $id: Now.ID['kyd_risk_maturity_skill'],
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
                                model: 'gpt-5.4',
                                temperature: 0.2,
                                maxTokens: 4000,
                                promptState: 'draft',
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
                        ],
                    },
                ],
            },
        ],
    },
)
