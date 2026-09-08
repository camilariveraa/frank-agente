# Frank

A conversational nutrition agent running on Claude Opus. Frank builds personalized meal-prep plans that respect the dietary restrictions you give it, and writes each plan to `meal-prep/`.

Built as a single Node script against the Anthropic SDK — no framework, no server. Behaviour lives in `AGENTS.md`.

## Run it

```bash
npm install
export ANTHROPIC_API_KEY=sk-...
node frank.js
```

## Layout

| File | What it is |
|---|---|
| `frank.js` | The agent loop |
| `AGENTS.md` | Frank's instructions and nutrition approach |
| `meal-prep/` | Generated plans |

Frank is one of three agents in [nextfellow-agents](https://github.com/camilariveraa/nextfellow-agents), where it runs with a Telegram interface as well.
