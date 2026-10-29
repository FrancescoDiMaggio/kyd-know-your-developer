# KYD - Evolutive

Backlog delle evoluzioni successive alla prima fase (analisi deterministica + UI di rappresentazione).

## 1. Skill Now Assist nel processo di analisi

**Obiettivo:** usare un LLM per trasformare i dati prodotti dagli script, tendenzialmente numerici, in valori testuali di comprensione.

**Stato:** prima versione implementata con tre skill (Behaviour Profile, Delivery Outcomes, Risk and Maturity) in `src/fluent/now-assist-skills/`. Le invoca il motore a fine analisi e la UI le mostra nella scheda Report.

Le Skill (Now Assist Skill Kit, `NowAssistSkillConfig`) vengono invocate in momenti specifici del motore di analisi. Ognuna riceve una sezione del `KydAnalysisResult` e restituisce testo strutturato, salvato nella stessa KYD Analysis.

| Momento del processo | Input (sezione) | Output testuale atteso |
| --- | --- | --- |
| Dopo la scansione dei messaggi | 8. Metriche comportamentali, 9. Qualità dei prompt, 13. Prompt | Profilo comportamentale: punti di forza, criticità, pattern di rischio nel prompting |
| Dopo l'analisi dei tool | 3. Tool, 4. Build / Install | Cause principali dei fallimenti, aree critiche spiegate |
| Dopo i metadata | 6. Intent degli script, 10. Metadata, 11. Update set | Mappa delle attività per stream di lavoro, esiti delle richieste |
| A fine analisi | 12. Governance + output delle skill precedenti | Osservazioni di rischio con severità, livello di maturità per dimensione, raccomandazioni operative |

**Da definire:**
- Il contratto di output di ogni skill (JSON con campi testuali) e la sua aggiunta a `KydAnalysisResult`.
- Le soglie di dimensione dell'input per la sezione 13 (i prompt possono essere molto lunghi).
- Dove salvare i testi generati: sulla KYD Analysis, con traccia della skill e del modello usati.

## 2. Developer Passport

Una vista sintetica e condivisibile del developer, costruita sulle analisi KYD:

- **Identità e contesto:** ruoli, gruppi, client Build Agent usati.
- **Livelli per dimensione:** conoscenza piattaforma, governance, qualità del prompting, verifica, automazione dei test.
- **Badge** ricavati dai dati, ad esempio "Governance-first", "Evidence-driven" o "Zero ATF".
- **Evoluzione nel tempo:** confronto tra le KYD Analysis successive dello stesso developer. Ce ne possono essere più di una per utente.
- **Raccomandazioni attive**, prodotte dalle Skill del punto 1.
