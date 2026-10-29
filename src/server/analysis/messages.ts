import { GlideRecord } from '@servicenow/glide'
import type { Conversation, PromptEntry, Sender, SubAgentDelegation, ToolOutcome } from '../../client/types'
import {
    FRICTION_WORDS,
    GOAL_TRUNCATE,
    INTENT_TRUNCATE,
    MAX_PROMPTS_PER_CONV,
    PROMPT_TRUNCATE,
    RESULT_TRUNCATE,
    SUBAGENT_TASK_TRUNCATE,
} from './config.ts'
import { flat, inc, parseContent } from './util.ts'

const SENDERS: Sender[] = ['user', 'assistant', 'assistant-thinking', 'assistant-tool', 'sub-agent']

export interface ConversationSet {
    rootCount: number
    ids: string[]
    meta: Record<string, Conversation>
}

function toConversation(gr: any, isSubAgent: boolean): Conversation {
    return {
        sysId: gr.getUniqueValue(),
        title: flat(gr.getValue('title'), isSubAgent ? 85 : 95),
        isSubAgent,
        parent: gr.getValue('parent_conversation') || undefined,
        createdOn: gr.getValue('sys_created_on') || '',
        lastMessageOn: gr.getValue('last_message_at') || '',
        state: gr.getValue('state') || '',
        execStatus: gr.getValue('execution_status') || '-',
        client: gr.getValue('client') || '',
        variant: gr.getValue('ba_variant_type') || '',
        appName: gr.getValue('application_name') || '-',
        scopeId: gr.getValue('application_id') || '-',
        messages: 0,
        senders: { user: 0, assistant: 0, 'assistant-thinking': 0, 'assistant-tool': 0, 'sub-agent': 0 },
    }
}

// 2. Conversazioni root del periodo più le conversazioni figlie (sub-agent).
export function collectConversations(userId: string, from: string, to: string): ConversationSet {
    const ids: string[] = []
    const meta: Record<string, Conversation> = {}
    const c = new GlideRecord('sn_build_agent_conversation')
    c.addQuery('user', userId)
    c.addQuery('sys_created_on', '>=', from)
    c.addQuery('sys_created_on', '<', to)
    c.orderBy('sys_created_on')
    c.query()
    while (c.next()) {
        const conv = toConversation(c, false)
        ids.push(conv.sysId)
        meta[conv.sysId] = conv
    }
    const rootCount = ids.length

    let frontier = [...ids]
    for (let guard = 0; frontier.length && guard < 10; guard++) {
        const ch = new GlideRecord('sn_build_agent_conversation')
        ch.addQuery('parent_conversation', 'IN', frontier.join(','))
        ch.query()
        const next: string[] = []
        while (ch.next()) {
            const id = ch.getUniqueValue()
            if (meta[id]) continue
            meta[id] = toConversation(ch, true)
            ids.push(id)
            next.push(id)
        }
        frontier = next
    }
    return { rootCount, ids, meta }
}

export interface ScanContext {
    conversations?: Record<string, Conversation>
    messages: number
    senderTotals: Record<string, number>
    tools: Record<string, { ok: number; ko: number; ms: number }>
    toolTotal: number
    buildCount: number
    buildFailures: ToolOutcome[]
    installs: ToolOutcome[]
    scriptFailures: ToolOutcome[]
    filesWritten: Record<string, number>
    fileOps: number
    filesDeleted: { conversation: string; op: string; path: string }[]
    scriptIntents: { conversation: string; ok: boolean; intent: string }[]
    subAgents: SubAgentDelegation[]
    byDay: Record<string, number>
    byHour: Record<string, number>
    images: number
    longestPrompt: number
    promptChars: number
    durThinking: number
    durTools: number
    durResponses: number
    prompts: Record<string, PromptEntry[]>
    pq: {
        total: number
        ultraShort: number
        veryLong: number
        withImages: number
        withUrl: number
        withTicket: number
        withTech: number
        friction: number
        duplicates: number
        hidden: number
    }
}

export function newScanContext(): ScanContext {
    return {
        messages: 0,
        senderTotals: {},
        tools: {},
        toolTotal: 0,
        buildCount: 0,
        buildFailures: [],
        installs: [],
        scriptFailures: [],
        filesWritten: {},
        fileOps: 0,
        filesDeleted: [],
        scriptIntents: [],
        subAgents: [],
        byDay: {},
        byHour: {},
        images: 0,
        longestPrompt: 0,
        promptChars: 0,
        durThinking: 0,
        durTools: 0,
        durResponses: 0,
        prompts: {},
        pq: { total: 0, ultraShort: 0, veryLong: 0, withImages: 0, withUrl: 0, withTicket: 0, withTech: 0, friction: 0, duplicates: 0, hidden: 0 },
    }
}

