# Frontend and backend repository structure
_Exported on 13/05/2026 at 16:29:25 GMT+5 from Cursor (3.3.30)_

---

**User**

the frontend (React) repo is at /frontend
the backend (Nest) repo is at /backend

keep this in mind while making changes


---

**Cursor**

Noted for this workspace:

- **Frontend (React):** `/frontend`
- **Backend (Nest):** `/backend`

I’ll use those paths when editing, running commands, or explaining where things live. If you want a specific change next, say what you’d like done in either app.

---

**User**

AI-Powered Client Brief → Dev-Ready Tasks / Jira Tickets Converter

Objective
Build an AI-driven system that transforms raw, unstructured client briefs into:

Clear, structured, developer-ready task breakdowns
Automatically generated developer tickets

The goal is to  build a tool for PMO department which will eliminate ambiguity, reduce back-and-forth communication, and enable developers to start implementation immediately. The system must never make assumptions. Instead.

Points to consider : 

No authentication is required

Evaluation Goal:

 Goal is to evaluate your interaction with AI to get the work done, so at this stage our primary focus for the evaluation will be quality not quantity. 

Reference Requirement Document
Use the following document as the testing  requirements:

@/Users/brainxweb/Library/Application Support/Cursor/User/workspaceStorage/11c93bd7a7d3b774b6104ebd419c26f6/pdfs/ad3f7c1d-f794-4b7d-8ed3-2a932bbf16ff/Copy of Purchase Pal – Simple Product Explanation.pdf 

keys: OPENAI_API_KEY, OPENAI_MODEL

first task: backend
make a reusable service that uses the key and model for OpenAI along with a prompt

---

**Cursor**

Exploring the Nest backend structure to add a reusable OpenAI service that reads `OPENAI_API_KEY` and `OPENAI_MODEL`.



Adding `@nestjs/config` and the official `openai` package, then implementing `OpenAiModule` and `OpenAiService`.



Creating `OpenAiService` and `OpenAiModule`, and wiring `ConfigModule` in `AppModule`.



Simplifying content handling: TypeScript narrowed the array branch incorrectly.



Here is what was added to the Nest backend.

### What you have

1. **`ConfigModule`** in `app.module.ts` — loads `.env` / `.env.local` globally so `OPENAI_API_KEY` and `OPENAI_MODEL` are available everywhere.

2. **`OpenAiModule`** (`src/openai/openai.module.ts`) — declares and exports **`OpenAiService`** so any feature module can `import { OpenAiModule }` and inject `OpenAiService`.

3. **`OpenAiService`** (`src/openai/openai.service.ts`) — reads both env vars in the constructor (throws if either is missing or blank), builds an `OpenAI` client with that key, and exposes:

   - **`completePrompt(userPrompt, options?)`** — required user text; optional `systemPrompt`, `temperature`, `maxCompletionTokens`. Uses **`OPENAI_MODEL`** for `chat.completions.create` and returns the assistant text (handles string or multimodal `content` arrays).

### Dependencies

- `@nestjs/config`
- `openai`

### `.env`

Ensure these are set (you already mentioned them):

- `OPENAI_API_KEY`
- `OPENAI_MODEL` (e.g. `gpt-4o-mini`)

Because `AppModule` imports `OpenAiModule`, **`OpenAiService` is constructed at startup**, so the app will fail fast if those variables are missing.

### Using it elsewhere

Import `OpenAiModule` in the module that needs AI, inject `OpenAiService`, then call `completePrompt('...')` or pass a `systemPrompt` in the second argument object.

If you want the next step, we can add a controller or a dedicated “brief → tasks” use case that calls this service only (still no auth).

---

**User**

next task: construct the API that the frontend wiill use

API will be sent instructions in a simple text param, see the example document Copy of Purchase Pal that was attahced in the first message

---

**Cursor**

Building the API endpoint and reviewing the reference document and frontend for expected shapes.



Implementing POST endpoint with validation, JSON-mode OpenAI output, and CORS for the Vite frontend. Adding `completeJson` to `OpenAiService`.



Implementing the brief-conversion module, extending OpenAI for JSON responses, and enabling validation plus CORS.



Here is what was added for the frontend-facing API.

### Endpoint

