"""
ECIDS Synthetic Data Generator
Generates 9 flat files for Kindergarten Readiness Risk Index PoC

Uses Faker for realistic synthetic data and Excel specifications for field definitions.

Author: Claude Code
Date: 2026-02-26
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
from pathlib import Path
from faker import Faker

# Initialize Faker with US locale
fake = Faker('en_US')
Faker.seed(42)
np.random.seed(42)
random.seed(42)

# Configuration
NUM_CHILDREN = 5000
OUTPUT_DIR = Path("synthetic_data")
OUTPUT_DIR.mkdir(exist_ok=True)

print("=" * 70)
print("ECIDS SYNTHETIC DATA GENERATION")
print("=" * 70)
print(f"Generating data for {NUM_CHILDREN} children using Faker library...")
print()

# Load reference data from Excel
print("Loading reference data from Excel...")
EXCEL_FILE = Path("/Users/vickinomwesigwa/Documents/ECIDS-Readiness/Flat File Templates.xlsx")
df_languages = pd.read_excel(EXCEL_FILE, sheet_name='Language')
df_relationships = pd.read_excel(EXCEL_FILE, sheet_name='PersonRelationshipType')

# Extract reference lists
LANGUAGES = df_languages.iloc[:, 0].dropna().tolist()
RELATIONSHIP_TYPES = df_relationships.iloc[:, 0].dropna().tolist()

# Filter to common relationship types for parent/guardian
GUARDIAN_RELATIONSHIPS = [
    'Mother', 'Father', 'Grandmother', 'Grandfather',
    'Foster Parent', 'Foster father', 'Foster mother',
    'Adoptive parent', 'Stepmother', 'Stepfather',
    'Aunt', 'Uncle', 'Court appointed guardian'
]

print(f"  ✓ Loaded {len(LANGUAGES)} languages")
print(f"  ✓ Loaded {len(RELATIONSHIP_TYPES)} relationship types")
print()

# Missouri Counties
MO_COUNTIES = [
    "ADAIR", "ANDREW", "ATCHISON", "AUDRAIN", "BARRY", "BARTON", "BATES", "BENTON",
    "BOLLINGER", "BOONE", "BUCHANAN", "BUTLER", "CALDWELL", "CALLAWAY", "CAMDEN",
    "CAPE GIRARDEAU", "CARROLL", "CARTER", "CASS", "CEDAR", "CHARITON", "CHRISTIAN",
    "CLARK", "CLAY", "CLINTON", "COLE", "COOPER", "CRAWFORD", "DADE", "DALLAS",
    "DAVIESS", "DEKALB", "DENT", "DOUGLAS", "DUNKLIN", "FRANKLIN", "GASCONADE",
    "GENTRY", "GREENE", "GRUNDY", "HARRISON", "HENRY", "HICKORY", "HOLT", "HOWARD",
    "HOWELL", "IRON", "JACKSON", "JASPER", "JEFFERSON", "JOHNSON", "KNOX", "LACLEDE",
    "LAFAYETTE", "LAWRENCE", "LEWIS", "LINCOLN", "LINN", "LIVINGSTON", "MCDONALD",
    "MACON", "MADISON", "MARIES", "MARION", "MERCER", "MILLER", "MISSISSIPPI",
    "MONITEAU", "MONROE", "MONTGOMERY", "MORGAN", "NEW MADRID", "NEWTON", "NODAWAY",
    "OREGON", "OSAGE", "OZARK", "PEMISCOT", "PERRY", "PETTIS", "PHELPS", "PIKE",
    "PLATTE", "POLK", "PULASKI", "PUTNAM", "RALLS", "RANDOLPH", "RAY", "REYNOLDS",
    "RIPLEY", "SALINE", "SCHUYLER", "SCOTLAND", "SCOTT", "SHANNON", "SHELBY",
    "ST. CHARLES", "ST. CLAIR", "ST. FRANCOIS", "ST. LOUIS", "ST. LOUIS CITY",
    "STE. GENEVIEVE", "STODDARD", "STONE", "SULLIVAN", "TANEY", "TEXAS", "VERNON",
    "WARREN", "WASHINGTON", "WAYNE", "WEBSTER", "WORTH", "WRIGHT"
]

# Reference data from Excel specifications
SEX_OPTIONS = ["Male", "Female", "Not selected"]
RACE_OPTIONS = [
    "American Indian or Alaska Native",
    "Asian",
    "Black or African American",
    "Native Hawaiian or Other Pacific Islander",
    "White",
    "Demographic Race Two or More Races",
    "Race and Ethnicity Unknown"
]
MARITAL_STATUS = ["Divorced", "Separated", "Married", "Single"]
EMPLOYMENT_STATUS = ["Employed", "Unemployed", "Part-time", "Not in Labor Force"]

# Program types with age windows
PROGRAM_TYPES = {
    "Early Intervention": (0, 3),
    "First Steps": (0, 3),
    "Home Visiting": (0, 3),
    "Early Head Start": (0, 3),
    "Head Start": (3, 5),
    "State Pre-K": (3, 5),
    "Childcare Subsidy": (0, 5),
    "Child Care": (0, 5),
}

# Health and education reference data
DISABILITY_TYPES = [
    "Developmental Delay",
    "Speech or Language Impairment",
    "Autism",
    "Hearing Impairment",
    "Visual Impairment",
    "Other Health Impairment",
    "Orthopedic Impairment",
    "Multiple Disabilities"
]

VISIT_TYPES = [
    "Home Visit",
    "Case Management",
    "Developmental Check",
    "Family Support Visit"
]

INSURANCE_TYPES = ["Medicaid", "CHIP", "Private", "Uninsured"]

IMMUNIZATION_TYPES = [
    "DTaP", "MMR", "Polio", "HepB", "Varicella",
    "HepA", "Hib", "PCV", "Rotavirus"
]

SCREENING_TYPES = [
    "6-month", "12-month", "18-month",
    "24-month", "36-month", "48-month"
]

COS_RATINGS = ["1", "2", "3", "4", "5", "6", "7"]
OUTCOME_TIMEPOINTS = ["Entry", "Exit", "Annual Review"]
FUNDING_SOURCES = ["Federal", "State", "Local", "Private"]
GRADE_LEVELS = ["Pre-K", "Preschool", "Early Intervention", ""]


def generate_dcn(index):
    """Generate 10-digit Child DCN"""
    return f"{index:010d}"


def generate_mosis_id(index):
    """Generate 6-digit MOSIS ID"""
    return f"{index:06d}"


def generate_district_code():
    """Generate 6-digit district code"""
    return f"{random.randint(1, 9999):06d}"


def generate_school_code():
    """Generate 4-digit school code"""
    return f"{random.randint(1, 999):04d}"


def generate_district_id(county):
    """
    Generate 6-digit school district ID based on county.
    Format: 3-digit county code + 3-digit district number = 6 digits total
    Example: County code 048 (Jackson) + district 230 = "048230"

    This represents the school district where the student LIVES (residential).
    """
    county_code = MO_COUNTIES.index(county) + 1 if county in MO_COUNTIES else random.randint(1, 115)
    district_num = random.randint(1, 999)
    return f"{county_code:03d}{district_num:03d}"


def random_date(start_date, end_date):
    """Generate random date between start and end"""
    delta = end_date - start_date
    random_days = random.randint(0, max(1, delta.days))
    return start_date + timedelta(days=random_days)


def get_age_at_date(birthdate, ref_date):
    """Calculate age in years at reference date"""
    return (ref_date - birthdate).days / 365.25


def assign_risk_tier():
    """Assign internal risk tier: Low (40%), Medium (40%), High (20%)"""
    rand = random.random()
    if rand < 0.40:
        return "Low"
    elif rand < 0.80:
        return "Medium"
    else:
        return "High"


def get_missouri_zip():
    """Generate realistic Missouri ZIP code"""
    # Missouri ZIP ranges: 63000-65899
    return f"{random.randint(63000, 65899)}"


def assign_language(race, hispanic, migrant):
    """
    Assign language based on demographics for realism.
    Correlates with race, ethnicity, and migrant status.
    """
    # Default: Most people speak English (~75-80% overall)

    # Hispanic/Latino → higher probability of Spanish
    if hispanic:
        if migrant:
            return random.choices(["Spanish", "English"], weights=[0.80, 0.20])[0]
        else:
            return random.choices(["Spanish", "English"], weights=[0.40, 0.60])[0]

    # Asian → Asian languages
    if race == "Asian":
        if random.random() < 0.50:  # 50% speak Asian language at home
            return random.choice([
                "Chinese", "Vietnamese", "Korean", "Tagalog",
                "Japanese", "Hindi", "Urdu", "Thai", "Cambodian"
            ])
        else:
            return "English"

    # Migrant status → more likely non-English
    if migrant:
        return random.choices(
            ["Spanish", "English", "Vietnamese", "Chinese", "Arabic"],
            weights=[0.50, 0.20, 0.10, 0.10, 0.10]
        )[0]

    # American Indian/Alaska Native → may speak indigenous language
    if race == "American Indian or Alaska Native":
        if random.random() < 0.15:  # 15% speak indigenous language
            return random.choice(["Cherokee", "Navajo", "Osage", "English"])
        else:
            return "English"

    # Pacific Islander
    if race == "Native Hawaiian or Other Pacific Islander":
        if random.random() < 0.20:
            return random.choice(["Samoan", "Hawaiian", "Tongan", "English"])
        else:
            return "English"

    # Default to English for most others (White, Black, etc.)
    # With small chance of other languages due to immigration/diversity
    if random.random() < 0.95:
        return "English"
    else:
        return random.choice(["Spanish", "French", "German", "Russian", "Arabic", "English"])


# ============================================================================
# 1. GENERATE CHILD.CSV
# ============================================================================
print("1. Generating Child.csv...")

children = []
risk_tiers = {}  # Store for correlation logic

for i in range(1, NUM_CHILDREN + 1):
    child_dcn = generate_dcn(i)
    child_mosis_id = generate_mosis_id(i)

    # Assign internal risk tier for correlations
    risk_tier = assign_risk_tier()
    risk_tiers[child_dcn] = risk_tier

    # Birth year: 2018-2021 (cohort for K-readiness)
    birth_year = random.choice([2018, 2019, 2020, 2021])
    birth_date = fake.date_of_birth(minimum_age=2, maximum_age=7)
    # Override to ensure 2018-2021
    birth_date = datetime(birth_year, random.randint(1, 12), random.randint(1, 28))

    # Demographics using Faker
    sex = random.choice(SEX_OPTIONS)

    # Gender-appropriate names
    if sex == "Male":
        first_name = fake.first_name_male()
        middle_name = fake.first_name_male() if random.random() > 0.2 else ""
    elif sex == "Female":
        first_name = fake.first_name_female()
        middle_name = fake.first_name_female() if random.random() > 0.2 else ""
    else:
        first_name = fake.first_name()
        middle_name = fake.first_name() if random.random() > 0.2 else ""

    last_name = fake.last_name()

    # Generation code (Jr., Sr., III, etc.) - rare
    generation_code = random.choice(["", "", "", "", "Jr.", "Sr.", "III"]) if random.random() > 0.9 else ""

    # Race and ethnicity - weighted distribution
    # Missouri demographics: ~80% White, ~12% Black, ~4% Hispanic, ~2% Asian, ~2% Other
    race = random.choices(
        RACE_OPTIONS,
        weights=[0.02, 0.04, 0.12, 0.01, 0.79, 0.015, 0.005]  # Matches order in RACE_OPTIONS
    )[0]

    # Hispanic ethnicity (separate from race)
    # Higher rates for "Two or More Races"
    if race == "Demographic Race Two or More Races":
        hispanic = random.random() < 0.20
    else:
        hispanic = random.random() < 0.04  # ~4% Hispanic in Missouri

    # Geography - use Faker for city, but constrain to Missouri
    county = random.choice(MO_COUNTIES)
    city = fake.city()
    zip_code = get_missouri_zip()

    # Responsible Organization = 6-digit school district ID where student lives
    district_id = generate_district_id(county)

    # Risk factors - CORRELATED WITH RISK TIER
    if risk_tier == "High":
        # High-risk children have elevated risk factors
        homelessness = random.random() < 0.15
        foster_care = random.random() < 0.12
        migrant = random.random() < 0.05
        child_abuse = random.random() < 0.20
        poverty_level = random.randint(0, 100)  # 0-100% FPL
        family_income = random.randint(0, 25000)
        incarcerated = random.random() < 0.18
        substance_abuse = random.random() < 0.20
        depression = random.random() < 0.25
        loss_parent = random.random() < 0.10
        low_birth_weight = random.random() < 0.15
        premature = random.random() < 0.15
    elif risk_tier == "Medium":
        homelessness = random.random() < 0.04
        foster_care = random.random() < 0.03
        migrant = random.random() < 0.02
        child_abuse = random.random() < 0.08
        poverty_level = random.randint(50, 200)
        family_income = random.randint(20000, 50000)
        incarcerated = random.random() < 0.08
        substance_abuse = random.random() < 0.10
        depression = random.random() < 0.12
        loss_parent = random.random() < 0.03
        low_birth_weight = random.random() < 0.10
        premature = random.random() < 0.10
    else:  # Low risk
        homelessness = random.random() < 0.01
        foster_care = random.random() < 0.01
        migrant = random.random() < 0.01
        child_abuse = random.random() < 0.02
        poverty_level = random.randint(150, 400)
        family_income = random.randint(45000, 100000)
        incarcerated = random.random() < 0.03
        substance_abuse = random.random() < 0.04
        depression = random.random() < 0.05
        loss_parent = random.random() < 0.01
        low_birth_weight = random.random() < 0.07
        premature = random.random() < 0.07

    # Language - CORRELATED with race, ethnicity, and migrant status
    language = assign_language(race, hispanic, migrant)

    # Foster care dates (if applicable)
    foster_start = ""
    foster_end = ""
    if foster_care:
        foster_start_date = random_date(birth_date, datetime(2025, 12, 31))
        foster_start = foster_start_date.strftime("%Y-%m-%d")
        # 70% still in foster care
        if random.random() > 0.3:
            foster_end_date = foster_start_date + timedelta(days=random.randint(30, 730))
            if foster_end_date > datetime(2026, 2, 26):
                foster_end_date = datetime(2026, 2, 26)
            foster_end = foster_end_date.strftime("%Y-%m-%d")

    # Family structure
    marital_status = random.choice(MARITAL_STATUS)
    num_people = random.randint(2, 7)

    # Birth characteristics
    if low_birth_weight:
        weight_at_birth = random.randint(1800, 2499)  # grams
    else:
        weight_at_birth = random.randint(2500, 4500)

    if premature:
        weeks_gestation = random.randint(28, 36)
    else:
        weeks_gestation = random.randint(37, 42)

    # Build child record
    child = {
        "Child DCN": child_dcn,
        "Child MOSIS ID": child_mosis_id,
        "LastName": last_name,
        "FirstName": first_name,
        "MiddleName": middle_name,
        "GenerationCode": generation_code,
        "BirthDate": birth_date.strftime("%Y-%m-%d"),
        "PostalCode": zip_code,
        "AddressCountyName": county,
        "City": city,
        "ResponsibleOrganizationIdentifier": district_id,
        "RefSex.Description": sex,
        "RefRace.Description": race,
        "HispanicLatinoEthnicity": "Yes" if hispanic else "No",
        "FosterCareStartDate": foster_start,
        "FosterCareEndDate": foster_end,
        "ChildAbuseNeglect": "Yes" if child_abuse else "No",
        "RefLanguage.Description": language,
        "HomelessnessStatus": "Yes" if homelessness else "No",
        "MigrantStatus": "Yes" if migrant else "No",
        "RefParentMaritalStatus.Description": marital_status,
        "FamilyMemberIncarcerated": "Yes" if incarcerated else "No",
        "FamilyMemberSubstanceUseAbuse": "Yes" if substance_abuse else "No",
        "LossOfParent": "Yes" if loss_parent else "No",
        "PercentOfFederalPovertyLevel": poverty_level,
        "FamilyIncome": family_income,
        "NumberOfPeopleInFamily": num_people,
        "HouseholdMemberDepressedOrMentallyIll": "Yes" if depression else "No",
        "WeightAtBirth": weight_at_birth,
        "WeeksOfGestation": weeks_gestation
    }

    children.append(child)

df_child = pd.DataFrame(children)
df_child.to_csv(OUTPUT_DIR / "Child.csv", index=False)
print(f"   ✓ Generated {len(df_child):,} children")

# ============================================================================
# 2. GENERATE RELATEDPERSON.CSV
# ============================================================================
print("2. Generating RelatedPerson.csv...")

related_persons = []

for _, child in df_child.iterrows():
    child_dcn = child["Child DCN"]
    child_mosis_id = child["Child MOSIS ID"]
    risk_tier = risk_tiers[child_dcn]

    # Number of guardians: 1-2 (weighted toward 2-parent households for low-risk)
    if risk_tier == "High":
        num_guardians = random.choices([1, 2], weights=[0.60, 0.40])[0]
    else:
        num_guardians = random.choices([1, 2], weights=[0.30, 0.70])[0]

    # Select relationship types
    relationships = random.sample(GUARDIAN_RELATIONSHIPS, min(num_guardians, len(GUARDIAN_RELATIONSHIPS)))

    for relationship in relationships:
        # Generate guardian demographics with Faker
        rel_sex = "Female" if relationship in ["Mother", "Grandmother", "Foster mother", "Stepmother", "Aunt"] else "Male"

        if rel_sex == "Female":
            rel_first = fake.first_name_female()
            rel_middle = fake.first_name_female() if random.random() > 0.3 else ""
        else:
            rel_first = fake.first_name_male()
            rel_middle = fake.first_name_male() if random.random() > 0.3 else ""

        # Last name same as child if parent/step-parent
        if relationship in ["Mother", "Father", "Stepmother", "Stepfather"]:
            rel_last = child["LastName"]
        else:
            rel_last = fake.last_name()

        rel_generation = random.choice(["", "", "", "Jr.", "Sr."]) if random.random() > 0.95 else ""

        # Guardian birth date (age 18-55)
        rel_birthdate = fake.date_of_birth(minimum_age=18, maximum_age=55)

        rel_hispanic = random.choice([True, False])

        # Employment status - CORRELATED WITH RISK
        if risk_tier == "High":
            emp_status = random.choices(EMPLOYMENT_STATUS, weights=[0.45, 0.25, 0.20, 0.10])[0]
        elif risk_tier == "Medium":
            emp_status = random.choices(EMPLOYMENT_STATUS, weights=[0.60, 0.15, 0.15, 0.10])[0]
        else:
            emp_status = random.choices(EMPLOYMENT_STATUS, weights=[0.75, 0.05, 0.10, 0.10])[0]

        emp_date = fake.date_between(start_date='-5y', end_date='today')

        related = {
            "Child DCN": child_dcn,
            "Child MOSIS ID": child_mosis_id,
            "RefPersonRelationshipType.Description": relationship,
            "RelatedPerson LastName": rel_last,
            "RelatedPerson FirstName": rel_first,
            "RelatedPerson MiddleName": rel_middle,
            "RelatedPerson GenerationCode": rel_generation,
            "RelatedPerson BirthDate": rel_birthdate.strftime("%Y-%m-%d"),
            "RelatedPerson PostalCode": child["PostalCode"],
            "RelatedPerson AddressCountyName": child["AddressCountyName"],
            "RelatedPerson City": child["City"],
            "RelatedPerson RefSex.Description": rel_sex,
            "RelatedPerson HispanicLatinoEthnicity": "Yes" if rel_hispanic else "No",
            "RelatedPerson RefEmploymentStatus.Description": emp_status,
            "RelatedPerson EmploymentStatusDate": emp_date.strftime("%Y-%m-%d")
        }

        related_persons.append(related)

df_related = pd.DataFrame(related_persons)
df_related.to_csv(OUTPUT_DIR / "RelatedPerson.csv", index=False)
print(f"   ✓ Generated {len(df_related):,} related persons")

# ============================================================================
# 3. GENERATE CHILDPARTICIPATION.CSV (with specific distribution rules)
# ============================================================================
print("3. Generating ChildParticipation.csv...")

participations = []

# Participation distribution: 40%=1, 35%=2, 20%=3, 5%=4-5
participation_counts = []
for _ in range(int(NUM_CHILDREN * 0.40)):
    participation_counts.append(1)
for _ in range(int(NUM_CHILDREN * 0.35)):
    participation_counts.append(2)
for _ in range(int(NUM_CHILDREN * 0.20)):
    participation_counts.append(3)
for _ in range(NUM_CHILDREN - len(participation_counts)):
    participation_counts.append(random.randint(4, 5))

random.shuffle(participation_counts)

for idx, (_, child) in enumerate(df_child.iterrows()):
    child_dcn = child["Child DCN"]
    child_mosis_id = child["Child MOSIS ID"]
    birthdate = datetime.strptime(child["BirthDate"], "%Y-%m-%d")
    risk_tier = risk_tiers[child_dcn]

    num_participations = participation_counts[idx]

    # Determine if has concurrent programs (10-15%)
    has_concurrent = random.random() < 0.125

    # Determine if has gaps (25-35%)
    has_gaps = random.random() < 0.30

    # Start participation between age 1mo - 2yrs
    current_date = birthdate + timedelta(days=random.randint(30, 730))

    participation_records = []

    for p in range(num_participations):
        # Select age-appropriate program
        child_age = get_age_at_date(birthdate, current_date)

        valid_programs = [prog for prog, (min_age, max_age) in PROGRAM_TYPES.items()
                         if min_age <= child_age <= max_age]

        if not valid_programs:
            current_date = birthdate + timedelta(days=365)
            valid_programs = [prog for prog, (min_age, max_age) in PROGRAM_TYPES.items()
                             if min_age <= 1 <= max_age]

        program = random.choice(valid_programs)

        # Duration based on risk tier
        if risk_tier == "High":
            duration_days = random.randint(60, 365)  # Shorter, unstable
        elif risk_tier == "Medium":
            duration_days = random.randint(180, 730)
        else:
            duration_days = random.randint(365, 1095)  # Longer, stable

        enrollment_date = current_date
        service_plan_date = enrollment_date + timedelta(days=random.randint(1, 30))
        service_end_date = service_plan_date + timedelta(days=duration_days)

        # Cap at age 5.5
        age_at_end = get_age_at_date(birthdate, service_end_date)
        if age_at_end > 5.5:
            service_end_date = birthdate + timedelta(days=int(5.5 * 365))

        # Attendance based on program type and risk
        if program in ["Head Start", "State Pre-K"]:
            base_attendance = random.randint(80, 180)
        elif program in ["Home Visiting"]:
            base_attendance = random.randint(5, 30)
        elif program in ["Early Intervention", "First Steps"]:
            base_attendance = random.randint(10, 60)
        else:  # Childcare
            base_attendance = random.randint(50, 220)

        # Adjust for risk
        if risk_tier == "High":
            attendance = int(base_attendance * random.uniform(0.5, 0.8))
        elif risk_tier == "Medium":
            attendance = int(base_attendance * random.uniform(0.7, 0.95))
        else:
            attendance = int(base_attendance * random.uniform(0.85, 1.0))

        # Grade level
        if program in ["State Pre-K", "Head Start"]:
            grade_level = "Pre-K"
        elif program in ["Early Intervention", "First Steps"]:
            grade_level = "Early Intervention"
        else:
            grade_level = ""

        # Funding source
        funding = random.choice(FUNDING_SOURCES)

        # Visiting indicator
        visiting = "Yes" if program == "Home Visiting" else "No"

        participation = {
            "Child DCN": child_dcn,
            "Child MOSIS ID": child_mosis_id,
            "RefProgramType.Description": program,
            "EnrollmentDate": enrollment_date.strftime("%Y-%m-%d"),
            "ServicePlanDate": service_plan_date.strftime("%Y-%m-%d"),
            "ServicePlanEndDate": service_end_date.strftime("%Y-%m-%d"),
            "VisitingIndicator": visiting,
            "NumberOfDaysInAttendance": attendance,
            "RefStudentGradeLevel.Description": grade_level,
            "RefFundingSource.Descriptions": funding
        }

        participation_records.append(participation)

        # Move to next enrollment with potential gaps
        if has_gaps and p < num_participations - 1:
            if risk_tier == "High":
                gap_days = random.randint(60, 180)  # Longer gaps
            else:
                gap_days = random.randint(30, 120)
            current_date = service_end_date + timedelta(days=gap_days)
        else:
            current_date = service_end_date + timedelta(days=random.randint(1, 30))

    # Handle concurrent programs (overlapping dates for 10-15%)
    if has_concurrent and len(participation_records) >= 2:
        overlap_start = datetime.strptime(participation_records[0]["ServicePlanDate"], "%Y-%m-%d")
        participation_records[1]["EnrollmentDate"] = (overlap_start + timedelta(days=30)).strftime("%Y-%m-%d")
        participation_records[1]["ServicePlanDate"] = (overlap_start + timedelta(days=45)).strftime("%Y-%m-%d")

    participations.extend(participation_records)

df_participation = pd.DataFrame(participations)
df_participation.to_csv(OUTPUT_DIR / "ChildParticipation.csv", index=False)
print(f"   ✓ Generated {len(df_participation):,} participation records")

# ============================================================================
# 4. GENERATE CHILDDISABILITY.CSV
# ============================================================================
print("4. Generating ChildDisability.csv...")

disabilities = []

for _, child in df_child.iterrows():
    child_dcn = child["Child DCN"]
    child_mosis_id = child["Child MOSIS ID"]
    risk_tier = risk_tiers[child_dcn]

    # Disability prevalence (10-14%, higher for high-risk)
    if risk_tier == "High":
        has_disability = random.random() < 0.18
    elif risk_tier == "Medium":
        has_disability = random.random() < 0.12
    else:
        has_disability = random.random() < 0.08

    if has_disability:
        disability_type = random.choice(DISABILITY_TYPES)

        disability = {
            "Child DCN": child_dcn,
            "Child MOSIS ID": child_mosis_id,
            "DisabilityStatus": "Yes",
            "RefIDEADisabilityType": disability_type
        }

        disabilities.append(disability)

df_disability = pd.DataFrame(disabilities)
df_disability.to_csv(OUTPUT_DIR / "ChildDisability.csv", index=False)
print(f"   ✓ Generated {len(df_disability):,} disability records")

# ============================================================================
# 5. GENERATE CHILDMONITORING.CSV
# ============================================================================
print("5. Generating ChildMonitoring.csv...")

monitoring_visits = []

for _, child in df_child.iterrows():
    child_dcn = child["Child DCN"]
    child_mosis_id = child["Child MOSIS ID"]
    risk_tier = risk_tiers[child_dcn]

    # Get participation windows
    child_participations = df_participation[df_participation["Child DCN"] == child_dcn]

    if len(child_participations) == 0:
        continue

    # Number of visits based on risk (0-6)
    if risk_tier == "High":
        num_visits = random.randint(3, 6)
    elif risk_tier == "Medium":
        num_visits = random.randint(1, 4)
    else:
        num_visits = random.randint(0, 2)

    for _ in range(num_visits):
        # Select random participation episode
        part_record = child_participations.sample(1).iloc[0]

        service_start = datetime.strptime(part_record["ServicePlanDate"], "%Y-%m-%d")
        service_end = datetime.strptime(part_record["ServicePlanEndDate"], "%Y-%m-%d")

        # Visit occurs during participation ±30 days
        visit_window_start = service_start - timedelta(days=30)
        visit_window_end = service_end + timedelta(days=30)

        visit_date = random_date(visit_window_start, visit_window_end)
        visit_type = random.choice(VISIT_TYPES)

        visit = {
            "Child DCN": child_dcn,
            "Child MOSIS ID": child_mosis_id,
            "RefVisitingType.Description": visit_type,
            "VisitDate": visit_date.strftime("%Y-%m-%d")
        }

        monitoring_visits.append(visit)

df_monitoring = pd.DataFrame(monitoring_visits)
df_monitoring.to_csv(OUTPUT_DIR / "ChildMonitoring.csv", index=False)
print(f"   ✓ Generated {len(df_monitoring):,} monitoring visits")

# ============================================================================
# 6. GENERATE CHILDINSURANCE.CSV
# ============================================================================
print("6. Generating ChildInsurance.csv...")

insurance_records = []

for _, child in df_child.iterrows():
    child_dcn = child["Child DCN"]
    child_mosis_id = child["Child MOSIS ID"]
    birthdate = datetime.strptime(child["BirthDate"], "%Y-%m-%d")
    poverty_level = child["PercentOfFederalPovertyLevel"]

    # Insurance type based on income
    if poverty_level < 150:
        insurance = random.choices(INSURANCE_TYPES, weights=[0.70, 0.20, 0.05, 0.05])[0]
    elif poverty_level < 250:
        insurance = random.choices(INSURANCE_TYPES, weights=[0.40, 0.35, 0.20, 0.05])[0]
    else:
        insurance = random.choices(INSURANCE_TYPES, weights=[0.10, 0.20, 0.65, 0.05])[0]

    # 1-2 insurance records per child
    num_records = random.choices([1, 2], weights=[0.75, 0.25])[0]

    for i in range(num_records):
        status_date = birthdate + timedelta(days=random.randint(0, 1825))

        insurance_rec = {
            "Child DCN": child_dcn,
            "Child MOSIS ID": child_mosis_id,
            "RefHealthInsuranceCoverage.Description": insurance,
            "HealthInsuranceStatusDate": status_date.strftime("%Y-%m-%d")
        }

        insurance_records.append(insurance_rec)

        # Second record might change type
        if i == 0 and num_records == 2:
            insurance = random.choice(INSURANCE_TYPES)

df_insurance = pd.DataFrame(insurance_records)
df_insurance.to_csv(OUTPUT_DIR / "ChildInsurance.csv", index=False)
print(f"   ✓ Generated {len(df_insurance):,} insurance records")

# ============================================================================
# 7. GENERATE CHILDIMMUNIZATION.CSV
# ============================================================================
print("7. Generating ChildImmunization.csv...")

immunizations = []

for _, child in df_child.iterrows():
    child_dcn = child["Child DCN"]
    child_mosis_id = child["Child MOSIS ID"]
    risk_tier = risk_tiers[child_dcn]
    birthdate = datetime.strptime(child["BirthDate"], "%Y-%m-%d")

    # Immunization schedule (CDC pediatric schedule)
    scheduled_immunizations = [
        ("HepB", 0),      # Birth
        ("DTaP", 60),     # 2 months
        ("Polio", 60),
        ("Hib", 60),
        ("PCV", 60),
        ("Rotavirus", 60),
        ("DTaP", 120),    # 4 months
        ("Polio", 120),
        ("Hib", 120),
        ("PCV", 120),
        ("Rotavirus", 120),
        ("DTaP", 180),    # 6 months
        ("Polio", 180),
        ("Hib", 180),
        ("PCV", 180),
        ("HepB", 180),
        ("MMR", 365),     # 12 months
        ("Varicella", 365),
        ("HepA", 365),
        ("DTaP", 450),    # 15 months
        ("PCV", 450),
        ("HepA", 548),    # 18 months
    ]

    # Compliance rate based on risk
    if risk_tier == "High":
        compliance = 0.60
    elif risk_tier == "Medium":
        compliance = 0.80
    else:
        compliance = 0.95

    for immunization_type, days_after_birth in scheduled_immunizations:
        if random.random() < compliance:
            imm_date = birthdate + timedelta(days=days_after_birth + random.randint(-15, 30))

            # Don't schedule future immunizations
            if imm_date > datetime(2026, 2, 26):
                continue

            immunization = {
                "Child DCN": child_dcn,
                "Child MOSIS ID": child_mosis_id,
                "RefImmunizationType.Description": immunization_type,
                "ImmunizationDate": imm_date.strftime("%Y-%m-%d")
            }

            immunizations.append(immunization)

df_immunization = pd.DataFrame(immunizations)
df_immunization.to_csv(OUTPUT_DIR / "ChildImmunization.csv", index=False)
print(f"   ✓ Generated {len(df_immunization):,} immunization records")

# ============================================================================
# 8. GENERATE CHILDSCREENING.CSV
# ============================================================================
print("8. Generating ChildScreening.csv...")

screenings = []

for _, child in df_child.iterrows():
    child_dcn = child["Child DCN"]
    child_mosis_id = child["Child MOSIS ID"]
    risk_tier = risk_tiers[child_dcn]
    birthdate = datetime.strptime(child["BirthDate"], "%Y-%m-%d")

    # Well-child screening schedule
    screening_schedule = [
        ("6-month", 180),
        ("12-month", 365),
        ("18-month", 548),
        ("24-month", 730),
        ("36-month", 1095),
        ("48-month", 1460),
    ]

    # Completion rate based on risk (lower risk = better compliance)
    if risk_tier == "High":
        completion_rate = 0.50
    elif risk_tier == "Medium":
        completion_rate = 0.75
    else:
        completion_rate = 0.92

    for screening_type, days_after_birth in screening_schedule:
        if random.random() < completion_rate:
            screening_date = birthdate + timedelta(days=days_after_birth + random.randint(-30, 60))

            # Don't schedule future screenings
            if screening_date > datetime(2026, 2, 26):
                continue

            screening = {
                "Child DCN": child_dcn,
                "Child MOSIS ID": child_mosis_id,
                "RefScheduledWellChildScreening.Description": screening_type,
                "WellChildScreeningReceivedDate": screening_date.strftime("%Y-%m-%d")
            }

            screenings.append(screening)

df_screening = pd.DataFrame(screenings)
df_screening.to_csv(OUTPUT_DIR / "ChildScreening.csv", index=False)
print(f"   ✓ Generated {len(df_screening):,} screening records")

# ============================================================================
# 9. GENERATE CHILDOUTCOMES.CSV
# ============================================================================
print("9. Generating ChildOutcomes.csv...")

outcomes = []

for _, child in df_child.iterrows():
    child_dcn = child["Child DCN"]
    child_mosis_id = child["Child MOSIS ID"]
    risk_tier = risk_tiers[child_dcn]

    # Get participation records
    child_participations = df_participation[df_participation["Child DCN"] == child_dcn]

    if len(child_participations) == 0:
        continue

    # Generate 1-3 outcome assessments
    num_outcomes = random.randint(1, min(3, len(child_participations)))
    sampled_parts = child_participations.sample(min(num_outcomes, len(child_participations)))

    for _, part_record in sampled_parts.iterrows():
        service_start = datetime.strptime(part_record["ServicePlanDate"], "%Y-%m-%d")
        service_end = datetime.strptime(part_record["ServicePlanEndDate"], "%Y-%m-%d")

        # Outcome timepoint
        timepoint = random.choice(OUTCOME_TIMEPOINTS)

        if timepoint == "Entry":
            outcome_date = service_start + timedelta(days=random.randint(0, 30))
        elif timepoint == "Exit":
            outcome_date = service_end + timedelta(days=random.randint(-30, 90))
        else:  # Annual Review
            outcome_date = service_start + timedelta(days=random.randint(300, 400))

        # COS Ratings (1-7) - CORRELATED WITH RISK
        if risk_tier == "High":
            rating_a = random.choices(COS_RATINGS, weights=[0.25, 0.25, 0.20, 0.15, 0.10, 0.03, 0.02])[0]
            rating_b = random.choices(COS_RATINGS, weights=[0.25, 0.25, 0.20, 0.15, 0.10, 0.03, 0.02])[0]
            rating_c = random.choices(COS_RATINGS, weights=[0.25, 0.25, 0.20, 0.15, 0.10, 0.03, 0.02])[0]
            rating_phys = random.choices(COS_RATINGS, weights=[0.20, 0.20, 0.20, 0.20, 0.10, 0.05, 0.05])[0]
        elif risk_tier == "Medium":
            rating_a = random.choices(COS_RATINGS, weights=[0.10, 0.15, 0.20, 0.25, 0.20, 0.07, 0.03])[0]
            rating_b = random.choices(COS_RATINGS, weights=[0.10, 0.15, 0.20, 0.25, 0.20, 0.07, 0.03])[0]
            rating_c = random.choices(COS_RATINGS, weights=[0.10, 0.15, 0.20, 0.25, 0.20, 0.07, 0.03])[0]
            rating_phys = random.choices(COS_RATINGS, weights=[0.08, 0.12, 0.20, 0.25, 0.20, 0.10, 0.05])[0]
        else:  # Low risk
            rating_a = random.choices(COS_RATINGS, weights=[0.03, 0.05, 0.10, 0.15, 0.27, 0.25, 0.15])[0]
            rating_b = random.choices(COS_RATINGS, weights=[0.03, 0.05, 0.10, 0.15, 0.27, 0.25, 0.15])[0]
            rating_c = random.choices(COS_RATINGS, weights=[0.03, 0.05, 0.10, 0.15, 0.27, 0.25, 0.15])[0]
            rating_phys = random.choices(COS_RATINGS, weights=[0.02, 0.03, 0.08, 0.12, 0.25, 0.30, 0.20])[0]

        # Summary rating
        avg_rating = (int(rating_a) + int(rating_b) + int(rating_c) + int(rating_phys)) // 4
        rating_summary = str(avg_rating)

        outcome = {
            "Child DCN": child_dcn,
            "Child MOSIS ID": child_mosis_id,
            "COSRatingA.Description": rating_a,
            "COSRatingB.Description": rating_b,
            "COSRatingC.Description": rating_c,
            "COSRatingPhysical.Description": rating_phys,
            "COSRatingSummary.Description": rating_summary,
            "RefOutcomeTimePoint.Description": timepoint,
            "OutcomeDate": outcome_date.strftime("%Y-%m-%d")
        }

        outcomes.append(outcome)

df_outcomes = pd.DataFrame(outcomes)
df_outcomes.to_csv(OUTPUT_DIR / "ChildOutcomes.csv", index=False)
print(f"   ✓ Generated {len(df_outcomes):,} outcome records")

# ============================================================================
# QA CHECKS & SUMMARY
# ============================================================================
print()
print("=" * 70)
print("QA CHECKS & DATA SUMMARY")
print("=" * 70)

print("\n📊 Row Counts by File:")
print(f"   Child.csv: {len(df_child):,}")
print(f"   RelatedPerson.csv: {len(df_related):,}")
print(f"   ChildParticipation.csv: {len(df_participation):,}")
print(f"   ChildDisability.csv: {len(df_disability):,}")
print(f"   ChildMonitoring.csv: {len(df_monitoring):,}")
print(f"   ChildInsurance.csv: {len(df_insurance):,}")
print(f"   ChildImmunization.csv: {len(df_immunization):,}")
print(f"   ChildScreening.csv: {len(df_screening):,}")
print(f"   ChildOutcomes.csv: {len(df_outcomes):,}")
total_records = (len(df_child) + len(df_related) + len(df_participation) +
                 len(df_disability) + len(df_monitoring) + len(df_insurance) +
                 len(df_immunization) + len(df_screening) + len(df_outcomes))
print(f"   TOTAL RECORDS: {total_records:,}")

print("\n📈 Participation Statistics:")
part_counts = df_participation.groupby("Child DCN").size()
children_with_no_part = len(df_child) - len(part_counts)
print(f"   Children with 0 participation records: {children_with_no_part} (0%)")
print(f"   Children with 1 participation record: {(part_counts == 1).sum()} ({(part_counts == 1).sum() / NUM_CHILDREN * 100:.1f}%)")
print(f"   Children with 2 participation records: {(part_counts == 2).sum()} ({(part_counts == 2).sum() / NUM_CHILDREN * 100:.1f}%)")
print(f"   Children with 3 participation records: {(part_counts == 3).sum()} ({(part_counts == 3).sum() / NUM_CHILDREN * 100:.1f}%)")
print(f"   Children with 4-5 participation records: {(part_counts >= 4).sum()} ({(part_counts >= 4).sum() / NUM_CHILDREN * 100:.1f}%)")

# Gap analysis
children_with_gaps = 0
children_with_concurrent = 0

for dcn in df_child["Child DCN"]:
    child_parts = df_participation[df_participation["Child DCN"] == dcn].sort_values("EnrollmentDate")

    if len(child_parts) >= 2:
        # Check for gaps
        for i in range(len(child_parts) - 1):
            end1 = datetime.strptime(child_parts.iloc[i]["ServicePlanEndDate"], "%Y-%m-%d")
            start2 = datetime.strptime(child_parts.iloc[i+1]["EnrollmentDate"], "%Y-%m-%d")
            gap = (start2 - end1).days
            if gap > 30:
                children_with_gaps += 1
                break

        # Check for concurrent enrollment
        for i in range(len(child_parts)):
            for j in range(i+1, len(child_parts)):
                start1 = datetime.strptime(child_parts.iloc[i]["EnrollmentDate"], "%Y-%m-%d")
                end1 = datetime.strptime(child_parts.iloc[i]["ServicePlanEndDate"], "%Y-%m-%d")
                start2 = datetime.strptime(child_parts.iloc[j]["EnrollmentDate"], "%Y-%m-%d")
                end2 = datetime.strptime(child_parts.iloc[j]["ServicePlanEndDate"], "%Y-%m-%d")

                # Check overlap
                if start2 <= end1 and start1 <= end2:
                    children_with_concurrent += 1
                    break
            if children_with_concurrent > 0:
                break

print(f"   Children with ≥1 gap (>30 days): {children_with_gaps} ({children_with_gaps / NUM_CHILDREN * 100:.1f}%)")
print(f"   Children with concurrent programs: {children_with_concurrent} ({children_with_concurrent / NUM_CHILDREN * 100:.1f}%)")

print("\n⚠️  Risk Indicator Prevalence:")
print(f"   Homelessness: {(df_child['HomelessnessStatus'] == 'Yes').sum()} ({(df_child['HomelessnessStatus'] == 'Yes').sum() / NUM_CHILDREN * 100:.1f}%)")
print(f"   Foster Care: {(df_child['FosterCareStartDate'] != '').sum()} ({(df_child['FosterCareStartDate'] != '').sum() / NUM_CHILDREN * 100:.1f}%)")
print(f"   Migrant Status: {(df_child['MigrantStatus'] == 'Yes').sum()} ({(df_child['MigrantStatus'] == 'Yes').sum() / NUM_CHILDREN * 100:.1f}%)")
print(f"   Disability: {len(df_disability)} ({len(df_disability) / NUM_CHILDREN * 100:.1f}%)")
print(f"   Child Abuse/Neglect: {(df_child['ChildAbuseNeglect'] == 'Yes').sum()} ({(df_child['ChildAbuseNeglect'] == 'Yes').sum() / NUM_CHILDREN * 100:.1f}%)")
print(f"   Family Incarceration: {(df_child['FamilyMemberIncarcerated'] == 'Yes').sum()} ({(df_child['FamilyMemberIncarcerated'] == 'Yes').sum() / NUM_CHILDREN * 100:.1f}%)")
print(f"   Substance Abuse: {(df_child['FamilyMemberSubstanceUseAbuse'] == 'Yes').sum()} ({(df_child['FamilyMemberSubstanceUseAbuse'] == 'Yes').sum() / NUM_CHILDREN * 100:.1f}%)")
print(f"   Depression/Mental Illness: {(df_child['HouseholdMemberDepressedOrMentallyIll'] == 'Yes').sum()} ({(df_child['HouseholdMemberDepressedOrMentallyIll'] == 'Yes').sum() / NUM_CHILDREN * 100:.1f}%)")

print("\n✅ Referential Integrity Checks:")
all_child_dcns = set(df_child["Child DCN"])
checks = {
    "RelatedPerson": df_related['Child DCN'].isin(all_child_dcns).all(),
    "Participation": df_participation['Child DCN'].isin(all_child_dcns).all(),
    "Disability": df_disability['Child DCN'].isin(all_child_dcns).all() if len(df_disability) > 0 else True,
    "Monitoring": df_monitoring['Child DCN'].isin(all_child_dcns).all() if len(df_monitoring) > 0 else True,
    "Insurance": df_insurance['Child DCN'].isin(all_child_dcns).all(),
    "Immunization": df_immunization['Child DCN'].isin(all_child_dcns).all(),
    "Screening": df_screening['Child DCN'].isin(all_child_dcns).all(),
    "Outcomes": df_outcomes['Child DCN'].isin(all_child_dcns).all() if len(df_outcomes) > 0 else True,
}

for file_name, is_valid in checks.items():
    status = "✓ PASS" if is_valid else "✗ FAIL"
    print(f"   {file_name}: {status}")

print()
print("=" * 70)
print("✨ DATA GENERATION COMPLETE!")
print(f"📁 Files saved to: {OUTPUT_DIR.absolute()}")
print("=" * 70)
print()
print("Generated using:")
print("  • Faker library for realistic synthetic data")
print("  • Excel field specifications for accurate schemas")
print("  • Risk-correlated distributions for modeling readiness")
print("=" * 70)
