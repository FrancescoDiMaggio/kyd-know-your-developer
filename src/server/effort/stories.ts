import { GlideDateTime, GlideRecord } from '@servicenow/glide'
import type { LinkedStory } from '../../client/types'

const STORY_NUMBER = /STRY\d{6,}/g
// Scala Fibonacci di riferimento per l'aderenza delle stime del team.
const FIBONACCI = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89]

export function storyNumbers(text: string): string[] {
    return [...new Set(text.match(STORY_NUMBER) || [])]
}

function teamStats(groupSysId: string): LinkedStory['teamStats'] {
    if (!groupSysId) return null
    const points: number[] = []
    const gr = new GlideRecord('rm_story')
    gr.addQuery('assignment_group', groupSysId)
    gr.addQuery('story_points', '>', 0)
    const since = new GlideDateTime()
    since.addDaysUTC(-365)
    gr.addQuery('sys_created_on', '>=', since.getValue())
    gr.query()
    while (gr.next()) points.push(parseInt(gr.getValue('story_points'), 10))
    if (!points.length) return null
    points.sort((a, b) => a - b)
    const at = (q: number) => points[Math.min(points.length - 1, Math.floor(q * (points.length - 1)))]
    return {
        stories: points.length,
        median: at(0.5),
        p90: at(0.9),
        max: points[points.length - 1],
        fibonacciShare: Math.round((points.filter((p) => FIBONACCI.includes(p)).length / points.length) * 1000) / 10,
    }
}

// Story del cliente citate nel lavoro con Build Agent, con le statistiche del loro team:
// gli story point sono una valuta del team e vanno letti nel suo contesto.
export function linkStories(byConversation: Record<string, string[]>): LinkedStory[] {
    const conversations: Record<string, string[]> = {}
    Object.entries(byConversation).forEach(([conv, numbers]) =>
        numbers.forEach((n) => (conversations[n] ||= []).includes(conv) || conversations[n].push(conv)),
    )
    const numbers = Object.keys(conversations)
    if (!numbers.length) return []
    const out: LinkedStory[] = []
    const teams: Record<string, LinkedStory['teamStats']> = {}
    try {
        const gr: any = new GlideRecord('rm_story')
        gr.addQuery('number', 'IN', numbers.join(','))
        gr.query()
        while (gr.next()) {
            const group = gr.getValue('assignment_group') || ''
            if (!(group in teams)) teams[group] = teamStats(group)
            const sp = parseInt(gr.getValue('story_points') || '', 10)
            out.push({
                number: gr.getValue('number'),
                shortDescription: gr.getValue('short_description') || '',
                storyPoints: isNaN(sp) ? null : sp,
                state: gr.getDisplayValue('state') || '',
                team: gr.getDisplayValue('assignment_group') || '',
                product: gr.isValidField('product') ? gr.getDisplayValue('product') || '' : '',
                conversations: conversations[gr.getValue('number')] || [],
                teamStats: teams[group],
            })
        }
    } catch {
        // rm_story non leggibile: nessuna story collegata
    }
    return out
}