- **`POST /api/briefs/convert`**
- **Body (JSON):** `{ "instructions": "<full plain-text brief>" }`  
  - Validated with `class-validator`: non-empty string, max length **120 000** characters.  
  - Unknown extra fields return **400** (`forbidNonWhitelisted`).

```1:21:/Users/brainxweb/Documents/Projects/Demos/hackathon-task-2/backend/src/brief-conversion/brief-conversion.controller.ts
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { BriefConversionService } from './brief-conversion.service';
import { ConvertBriefDto } from './dto/convert-brief.dto';
import type { BriefConversionResult } from './brief-conversion.types';

@Controller('api/briefs')
export class BriefConversionController {
  constructor(private readonly briefConversion: BriefConversionService) {}

  /**
   * POST body: { "instructions": "<plain text brief>" }
   */
  @Post('convert')
  @HttpCode(200)
  async convert(@Body() dto: ConvertBriefDto): Promise<BriefConversionResult> {
    return this.briefConversion.convert(dto.instructions);
  }
}
```

### Response shape (`200`)

Structured object aligned with PMO use: summary, goals, functional areas, **information gaps** (no silent guessing), **developer_tasks** (with **traceability** to the brief), and **jira_tickets**. Types live in `brief-conversion.types.ts`; the model is steered by `brief-conversion.prompt.ts` (Purchase Pal–style briefs: steps, bullets, embedded questions, partial scope) and **JSON object** mode via `OpenAiService.completePromptJson`.

### Errors

- **400** — invalid body (e.g. missing `instructions`, too long, extra properties).
- **502** — OpenAI call failed or response could not be used.
- **500** — unexpected failure while normalizing JSON.

### Frontend / CORS

`main.ts` enables **CORS** for `http://localhost:5173` and `http://127.0.0.1:5173` by default. Override with **`CORS_ORIGINS`** (comma-separated origins) if your Vite URL differs.

### Global validation

`ValidationPipe` is registered globally (`whitelist`, `transform`, `forbidNonWhitelisted`).

---

**Example for the React app:** `fetch('http://localhost:3000/api/briefs/convert', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ instructions: pastedText }) })`.

If you want the next step, we can wire this call in `/frontend` and share a small TypeScript type mirroring `BriefConversionResult`.

---

**User**

no database will be required
next task: conststruct the prompt and decide the output format

AI will be given raw, unstructured client briefs in text format
they must convert them to Clear, structured, developer-ready task breakdowns - these must be individual points which will be compiled into an instructions array
next: Automatically generated developer tickets - these must be individual points sorted by the project lifecycle - each one should be an object containing the text and the priority (low, medium, high) - which will be later compiled into an array of objects

so there will be a single API fro the frontend that takes a text param and outputs instructions (array of strings) and tickets (array of objects - each having a text and priorty param)

make sure to follow the usual prompt conventions so the AI understands the instructions and responds in a structured formtat

output format must be strict in the prompt


---

**Cursor**

Refactoring the brief-conversion flow to a strict `{ instructions: string[], tickets: { text, priority }[] }` contract, renaming the input field to `text`, and rewriting the system prompt.



Implementing a strict system prompt, a JSON Schema for structured outputs, parser updates, and renaming the request body field to `text`.



Here is what changed.

### API contract (single endpoint, no DB)

- **`POST /api/briefs/convert`**
- **Body:** `{ "text": "<raw brief>" }` (renamed from `instructions` so it does not clash with the response `instructions` array.)
- **Response:** `{ "instructions": string[], "tickets": { "text": string, "priority": "low" | "medium" | "high" }[] }`

### Prompt (`brief-conversion.prompt.ts`)

- States **role**, **task**, and **output rules** in clear sections (Role, Output contract, Semantics for `instructions` / `tickets`, Grounding rules, Response reminder).
- **`instructions`:** one string = one atomic, developer-ready point; no invented scope; gaps go to tickets, not fake instructions.
- **`tickets`:** each item is `{ text, priority }`; **`tickets` array ordered by project lifecycle** (discovery → requirements → architecture → implementation → quality → launch, skipping phases that do not apply).
- **`priority`:** when to use high / medium / low is defined in the prompt.
- Explicit rule: **JSON only**, no markdown, **exactly two root keys** with the meanings above.

### Strict structure (prompt + API)

