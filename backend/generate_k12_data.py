"""
K-12 Synthetic Data Generator - Longitudinal Extension of ECIDS Data

Generates K-12 student records (PK through Grade 03) for the existing 5,000 ECIDS children.
Links to early childhood data and demonstrates risk indicator → K-12 outcome correlations.

Includes contextual variables:
- Parent education level (as contextual influence, not deterministic)
- Primary language (informs ELL/LEP indicators)

Author: Claude Code
Date: 2026-03-16
"""

import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime, timedelta
import random

# Set random seed for reproducibility
np.random.seed(42)
random.seed(42)


class K12DataGenerator:
    """Generate K-12 student data linked to ECIDS children"""

    def __init__(self, ecids_dir="../dashboard-react/public/data/ecids", k12_dir="../dashboard-react/public/data/k12"):
        """Initialize generator with data directories"""
        self.ecids_dir = Path(ecids_dir)
        self.k12_dir = Path(k12_dir)
        self.k12_dir.mkdir(parents=True, exist_ok=True)

        # Load option codes
        self.load_option_codes()

        # Load ECIDS data
        self.load_ecids_data()

        # Current school years to generate (2024-2026)
        self.school_years = [2024, 2025, 2026]  # End years of school year

    def load_option_codes(self):
        """Load all option codes from OptionCodes.xlsx"""
        print("Loading option codes...")
        df = pd.read_excel("../archive/templates/OptionCodes.xlsx", sheet_name="Sheet1")
        df.columns = ['CodeSet', 'Option_Name', 'Default_Code', 'Option_Definition',
                     'Rank', 'Effective_Date', 'Expiration_Date', 'Last_Modified']
        df = df.iloc[1:]  # Skip header row

        # Store as dictionary for easy lookup
        self.option_codes = {}
        for codeset in df['CodeSet'].unique():
            if pd.notna(codeset):
                codes = df[df['CodeSet'] == codeset]
                self.option_codes[codeset] = codes[['Option_Name', 'Default_Code']].to_dict('records')

        print(f"✓ Loaded {len(self.option_codes)} code sets")

    def load_ecids_data(self):
        """Load ECIDS child data with risk scores"""
        print("Loading ECIDS data...")

        # Load child demographics
        self.df_child = pd.read_csv(self.ecids_dir / "Child.csv")

        # Load disability data
        self.df_disability = pd.read_csv(self.ecids_dir / "ChildDisability.csv")

        # Load risk scores
        self.df_risk = pd.read_csv(self.ecids_dir / "risk_scores.csv")

        # Merge risk scores with child data
        self.df_child = self.df_child.merge(
            self.df_risk[['Child DCN', 'Child MOSIS ID', 'composite_risk_score', 'risk_tier',
                         'stability_score', 'engagement_score', 'developmental_score', 'context_score',
                         'num_enrollment_gaps', 'avg_attendance_days', 'has_disability',
                         'num_household_stressors']],
            on=['Child DCN', 'Child MOSIS ID'],
            how='left'
        )

        # Parse birth dates
        self.df_child['BirthDate'] = pd.to_datetime(self.df_child['BirthDate'])
        self.df_child['BirthYear'] = self.df_child['BirthDate'].dt.year

        print(f"✓ Loaded {len(self.df_child)} children with risk scores")

        # Map parent education to numeric for modeling
        self.education_levels = {
            "No high school diploma": 1,
            "High school diploma or equivalent": 2,
            "Some college, no degree": 3,
            "Associate's degree": 4,
            "Bachelor's degree": 5,
            "Graduate or professional degree": 6
        }
        self.df_child['parent_education_numeric'] = self.df_child['HighestParentEducationLevel'].map(self.education_levels)

    def get_grade_for_year(self, birth_year, school_year):
        """
        Determine grade level for a given birth year and school year.

        Grade progression (adjusted to generate ~400 Grade 3 students):
        - Birth 2018 → 02(2024-25), 03(2025-26)  [early cohort progression]
        - Birth 2019 → K(2024-25), 01(2025-26), 02(2026-27)
        - Birth 2020 → PK(2024-25), K(2025-26), 01(2026-27)
        - Birth 2021 → PK(2025-26), K(2026-27)

        Includes grade skipping for gifted students (~2% chance)

        Returns: Grade code (PK, K, 01, 02, 03) or None if not enrolled
        """
        # Special handling for 2018 birth cohort to ensure Grade 3 students
        # Assume they started K at age 4 (early entry) instead of age 5
        if birth_year == 2018:
            # 2018 cohort accelerated by 1 year
            # Age 6 in fall 2024 → Grade 02 (instead of 01)
            # Age 7 in fall 2025 → Grade 03 (instead of 02)
            # Age 8 in fall 2026 → Grade 03 (cap here)
            adjusted_age = (school_year - 1 - birth_year) + 1  # Add 1 year
        else:
            adjusted_age = school_year - 1 - birth_year

        # Map age to grade
        if adjusted_age == 3:
            base_grade = "PK"
        elif adjusted_age == 4:
            # 80% go to PK, 20% wait for K
            base_grade = "PK" if random.random() < 0.8 else None
        elif adjusted_age == 5:
            base_grade = "K"
        elif adjusted_age == 6:
            base_grade = "01"
        elif adjusted_age == 7:
            base_grade = "02"
        elif adjusted_age == 8:
            base_grade = "03"
        elif adjusted_age >= 9:
            # Cap at Grade 3 for this dataset
            base_grade = "03"
        else:
            return None

        if base_grade is None:
            return None

        # Rare chance of grade skipping (2% of students are gifted/accelerated)
        # Only skip if currently in PK through 02
        if base_grade in ["PK", "K", "01", "02"] and random.random() < 0.02:
            # Skip one grade
            grade_progression = ["PK", "K", "01", "02", "03"]
            current_idx = grade_progression.index(base_grade)
            if current_idx < len(grade_progression) - 1:
                base_grade = grade_progression[current_idx + 1]

        return base_grade

    def map_race_to_k12(self, ecids_race):
        """Map ECIDS race to K-12 race codes"""
        race_map = {
            'Asian': 'A',
            'Black or African American': 'B',
            'Hispanic or Latino': 'H',
            'American Indian or Alaska Native': 'I',
            'White': 'W',
            'Native Hawaiian or Other Pacific Islander': 'P',
            'Demographic Race Two or More Races': 'M',
            'Two or More Races': 'M',
            'Race and Ethnicity Unknown': 'W'
        }
        return race_map.get(ecids_race, 'W')

    def map_disability_to_k12(self, ecids_disability_type):
        """Map ECIDS IDEA disability to K-12 disability codes"""
        disability_map = {
            'Developmental Delay': '16',
            'Speech or Language Impairment': '17',
            'Learning Disability': '9',
            'Autism Spectrum Disorder': '13',
            'Emotional Disturbance': '2',
            'Intellectual Disability': '1',
            'Visual Impairment': '6',
            'Hearing Impairment': '8',
            'Orthopedic Impairment': '4',
            'Other Health Impairment': '10',
            'Traumatic Brain Injury': '14',
            'Multiple Disabilities': '12',
            'Deaf-Blindness': '11'
        }
        return disability_map.get(ecids_disability_type, '0')

    def generate_map_score(self, grade, subject, child, student):
        """
        Generate realistic MAP scale score and performance level.

        Correlated with:
        - ECIDS developmental_score (primary)
        - Kindergarten readiness status
        - RSP status
        - Parent education (contextual)
        - Attendance rate
        """
        # Base scale score ranges by grade (Missouri MAP typical ranges)
        base_ranges = {
            'K': {'Reading': (140, 180), 'Math': (140, 185)},
            '01': {'Reading': (160, 200), 'Math': (165, 205)},
            '02': {'Reading': (175, 215), 'Math': (180, 220)},
            '03': {'Reading': (185, 230), 'Math': (190, 235)}
        }

        min_score, max_score = base_ranges[grade][subject]
        range_width = max_score - min_score

        # Calculate base performance from ECIDS developmental score
        # HIGHER developmental_score = HIGHER RISK = LOWER performance
        dev_score = child['developmental_score']

        # Convert developmental risk to performance percentile (inverted)
        if dev_score < 15:
            base_percentile = random.uniform(0.70, 0.95)  # High performer
        elif dev_score < 30:
            base_percentile = random.uniform(0.50, 0.75)  # Average
        elif dev_score < 45:
            base_percentile = random.uniform(0.25, 0.55)  # Below average
        else:
            base_percentile = random.uniform(0.05, 0.35)  # Low performer

        # Adjust for K readiness (if available)
        if grade in ['01', '02', '03'] and pd.notna(student.get('KindergartenReadiness')):
            if student['KindergartenReadiness'] == 'Y':
                base_percentile += 0.10  # Boost for K ready
            else:
                base_percentile -= 0.10  # Penalty for not K ready

        # Adjust for RSP status (reading only)
        if subject == 'Reading' and student.get('ReadingSuccessPlan') == 'REC RSP':
            base_percentile -= 0.15  # RSP students have lower reading scores

        # Parent education contextual adjustment
        parent_ed_numeric = child.get('parent_education_numeric', 3.5)
        ed_adjustment = (parent_ed_numeric - 3.5) * 0.03  # +/- 0.075
        base_percentile += ed_adjustment

        # Bound percentile
        base_percentile = max(0.05, min(0.95, base_percentile))

        # Convert to scale score with some random variation
        scale_score = int(min_score + (range_width * base_percentile) + random.uniform(-5, 5))
        scale_score = max(min_score, min(max_score, scale_score))

        # Determine performance level based on scale score
        # Rough cut points (adjust these based on Missouri standards)
        third_point = min_score + range_width * 0.33
        mid_point = min_score + range_width * 0.50
        two_third_point = min_score + range_width * 0.75

        if scale_score >= two_third_point:
            performance_level = 'Advanced'
        elif scale_score >= mid_point:
            performance_level = 'Proficient'
        elif scale_score >= third_point:
            performance_level = 'Basic'
        else:
            performance_level = 'Below Basic'

        return scale_score, performance_level

    def generate_wida_score(self, child, student):
        """
        Generate WIDA ACCESS composite score (1.0-6.0 scale).

        Level 1-2: Entering/Emerging
        Level 3-4: Developing/Expanding
        Level 5-6: Bridging/Reaching (ready to exit ELL)
        """
        # Base score influenced by years in U.S. schools (simulated)
        # Newer ELL students score lower, older students score higher
        grade = student['StudentGradeLevel']

        # Estimate years in program based on grade
        if grade == 'K':
            years_in_program = random.uniform(0, 1)
        elif grade == '01':
            years_in_program = random.uniform(0.5, 2)
        elif grade == '02':
            years_in_program = random.uniform(1, 3)
        else:  # 03
            years_in_program = random.uniform(1.5, 4)

        # Base score from years in program
        if years_in_program < 1:
            base_score = random.uniform(1.5, 3.0)  # Entering/Emerging
        elif years_in_program < 2:
            base_score = random.uniform(2.5, 4.0)  # Developing
        elif years_in_program < 3:
            base_score = random.uniform(3.5, 5.0)  # Expanding
        else:
            base_score = random.uniform(4.5, 6.0)  # Bridging/Reaching

        # Parent education slight influence
        parent_ed_numeric = child.get('parent_education_numeric', 3.5)
        ed_adjustment = (parent_ed_numeric - 3.5) * 0.15
        base_score += ed_adjustment

        # Bound to WIDA scale
        composite_score = round(max(1.0, min(6.0, base_score)), 1)

        # Determine proficiency level
        if composite_score < 2.5:
            proficiency_level = 'Level 1-2: Entering/Emerging'
        elif composite_score < 4.0:
            proficiency_level = 'Level 3: Developing'
        elif composite_score < 5.0:
            proficiency_level = 'Level 4: Expanding'
        elif composite_score < 5.5:
            proficiency_level = 'Level 5: Bridging'
        else:
            proficiency_level = 'Level 6: Reaching'

        return composite_score, proficiency_level

    def generate_stucore(self):
        """Generate StuCore.csv - one record per student per school year"""
        print("\nGenerating StuCore.csv...")

        records = []
        student_count = 0
        student_history = {}  # Track highest grade reached by each student

        for _, child in self.df_child.iterrows():
            birth_year = child['BirthYear']
            state_id = f"{int(child['Child MOSIS ID']):010d}"

            for school_year in self.school_years:
                grade = self.get_grade_for_year(birth_year, school_year)

                # Skip if not enrolled this year
                if grade is None:
                    continue

                # Prevent going backwards in grade (but allow repeating)
                if state_id in student_history:
                    grade_order = {'PK': 0, 'K': 1, '01': 2, '02': 3, '03': 4}
                    current_grade_num = grade_order.get(grade, 0)
                    highest_grade_num = grade_order.get(student_history[state_id], 0)

                    # If trying to go to a LOWER grade than highest achieved, skip
                    if current_grade_num < highest_grade_num:
                        continue
                    # If advancing or repeating, update tracking
                    student_history[state_id] = grade
                else:
                    # First enrollment for this student
                    student_history[state_id] = grade

                # Random chance to exit early (higher for high-risk students)
                exit_prob = 0.02 if child['risk_tier'] == 'Low' else 0.05 if child['risk_tier'] == 'Moderate' else 0.10
                if random.random() < exit_prob and grade not in ['PK', 'K']:
                    continue

                student_count += 1

                # Generate district/school codes (use ResponsibleOrganizationIdentifier from ECIDS)
                district_code = f"{int(child['ResponsibleOrganizationIdentifier']):06d}"
                school_code = f"{random.randint(1000, 9999):04d}"

                # Gender mapping
                gender = 'M' if child['RefSex.Description'] == 'Male' else 'F'

                # Race mapping
                race = self.map_race_to_k12(child['RefRace.Description'])

                # Lunch status based on poverty
                poverty_pct = child['PercentOfFederalPovertyLevel']
                if poverty_pct < 130:
                    lunch_status = 'F'  # Free
                elif poverty_pct < 185:
                    lunch_status = 'R'  # Reduced
                else:
                    lunch_status = 'U'  # Unreduced

                # Homeless status
                homeless = 'Y' if child['HomelessnessStatus'] == 'Yes' else 'N'

                # Foster care status
                foster_care = 'Y' if pd.notna(child['FosterCareStartDate']) and child['FosterCareStartDate'] != '' else 'N'

                # IEP Disability
                child_disability = self.df_disability[
                    self.df_disability['Child DCN'] == child['Child DCN']
                ]
                if len(child_disability) > 0:
                    iep_disability = self.map_disability_to_k12(
                        child_disability.iloc[0]['RefIDEADisabilityType']
                    )
                else:
                    iep_disability = '0'  # None

                # LEP/ELL status based on language
                language = child['RefLanguage.Description']
                if language != 'English':
                    lep_ell = 'RCV'  # Receiving services
                else:
                    lep_ell = 'NLP'  # Not English Learner

                # Kindergarten Readiness (only for K students)
                # Influenced by developmental_score, engagement_score, AND parent_education
                kindergarten_readiness = ''
                if grade == 'K':
                    dev_score = child['developmental_score']
                    eng_score = child['engagement_score']
                    parent_ed_numeric = child['parent_education_numeric']

                    # Calculate base readiness probability from ECIDS risk
                    # More realistic correlation (~-0.30 to -0.40) with wider ranges
                    avg_risk = (dev_score + eng_score) / 2

                    # Base probability from risk - WIDER RANGES for more variability
                    if avg_risk < 20:
                        base_prob = random.uniform(0.75, 0.90)  # Some low performers even in low-risk
                    elif avg_risk < 35:
                        base_prob = random.uniform(0.55, 0.80)  # Wide overlap
                    else:
                        base_prob = random.uniform(0.30, 0.65)  # Some high performers in high-risk

                    # Parent education adds contextual influence (not deterministic)
                    # Higher education adds modest positive influence
                    ed_adjustment = (parent_ed_numeric - 3.5) * 0.06  # Range: -0.15 to +0.15

                    # Add random noise to prevent perfect correlation
                    noise = random.uniform(-0.10, 0.10)

                    final_prob = base_prob + ed_adjustment + noise
                    final_prob = max(0.15, min(0.95, final_prob))  # Bound between 15%-95%

                    kindergarten_readiness = 'Y' if random.random() < final_prob else 'N'

                # Reading Success Plan (for students with reading difficulties)
                # Influenced by developmental_score AND parent_education
                reading_success_plan = 'NO RSP'
                rsp_primary_intervention = ''
                if grade in ['01', '02', '03']:
                    dev_score = child['developmental_score']
                    parent_ed_numeric = child['parent_education_numeric']

                    # Base RSP probability from developmental risk
                    if dev_score > 40:
                        base_rsp_prob = 0.40
                    elif dev_score > 25:
                        base_rsp_prob = 0.20
                    else:
                        base_rsp_prob = 0.05

                    # Parent education adds contextual influence
                    # Lower education increases RSP probability slightly
                    ed_adjustment = (3.5 - parent_ed_numeric) * 0.03  # Range: -0.075 to +0.075
                    final_rsp_prob = base_rsp_prob + ed_adjustment
                    final_rsp_prob = max(0.02, min(0.50, final_rsp_prob))

                    if random.random() < final_rsp_prob:
                        reading_success_plan = 'REC RSP'
                        rsp_primary_intervention = random.choice([
                            'Phonics Intervention',
                            'Reading Fluency',
                            'Comprehension Support',
                            'Small Group Instruction'
                        ])

                # Enrollment status
                enrolled_all_year = 'Y'
                # Higher stability_score = more mobility = less likely full year
                if child['stability_score'] > 30 and random.random() < 0.20:
                    enrolled_all_year = 'N'

                record = {
                    'CollectionVersion': f'2026Oct1.0StuCore',
                    'CurrentSchoolYear': school_year,
                    'AttendingDistrictCode': district_code,
                    'AttendingSchoolCode': school_code,
                    'ReportingDistrictCode': district_code,
                    'ReportingSchoolCode': school_code,
                    'ResidentDistrictCode': district_code,
                    'ResidentSchoolCode': school_code,
                    'TeacherName': '',
                    'StateID': state_id,
                    'LocalStudentID': f"L{state_id}",
                    'LastName': child['LastName'],
                    'FirstName': child['FirstName'],
                    'MiddleName': child['MiddleName'] if pd.notna(child['MiddleName']) else '',
                    'Suffix': '',
                    'DateOfBirth': child['BirthDate'].strftime('%Y-%m-%d'),
                    'County': child['AddressCountyName'][:3].upper() if pd.notna(child['AddressCountyName']) else 'STL',
                    'StudentGradeLevel': grade,
                    'Gender': gender,
                    'RaceEthnicity': race,
                    'LunchStatus': lunch_status,
                    'Gifted': 'N',
                    'Homeless': homeless,
                    'Migrant': 'Y' if child['MigrantStatus'] == 'Yes' else 'N',
                    'NotFAYSchool': 'Y' if child['stability_score'] > 35 and random.random() < 0.15 else 'N',
                    'NotFAYDistrict': 'Y' if child['stability_score'] > 35 and random.random() < 0.10 else 'N',
                    'VoluntaryTransfer': 'N',
                    'Aplus': 'N',
                    'MonthsUSA': 12,
                    'Immigrant': 'N',
                    'ELLLanguage': language if language != 'English' else '',
                    'LEPELL': lep_ell,
                    'ELLExit': '',
                    'ELLExitTest': '',
                    'ESOLInstModel': '',
                    'MOOptionProgram': 'N',
                    'CareerEd': 'N',
                    'TitleI': 'Y' if lunch_status in ['F', 'R'] else 'N',
                    'TitleIII': 'Y' if lep_ell == 'RCV' else 'N',
                    'ResidencyStatus': 'R',
                    'MemberFTE': '1.00',
                    'OnePriorTen': 'N',
                    'EnrolledOnCntDate': 'Y',
                    'EnrolledAllYear': enrolled_all_year,
                    'FirstYearFreshman': 'N',
                    'GPA': '',
                    'GPAScale': '',
                    'EighthTechLit': '',
                    'AerobicCap': '',
                    'AbdominalStr': '',
                    'UpperBodyStr': '',
                    'Flexibility': '',
                    'IEPDisability': iep_disability,
                    'MAPA': 'N',
                    'SPEDPlacement': '',
                    'SPEDExit': '',
                    'Truant': 'N',
                    'SuppEdService': '',
                    'CTECluster': '',
                    'NonTradStudent': 'N',
                    'SingleParent': 'N',
                    'DisplacedHomemaker': 'N',
                    'CTETSA': '',
                    'K8GradDistrictCode': '',
                    'ECOEntryDate': '',
                    'ECOEntryInd1': '',
                    'ECOEntryInd2': '',
                    'ECOEntryInd3': '',
                    'ECOExitDate': '',
                    'ECOExitInd1': '',
                    'ECOExitInd2': '',
                    'ECOExitInd3': '',
                    'CTEProgramCode': '',
                    'Title3LEP': 'Y' if lep_ell == 'RCV' else 'N',
                    'Title3Immigrant': 'N',
                    'FirstFreshmanYear': '',
                    'ZipCode': child['PostalCode'],
                    'IndustryCred': '',
                    'Military': 'N',
                    'MPP': 'N',
                    'FosterCare': foster_care,
                    'PKEligStateAid': 'Y' if grade == 'PK' and lunch_status in ['F', 'R'] else 'N',
                    'KindergartenReadiness': kindergarten_readiness,
                    'HighNeedStudent': 'Y' if child['risk_tier'] == 'High' else 'N',
                    'Dyslexia': 'N',
                    'NeglectedorDelinquent': 'N',
                    'CTECertificate': '',
                    'InstructionMethod': '01',  # In-person
                    'InternetAccess': 'Y',
                    'DeviceAccess': 'Y',
                    'PKReplacementID': '',
                    'StackCred1': '',
                    'StackCred2': '',
                    'ICAP': 'N',
                    'ICAPReview': 'N',
                    'SealofBiliteracy': 'N',
                    'SealofBiliteracyLanguage1': '',
                    'SealofBiliteracyLanguage2': '',
                    'SealofBiliteracyLanguage3': '',
                    'AssociateDegree': 'N',
                    'AssociateDegreeInstitution': '',
                    'KGPhysicalWell-beingandMotor ': '',
                    'KGSocialandEmotional': '',
                    'KGCognitionandGeneralKnowledge': '',
                    'KGApproachesTowardLearning': '',
                    'KGLanguageandLiteracy': '',
                    'OnTracktoGraduate': '',
                    'CreditsEarned': '',
                    'ReadingSuccessPlan': reading_success_plan,
                    'RSPPrimaryIntervention': rsp_primary_intervention,
                    'RSPPrimarySupport': '',
                    'MOQPK-LEA': '',
                    'SecondaryDisability': '0',
                    'CTEWorkBasedLearning (WBL)': ''
                }

                records.append(record)

        df_stucore = pd.DataFrame(records)
        output_path = self.k12_dir / "StuCore.csv"
        df_stucore.to_csv(output_path, index=False)

        print(f"✓ Generated {len(df_stucore):,} records ({student_count:,} student-years)")
        print(f"  Saved to: {output_path}")

        # Store for use in other files
        self.df_stucore = df_stucore

        # Print grade distribution
        print("\nGrade Distribution:")
        print(df_stucore.groupby(['CurrentSchoolYear', 'StudentGradeLevel']).size().unstack(fill_value=0))

        return df_stucore

    def generate_stuenrlattnd(self):
        """Generate StuEnrlAttnd.csv - enrollment and attendance records"""
        print("\nGenerating StuEnrlAttnd.csv...")

        records = []

        for _, student in self.df_stucore.iterrows():
            # Get child data for risk scores
            state_id_int = int(student['StateID'])
            child = self.df_child[self.df_child['Child MOSIS ID'] == state_id_int].iloc[0]

            # Entry and exit dates
            school_year = student['CurrentSchoolYear']
            entry_date = f"{school_year - 1}-08-{random.randint(15, 31):02d}"

            # Exit date - most stay full year
            if student['EnrolledAllYear'] == 'Y':
                exit_date = f"{school_year}-05-{random.randint(20, 31):02d}"
                entry_code = 'E100' if student['StudentGradeLevel'] == 'PK' else 'R101'
                exit_code = 'R001'  # Remained: Advanced
            else:
                # Mid-year exit (Sept-April)
                # Pick from months 9,10,11,12 (fall) or 1,2,3,4 (winter/spring)
                exit_month_choices = [9, 10, 11, 12, 1, 2, 3, 4]
                exit_month = random.choice(exit_month_choices)
                if exit_month <= 4:
                    exit_year = school_year
                else:
                    exit_year = school_year - 1
                exit_date = f"{exit_year}-{exit_month:02d}-{random.randint(1, 28):02d}"
                entry_code = 'E100' if student['StudentGradeLevel'] == 'PK' else 'T101'
                exit_code = 'T001'  # Transfer

            # Calculate attendance
            # HIGHER engagement_score = HIGHER RISK = LOWER attendance
            # Also influenced by parent education as contextual variable
            engagement_score = child['engagement_score']
            parent_ed_numeric = child['parent_education_numeric']

            # Base hours in session (180 days * 6.5 hours = 1170 hours)
            hrs_in_session = 1170

            # Base attendance rate from engagement risk
            # VERY WIDE RANGES with substantial overlap for realistic correlation (~-0.55 to -0.65)
            # Many exceptions to prevent overly strong correlation
            if engagement_score < 20:
                base_attend_rate = random.uniform(0.80, 1.00)  # Very wide range
            elif engagement_score < 35:
                base_attend_rate = random.uniform(0.75, 0.95)  # Substantial overlap
            elif engagement_score < 50:
                base_attend_rate = random.uniform(0.72, 0.92)  # Overlaps both ways
            else:
                base_attend_rate = random.uniform(0.68, 0.88)  # Many outliers succeed

            # Parent education adds modest contextual influence
            # Higher education slightly improves attendance
            ed_adjustment = (parent_ed_numeric - 3.5) * 0.015

            # Add significant random noise (±5%) to create realistic scatter
            noise = random.uniform(-0.05, 0.05)

            attend_rate = base_attend_rate + ed_adjustment + noise
            attend_rate = max(0.65, min(1.00, attend_rate))

            reg_hrs_attended = int(hrs_in_session * attend_rate)
            reg_hrs_absent = hrs_in_session - reg_hrs_attended

            record = {
                'CollectionVersion': '2026Aug1.0StuEnrlAttnd',
                'CurrentSchoolYear': school_year,
                'AttendingDistrictCode': student['AttendingDistrictCode'],
                'AttendingSchoolCode': student['AttendingSchoolCode'],
                'ReportingDistrictCode': student['ReportingDistrictCode'],
                'ReportingSchoolCode': student['ReportingSchoolCode'],
                'ResidentDistrictCode': student['ResidentDistrictCode'],
                'ResidentSchoolCode': student['ResidentSchoolCode'],
                'StateID': student['StateID'],
                'LocalStudentID': student['LocalStudentID'],
                'LastName': student['LastName'],
                'FirstName': student['FirstName'],
                'MiddleName': student['MiddleName'],
                'Suffix': student['Suffix'],
                'DateOfBirth': student['DateOfBirth'],
                'StudentGradeLevel': student['StudentGradeLevel'],
                'ResidencyStatus': 'R',
                'RegHrsAttended': reg_hrs_attended,
                'RegHrsAbsent': reg_hrs_absent,
                'RemHrsAttended': 0,
                'HrsInSession': hrs_in_session,
                'SummerAttendance': 0,
                'SummerMembership': 0,
                'EntryDate': entry_date,
                'EntryCode': entry_code,
                'ExitDate': exit_date,
                'ExitCode': exit_code,
                'ExitDestDistrictCode': '',
                'ExitDestSchoolCode': '',
                'ExitDestComment': '',
                'SchoolChoice': 'N',
                'ExtSchlHours': 0
            }

            records.append(record)

        df_enrl = pd.DataFrame(records)
        output_path = self.k12_dir / "StuEnrlAttnd.csv"
        df_enrl.to_csv(output_path, index=False)

        print(f"✓ Generated {len(df_enrl):,} enrollment records")
        print(f"  Saved to: {output_path}")

        # Print attendance stats
        avg_attend_rate = (df_enrl['RegHrsAttended'] / df_enrl['HrsInSession']).mean()
        print(f"  Average attendance rate: {avg_attend_rate:.1%}")

        return df_enrl

    def generate_stuassign(self):
        """Generate StuAssign.csv - student course assignments"""
        print("\nGenerating StuAssign.csv...")

        records = []

        for _, student in self.df_stucore.iterrows():
            # Get child data for risk scores
            state_id_int = int(student['StateID'])
            child = self.df_child[self.df_child['Child MOSIS ID'] == state_id_int].iloc[0]

            grade = student['StudentGradeLevel']

            # All students get homeroom
            assignments = [
                {'LocCourseNum': 'HR-001', 'LocCourseName': 'Homeroom', 'LocSecNum': 'A'}
            ]

            # Add core subjects
            if grade in ['K', '01', '02', '03']:
                assignments.append({
                    'LocCourseNum': 'RD-001',
                    'LocCourseName': 'Reading',
                    'LocSecNum': 'A'
                })
                assignments.append({
                    'LocCourseNum': 'MA-001',
                    'LocCourseName': 'Math',
                    'LocSecNum': 'A'
                })

            # Add reading intervention if developmental risk is high
            # Contextually influenced by parent education
            if grade in ['01', '02', '03']:
                dev_score = child['developmental_score']
                parent_ed_numeric = child['parent_education_numeric']

                # Base probability from developmental risk
                if dev_score > 35:
                    base_intervention_prob = 0.40
                elif dev_score > 25:
                    base_intervention_prob = 0.20
                else:
                    base_intervention_prob = 0.05

                # Parent education adjustment
                ed_adjustment = (3.5 - parent_ed_numeric) * 0.03
                intervention_prob = base_intervention_prob + ed_adjustment

                if random.random() < intervention_prob or student['ReadingSuccessPlan'] == 'REC RSP':
                    assignments.append({
                        'LocCourseNum': 'RD-INT',
                        'LocCourseName': 'Reading Intervention',
                        'LocSecNum': 'B'
                    })

            # Generate assignment records
            for i, assignment in enumerate(assignments, 1):
                record = {
                    'CollectionVersion': '2026Oct1.0StuAssign',
                    'CurrentSchoolYear': student['CurrentSchoolYear'],
                    'ReportingDistrictCode': student['ReportingDistrictCode'],
                    'ReportingSchoolCode': student['ReportingSchoolCode'],
                    'StateID': student['StateID'],
                    'LocalStudentID': student['LocalStudentID'],
                    'StudentLastName': student['LastName'],
                    'StudentFirstName': student['FirstName'],
                    'StudentMiddleName': student['MiddleName'],
                    'StudentNameSuffix': student['Suffix'],
                    'StudentDateOfBirth': student['DateOfBirth'],
                    'StudentGradeLevel': grade,
                    'StudentGender': student['Gender'],
                    'StudentRaceEthn': student['RaceEthnicity'],
                    'AssignNum': i,
                    'DualCreditSite': '',
                    'ReceivingCollDistCode': '',
                    'SendDistCode': '',
                    'SendSchoolCode': '',
                    'EDSSN': f"{random.randint(100000000, 999999999)}",
                    'PosCode': '01',
                    'CTEProgType': '',
                    'Disadvantaged': 'Y' if student['LunchStatus'] in ['F', 'R'] else 'N',
                    'IEPDisability': student['IEPDisability'],
                    'Adult': 'N',
                    'LocCourseNum': assignment['LocCourseNum'],
                    'LocCourseName': assignment['LocCourseName'],
                    'LocSecNum': assignment['LocSecNum'],
                    'CourseNum': ''
                }
                records.append(record)

        df_assign = pd.DataFrame(records)
        output_path = self.k12_dir / "StuAssign.csv"
        df_assign.to_csv(output_path, index=False)

        print(f"✓ Generated {len(df_assign):,} course assignments")
        print(f"  Saved to: {output_path}")

        return df_assign

    def generate_assessments(self):
        """Generate assessment participation files (MAP and WIDA) with outcomes"""
        print("\nGenerating Assessment files...")

        map_records = []
        wida_records = []

        for _, student in self.df_stucore.iterrows():
            grade = student['StudentGradeLevel']
            school_year = student['CurrentSchoolYear']

            # Get child data for risk scores to correlate with outcomes
            state_id_int = int(student['StateID'])
            child = self.df_child[self.df_child['Child MOSIS ID'] == state_id_int].iloc[0]

            # MAP for K-03 (Reading and Math) with scale scores
            if grade in ['K', '01', '02', '03']:
                for subject in ['Reading', 'Math']:
                    # Generate scale score based on grade, subject, and ECIDS risk
                    scale_score, performance_level = self.generate_map_score(
                        grade, subject, child, student
                    )

                    # For Grade 3 Reading, add reading band for prediction
                    grade3_reading_band = ''
                    if grade == '03' and subject == 'Reading':
                        if performance_level == 'Advanced':
                            grade3_reading_band = 'Above Grade Level'
                        elif performance_level == 'Proficient':
                            grade3_reading_band = 'On Grade Level'
                        elif performance_level == 'Basic':
                            grade3_reading_band = 'Below Grade Level'
                        else:
                            grade3_reading_band = 'Well Below Grade Level'

                    record = {
                        'CollectionVersion': '2026MAPSPR1.0AsmPre',
                        'CurrentSchoolYear': school_year,
                        'ReportingDistrictCode': student['ReportingDistrictCode'],
                        'ReportingSchoolCode': student['ReportingSchoolCode'],
                        'StateID': student['StateID'],
                        'LocalStudentID': student['LocalStudentID'],
                        'LastName': student['LastName'],
                        'FirstName': student['FirstName'],
                        'MiddleName': student['MiddleName'],
                        'Suffix': student['Suffix'],
                        'DateOfBirth': student['DateOfBirth'],
                        'StudentGradeLevel': grade,
                        'Gender': student['Gender'],
                        'RaceEthnicity': student['RaceEthnicity'],
                        'Assessment': 'MAP',
                        'TstMethod': 'CBT',
                        'EDFirstName': 'Test',
                        'EDLastName': 'Administrator',
                        'Subject': subject,
                        'Period': 'Spring',
                        'Sort': '1',
                        'ExaminerEmail': 'testadmin@school.edu',
                        'ScaleScore': scale_score,
                        'PerformanceLevel': performance_level,
                        'Grade3ReadingBand': grade3_reading_band
                    }
                    map_records.append(record)

            # WIDA for ELL students (K-03 only, not PK for realism)
            if student['LEPELL'] == 'RCV' and grade in ['K', '01', '02', '03']:
                # Generate WIDA composite score (1.0-6.0)
                wida_score, wida_level = self.generate_wida_score(child, student)

                record = {
                    'CollectionVersion': '2026LEPELL1.0AsmPre',
                    'CurrentSchoolYear': school_year,
                    'ReportingDistrictCode': student['ReportingDistrictCode'],
                    'ReportingSchoolCode': student['ReportingSchoolCode'],
                    'StateID': student['StateID'],
                    'LocalStudentID': student['LocalStudentID'],
                    'LastName': student['LastName'],
                    'FirstName': student['FirstName'],
                    'MiddleName': student['MiddleName'],
                    'Suffix': student['Suffix'],
                    'DateOfBirth': student['DateOfBirth'],
                    'StudentGradeLevel': grade,
                    'Gender': student['Gender'],
                    'RaceEthnicity': student['RaceEthnicity'],
                    'Assessment': 'WIDA ACCESS',
                    'TstMethod': 'CBT',
                    'EDFirstName': 'ELL',
                    'EDLastName': 'Coordinator',
                    'Subject': 'English Language Proficiency',
                    'Period': 'Winter',
                    'Sort': '1',
                    'ExaminerEmail': 'ellcoord@school.edu',
                    'CompositeScore': wida_score,
                    'ProficiencyLevel': wida_level
                }
                wida_records.append(record)

        # Save MAP
        df_map = pd.DataFrame(map_records)
        output_path = self.k12_dir / "MAP.csv"
        df_map.to_csv(output_path, index=False)
        print(f"✓ Generated {len(df_map):,} MAP assessment records")
        print(f"  Saved to: {output_path}")

        # Save WIDA
        df_wida = pd.DataFrame(wida_records)
        output_path = self.k12_dir / "WIDA.csv"
        df_wida.to_csv(output_path, index=False)
        print(f"✓ Generated {len(df_wida):,} WIDA assessment records")
        print(f"  Saved to: {output_path}")

        return df_map, df_wida

    def generate_discipline(self):
        """Generate StuDiscipline.csv - discipline incidents"""
        print("\nGenerating StuDiscipline.csv...")

        records = []

        # Incident rates by grade
        incident_rates = {
            'PK': 0.005,
            'K': 0.01,
            '01': 0.02,
            '02': 0.03,
            '03': 0.04
        }

        offense_types = ['A', 'D', 'T', 'E', 'V', 'N', 'W', 'O']
        removal_types = ['ISS', 'OSS', 'EXP']

        for _, student in self.df_stucore.iterrows():
            grade = student['StudentGradeLevel']

            # Get child data for context score
            state_id_int = int(student['StateID'])
            child = self.df_child[self.df_child['Child MOSIS ID'] == state_id_int].iloc[0]

            # Base incident probability
            base_prob = incident_rates.get(grade, 0.01)

            # Increase probability for high context risk (family stressors)
            # Context is primary driver, not parent education
            context_score = child['context_score']
            if context_score > 40:
                incident_prob = base_prob * 3.0
            elif context_score > 25:
                incident_prob = base_prob * 1.5
            else:
                incident_prob = base_prob

            # Generate incident if probability met
            if random.random() < incident_prob:
                # Offense date during school year (Sept-May)
                school_year = student['CurrentSchoolYear']
                month_choices = [9, 10, 11, 12, 1, 2, 3, 4, 5]
                month = random.choice(month_choices)
                if month <= 5:
                    year = school_year
                else:
                    year = school_year - 1
                offense_date = f"{year}-{month:02d}-{random.randint(1, 28):02d}"

                # Select offense and removal type
                offense_type = random.choice(offense_types)
                removal_type = random.choice(removal_types)

                # Length of removal
                if removal_type == 'ISS':
                    length_removed = random.randint(1, 3)
                elif removal_type == 'OSS':
                    length_removed = random.randint(1, 10)
                else:  # EXP
                    length_removed = random.randint(10, 180)

                record = {
                    'CollectionVersion': '2026Jun1.0StuDiscipline',
                    'CurrentSchoolYear': school_year,
                    'AttendingDistrictCode': student['AttendingDistrictCode'],
                    'AttendingSchoolCode': student['AttendingSchoolCode'],
                    'ReportingDistrictCode': student['ReportingDistrictCode'],
                    'ReportingSchoolCode': student['ReportingSchoolCode'],
                    'ResidentDistrictCode': student['ResidentDistrictCode'],
                    'ResidentSchoolCode': student['ResidentSchoolCode'],
                    'StateID': student['StateID'],
                    'LocalStudentID': student['LocalStudentID'],
                    'LastName': student['LastName'],
                    'FirstName': student['FirstName'],
                    'MiddleName': student['MiddleName'],
                    'Suffix': student['Suffix'],
                    'DateOfBirth': student['DateOfBirth'],
                    'StudentGradeLevel': grade,
                    'Gender': student['Gender'],
                    'RaceEthnicity': student['RaceEthnicity'],
                    'OffenseDate': offense_date,
                    'OffenseType': offense_type,
                    'WeaponType': '',
                    'DisciplineRemoval': removal_type,
                    'LengthRemoved': length_removed,
                    'ModifiedLength': 'N',
                    'API': 'N',
                    'LEPELL': student['LEPELL'],
                    'IEPDisability': student['IEPDisability']
                }
                records.append(record)

        df_discipline = pd.DataFrame(records)
        output_path = self.k12_dir / "StuDiscipline.csv"
        df_discipline.to_csv(output_path, index=False)

        print(f"✓ Generated {len(df_discipline):,} discipline incidents")
        print(f"  Saved to: {output_path}")

        # Show discipline by grade
        if len(df_discipline) > 0:
            print("\nDiscipline incidents by grade:")
            print(df_discipline['StudentGradeLevel'].value_counts().sort_index())

        return df_discipline

    def generate_all(self):
        """Generate all K-12 files"""
        print("="*80)
        print("K-12 SYNTHETIC DATA GENERATION")
        print("="*80)
        print(f"Generating K-12 data for {len(self.df_child):,} ECIDS children")
        print(f"School years: {self.school_years}")
        print()
        print("Contextual variables included:")
        print("  - Parent education level (influences K readiness, RSP, attendance)")
        print("  - Primary language (determines ELL/LEP status, WIDA participation)")
        print()

        # Generate all files
        self.generate_stucore()
        self.generate_stuenrlattnd()
        self.generate_stuassign()
        self.generate_assessments()
        self.generate_discipline()

        print("\n" + "="*80)
        print("✓ K-12 DATA GENERATION COMPLETE")
        print("="*80)
        print(f"\nFiles saved to: {self.k12_dir}/")
        print("\nGenerated files:")
        for file in sorted(self.k12_dir.glob("*.csv")):
            size_kb = file.stat().st_size / 1024
            print(f"  - {file.name:25} ({size_kb:>8.1f} KB)")


if __name__ == "__main__":
    generator = K12DataGenerator()
    generator.generate_all()
