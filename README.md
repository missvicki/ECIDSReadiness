# ECIDS Readiness Risk Index Dashboard

Early Childhood Integrated Data System - Kindergarten Readiness Risk Analysis

## Overview

This proof-of-concept dashboard operationalizes kindergarten readiness as a **longitudinal stability + engagement + developmental risk signal**, rather than a single point-in-time assessment. It helps programs identify children who may benefit from early support prior to kindergarten entry.

**⚠️ IMPORTANT:** This PoC uses synthetic data for demonstration purposes only.

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+ (for data generation only)

### Running Locally

```bash
cd dashboard-react
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Deploy to Vercel

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Deploy (zero configuration needed!)

## Project Structure

```
├── dashboard-react/          # React/Next.js dashboard
│   ├── public/data/          # CSV data files
│   ├── src/
│   │   ├── app/              # Pages (Next.js App Router)
│   │   ├── components/       # Reusable components
│   │   ├── lib/              # Data loading & utilities
│   │   └── styles/           # Global styles
│   └── vercel.json           # Vercel deployment config
├── synthetic_data/           # Generated CSV files (source)
├── generate_ecids_data.py    # Data generation script
└── risk_scoring.py           # Risk calculation engine
```

## Key Features

### Pages
- **📍 Overview** - High-level risk distribution and key metrics
- **📊 Risk Distribution** - Risk patterns by county, poverty, participation
- **🎯 Domain Decomposition** - Four-domain risk breakdown (Stability, Engagement, Developmental, Context)
- **📅 Participation & Stability** - Enrollment gaps, episodes, attendance
- **🏥 Developmental Signals** - Screening completion, COS outcomes, immunizations
- **🌎 Geographic & Context** - County/regional variation, household stressors
- **🔮 Predictive Simulation** - Simulated 3rd-grade outcome correlations (illustrative)
- **👥 Cohort Explorer** - Individual child-level records with filtering and export
- **💡 Use Cases** - How stakeholders use the dashboard
- **📚 Data Methodology** - Synthetic data generation approach

### Risk Scoring Model
- **4 Domains** (equal weighting recommended):
  - Stability (30%): Enrollment gaps, provider changes, mobility
  - Engagement (25%): Attendance, screening completion, immunization
  - Developmental (25%): COS outcomes, disability status
  - Context (20%): Poverty, household stressors, homelessness

- **Risk Tiers**:
  - Low: 0-34
  - Moderate: 35-59
  - High: 60-100

## Data Generation

To regenerate synthetic data:

```bash
python generate_ecids_data.py
```

This creates 5,000 synthetic child records across 9 CSV files.

## Primary Users

- Program and agency leaders (planning and resource allocation)
- Early childhood coordinators and case managers (targeted outreach)
- Cross-agency partners (service alignment)

## Guardrails

✓ PoC uses synthetic data (no real child PII)
✓ The index supports decision-making; it does not replace professional judgment
✓ Predictive validation strengthens when linked to real K–12 outcomes

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Charts**: Recharts
- **Data**: Papa Parse (CSV parsing)
- **Deployment**: Vercel

## License

For demonstration purposes only.