- **`brief-conversion.schema.ts`** supplies OpenAI **Structured Outputs** (`json_schema`, `strict: true`) so the model is constrained to that root shape and ticket `priority` enum.
- **`brief-conversion.result.ts`** still validates: exactly two root keys, both arrays, every ticket has non-empty `text` and a valid priority (case-normalized to `low` | `medium` | `high`).

### Code wiring

- `OpenAiService.completePromptJson` accepts optional **`jsonResponseFormat`** (defaults to `json_object` when omitted).
- `BriefConversionService` passes **`BRIEF_CONVERSION_RESPONSE_FORMAT`** into that option.

**Note:** Structured Outputs with `strict: true` needs a model that supports it (e.g. recent GPT‑4o family). If `OPENAI_MODEL` does not, the OpenAI call may fail with **502**; switch the model or we can add a fallback path later.

If the frontend was already calling with `{ "instructions": "..." }`, update it to **`{ "text": "..." }`** and read **`instructions`** and **`tickets`** from the response as above.

---

**User**

onto the frontend
first task
there must be a single page with textarea field that will take the user's instructions and send them to the API to recieve the result

keep the design modern and sleek, and professional to suit the project's userbase

there must be a header at the top with the project name Jira Tickets Converter

the main body must have the text field

use API_URL for the base url

---

**Cursor**

Exploring the frontend setup and implementing the single-page UI with API integration.



Implementing the single-page UI, API helper using `API_URL`, and Vite config so `API_URL` is exposed to the client.



Here is what was implemented.

### Behaviour
- **Header:** “Jira Tickets Converter” with a short subtitle for PMO-style use.
- **Main:** Large textarea for the brief, primary **Convert** action, loading state, and inline errors from the API.
- **Results:** After a successful `POST`, **Instructions** (ordered list) and **Tickets** (cards with **low / medium / high** badges) in a responsive two-column layout on wide screens.

### API
- `convertBrief` in `src/api/convertBrief.ts` calls  
  `{API_URL}/api/briefs/convert`  
  with `{ "text": "<textarea content>" }`, matching the Nest contract.

### `API_URL` in Vite
- Default Vite only exposes `VITE_*`. **`vite.config.ts`** now has  
  `envPrefix: ['VITE_', 'API_']`  
  so `API_URL` from `.env` is available as **`import.meta.env.API_URL`**.
- **`src/vite-env.d.ts`** declares `API_URL` for TypeScript.

### Design
- Slate / blue palette, light surface cards, subtle shadow and gradient background, dark-mode-friendly overrides, clear typography and spacing.

### Other updates
- **`index.html`** title set to Jira Tickets Converter.
- **`index.css`** `#root` adjusted so the page is full-width and left-aligned (no old marketing layout).

Your existing `frontend/.env` with `API_URL=http://localhost:3000` is enough: run the backend on port 3000 and `npm run dev` in `frontend` to try it end to end.

---

**User**

for the output
show it below the text field
ina two column layout

on the left side - instructions in bullet points
on the right side - the tickets in small rounded containers in a flex container, each should have the priority as badge on the top right and background color according to the priority

red - high
yellow - medium
green - low

---

**Cursor**

Updating the layout: placing results directly below the form, using a two-column grid, switching instructions to a bulleted `ul`, and styling ticket cards with priority-colored backgrounds and a top-right badge.



Here is what changed.

### Layout
- Results stay **under the textarea** (form → optional error → results).
- **Two columns** from **720px** up: left = instructions, right = tickets; **one column** on smaller screens.

### Instructions (left)
- Switched from `<ol>` to **`<ul>`** with **`list-style-type: disc`** and accent-colored markers.

### Tickets (right)
- **`display: flex; flex-direction: column; gap`** on `.app-tickets` for a vertical stack of cards.
- Each ticket is a **rounded card** (`border-radius: 10px`) with **priority-colored background**:
  - **high** → red tint (`#fee2e2` / dark mode semi-transparent red)
  - **medium** → yellow (`#fef3c7` / dark amber tint)
  - **low** → green (`#dcfce7` / dark green tint)
- **Badge** in the **top right** (`.app-ticket-badge`: `position: absolute; top/right`), pill shape; text uses padding on the card so it doesn’t sit under the badge.
- Unknown `priority` values fall back to **medium** styling so CSS never breaks.

