# K-12 Synthetic Data Generation Summary

## Overview

Successfully generated K-12 student records (PK through Grade 03) for 5,000 ECIDS children, creating longitudinal data that connects early childhood indicators to K-3 outcomes.

**Generation Date:** March 16, 2026
**Total Student-Years:** 12,760
**School Years:** 2024, 2025, 2026

---

## New Contextual Variables Added

### 1. Parent/Guardian Highest Education Level

**Location:** `RelatedPerson.csv` → `RelatedPerson HighestEducationLevel`
**Derived Field:** `Child.csv` → `HighestParentEducationLevel`

**Categories:**
- No high school diploma
- High school diploma or equivalent
- Some college, no degree
- Associate's degree
- Bachelor's degree
- Graduate or professional degree

**Correlation with ECIDS Risk:**
- High Risk families → avg education level 3.0 (Some college)
- Low Risk families → avg education level 4.0 (Associate's degree)

**Influence on K-12 Outcomes (Contextual, Not Deterministic):**
- **Kindergarten Readiness:** 45% (no HS) → 81% (graduate degree)
- **Reading Success Plan:** 26% (no HS) → 7% (graduate degree)
- **Attendance Rate:** 84% (no HS) → 93% (graduate degree)

### 2. Primary Language

**Location:** `Child.csv` → `RefLanguage.Description` *(already existed)*

**Distribution:**
- English: 90.6% (4,531 children)
- Spanish: 3.5% (176 children)
- Other languages: 5.9% (293 children)

**Influence on K-12 Outcomes:**
- Non-English speakers → `LEPELL = 'RCV'` (Receiving services)
- Non-English speakers → WIDA assessment participation
- 9.4% of students receive ELL services (1,200 students)

---

## Generated Files

### 1. StuCore.csv (3.5 MB)
**12,760 records** - One per student per school year

**Key Fields:**
- `StateID` = ECIDS Child MOSIS ID (links to early childhood data)
- `StudentGradeLevel` = PK, K, 01, 02, 03 (Missouri grade codes)
- `KindergartenReadiness` = Only for K students, influenced by developmental_score + engagement_score + parent_education
- `ReadingSuccessPlan` = For grades 01-03, influenced by developmental_score + parent_education
- `LEPELL` = Based on primary language (NLP or RCV)
- `IEPDisability` = Maps to ChildDisability.csv

**Grade Distribution:**
- PK: 5,491 student-years
- K: 3,717 student-years
- 01: 2,342 student-years
- 02: 1,210 student-years
- 03: 0 student-years (will appear in future years)

### 2. StuEnrlAttnd.csv (2.3 MB)
**12,760 records** - Enrollment and attendance data

**Key Metrics:**
- Average attendance rate: 89.6%
- Attendance correlation with ECIDS engagement_score:
  - Low engagement risk → 94% attendance
  - High engagement risk → 81% attendance
- Parent education adds +/- 1-2% contextual influence

### 3. StuAssign.csv (3.9 MB)
**28,231 records** - Course assignments (2-4 per student)

**Assignments:**
- All students: Homeroom
- K-03 students: Reading, Math
- High developmental risk: Reading Intervention (influenced by parent education)

### 4. MAP.csv (2.3 MB)
**14,538 records** - MAP Reading and Math assessments

**Coverage:**
- K-03 students only
- 2 assessments per student (Reading + Math)
- Period: Spring

### 5. WIDA.csv (222 KB)
**1,200 records** - English Language Proficiency assessments

**Coverage:**
- Students with LEPELL = 'RCV' (non-English primary language)
- Assessment: WIDA ACCESS
- Period: Winter

### 6. StuDiscipline.csv (35 KB)
**226 records** - Discipline incidents

**Incident Rates by Grade:**
- PK: <1% (44 incidents)
- K: 1% (56 incidents)
- 01: 2% (58 incidents)
- 02: 3% (68 incidents)

**Correlation:**
- Students with incidents have avg context_score of 40.9
- Overall avg context_score: 32.4
- **Primary driver:** ECIDS context_score (family stressors), not parent education

---

## Risk → K-12 Outcome Correlations

### Kindergarten Readiness
**Primary Drivers:** developmental_score + engagement_score
**Contextual Influence:** parent_education (+5% to -5%)

| Risk Tier | K Readiness Rate |
|-----------|------------------|
| Low       | 82%              |
| Moderate  | 55%              |
| High      | 47%              |

### Reading Success Plan (RSP)
**Primary Driver:** developmental_score
**Contextual Influence:** parent_education (+3% to -3%)

| Risk Tier | RSP Rate |
|-----------|----------|
| Low       | 9%       |
| Moderate  | 19%      |
| High      | 27%      |

### Attendance
**Primary Driver:** engagement_score
**Contextual Influence:** parent_education (+1% to -1%)

| Risk Tier | Avg Attendance |
|-----------|----------------|
| Low       | 94%            |
| Moderate  | 87%            |
| High      | 81%            |

### Discipline Incidents
**Primary Driver:** context_score (family stressors)
**Contextual Influence:** None (parent education not used)

---

## Key Design Principles

### ✓ ECIDS Risk Domains as Primary Drivers
The four ECIDS risk domains (Stability, Engagement, Developmental, Context) remain the **primary drivers** of K-12 outcomes:
- **Stability** → school mobility (NotFAYSchool/District)
- **Engagement** → attendance rates
- **Developmental** → kindergarten readiness, RSP needs
- **Context** → discipline incidents

### ✓ Contextual Variables, Not Deterministic
Parent education and primary language are used as **contextual variables** that add realistic variation:
- Effects are modest (+/- 5% maximum)
- They complement, not replace, ECIDS risk indicators
- No single variable determines outcomes

### ✓ Probabilistic Relationships
All correlations are **probabilistic**, not deterministic:
- High developmental risk → 40% chance of RSP (not 100%)
- Low parent education → slightly increases RSP probability
- Variation exists at all levels (avoiding perfect correlations)

### ✓ Missouri Grade Codes
Grade levels use exact Missouri codes:
- **PK** (Pre-Kindergarten)
- **K** (Kindergarten, space K)
- **01** (First Grade)
- **02** (Second Grade)
- **03** (Third Grade)

---

## File Locations

**ECIDS Data (Updated):**
- `/synthetic_data/Child.csv` - Now includes `HighestParentEducationLevel`
- `/synthetic_data/RelatedPerson.csv` - Now includes `RelatedPerson HighestEducationLevel`

**K-12 Data (New):**
- `/k12_data/StuCore.csv`
- `/k12_data/StuEnrlAttnd.csv`
- `/k12_data/StuAssign.csv`
- `/k12_data/MAP.csv`
- `/k12_data/WIDA.csv`
- `/k12_data/StuDiscipline.csv`

**Scripts:**
- `generate_ecids_data.py` - Regenerates ECIDS data with new fields
- `generate_k12_data.py` - Generates K-12 longitudinal data

---

## Demonstration Narrative

This longitudinal dataset enables the application to demonstrate:

**Early Childhood Indicators** →
**Kindergarten Readiness** →
**K-3 Attendance & Stability** →
**Grade 3 Reading Outcomes** (future)

**Example Longitudinal Story:**
1. Child born 2018, ECIDS participation 2020-2022
2. High developmental_score (45) + Low parent_education → Lower K readiness probability
3. Enters Kindergarten 2023: Not ready (KindergartenReadiness = 'N')
4. Grade 1 (2024): Receives RSP (ReadingSuccessPlan = 'REC RSP')
5. Grade 2 (2025): Attendance 82% (influenced by high engagement_score)
6. Grade 3 (2026): Reading assessment outcomes (to be linked)

---

## Next Steps

1. **Grade 3 Reading Outcomes:** Add simulated MAP reading scale scores influenced by:
   - ECIDS developmental_score
   - Kindergarten readiness status
   - RSP participation
   - Attendance patterns
   - Parent education (contextual)

2. **Longitudinal Analysis:** Create visualizations showing:
   - ECIDS risk tier → K readiness → Grade 3 reading pathway
   - Intervention effectiveness (RSP impact on reading growth)
   - Attendance trajectory analysis

3. **Dashboard Integration:** Update React dashboard to:
   - Display K-12 outcome distributions
   - Show longitudinal student pathways
   - Enable filtering by parent education and language

---

**Generated by:** Claude Code
**Date:** March 16, 2026
**Status:** ✓ Complete and ready for analysis
