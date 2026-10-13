# feasto
<p align="center">
  <img src="public/feasto.png" alt="Feasto logo" width="160" />
</p>

<h1 align="center">Feasto</h1>

<p align="center">
  <a href="https://feasto.pages.dev">feasto.com</a>
</p>

<p align="center">
  <em>Don't start with a recipe. Start with what you have.</em>
</p>

---

## What is Feasto?

Feasto is a small web app that answers one question: *what can I cook right now?*

You tell it what's in your kitchen (say, *eggs*, *rice* and *garlic*) and Feasto sorts recipes into three groups: things you can make now, things you're almost ready to make, and things that would need a bit more. It also suggests swaps for missing ingredients, tells you which single ingredient would unlock the most new recipes, and keeps a shopping list for the rest.

The whole app works in English and Turkish.

### How to use it

1. **Add what you have.** Search for an ingredient (press `Enter` to add the top match) or tap it on the shelf. You can also tick everything at once on the **My Pantry** page.
2. **Mark what to use first.** Ingredients that are about to go off can be flagged under **Use soon**. Recipes that use them rank higher.
3. **Filter.** Narrow by time (under 15 or under 30 minutes), meal, and diet (vegetarian or vegan).
4. **Read the results.** Recipes are split into **Make now**, **Almost there** and **Try something different**. Each card shows how ready you are, why it was suggested, and what's missing.
5. **Open a recipe.** Ingredients are marked as *Have*, *Swap needed* or *Optional*, with swap suggestions where they exist. Press **Cook this** for a step-by-step checklist, and **Finish cooking** when you're done.
6. **Plan the shopping.** Save recipes for later, or add what's missing to your **Shopping list**. Tap **Got it** and the ingredient moves into your kitchen.
7. **Switch language.** Press `TR` / `EN` in the header. Recipes, ingredients and swap notes are all translated.

Other pages: **Explore** lists every recipe A to Z with search, and **Saved** shows your saved recipes ranked by how ready you are.

---

## Getting started

**Requirements:** Node.js 20.19+ or 22.12+.

```bash
git clone https://github.com/melisalevli/feasto.git
cd feasto
npm install
npm run dev
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Check the data, type-check, and build into `dist/` |
| `npm run check:data` | Validate the JSON data files |
| `npm run lint` | Run oxlint |
| `npm run preview` | Preview the production build |

---

## How it works (technical)

### Stack

| Piece | Choice |
| --- | --- |
| UI | React 19 |
| Language | TypeScript |
| Build tool | Vite 8 |
| State | [Zustand](https://zustand.docs.pmnd.rs) 5, persisted to `localStorage` |
| Data | Static JSON (recipes, ingredients, substitutions) |
| Linting | [oxlint](https://oxc.rs) |
| Hosting | Cloudflare Pages |

There is no backend, no database, and no API key. The whole app is a static bundle. Your kitchen, saved recipes, shopping list and language choice stay in your browser's `localStorage`.

### Matching recipes to your kitchen

Every ingredient in a recipe has a weight: **3** essential, **2** important, **1** optional. `core/engine.ts` evaluates each recipe against what you have:

- An ingredient you have counts fully.
- A missing required ingredient with a usable swap (medium or high compatibility) that you own counts for 70% and is flagged *Swap needed*.
- A missing required ingredient with no swap is a **blocker**.
- Missing optional ingredients never block anything.

Recipes only appear if you own at least one required ingredient. They land in a group based on the blockers:

| Group | Condition |
| --- | --- |
| Make now | No blockers and no swaps needed |
| Almost there | No blockers but swaps needed, or exactly one blocker |
| Try something different | Two or more blockers |

### Ranking

Inside each group, recipes are sorted by a score:

| Signal | Points |
| --- | --- |
| Coverage of required ingredients (swaps count 70%) | 0 to 1 |
| Share of your kitchen that the recipe uses | up to +0.3 |
| Uses an ingredient marked *Use soon* | +0.3 |
| Each optional ingredient you own | +0.05 |
| Cooked in your last 5 recipes | -0.25 |

### One ingredient away

For every ingredient you don't have, the engine counts how many recipes would become *Make now* if you added it, and shows the top four.

### Surprise me

A weighted random pick from your *Make now* and *Almost there* recipes, so better matches come up more often. If there are none, it falls back to the other group, and then to any recipe that fits your filters.

### Diet filters

Vegetarian removes recipes with meat or fish. Vegan also removes eggs and dairy. Each ingredient is classified by its category, with an optional `animal` field to override it.

### Data

Everything lives in `src/data/`:

- `ingredients.json`
- `recipes.json`
- `substitutions.json`

Turkish names, steps and swap notes sit next to the English ones. Where a Turkish text is missing, the app shows the English one. `scripts/check-data.mjs` runs before every build.

---

## Design

Feasto's interface is flat and typographic: a 12-column grid, thin black borders, no rounded corners and no shadows. The palette is three colors, **ink** (`#111`), **cream** (`#fcf0c2`) and **red** (`#b02321`), on white.

**Typography.** The font stack is Helvetica Neue, Helvetica, Arial. Headlines are bold with tight letter-spacing. Section labels are small, uppercase and letter-spaced.

---

## Deployment: Cloudflare Pages

Feasto is hosted on **Cloudflare Pages**.

---

## Credits

Recipes from [TheMealDB](https://www.themealdb.com) and more.