# School Fee Planner SA

A simple web app for South African parents to estimate the full cost of schooling from the current year through matric, understand annual fee inflation, and calculate how much to save monthly.

## Features

- **Instant estimate** — total cost to matric based on school type and fee tier
- **Three school paths** — Public, Independent/Semi-Private, Private
- **Flexible fee input** — use built-in fee tiers or enter your actual school's fee
- **Savings calculator** — enter existing savings and monthly contributions to see your gap
- **Year-by-year projection** — table and charts showing fee growth over time
- **PDF report** — download a printable summary
- **Mobile-first** — works great on phones (WhatsApp-shareable link)

## Quick Start

### Requirements
- Node.js 18+
- npm or yarn

### Install & run locally

```bash
cd school-fee-planner
npm install
npm run dev
```

Open http://localhost:5173

### Build for production

```bash
npm run build
```

Output is in `dist/` — deploy to any static host.

## Deployment Options

### Vercel (recommended, free)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Drag and drop the dist/ folder to netlify.com/drop
```

### GitHub Pages
```bash
npm run build
# Push dist/ to your gh-pages branch
```

## Project Structure

```
src/
  data/
    schoolData.js       # Fee tiers, grade mapping, defaults
  utils/
    calculations.js     # All financial formulas
    pdfExport.js        # PDF report generation
  components/
    CalculatorForm.jsx  # Left panel – all inputs
    ResultsPanel.jsx    # Right panel – key results
    Charts.jsx          # Recharts visualisations
    ProjectionTable.jsx # Year-by-year table
    FAQ.jsx             # Accordion FAQ
  App.jsx               # Main page layout and state
  index.css             # All styles (design system + components)
  main.jsx              # React entry point
```

## Updating Fee Tiers

Edit `src/data/schoolData.js` to update fee ranges annually. Each tier has:
- `low` / `high` — the range in Rands
- `midpoint` — the default planning estimate used in calculations

## Customisation

- **Branding**: Update colours in `src/index.css` CSS variables (`:root` block)
- **Defaults**: Change `DEFAULT_VALUES` in `src/data/schoolData.js`
- **Copy**: All user-facing text is inline in `App.jsx` and `FAQ.jsx`
- **Monetisation**: Add a payment gate in `ResultsPanel.jsx` before the PDF button

## Legal

All projections are estimates for planning purposes only. Not financial advice. Fee ranges are based on publicly available information and typical market ranges as of 2024–2025.

---

Built for South African parents. © 2025