Header/main max width is aligned at **1100px** so the two columns have a bit more room.

---

**User**

the prompt needs refinement 

the tickets generated fro the example doc Copy of Purchase Pal  were only 3, and did not represent actual dev ready tasks

assume that the given requirements have no ambuigities or follow up questions, and make tickets according to that

the tickets should be actual dev tasks e.g  create login API, purchase history page design
and they should be informative and should represent exactly what the developer needs to do

---

**Cursor**

Refining the system prompt and schema descriptions so tickets are concrete, dev-ready tasks and we assume a complete, unambiguous brief.



Rewriting the system prompt and updating the JSON schema descriptions to require granular, implementation-style tickets and to assume an actionable, unambiguous brief.



Here is what was updated.

### Prompt (`brief-conversion.prompt.ts`)

- **Assumption:** The brief is treated as **complete and unambiguous** — no clarification spikes, “confirm with PM/client,” or ambiguity-only tickets.
- **Tickets:** Must read like **real Jira dev work** (concrete deliverables: APIs, screens, services, models, flows). Added **good vs bad** examples, including patterns similar to “Implement login API” / “Build purchase history UI…”.
- **Granularity:** For a **multi-step** brief, explicitly ask for **many** tickets (guide **~8–20+** when the brief has that much scope), and to **split by boundary** (API vs UI vs job vs integration), not one ticket for the whole product.
- **Expansion:** Still **grounded** in the brief, but you **may decompose** stated capabilities into the full set of engineering tasks (persistence, API, UI, validation) even when the brief does not use words like “API.”
- **Lifecycle:** Replaced “discovery/clarification” with an **engineering dependency order**: core backend/domain → auth if present → other APIs/integrations → frontend (shell then features) → cross-cutting (export, comparisons, etc.).
- **Priorities:** **high** = foundational/blocking; **medium** = core features; **low** = secondary or late-phase items **named in the brief**.

### User message nudge (`brief-conversion.service.ts`)

- Appended: *Decompose into many granular engineering tickets… Assume the brief is complete.*
- **`maxCompletionTokens`** raised to **16384** so long instruction/ticket lists are less likely to truncate.

### Schema copy (`brief-conversion.schema.ts`)

- Descriptions updated so the model sees the same expectations in the structured-output metadata (granular tasks, many tickets, lifecycle order).

Restart the Nest server and run the Purchase Pal brief again; you should see a larger, more implementation-specific ticket set. If anything still feels too coarse for your rubric, we can add a numeric floor (e.g. minimum ticket count) in the prompt—know that can conflict with very tiny briefs.

---

**User**

issue with the prompt

example: this is the ticket that was generated
Clarify the approach and feasibility for importing previous purchase lists via store account links and how to approach stores with this request.

a single high ticket - that still is stuck on clarifying the approach

assume everything is crystal clear and get straight to the dev tickets

the instructions are fine - use them to make dev ready tickets with presice details

---

**Cursor**

Tightening the prompt to forbid clarification/feasibility tickets and require implementation-only tickets derived from the brief's instructions-level detail.



Strengthening the prompt: forbidding clarification/feasibility language, requiring tickets to be derived from the instructions as implementation-only work, and reframing in-brief questions into concrete build tasks.



Here is what changed.

### Prompt (`brief-conversion.prompt.ts`)

- **Crystal-clear brief:** States that everything is decided, there is **nothing to clarify** with PM/client/stores, and **embedded questions must be turned into a default technical path** (example: store-linked import → OAuth/link + ingestion + UI), not human “figure it out” work.
- **Instructions → tickets:** Explicit **two-step logic**: (1) build a full **`instructions`** list as the scope source of truth; (2) derive **`tickets`** from those lines by merging adjacent steps into Jira-sized **implementation** tasks—no new scope beyond what instructions cover.
- **Forbidden ticket text:** Explicit ban on **clarify / feasibility / approach (stakeholder) / discuss / reach out / ask stores / alignment / open questions / recommend options** without shipping code, and on a **single high-priority “research only”** ticket.
- **Your example:** Included as **BAD** vs **GOOD** split (linking API, normalize import API, connect/preview UI).
- **Good shape:** Verbs like Implement / Build / Create / Expose / Persist / Wire, with concrete deliverables.

### Schema (`brief-conversion.schema.ts`)

