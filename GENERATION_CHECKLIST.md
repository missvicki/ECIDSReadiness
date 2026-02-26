# ECIDS Synthetic Data Generation - Requirements Checklist

## ✅ Core Specifications

### Data Generation
- [x] **5,000 children** cohort size
- [x] **Birth years**: 2018-2021 (4-year cohort)
- [x] **Age range**: 0-5 during early childhood participation
- [x] **DCN**: 10 digits (zero-padded)
- [x] **MOSIS ID**: 6 digits (zero-padded)
- [x] **District codes**: 6 digits (zero-padded)
- [x] **School codes**: 4 digits (zero-padded)

### Risk Tiers (Internal)
- [x] **Low**: 40% of children
- [x] **Medium**: 40% of children
- [x] **High**: 20% of children

## ✅ File 1: Child.csv

### Demographics
- [x] Realistic names using **Faker** (gender-appropriate)
- [x] Race/ethnicity following Missouri demographics
- [x] **Language CORRELATED** with:
  - [x] Race (Asian → Asian languages)
  - [x] Hispanic ethnicity → Spanish
  - [x] Migrant status → non-English languages
  - [x] Default: ~75-80% English overall

### Risk Indicators (Correlated with Risk Tier)
- [x] **Homelessness**: 5-8% overall (higher for high-risk)
- [x] **Foster care**: 3-6% overall
- [x] **Migrant status**: 1-3% overall
- [x] **Disability**: 10-14% overall (in separate file)
- [x] **Poverty bands**: Skewed toward low-moderate
- [x] **Family stressors**: 5-15% each
  - [x] Incarceration
  - [x] Substance abuse
  - [x] Depression/mental illness
- [x] **Birth risks**: Low birth weight, premature gestation

### Geography
- [x] **Missouri counties**
- [x] Realistic city names
- [x] Missouri ZIP codes (63000-65899)
- [x] Consistent ResponsibleOrganizationIdentifier

## ✅ File 2: RelatedPerson.csv

- [x] **1-2 guardians** per child
- [x] Relationship types from Excel sheet
- [x] **Employment status** correlated with risk tier
- [x] Realistic guardian demographics (Faker)
- [x] Same address as child

## ✅ File 3: ChildParticipation.csv

### Participation Distribution
- [x] **40%** = 1 record
- [x] **35%** = 2 records
- [x] **20%** = 3 records
- [x] **5%** = 4-5 records

### Program Features
- [x] **Concurrent programs**: 10-15% with overlapping dates
- [x] **Gaps**: 25-35% with gaps of 30-180 days
- [x] Longer/more frequent gaps for high-risk children

### Program Types with Age Windows
- [x] Early Intervention / First Steps: **0-3**
- [x] Home Visiting: **0-3**
- [x] Early Head Start: **0-3**
- [x] Head Start: **3-5**
- [x] State Pre-K: **3-5**
- [x] Childcare Subsidy: **0-5**

### Attendance Realism
- [x] **Pre-K / Head Start**: 80-180 days/year
- [x] **Home Visiting**: 5-30 days
- [x] **Early Intervention**: 10-60 days
- [x] **Childcare**: 50-220 days
- [x] **Risk correlation**: Lower attendance for high-risk

### Participation Exposure
- [x] 20% short-term (≤1 year)
- [x] 50% moderate (2-3 years)
- [x] 30% long continuous (4+ years)

## ✅ File 4: ChildDisability.csv

- [x] **10-14%** prevalence
- [x] Higher rates for high-risk children
- [x] IDEA disability types from specifications

## ✅ File 5: ChildMonitoring.csv

- [x] **0-6 visits** per child
- [x] More visits for high-risk children (3-6)
- [x] **Visits occur during participation ±30 days**
- [x] Visit types: Home Visit, Case Management, etc.

## ✅ File 6: ChildInsurance.csv

- [x] **1-2 records** per child
- [x] Insurance type **correlated with income/poverty level**
- [x] Medicaid/CHIP for low-income families
- [x] Private insurance for higher-income families

## ✅ File 7: ChildImmunization.csv

- [x] **5-10 records** per child (age-appropriate)
- [x] CDC pediatric schedule (DTaP, MMR, Polio, etc.)
- [x] **Compliance correlated with risk**
- [x] Date variance (±15-30 days from schedule)

## ✅ File 8: ChildScreening.csv

- [x] **1-4 records** per child
- [x] Well-child screenings at: 6mo, 12mo, 18mo, 24mo, 36mo, 48mo
- [x] **Missing screenings for higher-risk children**
- [x] Completion rates: Low-risk 92%, Med 75%, High 50%

## ✅ File 9: ChildOutcomes.csv

- [x] **1-3 records** per child
- [x] Outcomes occur **30-90 days near program milestones**
- [x] Entry, Exit, or Annual Review timepoints
- [x] **COS ratings (1-7) correlated with risk tier**
- [x] Lower ratings for high-risk children
- [x] Ratings: A (Social Emotional), B (Cognitive), C (Communication), Physical, Summary

## ✅ Data Quality Features

### Correlations
- [x] High-risk children show:
  - [x] More enrollment gaps
  - [x] Lower attendance
  - [x] Higher homelessness/foster care
  - [x] Lower screening completion
  - [x] Higher disability prevalence
  - [x] More monitoring visits
  - [x] Lower COS ratings
- [x] Low-risk children show inverse patterns

### Referential Integrity
- [x] All files reference valid Child DCN + MOSIS ID
- [x] All children exist in Child.csv
- [x] Dates follow chronological order
- [x] Events aligned to age windows

### Formatting
- [x] **ISO dates**: YYYY-MM-DD
- [x] **Headers exactly as specified** in FlatFile.md
- [x] No null primary keys
- [x] Consistent delimiters (CSV)

## ✅ QA Checks & Output

- [x] Row counts per file
- [x] Participation distribution percentages
- [x] Children with gaps
- [x] Children with concurrent programs
- [x] Risk indicator prevalence rates
- [x] Referential integrity validation
- [x] Summary statistics

## ✅ Tools & Libraries

- [x] **Faker** for realistic synthetic data
- [x] **Pandas** for data manipulation
- [x] **Excel specifications** for field definitions
- [x] **Reference data** from Excel sheets:
  - [x] Languages (485 options)
  - [x] Relationship types (73 options)
  - [x] Missouri counties (115 counties)

---

## 🎯 Key Improvements Made

1. **Language correlation** - Now properly correlated with:
   - Race (Asian → Asian languages, etc.)
   - Hispanic ethnicity → Spanish
   - Migrant status → non-English languages
   - Realistic distribution (~75-80% English overall)

2. **Realistic demographics** - Missouri-appropriate racial/ethnic distribution

3. **Comprehensive risk correlations** - All outcomes properly linked to internal risk tier

4. **Event timing** - All events (monitoring, outcomes, screenings) properly aligned to participation windows and age milestones

---

**Status**: ✅ **READY FOR GENERATION**

All requirements verified and implemented.
