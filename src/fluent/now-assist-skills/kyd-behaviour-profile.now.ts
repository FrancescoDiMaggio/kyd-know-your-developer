import '@servicenow/sdk/global'
import { NowAssistSkillConfig } from '@servicenow/sdk/core'

// Sezioni 8, 9 e 13: come il developer lavora con Build Agent.
// Invocata dal motore KYD a fine analisi (nessun deployment).
NowAssistSkillConfig(
    {
        $id: Now.ID['kyd_behaviour_profile_skill'],
        state: 'published',
        name: 'KYD Behaviour Profile',
        shortDescription: 'Behavioural profile of a developer working with Build Agent',
        description:
            'Reads the prompt metrics, the prompt quality indicators and the prompt history computed by a KYD Analysis and describes strengths, concerns and prompting patterns of the developer.',
        inputs: [
            {
                $id: Now.ID['kyd_behaviour_profile_analysis_data_input'],
                name: 'analysis data',
                description: 'JSON with behaviour metrics, prompt quality indicators and prompt history',
                mandatory: true,
                dataType: 'string',
                testValues: '{"behaviour":{"prompts":12,"activeDays":2},"promptQuality":{"base":12,"metrics":[]},"prompts":[]}',
            },
            {
                $id: Now.ID['kyd_behaviour_profile_language_input'],
                name: 'output language',
                description: 'Language for all generated text (e.g. English, Italian)',
                mandatory: true,
                dataType: 'string',
                testValues: 'English',
            },
        ],
        securityControls: {
            userAccess: { $id: Now.ID['kyd_behaviour_profile_user_access'], type: 'roles', roles: ['x_giss2_kyd.user'] },
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
                        name: 'KYD Behaviour Profile',
                        versions: [
                            {
                                $id: Now.ID['kyd_behaviour_profile_prompt_v1'],
                                version: 1,
                                model: 'gpt-5.4',
                                temperature: 0.2,
                                maxTokens: 4000,
                                promptState: 'published',
                                prompt: (p) => `## Role
You are a senior ServiceNow engineering coach. You review how a developer works with Build Agent, the ServiceNow AI coding assistant, and you describe working practices in a factual, professional and respectful way.

## Context
The data below was computed by KYD (Know Your Developer) from the Build Agent conversations of one developer over a period. It contains:
- behaviour: prompts per day and per hour, prompt counts, average and longest prompt length, attached images, agent processing minutes;
- promptQuality: share of ultra-short prompts, very long prompts, prompts with screenshots, links, ticket references, technical table/field names, duplicates and friction signals;
- prompts: the prompt history per conversation (truncated texts, with tags such as IMG for screenshots).

Analysis data:
${p.input['analysis data']}

## Instructions
1. Describe how the developer works: depth of platform knowledge shown in the prompts, how requirements are expressed, how results are verified, how decisions are delegated to the agent.
2. List the strengths and the concerns. Every point must be grounded in the data: cite numbers, dates or short quotes from the prompts as evidence. Never invent facts.
3. Focus on working practices, not on the person. Quote frustration only as factual evidence of friction in the session (e.g. repeated corrections, lost context), without judging the developer.
4. Give a short classification of the profile (e.g. "Power user, architect-reviewer approach").
5. Write every text value in ${p.input['output language']}. Keep JSON keys and enum values in English.

## Output
Return only a JSON object, with no markdown fences and no text before or after it:
{
  "classification": "short label of the profile",
  "summary": "two or three sentences",
  "strengths": [{ "title": "short title", "detail": "explanation with evidence" }],
  "concerns": [{ "title": "short title", "detail": "explanation with evidence" }]
}
Return between 3 and 6 strengths and between 3 and 6 concerns.`,
                            },
                            {
                                $id: Now.ID['kyd_behaviour_profile_prompt_v2'],
                                version: 2,
                                model: 'gpt-5.4',
                                temperature: 0.2,
                                maxTokens: 4000,
                                promptState: 'published',
                                prompt: (p) => `## Role
You are a senior ServiceNow engineering coach. You review how a developer works with Build Agent, the ServiceNow AI coding assistant, and you describe working practices in a factual, professional and respectful way.

## Context
The data below was computed by KYD (Know Your Developer) from the Build Agent conversations of one developer over a period. It contains:
- behaviour: prompts per day and per hour, prompt counts, average and longest prompt length, attached images, agent processing minutes;
- promptQuality: share of ultra-short prompts, very long prompts, prompts with screenshots, links, ticket references, technical table/field names, duplicates and friction signals;
- prompts: the prompt history per conversation (conversation id and title, prompt texts truncated to 160 characters, tags such as IMG for screenshots).

Analysis data:
${p.input['analysis data']}

## Instructions
1. Describe how the developer works: depth of platform and legacy knowledge shown in the prompts, how requirements are expressed, how results are verified, how decisions are delegated to the agent, how governance rules (update sets, naming, scope) are imposed on the agent.
2. List the strengths and the concerns. Every point must be grounded in the data: cite numbers, dates or short quotes from the prompts as evidence. Never invent facts.
3. Quotes: put text in double quotes only when it is copied verbatim from the prompts provided. Prompt texts are truncated to 160 characters: never complete or extend a truncated text. Otherwise paraphrase without quotes.
4. Focus on working practices, not on the person. Quote frustration only as factual evidence of friction in the session (e.g. repeated corrections, lost context), without judging the developer.
5. Give a short classification of the profile (e.g. "Power user, architect-reviewer approach").
6. Write every text value in ${p.input['output language']}. Keep JSON keys and enum values in English.

## Output
Return only a JSON object, with no markdown fences and no text before or after it:
{
  "classification": "short label of the profile",
  "summary": "two or three sentences",
  "strengths": [{ "title": "short title", "detail": "explanation with evidence" }],
  "concerns": [{ "title": "short title", "detail": "explanation with evidence" }]
}
Return between 3 and 6 strengths and between 3 and 6 concerns.`,
                            },
                        ],
                    },
                ],
                defaultPrompt: 'KYD Behaviour Profile',
                defaultPromptVersion: 2,
            },
        ],
    },
)
