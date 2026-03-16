# K-12 Data Linkage & Integration Guide

## Primary Join Key Strategy

### StateID: The Universal Child Identifier

**`StateID`** is the **primary linkage key** across all ECIDS and K-12 files.

```
ECIDS Child.csv: Child MOSIS ID (integer 1-5000)
                    ↓
           Zero-padded to 10 digits
                    ↓
K-12 Files: StateID (string "0000000001" - "0000005000")
```

### Join Strategy

```sql
-- Link ECIDS to K-12
SELECT *
FROM Child c
INNER JOIN StuCore k12
  ON LPAD(c.`Child MOSIS ID`, 10, '0') = k12.StateID

-- Or in pandas/Python
df_merged = df_child.merge(
    df_stucore,
    left_on='Child MOSIS ID',
    right_on=lambda x: x['StateID'].astype(int),
    how='inner'
)
```

### Key Field Mapping

| ECIDS File | Field | K-12 Files | Field |
|------------|-------|------------|-------|
| Child.csv | `Child MOSIS ID` (1-5000) | All K-12 | `StateID` (0000000001-0000005000) |
| Child.csv | `FirstName`, `LastName` | All K-12 | `FirstName`, `LastName` |
| Child.csv | `BirthDate` | All K-12 | `DateOfBirth` |
| Child.csv | `RefSex.Description` | All K-12 | `Gender` (M/F) |
| Child.csv | `RefRace.Description` | All K-12 | `RaceEthnicity` (A/B/H/I/W/P/M) |

---

## StuCore.csv Column Usage Guide

### ✅ Columns to USE in UI/Analysis

**Core Demographics:**
- `StateID`, `LocalStudentID`
- `FirstName`, `LastName`, `MiddleName`, `DateOfBirth`
- `Gender`, `RaceEthnicity`
- `County`, `ZipCode`

**Grade & Enrollment:**
- `CurrentSchoolYear`
- `StudentGradeLevel` (PK, K, 01, 02, 03)
- `AttendingDistrictCode`, `AttendingSchoolCode`
- `EnrolledAllYear`, `MemberFTE`

**Risk Indicators:**
- `LunchStatus` (F=Free, R=Reduced, U=Unreduced)
- `Homeless` (Y/N)
- `FosterCare` (Y/N)
- `Migrant` (Y/N)
- `IEPDisability` (0=None, 1-18=Disability codes)
- `LEPELL` (NLP, RCV, MY1, MY2, etc.)
- `ELLLanguage` (Primary language if not English)

**Early Childhood Outcomes:**
- `KindergartenReadiness` (Y/N, K students only)
- `ReadingSuccessPlan` (NO RSP, REC RSP, UPDATE RSP, etc.)
- `RSPPrimaryIntervention` (Description of intervention)

**Program Indicators:**
- `TitleI` (Y/N)
- `TitleIII` (Y/N)
- `HighNeedStudent` (Y/N)
- `NotFAYSchool`, `NotFAYDistrict` (mobility indicators)

### ⚠️ Columns to IGNORE in UI (High School Oriented)

**These are blank/not applicable for PK-03:**
- `Gifted`, `Aplus`, `CareerEd`, `CTECluster`, `CTEProgramCode`, `CTECertificate`
- `OnTracktoGraduate`, `CreditsEarned`, `GPA`, `GPAScale`
- `FirstYearFreshman`, `FirstFreshmanYear`, `K8GradDistrictCode`
- `NonTradStudent`, `SingleParent`, `DisplacedHomemaker`
- `IndustryCred`, `Military`, `AssociateDegree`
- `EighthTechLit` (fitness fields)
- `AerobicCap`, `AbdominalStr`, `UpperBodyStr`, `Flexibility`
- `SealofBiliteracy`, `SealofBiliteracyLanguage1/2/3`
- `ECOEntryDate/IND`, `ECOExitDate/IND` (early college)
- `SPEDPlacement`, `SPEDExit` (use IEPDisability instead)
- All CTE fields (`CTEWorkBasedLearning`, `CTETSA`)
- `ICAP`, `ICAPReview`, `MPP`
- `StackCred1`, `StackCred2`

