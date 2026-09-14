/**
 * Field config for the Incident Investigation Report (IIR), replicating
 * FF-HSE-FOR-001 (rev. 001). Same pattern as lib/pmvLogs.ts: one config
 * array per template section, each column carrying its own bilingual
 * label — components/ficc/IirFormModal.tsx renders every section
 * generically from this file. Supabase column names (snake_case) map
 * 1:1 onto incident_investigations.
 */

export type IirFieldType = "text" | "textarea" | "date" | "time" | "select" | "checkbox" | "multiselect";

export interface IirField {
  key: string;
  en: string;
  ar: string;
  type: IirFieldType;
  options?: string[];
  /** Renders full-width instead of sharing a grid row. */
  wide?: boolean;
}

export interface IirSection {
  key: string;
  titleEn: string;
  titleAr: string;
  /** When set, this section has an "N/A — doesn't apply" checkbox (this
   *  field key) that hides/disables the rest of the section's fields. */
  naKey?: string;
  fields: IirField[];
}

export const IIR_SECTIONS: IirSection[] = [
  {
    key: "general",
    titleEn: "General Information",
    titleAr: "معلومات عامة",
    fields: [
      { key: "pm_team", en: "PM / Team", ar: "مدير المشروع / الفريق", type: "text" },
      { key: "incident_site", en: "Incident Site", ar: "موقع الحادث", type: "text" },
      { key: "other_location", en: "Other Location Detail", ar: "تفاصيل الموقع (أخرى)", type: "text" },
      { key: "report_date", en: "Report Date", ar: "تاريخ التقرير", type: "date" },
      { key: "report_time", en: "Report Time", ar: "وقت التقرير", type: "time" },
      {
        key: "work_related",
        en: "Work Related?",
        ar: "هل الحادث متعلق بالعمل؟",
        type: "select",
        options: ["Yes", "No"],
      },
      {
        key: "employer_type",
        en: "Employer Type",
        ar: "نوع جهة العمل",
        type: "select",
        options: ["Direct Employee", "Subcontractor", "Visitor", "Other"],
      },
      {
        key: "incident_summary",
        en: "Incident Summary",
        ar: "ملخص الحادث",
        type: "textarea",
        wide: true,
      },
    ],
  },
  {
    key: "employee",
    titleEn: "Employee Involved",
    titleAr: "الموظف المتأثر",
    fields: [
      { key: "employee_first_name", en: "First Name", ar: "الاسم الأول", type: "text" },
      { key: "employee_surname", en: "Surname", ar: "اسم العائلة", type: "text" },
      { key: "employee_dob", en: "Date of Birth", ar: "تاريخ الميلاد", type: "date" },
      { key: "employee_company", en: "Company", ar: "الشركة", type: "text" },
      { key: "employee_id_no", en: "ID No.", ar: "رقم الهوية", type: "text" },
      { key: "employee_hire_date", en: "Hire Date", ar: "تاريخ التعيين", type: "date" },
      { key: "employee_trade", en: "Trade", ar: "المهنة", type: "text" },
      { key: "employee_position", en: "Position", ar: "المنصب الوظيفي", type: "text" },
    ],
  },
  {
    key: "injury",
    titleEn: "Injury / Illness",
    titleAr: "الإصابة / المرض",
    naKey: "injury_na",
    fields: [
      {
        key: "injury_case_type",
        en: "Case Type",
        ar: "نوع الحالة",
        type: "select",
        options: [
          "First Aid Case",
          "Medical Treatment Case",
          "Restricted Work Case",
          "Lost Time Case",
          "Fatality",
        ],
      },
      { key: "injury_body_part", en: "Body Part Affected", ar: "الجزء المصاب من الجسم", type: "text" },
      {
        key: "injury_ems_transport",
        en: "EMS / Transport to Hospital?",
        ar: "هل تم نقله بالإسعاف / للمستشفى؟",
        type: "select",
        options: ["Yes", "No"],
      },
      { key: "injury_treatment", en: "Treatment Given", ar: "العلاج المقدم", type: "textarea" },
      { key: "injury_description", en: "Injury Description", ar: "وصف الإصابة", type: "textarea", wide: true },
    ],
  },
  {
    key: "nearMiss",
    titleEn: "Near Miss",
    titleAr: "حالة الوشك (Near Miss)",
    naKey: "near_miss_na",
    fields: [
      {
        key: "near_miss_risk",
        en: "Potential Risk(s)",
        ar: "المخاطر المحتملة",
        type: "multiselect",
        options: ["Injury", "Fatality", "Property Damage", "Environmental", "Process Safety"],
        wide: true,
      },
    ],
  },
  {
    key: "environmental",
    titleEn: "Environmental",
    titleAr: "بيئي",
    naKey: "env_na",
    fields: [
      {
        key: "env_category",
        en: "Category",
        ar: "الفئة",
        type: "select",
        options: ["Spill", "Emission", "Waste", "Noise", "Other"],
      },
      { key: "env_substance_released", en: "Substance Released", ar: "المادة المنطلقة", type: "text" },
      { key: "env_equipment_source", en: "Equipment / Source", ar: "المعدة / المصدر", type: "text" },
      { key: "env_released_to", en: "Released To", ar: "انطلقت إلى", type: "text" },
      {
        key: "env_severity",
        en: "Severity",
        ar: "الشدة",
        type: "select",
        options: ["Low", "Medium", "High"],
      },
      { key: "env_quantity", en: "Quantity", ar: "الكمية", type: "text" },
      { key: "env_unit", en: "Unit", ar: "الوحدة", type: "text" },
      { key: "env_cleanup_disposition", en: "Cleanup / Disposition", ar: "الإجراء / التخلص", type: "textarea" },
      { key: "env_process_cause", en: "Process Cause", ar: "سبب العملية", type: "textarea" },
    ],
  },
  {
    key: "property",
    titleEn: "Property Damage",
    titleAr: "تلف الممتلكات",
    naKey: "property_na",
    fields: [
      { key: "property_owner", en: "Owner", ar: "المالك", type: "text" },
      { key: "property_equipment_type", en: "Equipment Type", ar: "نوع المعدة", type: "text" },
      { key: "property_make_model_type", en: "Make / Model / Type", ar: "الصنع / الموديل / النوع", type: "text" },
      { key: "property_plant_reg_no", en: "Plant Reg. No.", ar: "رقم تسجيل المعدة", type: "text" },
      { key: "property_vandalism", en: "Vandalism Suspected?", ar: "هل يشتبه بتخريب متعمد؟", type: "checkbox" },
      { key: "property_fire", en: "Fire Involved?", ar: "هل نتج عنه حريق؟", type: "checkbox" },
      {
        key: "property_value_category",
        en: "Value Category",
        ar: "فئة القيمة",
        type: "select",
        options: ["< $1,000", "$1,000 - $10,000", "$10,000 - $100,000", "> $100,000"],
      },
    ],
  },
  {
    key: "utility",
    titleEn: "Utility Damage",
    titleAr: "تلف المرافق",
    naKey: "utility_na",
    fields: [
      {
        key: "utility_type",
        en: "Utility Type",
        ar: "نوع المرفق",
        type: "select",
        options: ["Electrical", "Water", "Gas", "Telecom", "Sewage", "Other"],
      },
    ],
  },
  {
    key: "causation",
    titleEn: "Causation",
    titleAr: "الأسباب",
    fields: [
      { key: "activity_in_progress", en: "Activity in Progress", ar: "النشاط الجاري وقت الحادث", type: "text", wide: true },
      { key: "process_condition_cause", en: "Process / Condition Cause", ar: "سبب متعلق بالعملية / الحالة", type: "textarea" },
      { key: "action_cause", en: "Action (Behaviour) Cause", ar: "سبب متعلق بالفعل / السلوك", type: "textarea" },
      { key: "object_cause", en: "Object / Equipment Cause", ar: "سبب متعلق بالجسم / المعدة", type: "textarea" },
      { key: "impact_energy", en: "Impact / Energy Source", ar: "مصدر التأثير / الطاقة", type: "text" },
      { key: "behaviour_condition_environment", en: "Behaviour, Condition & Environment", ar: "السلوك والحالة والبيئة", type: "textarea", wide: true },
    ],
  },
  {
    key: "riskAssessment",
    titleEn: "Risk Assessment",
    titleAr: "تقييم المخاطر",
    fields: [
      {
        key: "potential_severity_level",
        en: "Potential Severity Level",
        ar: "مستوى الشدة المحتملة",
        type: "select",
        options: ["Minor", "Moderate", "Major", "Catastrophic"],
      },
      {
        key: "impact_type",
        en: "Impact Type",
        ar: "نوع التأثير",
        type: "select",
        options: ["People", "Environment", "Asset", "Reputation"],
      },
      {
        key: "risk_probability",
        en: "Probability",
        ar: "الاحتمالية",
        type: "select",
        options: ["Rare", "Unlikely", "Possible", "Likely", "Almost Certain"],
      },
      {
        key: "total_loss_potential",
        en: "Total Loss Potential",
        ar: "إجمالي احتمالية الخسارة",
        type: "select",
        options: ["Low", "Medium", "High", "Extreme"],
      },
    ],
  },
  {
    key: "rootCause",
    titleEn: "Root Cause Analysis",
    titleAr: "تحليل السبب الجذري",
    fields: [
      {
        key: "causal_factors",
        en: "Causal Factor(s)",
        ar: "العوامل المسببة",
        type: "multiselect",
        options: [
          "Lack of Training",
          "Inadequate Procedure",
          "PPE Not Used",
          "Equipment Failure",
          "Poor Communication",
          "Time Pressure",
          "Supervision Gap",
          "Other",
        ],
        wide: true,
      },
      {
        key: "life_saving_rule_violation",
        en: "Life Saving Rule Violation",
        ar: "مخالفة قاعدة إنقاذ الحياة",
        type: "text",
      },
      { key: "causal_analysis_discussion", en: "Causal Analysis Discussion", ar: "مناقشة التحليل السببي", type: "textarea", wide: true },
      { key: "root_cause", en: "Root Cause", ar: "السبب الجذري", type: "textarea", wide: true },
    ],
  },
];

