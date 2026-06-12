import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, mkdirSync, writeFileSync } from "fs";
import { createInterface } from "readline";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const client = new Anthropic();

const systemPrompt = readFileSync(join(__dirname, "AGENTS.md"), "utf-8");

const messages = [];

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(prompt) {
  return new Promise((resolve) => rl.question(prompt, resolve));
}

function saveMealPlan(content) {
  const dir = join(__dirname, "meal-prep");
  mkdirSync(dir, { recursive: true });
  const date = new Date().toISOString().split("T")[0];
  const filename = join(dir, `prep-${date}.md`);
  writeFileSync(filename, content, "utf-8");
  console.log(`\n📁 Plan guardado: meal-prep/prep-${date}.md`);
}

async function chat(userInput) {
  messages.push({ role: "user", content: userInput });

  process.stdout.write("\nFrank: ");

  const stream = client.messages.stream({
    model: "claude-opus-4-8",
    max_tokens: 4096,
    system: systemPrompt,
    messages,
    thinking: { type: "adaptive" },
  });

  let fullText = "";

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      process.stdout.write(event.delta.text);
      fullText += event.delta.text;
    }
  }

  console.log("\n");
  messages.push({ role: "assistant", content: fullText });

  // Auto-save if response contains a meal plan
  if (
    fullText.includes("PREP PARA HOY") ||
    fullText.includes("Desayuno") && fullText.includes("Almuerzo")
  ) {
    const save = await ask("¿Guardar este plan? (s/n): ");
    if (save.trim().toLowerCase() === "s") {
      saveMealPlan(fullText);
    }
  }

  return fullText;
}

async function main() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Frank — Agente de Nutrición de Camila");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log('Escribe "salir" para terminar.\n');

  while (true) {
    const input = await ask("Camila: ");
    const trimmed = input.trim();

    if (!trimmed) continue;
    if (trimmed.toLowerCase() === "salir") {
      console.log("\nFrank: ¡Hasta pronto! Come rico. 🌿\n");
      break;
    }

    await chat(trimmed);
  }

  rl.close();
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