// Scansione unica dei messaggi di tutte le conversazioni.
export function scanMessages(ctx: ScanContext, conv: ConversationSet) {
    if (!conv.ids.length) return
    ctx.conversations = conv.meta
    const seen: Record<string, boolean> = {}
    const m = new GlideRecord('sn_build_agent_message')
    m.addQuery('conversation', 'IN', conv.ids.join(','))
    m.orderBy('conversation')
    m.orderBy('sequence')
    m.query()
    while (m.next()) {
        const cid = m.getValue('conversation')
        const created = m.getValue('sys_created_on') || ''
        const o = parseContent(m.getValue('content'))
        const sender: string = o.sender || 'unknown'

        ctx.messages++
        inc(ctx.senderTotals, sender)
        const c = conv.meta[cid]
        if (c) {
            c.messages++
            if ((SENDERS as string[]).includes(sender)) c.senders[sender as Sender]++
        }

        if (sender === 'assistant-thinking') ctx.durThinking += o.duration || 0
        else if (sender === 'assistant') ctx.durResponses += o.duration || 0
        else if (sender === 'assistant-tool') ctx.durTools += o.duration || 0

        if (sender === 'user') scanUserMessage(ctx, cid, created, o, seen)
        else if (sender === 'sub-agent')
            ctx.subAgents.push({
                conversation: cid,
                agentType: o.agentType || '?',
                name: o.name || '',
                task: flat(o.task, SUBAGENT_TASK_TRUNCATE),
            })
        else if (sender === 'assistant-tool') scanToolMessage(ctx, cid, o)
    }
}

function scanUserMessage(ctx: ScanContext, cid: string, created: string, o: any, seen: Record<string, boolean>) {
    const isHidden = !!o.isHidden
    const txt = String(o.text || '')
    if (isHidden) {
        ctx.pq.hidden++
    } else {
        inc(ctx.byDay, created.substring(0, 10))
        inc(ctx.byHour, created.substring(11, 13))
        ctx.pq.total++
        ctx.promptChars += txt.length
        if (txt.length > ctx.longestPrompt) ctx.longestPrompt = txt.length

        const norm = txt.replace(/\s+/g, ' ').trim()
        if (norm.length <= 15) ctx.pq.ultraShort++
        if (txt.length > 1500) ctx.pq.veryLong++
        if (o.images) {
            ctx.pq.withImages++
            ctx.images += o.images.length || 1
        }
        if (/https?:\/\//i.test(txt)) ctx.pq.withUrl++
        if (/(RITM|REQ|STRY|INC|CHG|SCTASK)\d{6,}/i.test(txt)) ctx.pq.withTicket++
        if (/\b(u_|sys_|sc_|sn_|rm_|cmdb_)[a-z0-9_]{3,}/i.test(txt)) ctx.pq.withTech++

        const low = norm.toLowerCase()
        if (FRICTION_WORDS.some((w) => low.includes(w))) ctx.pq.friction++
        const key = cid + '::' + low.substring(0, 120)
        if (seen[key]) ctx.pq.duplicates++
        else seen[key] = true
    }

    const conv = ctx.conversations?.[cid]
    if (conv && !isHidden && !conv.goal && txt.trim()) conv.goal = flat(txt, GOAL_TRUNCATE)

    const list = (ctx.prompts[cid] ||= [])
    if (list.length < MAX_PROMPTS_PER_CONV && !isHidden) {
        const tags: string[] = []
        if (o.images) tags.push(`IMG${o.images.length || 1}`)
        if (o.hasCheckpoints) tags.push('CKPT')
        list.push({ createdOn: created, tags, text: flat(txt, PROMPT_TRUNCATE), length: txt.length })
    }
}

function scanToolMessage(ctx: ScanContext, cid: string, o: any) {
    const tool: string = o.toolActualName || o.toolName || 'unknown'
    const inp = o.toolInput || {}
    const ok = o.success === true
    const message = flat(o.result, RESULT_TRUNCATE)

    ctx.toolTotal++
    const st = (ctx.tools[tool] ||= { ok: 0, ko: 0, ms: 0 })
    st[ok ? 'ok' : 'ko']++
    st.ms += o.duration || 0

    if (tool === 'build') {
        ctx.buildCount++
        if (!ok) ctx.buildFailures.push({ conversation: cid, tool, ok, message })
    } else if (tool === 'install' || tool === 'build_install') {
        ctx.installs.push({ conversation: cid, tool, ok, message })
    } else if (tool === 'run_script') {
        ctx.scriptIntents.push({ conversation: cid, ok, intent: flat(inp.intent, INTENT_TRUNCATE) })
        if (!ok) ctx.scriptFailures.push({ conversation: cid, tool, ok, message })
    } else if (tool === 'fs_write_file' || tool === 'write_file') {
        inc(ctx.filesWritten, inp.path || '?')
        ctx.fileOps++
    } else if (tool === 'fs_delete' || tool === 'fs_move' || tool === 'delete') {
        ctx.filesDeleted.push({ conversation: cid, op: tool, path: inp.path || inp.oldPath || '?' })
    }
}