/** Corrective Actions sub-table columns (incident_corrective_actions),
 *  rendered as an editable repeating grid rather than a generic section. */
export const CORRECTIVE_ACTION_COLUMNS: IirField[] = [
  { key: "action", en: "Corrective Action", ar: "الإجراء التصحيحي", type: "text" },
  {
    key: "hierarchy_of_control",
    en: "Hierarchy of Control",
    ar: "التسلسل الهرمي للضبط",
    type: "select",
    options: ["Elimination", "Substitution", "Engineering", "Administrative", "PPE"],
  },
  { key: "responsible_person", en: "Responsible Person", ar: "المسؤول", type: "text" },
  { key: "due_date", en: "Due Date", ar: "تاريخ الاستحقاق", type: "date" },
  { key: "completed_date", en: "Completed Date", ar: "تاريخ الإنجاز", type: "date" },
];

/** Photo Information Sheet, simplified to a generic multi-photo upload
 *  (the template's merged-cell photo grid doesn't translate to a normal
 *  form field) plus a checklist of what's attached. */
export const ATTACHMENT_OPTIONS: { key: string; en: string; ar: string }[] = [
  { key: "photos", en: "Photos", ar: "صور" },
  { key: "witness_statements", en: "Witness Statements", ar: "إفادات الشهود" },
  { key: "medical_report", en: "Medical Report", ar: "تقرير طبي" },
  { key: "equipment_inspection", en: "Equipment Inspection Record", ar: "سجل فحص المعدة" },
  { key: "training_records", en: "Training Records", ar: "سجلات التدريب" },
  { key: "toolbox_talk", en: "Toolbox Talk Record", ar: "سجل توك بوكس" },
  { key: "police_report", en: "Police / Authority Report", ar: "تقرير الشرطة / الجهة الرسمية" },
  { key: "other", en: "Other", ar: "أخرى" },
];
