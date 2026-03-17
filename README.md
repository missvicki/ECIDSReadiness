# ECIDS Readiness Risk Index Dashboard

Early Childhood Integrated Data System (ECIDS) → K-12 Longitudinal Outcomes Analysis

## Overview

This proof-of-concept dashboard demonstrates how longitudinal early childhood data can be linked to K-12 outcomes. It combines **ECIDS indicators** (birth through pre-K) with **K-12 administrative records** (kindergarten readiness through Grade 3 reading) to show population-level patterns and inform system-level decisions.

**⚠️ IMPORTANT:** This dashboard uses synthetic data generated for demonstration purposes only. See the Data Methodology page for full details.

## Quick Start

### Running the Dashboard

```bash
cd dashboard-react
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Generating Data (Optional)

Data is already included. To regenerate:

```bash
cd backend
source ../venv/bin/activate
python generate_ecids_data.py
python risk_scoring.py
python generate_k12_data.py
python comprehensive_validation_report.py
```

See `backend/README.md` for detailed instructions.

### Deploy to Vercel

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Set root directory to `dashboard-react`
4. Deploy (zero configuration needed!)

## Project Structure

```
├── dashboard-react/              # React/Next.js dashboard
│   ├── public/data/
│   │   ├── ecids/               # ECIDS CSV files (9 files)
│   │   └── k12/                 # K-12 CSV files (6 files)
│   ├── src/
│   │   ├── app/                 # Pages
│   │   ├── components/          # UI components
│   │   └── lib/                 # Data loaders
│   └── vercel.json
│
├── backend/                      # Data generation scripts
│   ├── generate_ecids_data.py
│   ├── generate_k12_data.py
│   ├── risk_scoring.py
│   ├── comprehensive_validation_report.py
│   └── README.md
│
├── archive/                      # Documentation & templates
│   ├── documentation/
│   ├── templates/
│   └── validation/
│
└── venv/                        # Python virtual environment
```

## Dashboard Pages

- **📍 Overview** - Executive summary with key metrics
- **📊 Risk Distribution** - Geographic patterns and demographics
- **🗺️ Indicator Distribution** - Choropleth maps by indicator
- **🎯 Domain Decomposition** - Four-domain risk breakdown
- **📅 Participation & Stability** - Enrollment patterns and gaps
- **🏥 Developmental Signals** - Screening completion and outcomes
- **🌎 Geographic & Context** - County variation and poverty
- **🔗 Longitudinal Pathways** - ECIDS → K-12 outcomes flow
- **👥 Cohort Explorer** - Individual records with filtering
- **💡 Use Cases** - Stakeholder scenarios
- **📚 Data Methodology** - Risk model and validation

## Longitudinal Data Integration

Links **ECIDS early childhood data** with **K-12 administrative records**:

- **Child MOSIS ID** (ECIDS) → **StateID** (K-12) with zero-padding to 10 digits
- Tracks children from birth through Grade 3
- Shows how early risk indicators relate to:
  - Kindergarten readiness status
  - Reading Success Plan (RSP) participation
  - Grade 3 MAP Reading proficiency levels

## Risk Scoring Model

**Composite Risk Score** combines 4 weighted domains:

- **Stability (30%)**: Enrollment gaps, provider changes, attendance
- **Engagement (25%)**: Screening completion, immunization, attendance rate
- **Developmental (25%)**: IDEA eligibility, COS ratings
- **Context (20%)**: Poverty level, homelessness, household stressors

**Risk Tiers:**
- **Low**: 0-34 points
- **Moderate**: 35-59 points
- **High**: 60-100 points

## Dataset

- **5,000 synthetic children** with ECIDS records
- **12,708 K-12 student-year records** across grades PK-03
- **15 CSV files total** (9 ECIDS + 6 K-12)

**ECIDS Files** (`public/data/ecids/`):
- Child.csv, ChildDisability.csv, ChildOutcomes.csv
- ChildParticipation.csv, ChildInsurance.csv, ChildMonitoring.csv
- ChildImmunization.csv, ChildScreening.csv, RelatedPerson.csv
- risk_scores.csv

**K-12 Files** (`public/data/k12/`):
- StuCore.csv, StuEnrlAttnd.csv, StuAssign.csv
- StuDiscipline.csv, MAP.csv, WIDA.csv

## Use Cases

- **Program Planning** - Identify enrollment patterns and service gaps
- **Resource Allocation** - Target high-need populations and areas
- **Early Warning** - Flag children who may benefit from support
- **Cross-Agency Alignment** - Coordinate early childhood and K-12 interventions
- **Outcome Monitoring** - Track how early indicators relate to later success

## Technology Stack

**Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS, Recharts
**Backend:** Python 3.8+, Pandas, Faker
**Deployment:** Vercel

## Important Notes

✓ **Synthetic Data Only** - Artificially generated for demonstration
✓ **Population-Level Analysis** - Shows aggregate patterns, not individual predictions
✓ **Research-Based Correlations** - Programmed relationships based on literature
✓ **Proof-of-Concept** - Illustrates ECIDS → K-12 linkage feasibility

## License

For demonstration and educational purposes only.