### 📝 Columns with Partial Data

**Only populated for specific grades:**
- `KindergartenReadiness` - Only K students
- `ReadingSuccessPlan`, `RSPPrimaryIntervention` - Only grades 01-03
- `PKEligStateAid` - Only PK students
- `Kindergarten domain scores` (KGPhysicalWell-being, etc.) - Only K students (currently blank)

---

## Assessment Files Field Descriptions

### MAP.csv (Reading & Math Outcomes)

**Assessment Participation:**
- `Assessment` = "MAP"
- `Subject` = "Reading" or "Math"
- `Period` = "Spring"
- `TstMethod` = "CBT" (Computer-Based Testing)

**NEW: Outcome Fields**
- **`ScaleScore`** (integer 140-235)
  - K Reading: 140-180
  - Grade 01 Reading: 160-200
  - Grade 02 Reading: 175-215
  - Grade 03 Reading: 185-230
  - Similar ranges for Math
  - **Correlated with:** ECIDS developmental_score, K readiness, RSP status, parent education, attendance

- **`PerformanceLevel`** (categorical)
  - "Below Basic" - Not meeting standards
  - "Basic" - Partially meeting standards
  - "Proficient" - Meeting standards
  - "Advanced" - Exceeding standards

- **`Grade3ReadingBand`** (Grade 3 Reading only, for prediction modeling)
  - "Well Below Grade Level" (Below Basic)
  - "Below Grade Level" (Basic)
  - "On Grade Level" (Proficient)
  - "Above Grade Level" (Advanced)
  - **Empty for all other grades/subjects**

**Grade 3 Reading Outcome Distribution:**
```
Well Below Grade Level: 39% (477 students)
Below Grade Level:      13% (163 students)
On Grade Level:         26% (318 students)
Above Grade Level:      22% (263 students)
```

### WIDA.csv (English Language Proficiency)

**Assessment Participation:**
- `Assessment` = "WIDA ACCESS"
- `Subject` = "English Language Proficiency"
- `Period` = "Winter"
- **Grade Restriction:** K-03 only (PK excluded for realism)

**NEW: Outcome Fields**
- **`CompositeScore`** (decimal 1.0-6.0)
  - Overall English proficiency level
  - **Correlated with:** Years in program (simulated by grade), parent education

- **`ProficiencyLevel`** (categorical)
  - "Level 1-2: Entering/Emerging" (1.0-2.4) - Beginning English
  - "Level 3: Developing" (2.5-3.9) - Intermediate low
  - "Level 4: Expanding" (4.0-4.9) - Intermediate high
  - "Level 5: Bridging" (5.0-5.4) - Advanced, approaching proficiency
  - "Level 6: Reaching" (5.5-6.0) - Proficient, ready to exit ELL

**WIDA Distribution:**
```
Level 1-2: Entering/Emerging: 29% (200 students)
Level 3: Developing:          51% (353 students)
Level 4: Expanding:           13% (93 students)
Level 5: Bridging:            3% (18 students)
Level 6: Reaching:            4% (26 students)
```

---

## Complete File Linkage Map

```
ECIDS → K-12 LONGITUDINAL LINKAGE

Child.csv (5,000 children)
    ├─ Child MOSIS ID → StateID
    │
    ├─→ StuCore.csv (12,709 student-years)
    │      └─→ KindergartenReadiness, ReadingSuccessPlan
    │
    ├─→ StuEnrlAttnd.csv (12,709 records)
    │      └─→ RegHrsAttended, RegHrsAbsent (attendance)
    │
    ├─→ StuAssign.csv (28,587 assignments)
    │      └─→ Reading Intervention assignments
    │
    ├─→ MAP.csv (14,672 assessments)
    │      └─→ ScaleScore, PerformanceLevel, Grade3ReadingBand
    │
    ├─→ WIDA.csv (690 assessments, ELL only)
    │      └─→ CompositeScore, ProficiencyLevel
    │
    └─→ StuDiscipline.csv (322 incidents)
           └─→ OffenseType, DisciplineRemoval
```

---

## Prediction Modeling Quick Reference

