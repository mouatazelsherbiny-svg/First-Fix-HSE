/**
 * Config for the 11 PMV Log tables (from the uploaded PMV Logs workbook).
 * Each entry drives the generic log table + form in app/pmv/page.tsx via
 * components/pmv/PmvLogTable.tsx and PmvLogFormModal.tsx — one config, no
 * per-log bespoke UI code. Columns use the exact Supabase column names so
 * rows can be read/written with no camelCase mapping layer.
 *
 * To add a field to a log: add one entry to its `columns` array below —
 * the table and form pick it up automatically. The Supabase column must
 * exist first (see the matching migration).
 */

export type PmvFieldType = "text" | "number" | "date" | "select";

export interface PmvLogColumn {
  /** Supabase column name (snake_case). */
  key: string;
  en: string;
  ar: string;
  type: PmvFieldType;
  /** For type "select" — the allowed values (same list, both languages). */
  options?: string[];
}

export interface PmvLogDefinition {
  key: string;
  table: string;
  titleEn: string;
  titleAr: string;
  purposeEn: string;
  purposeAr: string;
  columns: PmvLogColumn[];
}

const PMV_OPTIONS_OWNERSHIP: string[] = ["Owned", "Rented"];
const PMV_OPTIONS_EQUIPMENT_CATEGORY: string[] = ["Generator", "Compressor", "Pump", "Forklift", "Excavator", "Lighting", "Vehicle", "Welding Machine", "Concrete Mixer", "Crane", "Scaffolding", "Scissor Lift", "Truck", "Bus", "Pickup", "Mini Van", "Other"];
const PMV_OPTIONS_FUEL_TYPE: string[] = ["Diesel", "Petrol", "LPG", "Electric", "CNG"];
const PMV_OPTIONS_SHIFT: string[] = ["Day", "Night", "Full Day (24hr)"];
const PMV_OPTIONS_DOWNTIME_CATEGORY: string[] = ["Mechanical", "Electrical", "Hydraulic", "Scheduled PM", "Operator Error", "Fuel Issue", "Waiting for Parts", "Standby - No Work", "External (Rental Co.)", "Other"];
const PMV_OPTIONS_REPAIR_BY: string[] = ["Internal", "External Contractor", "Manufacturer Service", "Rental Co. Responsibility"];
const PMV_OPTIONS_ASSET_STATUS: string[] = ["Active", "Idle", "Under Repair", "Returned to Rental Co.", "Demobilized", "Disposed"];
const PMV_OPTIONS_DEPLOYMENT_STATUS: string[] = ["Available for Use", "Breakdown"];
const PMV_OPTIONS_UTILIZATION_STATUS: string[] = ["In-Use", "Free"];
const PMV_OPTIONS_OPERATOR_STATUS: string[] = ["Present", "On Leave"];
const PMV_OPTIONS_MAINTENANCE_STATUS: string[] = ["Due", "Completed", "Overdue"];
const PMV_OPTIONS_DOWNTIME_REASON: string[] = ["Preventive", "Breakdown"];
const PMV_OPTIONS_DOWNTIME_STATUS: string[] = ["Open", "In Progress", "Closed"];
const PMV_OPTIONS_WARRANTY_STATUS: string[] = ["Under Warranty", "Expired", "N/A"];