- Ticket `text` description now says **implementation-only**, derived from instructions, **no clarification/feasibility** language.

### User message (`brief-conversion.service.ts`)

- Reinforces: exhaustive **instructions** first, **tickets** from them, **no clarification/feasibility** tickets, decisions assumed final.

Restart the backend so the new prompt is loaded, then run the Purchase Pal brief again; the store-import thread should come back as concrete build tasks instead of a clarification ticket.

---

**User**

Instructions
Developer-ready points from your brief.

Implement user sign up functionality to create new accounts.
Implement user login functionality for existing accounts.
Save user shopping lists and purchase history linked to their accounts.
After login, present users with two options to create a shopping list: import previous purchase list or create a new list manually.
Allow users to scan barcodes of previously purchased products to manually rebuild purchase history.
Allow users to search previous purchases by product name or brand to rebuild purchase history.
Enable users to select items from their purchase history when creating a new shopping list.
Enable users to search and add new items to the shopping list that are not in purchase history.
Ensure shopping lists contain only items, not store-specific products.
Provide a Next button to finalize the shopping list after items are added.
Search the app's grocery store database to find the cheapest available option for each item in the finalized list.
Build and maintain a database of grocery stores, initially focusing on 4-5 priority stores.
Generate a final purchase list showing each item and the best-priced store-specific option for that item.
Allow users to view price comparisons visually, either overall pricing at a single store or by choosing a store based on the list.
Enable export of the final purchase list into text or PDF format.
Ensure the app experience is simple, fast, and helpful, consistent with the client's UX presentation.

Tickets
Lifecycle order; color indicates priority.

high
Advise on approach to request store account linking for importing previous purchase lists.

this was the output from the example document attached

as you can see, the prompt is not correctly undersanding how to generate tickets - they should be dev ready tickets - and not about asking/clarifying - that asumption should be made by the AI

---

**Cursor**

Strengthening the prompt and adding server-side filtering to drop non-implementation tickets (e.g. "Advise on approach...") so responses stay dev-ready.



Adding a server-side ticket filter to remove advice/clarification-style tickets and tightening the prompt with mandatory implementation-only wording.



Adding a second safeguard: drop tickets that don't start with an allowed implementation verb (catches "Advise..." if the forbidden regex misses).



Here is what was wrong and what we changed.

### Root cause
The model still sometimes emitted **PM-style** ticket text (“Advise on approach…”). Prompting alone was not enough, so we added **server-side enforcement** and tightened the instructions again.

### 1. Prompt rewrite (`brief-conversion.prompt.ts`)
- Opens with an **absolute rule**: every `tickets[].text` is **shippable dev work only**; lists patterns that must **never** appear (advising, feasibility, how to approach stores, reach out, workshops, stakeholder alignment, etc.).
- Explicit: if the brief sounds like a **question to a store**, **ignore that framing** and output **implementation** work (OAuth/linking, import API, UI to connect accounts, etc.).
- **Mandatory opening verbs** for every ticket (including **Enable** and **Support**), aligned with the filter below.
- **Minimum ~10 tickets** for a multi-flow brief like Purchase Pal.
- **Self-check** steps before returning JSON (replace/delete non-PR tasks, verify allowed verb prefix, ticket count).

### 2. Post-processing (`brief-conversion.ticket-filter.ts`)
- **`dropNonImplementationTickets`**: removes tickets whose text matches **forbidden** patterns (`advise`, `clarify`, `feasibility`, `how to approach`, `reach out`, `ask the store(s)`, `approach to request`, stakeholder language, `recommend` / `evaluate` / `determine` / `research` / `investigate` at line start in a decision sense, workshops, etc.).
- **`dropTicketsMissingImplementationPrefix`**: keeps only tickets that **start** with:  
  `Implement|Build|Create|Add|Expose|Integrate|Wire|Persist|Develop|Configure|Extend|Introduce|Establish|Design|Migrate|Refactor|Optimize|Set up|Enable|Support`
- **`sanitizeDevTickets`**: runs both filters in order.

So a ticket like **“Advise on approach to request store account linking…”** is removed by **both** the forbidden-word check and the **missing Implement/… prefix** check.

