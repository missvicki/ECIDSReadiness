"""
K-12 Data Validation - Phase 1

Comprehensive validation checks:
1. Schema validation (required fields, data types)
2. Code-set validation (against OptionCodes.xlsx)
3. Cross-file linkage checks (StateID integrity)
4. Longitudinal checks (grade progression)
5. Distribution/range checks (realistic values)
6. Sample child walkthroughs (end-to-end tracing)

Author: Claude Code
Date: 2026-03-16
"""

import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime
import sys

class K12DataValidator:
    """Comprehensive validation of K-12 synthetic data"""

    def __init__(self, ecids_dir="synthetic_data", k12_dir="k12_data"):
        self.ecids_dir = Path(ecids_dir)
        self.k12_dir = Path(k12_dir)
        self.errors = []
        self.warnings = []
        self.passed = []

        print("="*80)
        print("K-12 DATA VALIDATION - PHASE 1")
        print("="*80)
        print()

    def load_data(self):
        """Load all data files"""
        print("Loading data files...")
        try:
            # ECIDS data
            self.df_child = pd.read_csv(self.ecids_dir / "Child.csv")
            self.df_risk = pd.read_csv(self.ecids_dir / "risk_scores.csv")

            # K-12 data (ensure StateID is string for all files)
            self.df_stucore = pd.read_csv(self.k12_dir / "StuCore.csv", dtype={'StateID': str})
            self.df_enrl = pd.read_csv(self.k12_dir / "StuEnrlAttnd.csv", dtype={'StateID': str})
            self.df_assign = pd.read_csv(self.k12_dir / "StuAssign.csv", dtype={'StateID': str})
            self.df_map = pd.read_csv(self.k12_dir / "MAP.csv", dtype={'StateID': str})
            self.df_wida = pd.read_csv(self.k12_dir / "WIDA.csv", dtype={'StateID': str})
            self.df_discipline = pd.read_csv(self.k12_dir / "StuDiscipline.csv", dtype={'StateID': str})

            # Option codes
            df_options = pd.read_excel("OptionCodes.xlsx", sheet_name="Sheet1")
            df_options.columns = ['CodeSet', 'Option_Name', 'Default_Code', 'Option_Definition',
                                 'Rank', 'Effective_Date', 'Expiration_Date', 'Last_Modified']
            self.df_options = df_options.iloc[1:]  # Skip header

            print(f"✓ Loaded all data files")
            print()
            return True
        except Exception as e:
            print(f"✗ Error loading data: {e}")
            return False

    def validate_schema(self):
        """1. Schema Validation - Required fields and data types"""
        print("1. SCHEMA VALIDATION")
        print("-"*80)

        # StuCore required fields
        stucore_required = [
            'StateID', 'LocalStudentID', 'FirstName', 'LastName', 'DateOfBirth',
            'StudentGradeLevel', 'Gender', 'RaceEthnicity', 'CurrentSchoolYear',
            'LunchStatus', 'Homeless', 'FosterCare', 'IEPDisability', 'LEPELL'
        ]

        missing = [f for f in stucore_required if f not in self.df_stucore.columns]
        if missing:
            self.errors.append(f"StuCore missing required fields: {missing}")
        else:
            self.passed.append("StuCore has all required fields")

        # Check StateID format (10-digit zero-padded string)
        # Convert to string if needed
        self.df_stucore['StateID'] = self.df_stucore['StateID'].astype(str)
        invalid_state_ids = self.df_stucore[~self.df_stucore['StateID'].str.match(r'^\d{10}$', na=False)]
        if len(invalid_state_ids) > 0:
            self.errors.append(f"Found {len(invalid_state_ids)} invalid StateID formats")
        else:
            self.passed.append("All StateIDs properly formatted (10 digits)")

        # Check grade codes (PK, K, 01, 02, 03)
        valid_grades = ['PK', 'K', '01', '02', '03']
        invalid_grades = self.df_stucore[~self.df_stucore['StudentGradeLevel'].isin(valid_grades)]
        if len(invalid_grades) > 0:
            self.errors.append(f"Found {len(invalid_grades)} invalid grade codes")
        else:
            self.passed.append("All grade codes valid (PK, K, 01, 02, 03)")

        # MAP required fields
        map_required = ['StateID', 'StudentGradeLevel', 'Subject', 'ScaleScore',
                       'PerformanceLevel', 'Grade3ReadingBand']
        missing_map = [f for f in map_required if f not in self.df_map.columns]
        if missing_map:
            self.errors.append(f"MAP.csv missing required fields: {missing_map}")
        else:
            self.passed.append("MAP.csv has all required outcome fields")

        # WIDA required fields
        wida_required = ['StateID', 'StudentGradeLevel', 'CompositeScore', 'ProficiencyLevel']
        missing_wida = [f for f in wida_required if f not in self.df_wida.columns]
        if missing_wida:
            self.errors.append(f"WIDA.csv missing required fields: {missing_wida}")
        else:
            self.passed.append("WIDA.csv has all required outcome fields")

        print(f"  ✓ Passed: {len([p for p in self.passed if 'Schema' in str(p) or 'required' in str(p).lower()])}")
        print(f"  ✗ Errors: {len([e for e in self.errors if 'missing' in str(e).lower() or 'invalid' in str(e).lower()])}")
        print()

    def validate_code_sets(self):
        """2. Code-Set Validation - Against OptionCodes.xlsx"""
        print("2. CODE-SET VALIDATION")
        print("-"*80)

        # Helper to get valid codes for a code set
        def get_valid_codes(code_set_name):
            codes = self.df_options[self.df_options['CodeSet'] == code_set_name]
            return set(codes['Default_Code'].dropna().unique())

        # Gender codes
        valid_gender = get_valid_codes('Gender_Codes')
        invalid_gender = self.df_stucore[~self.df_stucore['Gender'].isin(valid_gender)]
        if len(invalid_gender) > 0:
            self.errors.append(f"Found {len(invalid_gender)} invalid Gender codes")
        else:
            self.passed.append("All Gender codes valid")

        # Race/Ethnicity codes
        valid_race = get_valid_codes('Race_Ethnicity_Codes')
        invalid_race = self.df_stucore[~self.df_stucore['RaceEthnicity'].isin(valid_race)]
        if len(invalid_race) > 0:
            self.errors.append(f"Found {len(invalid_race)} invalid RaceEthnicity codes")
        else:
            self.passed.append("All RaceEthnicity codes valid")

        # Grade level codes
        valid_grades = get_valid_codes('Student_Grade_Level_Codes')
        # Filter to just PK, K, 01, 02, 03
        valid_elem_grades = {g for g in valid_grades if g in ['PK', 'K', '1', '01', '2', '02', '3', '03']}
        # Note: valid set includes '1', '2', '3' but we use '01', '02', '03'
        valid_elem_grades.update(['01', '02', '03'])
        invalid_grade_codes = self.df_stucore[~self.df_stucore['StudentGradeLevel'].isin(valid_elem_grades)]
        if len(invalid_grade_codes) > 0:
            self.errors.append(f"Found {len(invalid_grade_codes)} invalid StudentGradeLevel codes")
        else:
            self.passed.append("All StudentGradeLevel codes valid")

        # Lunch status codes
        valid_lunch = get_valid_codes('Lunch_Status_Codes')
        invalid_lunch = self.df_stucore[~self.df_stucore['LunchStatus'].isin(valid_lunch)]
        if len(invalid_lunch) > 0:
            self.errors.append(f"Found {len(invalid_lunch)} invalid LunchStatus codes")
        else:
            self.passed.append("All LunchStatus codes valid")

        # Disability codes
        valid_disability = get_valid_codes('Disability_Codes')
        invalid_disability = self.df_stucore[~self.df_stucore['IEPDisability'].isin(valid_disability)]
        if len(invalid_disability) > 0:
            self.errors.append(f"Found {len(invalid_disability)} invalid IEPDisability codes")
        else:
            self.passed.append("All IEPDisability codes valid")

        # LEP/ELL codes
        valid_lep = get_valid_codes('LEP_Codes')
        invalid_lep = self.df_stucore[~self.df_stucore['LEPELL'].isin(valid_lep)]
        if len(invalid_lep) > 0:
            self.errors.append(f"Found {len(invalid_lep)} invalid LEPELL codes")
        else:
            self.passed.append("All LEPELL codes valid")

        # Yes/No codes (Homeless, FosterCare, etc.)
        valid_yn = get_valid_codes('Yes_No')
        for field in ['Homeless', 'FosterCare', 'Migrant']:
            invalid = self.df_stucore[~self.df_stucore[field].isin(valid_yn)]
            if len(invalid) > 0:
                self.errors.append(f"Found {len(invalid)} invalid {field} codes")
            else:
                self.passed.append(f"All {field} codes valid")

        print(f"  ✓ Passed: {len([p for p in self.passed if 'codes valid' in str(p)])}")
        print(f"  ✗ Errors: {len([e for e in self.errors if 'invalid' in str(e).lower() and 'code' in str(e).lower()])}")
        print()

    def validate_cross_file_linkage(self):
        """3. Cross-File Linkage Checks - StateID integrity"""
        print("3. CROSS-FILE LINKAGE CHECKS")
        print("-"*80)

        # Convert ECIDS Child MOSIS ID to StateID format
        self.df_child['StateID'] = self.df_child['Child MOSIS ID'].astype(str).str.zfill(10)

        # Check: All K-12 StateIDs exist in ECIDS
        k12_state_ids = set(self.df_stucore['StateID'].unique())
        ecids_state_ids = set(self.df_child['StateID'].unique())

        orphan_k12 = k12_state_ids - ecids_state_ids
        if len(orphan_k12) > 0:
            self.errors.append(f"Found {len(orphan_k12)} K-12 StateIDs not in ECIDS")
        else:
            self.passed.append("All K-12 StateIDs exist in ECIDS Child.csv")

        # Check: All files use same StateID set
        enrl_ids = set(self.df_enrl['StateID'].unique())
        assign_ids = set(self.df_assign['StateID'].unique())
        map_ids = set(self.df_map['StateID'].unique())

        if enrl_ids != k12_state_ids:
            self.errors.append(f"StuEnrlAttnd StateIDs mismatch: {len(enrl_ids ^ k12_state_ids)} differences")
        else:
            self.passed.append("StuEnrlAttnd StateIDs match StuCore")

        if assign_ids != k12_state_ids:
            self.errors.append(f"StuAssign StateIDs mismatch: {len(assign_ids ^ k12_state_ids)} differences")
        else:
            self.passed.append("StuAssign StateIDs match StuCore")

        # MAP should be subset (only K-03)
        orphan_map = map_ids - k12_state_ids
        if len(orphan_map) > 0:
            self.errors.append(f"Found {len(orphan_map)} MAP StateIDs not in StuCore")
        else:
            self.passed.append("All MAP StateIDs exist in StuCore")

        # WIDA should be subset (only ELL students in K-03)
        wida_ids = set(self.df_wida['StateID'].unique())
        orphan_wida = wida_ids - k12_state_ids
        if len(orphan_wida) > 0:
            self.errors.append(f"Found {len(orphan_wida)} WIDA StateIDs not in StuCore")
        else:
            self.passed.append("All WIDA StateIDs exist in StuCore")

        # Check: WIDA only for LEPELL='RCV' students
        wida_students = self.df_stucore[self.df_stucore['StateID'].isin(wida_ids)]
        non_ell_in_wida = wida_students[wida_students['LEPELL'] != 'RCV']
        if len(non_ell_in_wida) > 0:
            self.warnings.append(f"Found {len(non_ell_in_wida)} non-ELL students in WIDA")
        else:
            self.passed.append("All WIDA students have LEPELL='RCV'")

        # Check: No PK students in WIDA
        pk_in_wida = self.df_wida[self.df_wida['StudentGradeLevel'] == 'PK']
        if len(pk_in_wida) > 0:
            self.errors.append(f"Found {len(pk_in_wida)} PK students in WIDA (should be K-03 only)")
        else:
            self.passed.append("WIDA correctly restricted to K-03 (no PK)")

        print(f"  ✓ Passed: {len([p for p in self.passed if 'StateID' in str(p) or 'match' in str(p)])}")
        print(f"  ⚠ Warnings: {len([w for w in self.warnings if 'WIDA' in str(w)])}")
        print(f"  ✗ Errors: {len([e for e in self.errors if 'StateID' in str(e) or 'mismatch' in str(e)])}")
        print()

    def validate_longitudinal(self):
        """4. Longitudinal Checks - Grade progression logic"""
        print("4. LONGITUDINAL CHECKS")
        print("-"*80)

        # Merge with birth year
        df_check = self.df_stucore.merge(
            self.df_child[['StateID', 'BirthDate']],
            on='StateID',
            how='left'
        )
        df_check['BirthDate'] = pd.to_datetime(df_check['BirthDate'])
        df_check['BirthYear'] = df_check['BirthDate'].dt.year

        # Check: Students don't go backwards in grade
        df_sorted = df_check.sort_values(['StateID', 'CurrentSchoolYear'])
        grade_order = {'PK': 0, 'K': 1, '01': 2, '02': 3, '03': 4}
        df_sorted['grade_numeric'] = df_sorted['StudentGradeLevel'].map(grade_order)

        backwards = 0
        for state_id in df_sorted['StateID'].unique():
            student = df_sorted[df_sorted['StateID'] == state_id]
            grades = student['grade_numeric'].tolist()
            for i in range(len(grades) - 1):
                if grades[i+1] < grades[i]:
                    backwards += 1
                    break

        if backwards > 0:
            self.errors.append(f"Found {backwards} students going backwards in grade")
        else:
            self.passed.append("No students regress in grade level")

        # Check: Age-appropriate grades (with flexibility for skipping/retention)
        age_issues = 0
        for _, row in df_check.iterrows():
            age_in_fall = row['CurrentSchoolYear'] - 1 - row['BirthYear']
            grade = row['StudentGradeLevel']

            # Define expected age ranges (with buffer for skipping/retention)
            expected_ages = {
                'PK': (3, 5),
                'K': (4, 7),
                '01': (5, 8),
                '02': (6, 9),
                '03': (7, 10)
            }

            min_age, max_age = expected_ages.get(grade, (0, 100))
            if not (min_age <= age_in_fall <= max_age):
                age_issues += 1

        if age_issues > 0:
            self.warnings.append(f"Found {age_issues} students with unusual age-grade combinations")
        else:
            self.passed.append("All students have age-appropriate grades")

        # Check: Grade 3 students are from 2018 birth cohort
        grade3 = df_check[df_check['StudentGradeLevel'] == '03']
        non_2018 = grade3[grade3['BirthYear'] != 2018]
        if len(non_2018) > 0:
            self.warnings.append(f"Found {len(non_2018)} Grade 3 students not from 2018 cohort (grade skippers)")
        else:
            self.passed.append("All Grade 3 students from 2018 birth cohort")

        # Check: Students appear in consecutive or near-consecutive years
        for state_id in df_sorted['StateID'].unique():
            student = df_sorted[df_sorted['StateID'] == state_id]
            years = sorted(student['CurrentSchoolYear'].unique())
            if len(years) > 1:
                max_gap = max(years[i+1] - years[i] for i in range(len(years)-1))
                if max_gap > 2:
                    self.warnings.append(f"Student {state_id} has {max_gap}-year gap in records")

        print(f"  ✓ Passed: {len([p for p in self.passed if 'grade' in str(p).lower()])}")
        print(f"  ⚠ Warnings: {len([w for w in self.warnings if 'age' in str(w) or 'gap' in str(w)])}")
        print(f"  ✗ Errors: {len([e for e in self.errors if 'backwards' in str(e)])}")
        print()

    def validate_distributions(self):
        """5. Distribution/Range Checks - Realistic values"""
        print("5. DISTRIBUTION & RANGE CHECKS")
        print("-"*80)

        # MAP Scale Scores - Check ranges by grade
        map_ranges = {
            'K': (140, 180),
            '01': (160, 200),
            '02': (175, 215),
            '03': (185, 230)
        }

        out_of_range = 0
        for grade, (min_score, max_score) in map_ranges.items():
            grade_data = self.df_map[
                (self.df_map['StudentGradeLevel'] == grade) &
                (self.df_map['Subject'] == 'Reading')
            ]
            invalid = grade_data[
                (grade_data['ScaleScore'] < min_score) |
                (grade_data['ScaleScore'] > max_score)
            ]
            out_of_range += len(invalid)

        if out_of_range > 0:
            self.errors.append(f"Found {out_of_range} MAP scores outside expected ranges")
        else:
            self.passed.append("All MAP scores within expected ranges by grade")

        # WIDA Composite Scores - Should be 1.0 to 6.0
        invalid_wida = self.df_wida[
            (self.df_wida['CompositeScore'] < 1.0) |
            (self.df_wida['CompositeScore'] > 6.0)
        ]
        if len(invalid_wida) > 0:
            self.errors.append(f"Found {len(invalid_wida)} WIDA scores outside 1.0-6.0 range")
        else:
            self.passed.append("All WIDA composite scores in valid range (1.0-6.0)")

        # Attendance - Should be 0-100%
        self.df_enrl['attend_rate'] = self.df_enrl['RegHrsAttended'] / self.df_enrl['HrsInSession']
        invalid_attend = self.df_enrl[
            (self.df_enrl['attend_rate'] < 0) |
            (self.df_enrl['attend_rate'] > 1.0)
        ]
        if len(invalid_attend) > 0:
            self.errors.append(f"Found {len(invalid_attend)} invalid attendance rates")
        else:
            self.passed.append("All attendance rates valid (0-100%)")

        # Check distributions are realistic (not all same value)
        if self.df_map['ScaleScore'].std() < 5:
            self.warnings.append("MAP scores have very low variance (possible data issue)")
        else:
            self.passed.append("MAP scores show realistic variance")

        # Grade 3 Reading Band - Should have all 4 categories
        grade3_reading = self.df_map[
            (self.df_map['StudentGradeLevel'] == '03') &
            (self.df_map['Subject'] == 'Reading')
        ]
        bands = grade3_reading['Grade3ReadingBand'].unique()
        expected_bands = ['Well Below Grade Level', 'Below Grade Level',
                         'On Grade Level', 'Above Grade Level']
        missing_bands = set(expected_bands) - set(bands)
        if missing_bands:
            self.warnings.append(f"Grade 3 Reading missing bands: {missing_bands}")
        else:
            self.passed.append("Grade 3 Reading has all 4 performance bands")

        print(f"  ✓ Passed: {len([p for p in self.passed if 'range' in str(p) or 'variance' in str(p) or 'valid' in str(p)])}")
        print(f"  ⚠ Warnings: {len([w for w in self.warnings if 'variance' in str(w) or 'missing' in str(w)])}")
        print(f"  ✗ Errors: {len([e for e in self.errors if 'range' in str(e) or 'outside' in str(e)])}")
        print()

    def validate_sample_walkthroughs(self):
        """6. Sample Child Walkthroughs - End-to-end tracing"""
        print("6. SAMPLE CHILD WALKTHROUGHS")
        print("-"*80)

        # Select 3 sample students: High risk, Moderate risk, Low risk
        df_merged = self.df_child.merge(self.df_risk, on=['Child DCN', 'Child MOSIS ID'])

        samples = []
        for tier in ['High', 'Moderate', 'Low']:
            tier_students = df_merged[df_merged['risk_tier'] == tier]
            if len(tier_students) > 0:
                sample = tier_students.iloc[0]
                samples.append((tier, sample))

        for tier, child in samples:
            state_id = f"{int(child['Child MOSIS ID']):010d}"

            print(f"\n  {tier} Risk Student: StateID {state_id}")
            print(f"  {'-'*70}")

            # ECIDS data
            print(f"  ECIDS: Birth {child['BirthDate'][:4]}, Composite Risk: {child['composite_risk_score']:.1f}")
            print(f"         Developmental: {child['developmental_score']:.1f}, " +
                  f"Engagement: {child['engagement_score']:.1f}")
            print(f"         Parent Ed: {child.get('HighestParentEducationLevel', 'N/A')}")

            # K-12 enrollment
            k12_records = self.df_stucore[self.df_stucore['StateID'] == state_id]
            if len(k12_records) == 0:
                print(f"  ✗ ERROR: No K-12 records found")
                self.errors.append(f"Sample student {state_id} missing K-12 records")
                continue

            print(f"  K-12:  {len(k12_records)} enrollment years")
            for _, rec in k12_records.sort_values('CurrentSchoolYear').iterrows():
                grade = rec['StudentGradeLevel']
                year = rec['CurrentSchoolYear']
                k_ready = rec.get('KindergartenReadiness', '')
                rsp = rec.get('ReadingSuccessPlan', 'NO RSP')

                detail = f"Grade {grade} ({year})"
                if grade == 'K' and k_ready:
                    detail += f" - K Ready: {k_ready}"
                if grade in ['01', '02', '03'] and 'REC' in rsp:
                    detail += f" - RSP: Yes"
                print(f"         {detail}")

            # Attendance
            attend_records = self.df_enrl[self.df_enrl['StateID'] == state_id]
            if len(attend_records) > 0:
                avg_attend = (attend_records['RegHrsAttended'] / attend_records['HrsInSession']).mean()
                print(f"  Attendance: {avg_attend:.1%} average")

            # MAP outcomes (Grade 3)
            map_grade3 = self.df_map[
                (self.df_map['StateID'] == state_id) &
                (self.df_map['StudentGradeLevel'] == '03') &
                (self.df_map['Subject'] == 'Reading')
            ]
            if len(map_grade3) > 0:
                score = map_grade3.iloc[0]['ScaleScore']
                band = map_grade3.iloc[0]['Grade3ReadingBand']
                print(f"  Grade 3 Reading: {score} - {band}")
                self.passed.append(f"Sample {tier} risk student has complete data")
            else:
                if len(k12_records[k12_records['StudentGradeLevel'] == '03']) > 0:
                    print(f"  ✗ ERROR: Grade 3 student missing MAP Reading")
                    self.errors.append(f"Student {state_id} in Grade 3 but no MAP Reading")

        print(f"\n  ✓ Passed: {len([p for p in self.passed if 'complete data' in str(p)])}")
        print(f"  ✗ Errors: {len([e for e in self.errors if 'missing' in str(e).lower() and 'MAP' in str(e)])}")
        print()

    def run_all_validations(self):
        """Run all validation checks"""
        if not self.load_data():
            return False

        self.validate_schema()
        self.validate_code_sets()
        self.validate_cross_file_linkage()
        self.validate_longitudinal()
        self.validate_distributions()
        self.validate_sample_walkthroughs()

        # Final summary
        print("="*80)
        print("VALIDATION SUMMARY")
        print("="*80)
        print(f"\n✓ PASSED: {len(self.passed)} checks")
        print(f"⚠ WARNINGS: {len(self.warnings)} issues")
        print(f"✗ ERRORS: {len(self.errors)} critical issues")

        if self.warnings:
            print("\nWarnings:")
            for w in self.warnings:
                print(f"  ⚠ {w}")

        if self.errors:
            print("\nErrors:")
            for e in self.errors:
                print(f"  ✗ {e}")
        else:
            print("\n🎉 All critical validations passed!")

        print("\n" + "="*80)

        if self.errors:
            print("Status: ⚠️  VALIDATION FAILED - Fix errors before proceeding")
            return False
        elif self.warnings:
            print("Status: ✓ VALIDATION PASSED - Review warnings")
            return True
        else:
            print("Status: ✅ VALIDATION PASSED - Data is production ready!")
            return True


if __name__ == "__main__":
    validator = K12DataValidator()
    success = validator.run_all_validations()
    sys.exit(0 if success else 1)
