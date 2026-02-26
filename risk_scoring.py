"""
ECIDS Readiness Risk Index - Risk Scoring Engine

Calculates composite readiness risk scores across four domains:
1. Stability (participation continuity, gaps, mobility)
2. Engagement (attendance, screening completion, immunizations)
3. Developmental (COS outcomes, disability status)
4. Family Context (poverty, household stressors, homelessness)

Author: Claude Code
Date: 2026-02-26
"""

import pandas as pd
import numpy as np
from pathlib import Path


class ReadinessRiskScorer:
    """Calculate composite readiness risk scores from ECIDS data"""

    def __init__(self, data_dir="synthetic_data"):
        """Load all ECIDS flat files"""
        self.data_dir = Path(data_dir)
        self.load_data()

    def load_data(self):
        """Load all 9 CSV files"""
        print("Loading ECIDS data files...")
        self.df_child = pd.read_csv(self.data_dir / "Child.csv")
        self.df_related = pd.read_csv(self.data_dir / "RelatedPerson.csv")
        self.df_participation = pd.read_csv(self.data_dir / "ChildParticipation.csv")
        self.df_disability = pd.read_csv(self.data_dir / "ChildDisability.csv")
        self.df_monitoring = pd.read_csv(self.data_dir / "ChildMonitoring.csv")
        self.df_insurance = pd.read_csv(self.data_dir / "ChildInsurance.csv")
        self.df_immunization = pd.read_csv(self.data_dir / "ChildImmunization.csv")
        self.df_screening = pd.read_csv(self.data_dir / "ChildScreening.csv")
        self.df_outcomes = pd.read_csv(self.data_dir / "ChildOutcomes.csv")
        print(f"✓ Loaded data for {len(self.df_child):,} children")

    def calculate_all_indicators(self):
        """Calculate all risk indicators across domains"""
        print("Calculating risk indicators...")

        # Start with base child data
        risk_df = self.df_child[["Child DCN", "Child MOSIS ID"]].copy()

        # Domain 1: Stability Indicators
        stability = self.calculate_stability_indicators()
        risk_df = risk_df.merge(stability, on="Child DCN", how="left")

        # Domain 2: Engagement Indicators
        engagement = self.calculate_engagement_indicators()
        risk_df = risk_df.merge(engagement, on="Child DCN", how="left")

        # Domain 3: Developmental Indicators
        developmental = self.calculate_developmental_indicators()
        risk_df = risk_df.merge(developmental, on="Child DCN", how="left")

        # Domain 4: Family Context Indicators
        context = self.calculate_context_indicators()
        risk_df = risk_df.merge(context, on="Child DCN", how="left")

        # Calculate domain scores
        risk_df = self.calculate_domain_scores(risk_df)

        # Calculate composite risk score
        risk_df = self.calculate_composite_score(risk_df)

        print(f"✓ Calculated risk indicators for {len(risk_df):,} children")
        return risk_df

    def calculate_stability_indicators(self):
        """Domain 1: Participation stability"""
        # Participation counts and gaps
        part_stats = self.df_participation.groupby("Child DCN").agg({
            "EnrollmentDate": "count",
            "NumberOfDaysInAttendance": "sum"
        }).rename(columns={
            "EnrollmentDate": "num_participation_episodes",
            "NumberOfDaysInAttendance": "total_attendance_days"
        }).reset_index()

        # Calculate gaps between participation episodes
        self.df_participation["EnrollmentDate"] = pd.to_datetime(self.df_participation["EnrollmentDate"])
        self.df_participation["ServicePlanEndDate"] = pd.to_datetime(self.df_participation["ServicePlanEndDate"])

        gap_stats = []
        for dcn in self.df_participation["Child DCN"].unique():
            child_parts = self.df_participation[
                self.df_participation["Child DCN"] == dcn
            ].sort_values("EnrollmentDate")

            num_gaps = 0
            max_gap = 0
            has_long_gap = False

            if len(child_parts) >= 2:
                for i in range(len(child_parts) - 1):
                    end_date = child_parts.iloc[i]["ServicePlanEndDate"]
                    start_date = child_parts.iloc[i + 1]["EnrollmentDate"]
                    gap_days = (start_date - end_date).days

                    if gap_days > 30:
                        num_gaps += 1
                        max_gap = max(max_gap, gap_days)
                        if gap_days > 180:  # 6 months
                            has_long_gap = True

            gap_stats.append({
                "Child DCN": dcn,
                "num_enrollment_gaps": num_gaps,
                "max_gap_days": max_gap,
                "has_gap_over_6mo": has_long_gap
            })

        df_gaps = pd.DataFrame(gap_stats)

        # Merge stability indicators
        stability = part_stats.merge(df_gaps, on="Child DCN", how="left")
        stability["num_enrollment_gaps"] = stability["num_enrollment_gaps"].fillna(0)
        stability["max_gap_days"] = stability["max_gap_days"].fillna(0)
        stability["has_gap_over_6mo"] = stability["has_gap_over_6mo"].fillna(False)

        return stability

    def calculate_engagement_indicators(self):
        """Domain 2: Program engagement (attendance, screenings, immunizations)"""
        engagement_data = []

        for dcn in self.df_child["Child DCN"]:
            # Attendance (average days per participation episode)
            child_parts = self.df_participation[self.df_participation["Child DCN"] == dcn]
            if len(child_parts) > 0:
                avg_attendance = child_parts["NumberOfDaysInAttendance"].mean()
            else:
                avg_attendance = 0

            # Screening completion (out of 6 possible: 6mo, 12mo, 18mo, 24mo, 36mo, 48mo)
            screenings = self.df_screening[self.df_screening["Child DCN"] == dcn]
            num_screenings = len(screenings)
            screening_completion_rate = num_screenings / 6.0  # Max 6 screenings

            # Immunization compliance (out of ~12 expected)
            immunizations = self.df_immunization[self.df_immunization["Child DCN"] == dcn]
            num_immunizations = len(immunizations)
            immunization_compliance_rate = min(num_immunizations / 12.0, 1.0)

            engagement_data.append({
                "Child DCN": dcn,
                "avg_attendance_days": avg_attendance,
                "num_screenings_completed": num_screenings,
                "screening_completion_rate": screening_completion_rate,
                "num_immunizations": num_immunizations,
                "immunization_compliance_rate": immunization_compliance_rate,
                "missed_screening": num_screenings < 4  # Flag if < 4 screenings
            })

        return pd.DataFrame(engagement_data)

    def calculate_developmental_indicators(self):
        """Domain 3: Developmental outcomes and disability"""
        dev_data = []

        for dcn in self.df_child["Child DCN"]:
            # Disability status
            has_disability = dcn in self.df_disability["Child DCN"].values

            # COS outcomes (average rating)
            outcomes = self.df_outcomes[self.df_outcomes["Child DCN"] == dcn]
            if len(outcomes) > 0:
                # Average COS ratings (convert to numeric)
                cos_cols = ["COSRatingA.Description", "COSRatingB.Description",
                           "COSRatingC.Description", "COSRatingPhysical.Description"]
                cos_ratings = []
                for col in cos_cols:
                    cos_ratings.extend(pd.to_numeric(outcomes[col], errors='coerce').dropna().tolist())

                avg_cos_rating = np.mean(cos_ratings) if cos_ratings else 4.0
                has_outcomes = True
            else:
                avg_cos_rating = None
                has_outcomes = False

            dev_data.append({
                "Child DCN": dcn,
                "has_disability": has_disability,
                "has_outcomes_data": has_outcomes,
                "avg_cos_rating": avg_cos_rating,
                "low_outcomes": avg_cos_rating < 4.0 if avg_cos_rating is not None else False
            })

        return pd.DataFrame(dev_data)

    def calculate_context_indicators(self):
        """Domain 4: Family and contextual risk factors"""
        context_data = []

        for _, child in self.df_child.iterrows():
            dcn = child["Child DCN"]

            # Convert Yes/No to boolean
            homelessness = child["HomelessnessStatus"] == "Yes"
            migrant = child["MigrantStatus"] == "Yes"
            abuse = child["ChildAbuseNeglect"] == "Yes"
            incarcerated = child["FamilyMemberIncarcerated"] == "Yes"
            substance = child["FamilyMemberSubstanceUseAbuse"] == "Yes"
            depression = child["HouseholdMemberDepressedOrMentallyIll"] == "Yes"
            loss_parent = child["LossOfParent"] == "Yes"

            # Foster care flag
            in_foster_care = child["FosterCareStartDate"] != ""

            # Deep poverty flag
            deep_poverty = child["PercentOfFederalPovertyLevel"] < 100

            # Count household stressors
            num_stressors = sum([incarcerated, substance, depression, loss_parent])

            context_data.append({
                "Child DCN": dcn,
                "homelessness_flag": homelessness,
                "migrant_flag": migrant,
                "abuse_flag": abuse,
                "incarcerated_flag": incarcerated,
                "substance_flag": substance,
                "depression_flag": depression,
                "loss_parent_flag": loss_parent,
                "in_foster_care": in_foster_care,
                "deep_poverty": deep_poverty,
                "num_household_stressors": num_stressors
            })

        return pd.DataFrame(context_data)

    def calculate_domain_scores(self, risk_df):
        """Calculate 0-100 score for each domain (higher = more risk)"""

        # Domain 1: Stability Score (0-100)
        # More gaps, longer gaps, more episodes = higher instability
        risk_df["stability_score"] = (
            (risk_df["num_enrollment_gaps"].fillna(0) * 15) +  # Each gap adds 15 points
            (risk_df["has_gap_over_6mo"].astype(int) * 25) +    # Long gap adds 25 points
            (risk_df["num_participation_episodes"].fillna(1) > 3).astype(int) * 15 +  # Multiple episodes
            (risk_df["total_attendance_days"].fillna(0) < 100).astype(int) * 20  # Low attendance
        ).clip(0, 100)

        # Domain 2: Engagement Score (0-100)
        # Missing screenings, low immunizations, low attendance = higher risk
        risk_df["engagement_score"] = (
            (1 - risk_df["screening_completion_rate"].fillna(0)) * 35 +  # Missing screenings
            (1 - risk_df["immunization_compliance_rate"].fillna(0)) * 25 +  # Missing immunizations
            (risk_df["avg_attendance_days"].fillna(0) < 80).astype(int) * 40  # Low attendance
        ).clip(0, 100)

        # Domain 3: Developmental Score (0-100)
        # Disability, low COS ratings = higher risk
        risk_df["developmental_score"] = (
            risk_df["has_disability"].astype(int) * 40 +  # Disability
            risk_df["low_outcomes"].astype(int) * 35 +     # Low COS ratings
            (~risk_df["has_outcomes_data"]).astype(int) * 25  # No outcome data
        ).clip(0, 100)

        # Domain 4: Context Score (0-100)
        # Poverty, household stressors, homelessness, foster care = higher risk
        risk_df["context_score"] = (
            risk_df["deep_poverty"].astype(int) * 25 +
            risk_df["homelessness_flag"].astype(int) * 25 +
            risk_df["in_foster_care"].astype(int) * 20 +
            risk_df["abuse_flag"].astype(int) * 15 +
            (risk_df["num_household_stressors"] * 5)  # Each stressor adds 5 points
        ).clip(0, 100)

        return risk_df

    def calculate_composite_score(self, risk_df):
        """Calculate composite readiness risk score (weighted average of domains)"""

        # Weights for each domain (must sum to 1.0)
        weights = {
            "stability_score": 0.30,      # 30% - Participation continuity
            "engagement_score": 0.25,      # 25% - Program engagement
            "developmental_score": 0.25,   # 25% - Developmental outcomes
            "context_score": 0.20          # 20% - Family context
        }

        # Calculate weighted composite score
        risk_df["composite_risk_score"] = (
            risk_df["stability_score"] * weights["stability_score"] +
            risk_df["engagement_score"] * weights["engagement_score"] +
            risk_df["developmental_score"] * weights["developmental_score"] +
            risk_df["context_score"] * weights["context_score"]
        )

        # Assign risk tier based on composite score
        risk_df["risk_tier"] = pd.cut(
            risk_df["composite_risk_score"],
            bins=[0, 30, 60, 100],
            labels=["Low", "Moderate", "High"],
            include_lowest=True
        )

        return risk_df

    def generate_full_dataset(self):
        """Generate complete dataset with risk scores and all indicators"""
        # Calculate all risk indicators
        risk_df = self.calculate_all_indicators()

        # Start with ALL child data
        full_df = self.df_child.copy()

        # Merge risk scores and indicators
        # Only keep new columns from risk_df (avoid duplicates)
        risk_cols_to_merge = [col for col in risk_df.columns if col not in full_df.columns or col == "Child DCN"]
        risk_df_filtered = risk_df[risk_cols_to_merge]

        full_df = full_df.merge(risk_df_filtered, on="Child DCN", how="left")

        # Add participation data (aggregated)
        part_agg = self.df_participation.groupby("Child DCN").agg({
            "RefProgramType.Description": lambda x: ", ".join(x.unique()),
            "EnrollmentDate": "count"
        }).rename(columns={
            "RefProgramType.Description": "programs_enrolled",
            "EnrollmentDate": "total_enrollments"
        }).reset_index()

        full_df = full_df.merge(part_agg, on="Child DCN", how="left")

        # Convert Yes/No columns to boolean for easier filtering
        yes_no_cols = [
            "HomelessnessStatus", "MigrantStatus", "ChildAbuseNeglect",
            "FamilyMemberIncarcerated", "FamilyMemberSubstanceUseAbuse",
            "HouseholdMemberDepressedOrMentallyIll", "LossOfParent"
        ]
        for col in yes_no_cols:
            if col in full_df.columns:
                full_df[col] = full_df[col] == "Yes"

        # Foster care flag (add if not already present from risk_df)
        if "in_foster_care" not in full_df.columns:
            full_df["in_foster_care"] = full_df["FosterCareStartDate"] != ""

        return full_df


if __name__ == "__main__":
    # Test the risk scorer
    scorer = ReadinessRiskScorer()
    risk_data = scorer.calculate_all_indicators()

    print("\n" + "=" * 70)
    print("RISK SCORE SUMMARY")
    print("=" * 70)
    print(f"\nRisk Tier Distribution:")
    print(risk_data["risk_tier"].value_counts().sort_index())

    print(f"\nComposite Risk Score Statistics:")
    print(risk_data["composite_risk_score"].describe())

    print(f"\nDomain Score Averages:")
    print(f"  Stability:      {risk_data['stability_score'].mean():.1f}")
    print(f"  Engagement:     {risk_data['engagement_score'].mean():.1f}")
    print(f"  Developmental:  {risk_data['developmental_score'].mean():.1f}")
    print(f"  Context:        {risk_data['context_score'].mean():.1f}")

    # Save to CSV
    output_path = Path("synthetic_data") / "risk_scores.csv"
    risk_data.to_csv(output_path, index=False)
    print(f"\n✓ Risk scores saved to: {output_path}")
