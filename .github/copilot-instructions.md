
# King Myco AI Bot — Copilot Instructions

## Project Overview
This is a TypeScript Telegram bot for crypto and Solana, powered by OpenAI GPT-4. The bot (King Myco) answers in a whimsical persona, provides crypto grading, education, and community engagement. It integrates:
- Telegram (via node-telegram-bot-api)
- OpenAI (via src/services/openai.ts)
- DexScreener API for live Solana token/market data

## Architecture & Data Flow
- **Entry Point:** [src/index.ts](../src/index.ts) instantiates `KingMycoBot` with bot and OpenAI keys.
- **Bot Logic:** [src/bot.ts](../src/bot.ts) contains all command handlers, persona logic, and message routing.
- **Services:**
  - [src/services/dexscreener.ts](../src/services/dexscreener.ts): Wraps token info and trending queries.
  - [src/services/dexscreener-api.ts](../src/services/dexscreener-api.ts): Fetches token data from DexScreener.
  - [src/services/dexscreener-trending.ts](../src/services/dexscreener-trending.ts): Fetches trending Solana tokens.
  - [src/services/openai.ts](../src/services/openai.ts): Handles all OpenAI prompt/response logic.
- **Types:** [src/types.ts](../src/types.ts) defines message types for OpenAI chat.

## Key Patterns & Conventions
- **Command Routing:** All Telegram commands are registered in `setupHandlers()` in [src/bot.ts](../src/bot.ts). Each command has a dedicated async handler method.
- **Persona Enforcement:** System prompts for OpenAI always enforce King Myco's whimsical, non-financial-advice persona. See `handleAskKingMyco` and `handleMessage` for prompt structure.
- **Service Abstraction:** All external API calls (DexScreener, OpenAI) are abstracted into service classes. Do not call APIs directly from handlers.
- **Error Handling:** All handlers catch errors and send user-friendly Telegram messages. Follow this pattern for new features.
- **Dynamic Menus:** Inline keyboards and menus are built with Telegram's reply_markup. See `setupMenuButton` and menu methods.
- **No User Data Storage:** The bot does not persist user data; conversation history is kept in-memory per session.

## Developer Workflows
- **Install dependencies:**
  ```sh
  npm install
  ```
- **Run the bot (dev):**
  ```sh
  npx ts-node src/bot.ts
  ```
- **Build (optional):**
  ```sh
  npx tsc
  ```
- **Environment Variables:**
  - `OPENAI_KEY` (required for OpenAI)
  - `BOT_TOKEN` (optional, can be hardcoded or set in env)
- **Debugging:**
  - Add `console.log` in handlers or services as needed.
  - The bot logs to console on startup and for major actions.
- **Testing:**
  - No formal test suite; test by running the bot and interacting via Telegram.

## Integration Points
- **DexScreener:** All token/market data comes from DexScreener API via service wrappers.
- **OpenAI:** All AI/LLM responses are generated via [src/services/openai.ts](../src/services/openai.ts).
- **Telegram:** All user interaction is via Telegram bot commands and inline menus.

## Project-Specific Advice
- Always use the King Myco persona in AI responses (see system prompts in [src/bot.ts](../src/bot.ts)).
- Add new commands by updating `setupHandlers()` and creating a handler method.
- For new data sources, create a service in `src/services/` and inject it into the bot class.
- Keep all user-facing error messages friendly and on-brand.
- Do not store user data or secrets in the repo.

## Example: Adding a Command
1. Add a new `onText` handler in `setupHandlers()`.
2. Implement the handler as an async method.
3. If using external data, add a service method in `src/services/`.
4. Follow persona and error handling conventions.

---
For more, see [README.md](../README.md) and service files in `src/services/`.
