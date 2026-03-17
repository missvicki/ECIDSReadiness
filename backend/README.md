# Backend - Data Generation Scripts

This directory contains Python scripts for generating synthetic ECIDS and K-12 data for the dashboard.

## Prerequisites

```bash
pip install pandas numpy faker openpyxl
```

## Scripts

### 1. Generate ECIDS Data (9 CSV files)

```bash
cd backend
python generate_ecids_data.py
```

**Output:** Creates 9 ECIDS flat files in `../dashboard-react/public/data/ecids/`
- Child.csv
- ChildDisability.csv, ChildOutcomes.csv
- ChildParticipation.csv, ChildInsurance.csv
- ChildMonitoring.csv, ChildImmunization.csv
- ChildScreening.csv, RelatedPerson.csv

### 2. Calculate Risk Scores

```bash
python risk_scoring.py
```

**Output:** Creates `risk_scores.csv` in `../dashboard-react/public/data/ecids/`

### 3. Generate K-12 Data (6 CSV files)

```bash
python generate_k12_data.py
```

**Output:** Creates 6 K-12 files in `../dashboard-react/public/data/k12/`
- StuCore.csv (demographics, kindergarten readiness)
- StuEnrlAttnd.csv (attendance records)
- StuAssign.csv (program assignments)
- StuDiscipline.csv (discipline incidents)
- MAP.csv (reading/math assessments)
- LEPELL.csv (language proficiency)

### 4. Run Validation Report

```bash
python comprehensive_validation_report.py
```

**Output:**
- `COMPREHENSIVE_VALIDATION_REPORT.md` (in project root)
- `validation_results.json` (in `../dashboard-react/public/`)

## Complete Generation Workflow

To regenerate all data from scratch:

```bash
cd backend

# Step 1: Generate ECIDS data
python generate_ecids_data.py

# Step 2: Calculate risk scores
python risk_scoring.py

# Step 3: Generate K-12 data (links to ECIDS)
python generate_k12_data.py

# Step 4: Validate data integrity
python comprehensive_validation_report.py
```

## Data Flow

```
backend/
├── generate_ecids_data.py     → dashboard-react/public/data/ecids/*.csv (9 files)
├── risk_scoring.py             → dashboard-react/public/data/ecids/risk_scores.csv
├── generate_k12_data.py        → dashboard-react/public/data/k12/*.csv (6 files)
└── comprehensive_validation_report.py
    → dashboard-react/public/validation_results.json
    → COMPREHENSIVE_VALIDATION_REPORT.md (root)
```

## Templates

Scripts reference Excel templates from `../archive/templates/`:
- `Flat File Templates.xlsx` (ECIDS field definitions)
- `OptionCodes.xlsx` (K-12 code sets)

## Notes

- All scripts use `seed=42` for reproducible random generation
- ECIDS data includes 5,000 synthetic children
- K-12 data creates ~12,708 student-year records across grades PK-03
- Child MOSIS ID (ECIDS) links to StateID (K-12) with zero-padding