### Grade 3 Reading Outcome (Primary Target)

**Source:** `MAP.csv` WHERE `StudentGradeLevel = '03'` AND `Subject = 'Reading'`

**Target Field:** `Grade3ReadingBand`
- Well Below Grade Level
- Below Grade Level
- On Grade Level
- Above Grade Level

**Predictor Variables (from ECIDS):**
1. **ECIDS Risk Scores:** `composite_risk_score`, `developmental_score`, `engagement_score`
2. **Early Indicators:** `num_screenings_completed`, `avg_cos_rating`, `has_disability`
3. **Participation:** `num_participation_episodes`, `num_enrollment_gaps`, `avg_attendance_days`
4. **Context:** `HighestParentEducationLevel`, `PercentOfFederalPovertyLevel`, `HomelessnessStatus`

**Predictor Variables (from K-12):**
1. **K Readiness:** `KindergartenReadiness` (from StuCore, K year)
2. **Attendance:** `attend_rate` (from StuEnrlAttnd, avg across K-02)
3. **Interventions:** `ReadingSuccessPlan` (from StuCore, grades 01-02)
4. **Mobility:** `NotFAYSchool`, `NotFAYDistrict` (from StuCore)

### Example Join for Prediction Dataset

```python
# Pseudocode for prediction dataset
prediction_data = (
    df_child[ECIDS_predictors]
    .merge(df_stucore_k[['StateID', 'KindergartenReadiness']], on='StateID')
    .merge(df_attendance_avg[['StateID', 'avg_attend_rate']], on='StateID')
    .merge(df_stucore_rsp[['StateID', 'ever_had_rsp']], on='StateID')
    .merge(df_map_grade3[['StateID', 'Grade3ReadingBand']], on='StateID')
)
```

---

## Data Quality Notes

### ✓ Complete Longitudinal Coverage
- All 1,221 Grade 3 students have:
  - Complete ECIDS early childhood data (birth to age 5)
  - K-12 enrollment records (PK/K through Grade 3)
  - MAP Reading and Math outcomes
  - Attendance history
  - Intervention history (RSP if applicable)
  - WIDA data (if ELL)

### ✓ Realistic Correlations
- **ECIDS developmental_score → MAP ScaleScore:** Strong negative correlation
- **K Readiness = Y → Grade 3 outcomes:** Positive association
- **RSP status → Reading scores:** Students with RSP have lower baseline scores
- **Parent education → All outcomes:** Modest contextual influence (not deterministic)
- **Attendance rate → Performance:** Positive correlation

### ✓ Grade Skipping Included
- ~2% of students skip one grade (gifted/accelerated)
- Adds realistic variation to cohort progression
- Contributes to younger students reaching Grade 3

---

## Dashboard Integration Checklist

### Data Loading
- [ ] Load ECIDS Child.csv with risk scores
- [ ] Load all K-12 files (StuCore, StuEnrlAttnd, MAP, WIDA, etc.)
- [ ] Convert StateID to integer for joining (remove leading zeros)
- [ ] Parse date fields (DateOfBirth, EntryDate, ExitDate)

### Key Metrics to Display
- [ ] Kindergarten Readiness Rate (by risk tier, parent education)
- [ ] Grade 3 Reading Proficiency (by K readiness, RSP status, ECIDS risk)
- [ ] Attendance patterns (by engagement_score, parent education)
- [ ] RSP participation rates (by developmental_score, parent education)

### Longitudinal Pathways
- [ ] ECIDS risk tier → K readiness → Grade 3 reading
- [ ] Early screening completion → K readiness → Grade 3 outcomes
- [ ] Attendance trajectory (K-03) → Reading outcomes
- [ ] RSP participation → Reading growth

### Filters to Include
- [ ] ECIDS Risk Tier (Low, Moderate, High)
- [ ] Parent Education Level (6 categories)
- [ ] Primary Language (English, Spanish, Other)
- [ ] District/County
- [ ] Poverty Level (Free, Reduced, Unreduced lunch)

---

**Generated:** March 16, 2026
**Status:** ✓ Final - Ready for Production Use