export const PMV_LOG_DEFINITIONS: PmvLogDefinition[] = [
  {
    key: "assetRegister",
    table: "pmv_asset_register",
    titleEn: "Asset Register",
    titleAr: "سجل الأصول",
    purposeEn: "Master list of all owned & rented equipment",
    purposeAr: "القائمة الرئيسية لكل المعدات المملوكة والمستأجرة",
    columns: [
      { key: "asset_id", en: "Asset ID", ar: "رقم الأصل", type: "text", },
      { key: "equipment_name", en: "Equipment Name", ar: "اسم المعدة", type: "text", },
      { key: "project_code", en: "Project Code", ar: "كود المشروع", type: "text", },
      { key: "equipment_category", en: "Equipment Category", ar: "فئة المعدة", type: "select", options: PMV_OPTIONS_EQUIPMENT_CATEGORY, },
      { key: "ownership", en: "Ownership", ar: "الملكية", type: "select", options: PMV_OPTIONS_OWNERSHIP, },
      { key: "brand", en: "Brand", ar: "الماركة", type: "text", },
      { key: "model", en: "Model", ar: "الموديل", type: "text", },
      { key: "plate_serial_no", en: "Plate / Serial No.", ar: "رقم اللوحة / التسلسلي", type: "text", },
      { key: "capacity_power_kw", en: "Capacity / Power (kW)", ar: "القدرة (kW)", type: "number", },
      { key: "warranty_status", en: "Warranty Status", ar: "حالة الضمان", type: "select", options: PMV_OPTIONS_WARRANTY_STATUS, },
      { key: "asset_deployment_date", en: "Asset Deployment Date", ar: "تاريخ تشغيل الأصل", type: "date", },
      { key: "reading_mileage_at_deployment", en: "Reading / Mileage at Deployment", ar: "القراءة عند التشغيل", type: "number", },
      { key: "asset_decommissioning_date", en: "Asset Decommissioning Date", ar: "تاريخ إيقاف الأصل", type: "date", },
      { key: "asset_transfer_site", en: "Asset Transfer - Site", ar: "نقل الأصل - الموقع", type: "text", },
      { key: "consumables_replacement_due_date", en: "Consumables Replacement Due Date", ar: "تاريخ استبدال المستهلكات", type: "date", },
      { key: "consumables_replacement_type", en: "Consumables Replacement Type", ar: "نوع المستهلكات المستبدلة", type: "text", },
      { key: "last_periodic_maintenance_date", en: "Last Periodic Maintenance Date", ar: "تاريخ آخر صيانة دورية", type: "date", },
      { key: "next_periodic_maintenance_due", en: "Next Periodic Maintenance Due", ar: "موعد الصيانة الدورية القادمة", type: "date", },
      { key: "third_party_inspection_expiry", en: "Third Party Inspection Expiry", ar: "انتهاء فحص الطرف الثالث", type: "date", },
      { key: "insurance_expiry", en: "Insurance Expiry", ar: "انتهاء التأمين", type: "date", },
      { key: "tank_capacity", en: "Tank Capacity", ar: "سعة الخزان", type: "number", },
      { key: "manufacturer_rate_litre_hour", en: "Manufacturer Rate (Litre/Hour)", ar: "معدل الاستهلاك (لتر/ساعة)", type: "number", },
      { key: "operator_name", en: "Operator Name", ar: "اسم المشغل", type: "text", },
      { key: "deployment_status", en: "Deployment Status", ar: "حالة التشغيل", type: "select", options: PMV_OPTIONS_DEPLOYMENT_STATUS, },
      { key: "utilization_status", en: "Utilization Status", ar: "حالة الاستخدام", type: "select", options: PMV_OPTIONS_UTILIZATION_STATUS, },
      { key: "rental_company", en: "Rental Company", ar: "شركة التأجير", type: "text", },
      { key: "rental_agreement_expiry_date", en: "Rental Agreement Expiry Date", ar: "انتهاء عقد الإيجار", type: "date", },
      { key: "rental_rate_sar_day", en: "Rental Rate (SAR/Day)", ar: "سعر الإيجار (ريال/يوم)", type: "number", },
      { key: "rental_start_date", en: "Rental Start Date", ar: "تاريخ بدء الإيجار", type: "date", },
      { key: "rental_end_date", en: "Rental End Date", ar: "تاريخ انتهاء الإيجار", type: "date", },
      { key: "downtime_hrs", en: "Downtime (Hrs)", ar: "التوقف (ساعات)", type: "number", },
      { key: "monthly_rental_cost_sar", en: "Monthly Rental Cost (SAR)", ar: "تكلفة الإيجار الشهرية", type: "number", },
      { key: "current_status", en: "Current Status", ar: "الحالة الحالية", type: "select", options: PMV_OPTIONS_ASSET_STATUS, },
    ],
  },
  {
    key: "operationLog",
    table: "pmv_operation_log",
    titleEn: "Operation Log",
    titleAr: "سجل التشغيل",
    purposeEn: "Operational monitoring - asset request vs actual deployment",
    purposeAr: "متابعة تشغيلية - الطلب مقابل التشغيل الفعلي",
    columns: [
      { key: "date", en: "Date", ar: "التاريخ", type: "date", },
      { key: "asset_id", en: "Asset ID", ar: "رقم الأصل", type: "text", },
      { key: "plate_serial_no", en: "Plate / Serial No.", ar: "رقم اللوحة / التسلسلي", type: "text", },
      { key: "equipment_name", en: "Equipment Name", ar: "اسم المعدة", type: "text", },
      { key: "ownership", en: "Ownership", ar: "الملكية", type: "select", options: PMV_OPTIONS_OWNERSHIP, },
      { key: "deployment_status", en: "Deployment Status", ar: "حالة النشر", type: "text", },
      { key: "equipment_requisition_by", en: "Equipment Requisition By", ar: "طلب المعدة من", type: "text", },
      { key: "planned_location", en: "Planned Location", ar: "الموقع المخطط", type: "text", },
      { key: "planned_start_date", en: "Planned Start Date", ar: "تاريخ البدء المخطط", type: "date", },
      { key: "planned_end_date", en: "Planned End Date", ar: "تاريخ الانتهاء المخطط", type: "date", },
      { key: "actual_location", en: "Actual Location", ar: "الموقع الفعلي", type: "text", },
      { key: "actual_start_date", en: "Actual Start Date", ar: "تاريخ البدء الفعلي", type: "date", },
      { key: "actual_end_date", en: "Actual End Date", ar: "تاريخ الانتهاء الفعلي", type: "date", },
      { key: "no_of_days", en: "No. Of Days", ar: "عدد الأيام", type: "number", },
    ],
  },
  {
    key: "utilizationLog",
    table: "pmv_utilization_log",
    titleEn: "Utilization Log",
    titleAr: "سجل الاستخدام",
    purposeEn: "Monthly asset utilization, idle time tracker & fuel consumption",
    purposeAr: "استخدام الأصول الشهري، متابعة وقت التعطل واستهلاك الوقود",
    columns: [
      { key: "asset_id", en: "Asset ID", ar: "رقم الأصل", type: "text", },
      { key: "plate_no", en: "Plate No", ar: "رقم اللوحة", type: "text", },
      { key: "equipment_name", en: "Equipment Name", ar: "اسم المعدة", type: "text", },
      { key: "ownership", en: "Ownership", ar: "الملكية", type: "select", options: PMV_OPTIONS_OWNERSHIP, },
      { key: "total_shift_hours_month", en: "Total Shift Hours (Month)", ar: "إجمالي ساعات الوردية (الشهر)", type: "number", },
      { key: "hours_operated_month", en: "Hours Operated (Month)", ar: "ساعات التشغيل (الشهر)", type: "number", },
      { key: "fuel_received_month_ltr", en: "Fuel Received (Month, Ltr)", ar: "الوقود المستلم (الشهر، لتر)", type: "number", },
      { key: "fuel_consumption_hour", en: "Fuel Consumption / Hour", ar: "استهلاك الوقود / ساعة", type: "number", },
      { key: "manufacturer_rate_litre_hour", en: "Manufacturer Rate (Litre/Hour)", ar: "معدل الشركة المصنعة (لتر/ساعة)", type: "number", },
      { key: "variance", en: "Variance", ar: "الفرق", type: "number", },
      { key: "operator_name", en: "Operator Name", ar: "اسم المشغل", type: "text", },
      { key: "operator_id", en: "Operator ID", ar: "رقم المشغل", type: "text", },
      { key: "project_code", en: "Project Code", ar: "كود المشروع", type: "text", },
      { key: "speciality", en: "Speciality", ar: "التخصص", type: "text", },
      { key: "location", en: "Location", ar: "الموقع", type: "text", },
      { key: "work_description", en: "Work Description", ar: "وصف العمل", type: "text", },
      { key: "idle_hours", en: "Idle Hours", ar: "ساعات التعطل", type: "number", },
      { key: "downtime_hours", en: "Downtime Hours", ar: "ساعات التوقف", type: "number", },
      { key: "utilization_hours", en: "Utilization Hours", ar: "ساعات الاستخدام", type: "number", },
      { key: "utilization", en: "Utilization %", ar: "نسبة الاستخدام %", type: "number", },
      { key: "issue", en: "Issue", ar: "المشكلة", type: "text", },
      { key: "repair_by", en: "Repair By", ar: "الإصلاح بواسطة", type: "select", options: PMV_OPTIONS_REPAIR_BY, },
      { key: "shift_supervisor_foreman", en: "Shift Supervisor / Foreman", ar: "مشرف الوردية", type: "text", },
      { key: "remarks", en: "Remarks", ar: "ملاحظات", type: "text", },
    ],
  },
  {
    key: "downtimeLog",
    table: "pmv_downtime_log",
    titleEn: "Downtime Log",
    titleAr: "سجل التوقفات",
    purposeEn: "Equipment breakdown & maintenance tracker",
    purposeAr: "متابعة أعطال وصيانة المعدات",
    columns: [
      { key: "date_reported", en: "Date Reported", ar: "تاريخ الإبلاغ", type: "date", },
      { key: "asset_description", en: "Asset Description", ar: "وصف الأصل", type: "text", },
      { key: "asset_id", en: "Asset ID", ar: "رقم الأصل", type: "text", },
      { key: "plate_no", en: "Plate No", ar: "رقم اللوحة", type: "text", },
      { key: "asset_category", en: "Asset Category", ar: "فئة الأصل", type: "select", options: PMV_OPTIONS_EQUIPMENT_CATEGORY, },
      { key: "ownership", en: "Ownership", ar: "الملكية", type: "select", options: PMV_OPTIONS_OWNERSHIP, },
      { key: "reason_for_downtime", en: "Reason for Downtime", ar: "سبب التوقف", type: "select", options: PMV_OPTIONS_DOWNTIME_REASON, },
      { key: "breakdown_time", en: "Breakdown Time", ar: "وقت العطل", type: "text", },
      { key: "restart_time", en: "Restart Time", ar: "وقت إعادة التشغيل", type: "text", },
      { key: "total_downtime_hrs", en: "Total Downtime (Hrs)", ar: "إجمالي التوقف (ساعات)", type: "number", },
      { key: "downtime_category", en: "Downtime Category", ar: "فئة التوقف", type: "select", options: PMV_OPTIONS_DOWNTIME_CATEGORY, },
      { key: "fault_description", en: "Fault Description", ar: "وصف العطل", type: "text", },
      { key: "action_taken", en: "Action Taken", ar: "الإجراء المتخذ", type: "text", },
      { key: "repaired_by", en: "Repaired By", ar: "تم الإصلاح بواسطة", type: "select", options: PMV_OPTIONS_REPAIR_BY, },
      { key: "technician_contractor", en: "Technician / Contractor", ar: "الفني / المقاول", type: "text", },
      { key: "parts_replaced", en: "Parts Replaced", ar: "القطع المستبدلة", type: "text", },
      { key: "parts_cost_sar", en: "Parts Cost (SAR)", ar: "تكلفة القطع", type: "number", },
      { key: "labour_cost_sar", en: "Labour Cost (SAR)", ar: "تكلفة العمالة", type: "number", },
      { key: "total_repair_cost_sar", en: "Total Repair Cost (SAR)", ar: "إجمالي تكلفة الإصلاح", type: "number", },
      { key: "status", en: "Status", ar: "الحالة", type: "select", options: PMV_OPTIONS_DOWNTIME_STATUS, },
    ],
  },
  {
    key: "dieselIssuance",
    table: "pmv_diesel_issuance",
    titleEn: "Diesel Issuance",
    titleAr: "صرف الديزل",
    purposeEn: "Fuel decanting record",
    purposeAr: "سجل تعبئة الوقود",
    columns: [
      { key: "date", en: "Date", ar: "التاريخ", type: "date", },
      { key: "equipment_name", en: "Equipment Name", ar: "اسم المعدة", type: "text", },
      { key: "asset_no_serial_no", en: "Asset No. / Serial No", ar: "رقم الأصل / التسلسلي", type: "text", },
      { key: "equipment_operator", en: "Equipment Operator", ar: "مشغل المعدة", type: "text", },
      { key: "employee_operator_id", en: "Employee / Operator ID", ar: "رقم الموظف / المشغل", type: "text", },
      { key: "location", en: "Location", ar: "الموقع", type: "text", },
      { key: "quantity_issued_ltr", en: "Quantity Issued (Ltr)", ar: "الكمية المصروفة (لتر)", type: "number", },
      { key: "time", en: "Time", ar: "الوقت", type: "text", },
      { key: "operator_signature", en: "Operator Signature", ar: "توقيع المشغل", type: "text", },
    ],
  },
  {
    key: "dieselStock",
    table: "pmv_diesel_stock",
    titleEn: "Diesel Stock Tracker",
    titleAr: "متابعة مخزون الديزل",
    purposeEn: "Daily fuel stock reconciliation",
    purposeAr: "تسوية مخزون الوقود اليومية",
    columns: [
      { key: "date", en: "Date", ar: "التاريخ", type: "date", },
      { key: "opening_stock_litres", en: "Opening Stock (Litres)", ar: "المخزون الافتتاحي (لتر)", type: "number", },
      { key: "quantity_received_ltr", en: "Quantity Received (Ltr)", ar: "الكمية المستلمة (لتر)", type: "number", },
      { key: "supplier_name", en: "Supplier Name", ar: "اسم المورد", type: "text", },
      { key: "received_into", en: "Received Into", ar: "استلمت في", type: "text", },
      { key: "tanker_vehicle_no", en: "Tanker Vehicle No.", ar: "رقم صهريج النقل", type: "text", },
      { key: "delivery_note", en: "Delivery Note", ar: "إذن التسليم", type: "text", },
      { key: "grn", en: "GRN", ar: "إذن استلام البضاعة", type: "text", },
      { key: "quantity_issued_ltr", en: "Quantity Issued (Ltr)", ar: "الكمية المصروفة (لتر)", type: "number", },
      { key: "issued_through", en: "Issued Through", ar: "صُرف عن طريق", type: "text", },
      { key: "time_interval", en: "Time Interval", ar: "الفترة الزمنية", type: "text", },
      { key: "closing_stock_litres", en: "Closing Stock (Litres)", ar: "المخزون الختامي (لتر)", type: "number", },
      { key: "physical_dip_reading", en: "Physical Dip Reading", ar: "قراءة القياس الفعلي", type: "number", },
      { key: "variance", en: "Variance", ar: "الفرق", type: "number", },
      { key: "verified_by", en: "Verified By", ar: "تم التحقق بواسطة", type: "text", },
      { key: "remarks", en: "Remarks", ar: "ملاحظات", type: "text", },
    ],
  },
  {
    key: "operatorsOwned",
    table: "pmv_operators_owned",
    titleEn: "Operators - Owned Equipment",
    titleAr: "مشغلو المعدات المملوكة",
    purposeEn: "Owned equipment operator's record",
    purposeAr: "سجل مشغلي المعدات المملوكة",
    columns: [
      { key: "project_code", en: "Project Code", ar: "كود المشروع", type: "text", },
      { key: "employee_id", en: "Employee ID", ar: "رقم الموظف", type: "text", },
      { key: "operator_name", en: "Operator Name", ar: "اسم المشغل", type: "text", },
      { key: "sponsor", en: "Sponsor", ar: "الكفيل", type: "text", },
      { key: "operator_mobile_no", en: "Operator Mobile No.", ar: "رقم جوال المشغل", type: "text", },
      { key: "iqama_no", en: "Iqama No.", ar: "رقم الإقامة", type: "text", },
      { key: "iqama_profession", en: "Iqama Profession", ar: "مهنة الإقامة", type: "text", },
      { key: "license_category", en: "License Category", ar: "فئة الرخصة", type: "text", },
      { key: "equipment_type_eligible", en: "Equipment Type Eligible", ar: "نوع المعدة المصرح بتشغيلها", type: "text", },
      { key: "tuv_certification_expiry", en: "TUV Certification Expiry", ar: "انتهاء شهادة TUV", type: "date", },
      { key: "designated_asset_id", en: "Designated Asset ID", ar: "رقم الأصل المخصص", type: "text", },
      { key: "designated_plate_no", en: "Designated Plate No.", ar: "رقم لوحة المعدة المخصصة", type: "text", },
      { key: "equipment_allocation_date", en: "Equipment Allocation Date", ar: "تاريخ تخصيص المعدة", type: "date", },
      { key: "equipment_release_date", en: "Equipment Release Date", ar: "تاريخ الإفراج عن المعدة", type: "date", },
      { key: "shift", en: "Shift", ar: "الوردية", type: "select", options: PMV_OPTIONS_SHIFT, },
      { key: "current_status", en: "Current Status", ar: "الحالة الحالية", type: "select", options: PMV_OPTIONS_OPERATOR_STATUS, },
      { key: "backup_operator", en: "Backup Operator", ar: "المشغل البديل", type: "text", },
    ],
  },
  {
    key: "operatorsRented",
    table: "pmv_operators_rented",
    titleEn: "Operators - Rented Equipment",
    titleAr: "مشغلو المعدات المستأجرة",
    purposeEn: "Rented equipment operator's record",
    purposeAr: "سجل مشغلي المعدات المستأجرة",
    columns: [
      { key: "project", en: "Project", ar: "المشروع", type: "text", },
      { key: "ff_operator_id", en: "FF Operator ID", ar: "رقم مشغل FF", type: "text", },
      { key: "operator_name", en: "Operator Name", ar: "اسم المشغل", type: "text", },
      { key: "sponsor", en: "Sponsor", ar: "الكفيل", type: "text", },
      { key: "operator_mobile_no", en: "Operator Mobile No.", ar: "رقم جوال المشغل", type: "text", },
      { key: "iqama_no", en: "Iqama No.", ar: "رقم الإقامة", type: "text", },
      { key: "iqama_profession", en: "Iqama Profession", ar: "مهنة الإقامة", type: "text", },
      { key: "license_category", en: "License Category", ar: "فئة الرخصة", type: "text", },
      { key: "equipment_type_eligible", en: "Equipment Type Eligible", ar: "نوع المعدة المصرح بتشغيلها", type: "text", },
      { key: "tuv_certification_expiry", en: "TUV Certification Expiry", ar: "انتهاء شهادة TUV", type: "date", },
      { key: "designated_asset_id", en: "Designated Asset ID", ar: "رقم الأصل المخصص", type: "text", },
      { key: "designated_plate_no", en: "Designated Plate No.", ar: "رقم لوحة المعدة المخصصة", type: "text", },
      { key: "equipment_allocation_date", en: "Equipment Allocation Date", ar: "تاريخ تخصيص المعدة", type: "date", },
      { key: "equipment_release_date", en: "Equipment Release Date", ar: "تاريخ الإفراج عن المعدة", type: "date", },
      { key: "shift", en: "Shift", ar: "الوردية", type: "select", options: PMV_OPTIONS_SHIFT, },
    ],
  },
  {
    key: "equipmentLog",
    table: "pmv_equipment_log",
    titleEn: "Equipment Log",
    titleAr: "سجل تشغيل المعدة",
    purposeEn: "Daily asset utilization & fuel receipt record",
    purposeAr: "سجل الاستخدام اليومي واستلام الوقود",
    columns: [
      { key: "date", en: "Date", ar: "التاريخ", type: "date", },
      { key: "equipment_name", en: "Equipment Name", ar: "اسم المعدة", type: "text", },
      { key: "plate_no", en: "Plate No", ar: "رقم اللوحة", type: "text", },
      { key: "project", en: "Project", ar: "المشروع", type: "text", },
      { key: "shift", en: "Shift", ar: "الوردية", type: "select", options: PMV_OPTIONS_SHIFT, },
      { key: "start_time", en: "Start Time", ar: "وقت البدء", type: "text", },
      { key: "end_time", en: "End Time", ar: "وقت الانتهاء", type: "text", },
      { key: "idle_hours", en: "Idle Hours", ar: "ساعات التعطل", type: "number", },
      { key: "down_time_hours", en: "Down Time Hours", ar: "ساعات التوقف", type: "number", },
      { key: "total_shift_hours", en: "Total Shift Hours", ar: "إجمالي ساعات الوردية", type: "number", },
      { key: "opening_reading", en: "Opening Reading", ar: "القراءة الافتتاحية", type: "number", },
      { key: "closing_reading", en: "Closing Reading", ar: "القراءة الختامية", type: "number", },
      { key: "hours_kms_operated", en: "Hours / KMs Operated", ar: "ساعات / كم التشغيل", type: "number", },
      { key: "fuel_received_ltr", en: "Fuel Received (Ltr)", ar: "الوقود المستلم (لتر)", type: "number", },
      { key: "operator_name", en: "Operator Name", ar: "اسم المشغل", type: "text", },
      { key: "operator_id", en: "Operator ID", ar: "رقم المشغل", type: "text", },
    ],
  },
  {
    key: "scheduledMaintenance",
    table: "pmv_scheduled_maintenance",
    titleEn: "Scheduled Maintenance",
    titleAr: "الصيانة المجدولة",
    purposeEn: "Planned maintenance schedule",
    purposeAr: "جدول الصيانة المخطط لها",
    columns: [
      { key: "asset_description", en: "Asset Description", ar: "وصف الأصل", type: "text", },
      { key: "asset_id", en: "Asset ID", ar: "رقم الأصل", type: "text", },
      { key: "plate_no", en: "Plate No", ar: "رقم اللوحة", type: "text", },
      { key: "asset_category", en: "Asset Category", ar: "فئة الأصل", type: "select", options: PMV_OPTIONS_EQUIPMENT_CATEGORY, },
      { key: "ownership", en: "Ownership", ar: "الملكية", type: "select", options: PMV_OPTIONS_OWNERSHIP, },
      { key: "upcoming_scheduled_maintenance", en: "Upcoming Scheduled Maintenance", ar: "الصيانة المجدولة القادمة", type: "text", },
      { key: "spare_parts_needed", en: "Spare Parts Needed", ar: "قطع الغيار المطلوبة", type: "text", },
      { key: "maintenance_frequency", en: "Maintenance Frequency", ar: "دورية الصيانة", type: "text", },
      { key: "last_maintenance_date", en: "Last Maintenance Date", ar: "تاريخ آخر صيانة", type: "date", },
      { key: "last_meter_odometer_reading", en: "Last Meter/Odometer Reading", ar: "آخر قراءة عداد", type: "number", },
      { key: "next_maintenance_date", en: "Next Maintenance Date", ar: "تاريخ الصيانة القادمة", type: "date", },
      { key: "next_meter_odometer_reading", en: "Next Meter/Odometer Reading", ar: "قراءة العداد القادمة", type: "number", },
      { key: "actual_maintenance_date", en: "Actual Maintenance Date", ar: "تاريخ الصيانة الفعلي", type: "date", },
      { key: "actual_meter_odometer_reading", en: "Actual Meter/Odometer Reading", ar: "قراءة العداد الفعلية", type: "number", },
      { key: "current_maintenance_status", en: "Current Maintenance Status", ar: "حالة الصيانة الحالية", type: "select", options: PMV_OPTIONS_MAINTENANCE_STATUS, },
    ],
  },
  {
    key: "summary",
    table: "pmv_summary",
    titleEn: "Summary",
    titleAr: "الملخص",
    purposeEn: "KPI dashboard for performance measurement",
    purposeAr: "مؤشرات الأداء لقياس الكفاءة",
    columns: [
      { key: "asset_id", en: "Asset ID", ar: "رقم الأصل", type: "text", },
      { key: "plate_no", en: "Plate No", ar: "رقم اللوحة", type: "text", },
      { key: "description", en: "Description", ar: "الوصف", type: "text", },
      { key: "total_hours_in_month", en: "Total Hours In Month", ar: "إجمالي الساعات في الشهر", type: "number", },
      { key: "deployed_hours", en: "Deployed Hours", ar: "ساعات التشغيل", type: "number", },
      { key: "avg_utilization_current_month", en: "Avg Utilization % - Current Month", ar: "متوسط الاستخدام % - الشهر الحالي", type: "number", },
      { key: "avg_utilization_previous_month", en: "Avg Utilization % - Previous Month", ar: "متوسط الاستخدام % - الشهر السابق", type: "number", },
      { key: "utilization_variance", en: "Utilization Variance", ar: "فرق الاستخدام", type: "number", },
      { key: "avg_consumption_ltr_hr_current_month", en: "Avg Consumption (Ltr/Hr) - Current Month", ar: "متوسط الاستهلاك - الشهر الحالي", type: "number", },
      { key: "avg_consumption_ltr_hr_previous_month", en: "Avg Consumption (Ltr/Hr) - Previous Month", ar: "متوسط الاستهلاك - الشهر السابق", type: "number", },
      { key: "consumption_variance", en: "Consumption Variance", ar: "فرق الاستهلاك", type: "number", },
      { key: "avg_idle_hours_current_month", en: "Avg Idle Hours - Current Month", ar: "متوسط ساعات التعطل - الشهر الحالي", type: "number", },
      { key: "avg_idle_hours_previous_month", en: "Avg Idle Hours - Previous Month", ar: "متوسط ساعات التعطل - الشهر السابق", type: "number", },
      { key: "idle_variance", en: "Idle Variance", ar: "فرق التعطل", type: "number", },
      { key: "avg_downtime_hours_current_month", en: "Avg Downtime Hours - Current Month", ar: "متوسط ساعات التوقف - الشهر الحالي", type: "number", },
      { key: "avg_downtime_hours_previous_month", en: "Avg Downtime Hours - Previous Month", ar: "متوسط ساعات التوقف - الشهر السابق", type: "number", },
      { key: "downtime_variance", en: "Downtime Variance", ar: "فرق التوقف", type: "number", },
    ],
  },
];