### 3. Parser (`brief-conversion.result.ts`)
- Uses **`sanitizeDevTickets`** on the model’s ticket array.
- If there are **≥ 6 instructions** but **no tickets** left after sanitizing, responds with **502** and *“No implementation-only developer tickets were produced. Please run conversion again.”* so the UI can retry instead of showing instructions with an empty or bogus ticket list.

### 4. Schema copy (`brief-conversion.schema.ts`)
- Ticket `text` description updated to include **Enable|Support** in the required opening-verb list.

### 5. Tests (`brief-conversion.ticket-filter.spec.ts`)
- Covers your **“Advise on approach…”** case and a ticket **without** an allowed opening verb.

Restart the Nest process so this code is live. If you still see 502 sometimes, run convert again—the model should eventually return a full set of **Implement/Build/…** tickets; if it keeps failing, we can add a single automatic retry in the service.

---

**User**

there is still only one ticket being generated from the example doc

the prompt needs refinement
use the Clear, structured, developer-ready task breakdowns to construct the content for the tickets - they should not be a 1 to 1 match

---

**Cursor**

Reviewing the prompt and tightening guidance so we derive multiple tickets by clustering instructions (not 1:1, not a single mega-ticket).



Refining the prompt with explicit clustering rules (not 1:1, not one mega-ticket) and adding validation so rich instruction lists require a proportional minimum number of tickets.



Updating the prompt, user message, schema descriptions, and adding minimum-ticket validation derived from instruction count.



Fixing validation: return 0 for small instruction counts and reordering checks so we don't require tickets when there are no instructions.



Here is what changed.

### Prompt (`brief-conversion.prompt.ts`)

- **`instructions`** are defined as the **fine-grained, developer-ready breakdown** (many short lines).
- New section **`"tickets" — synthesized from instructions (NOT 1:1, NOT one mega-ticket)`**:
  - **Not** one ticket per instruction.
  - **Not** one ticket that “does everything in the instructions.”
  - **Yes:** Jira-sized work items built by **clustering** related lines (about **2–5 instructions per ticket** when it fits), by **subsystem / layer / journey slice**, with **technical boundaries** (persistence vs API vs UI vs jobs).
  - Each ticket **summarizes** the cluster: enough detail to implement, **without** copying every instruction verbatim.
- **Cardinality:** For **12+** instruction lines, aim for about **one ticket per 2–3 instructions** and **never** only one or two tickets for the whole breakdown.
- **Self-check:** If **N** is large and **T** is 1–2, treat that as a **failure** and split.

### User message (`brief-conversion.service.ts`)

- Tells the model to build **many** tickets by **clustering** instructions — **not** a single rollup and **not** line-per-ticket.

### Schema (`brief-conversion.schema.ts`)

- Root + `tickets` descriptions updated so structured outputs also say: **group instructions**, **many tickets**, **not 1:1**, **not one mega-ticket**.

### Server guard (`brief-conversion.validation.ts` + `brief-conversion.result.ts`)

- For **≥ 10** instructions, require at least  
  `max(5, ceil(instructionCount / 2.4))`  
  tickets after sanitization (e.g. **12 → 5**, **15 → 7**, **18 → 8**).
- If the model returns too few, the API responds with **502** and a message to **retry** (so a single mega-ticket is rejected instead of returned).

Restart the backend so this is live. If you see **502** occasionally, run convert again; the new prompt plus the floor usually fixes it within a retry or two.

---

**User**

make Readme.md files for both frontend and backend

---

**Cursor**

Gathering project details to create accurate README files.



Here is what was added.

### `backend/README.md`
- Describes the Nest app, OpenAI usage, and no database.
- **Environment variables:** `OPENAI_API_KEY`, `OPENAI_MODEL`, optional `PORT` and `CORS_ORIGINS`.
- **Install / run** and a **scripts** table.
- **`POST /api/briefs/convert`** request/response shape, priorities, and common errors (`400`, `502`).
- Short **layout** section (`openai`, `brief-conversion`, `main.ts`) and **CORS** defaults for Vite.

### `frontend/README.md`
- Describes the React + Vite SPA and how it uses the API.
- **`API_URL`** and Vite `envPrefix` note.
- **Install / run** and **scripts** table.
- **UI behavior** (header, textarea, two-column results, ticket colors).
- Endpoint called and **project layout** pointers.

If you want matching `.env.example` files next to each README, say so and we can add them.

