export type Locale = "en" | "ar";

export interface TranslationShape {
  appName: string;
  tagline: string;
  common: {
    genericError: string;
    autoAssigned: string;
    loading: string;
  };
  login: {
    title: string;
    subtitle: string;
    email: string;
    emailPlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    submit: string;
    submitting: string;
    rememberMe: string;
    forgot: string;
    error: string;
    footer: string;
  };
  nav: {
    dashboard: string;
    newObservation: string;
    myObservations: string;
    envChecklist: string;
    fireChecklist: string;
    shChecklist: string;
    tcChecklist: string;
    toolboxTalk: string;
    hsePassport: string;
    disciplinaryAction: string;
    ppe: string;
    training: string;
    weeklyKpi: string;
    monthlyChecklists: string;
    permitToWork: string;
    myPermits: string;
    logout: string;
    hello: string;
  };
  form: {
    title: string;
    subtitle: string;
    reportNumber: string;
    projectName: string;
    projectPlaceholder: string;
    observationType: string;
    observationTypePlaceholder: string;
    observationTypeOther: string;
    observationTypeOtherPlaceholder: string;
    observationDetails: string;
    observationDetailsPlaceholder: string;
    classification: string;
    classificationPlaceholder: string;
    riskRating: string;
    riskRatingPlaceholder: string;
    observationPhoto: string;
    closeOutPhoto: string;
    uploadHint: string;
    closeOutDetails: string;
    closeOutDetailsPlaceholder: string;
    status: string;
    statusPlaceholder: string;
    inspectedBy: string;
    submit: string;
    cancel: string;
    success: string;
    filesSelected: string;
    other: string;
  };
  list: {
    title: string;
    subtitle: string;
    newBtn: string;
    empty: string;
    emptyCta: string;
    col: {
      reportNumber: string;
      project: string;
      type: string;
      classification: string;
      risk: string;
      status: string;
      date: string;
      actions: string;
    };
    view: string;
    search: string;
  };
  detail: {
    title: string;
    back: string;
    updateStatus: string;
    save: string;
    saved: string;
    reportedOn: string;
  };
  lang: {
    switchTo: string;
  };
  checklist: {
    generalInfo: string;
    inspectedBy: string;
    inspectionDate: string;
    projectDirector: string;
    totalManpower: string;
    activity: string;
    possible: string;
    scored: string;
    possiblePointsAwarded: string;
    summaryReport: string;
    section: string;
    totalPossible: string;
    totalScored: string;
    finalScore: string;
    grandTotal: string;
    submit: string;
    submitting: string;
    submitted: string;
    success: string;
    selectProjectAndDate: string;
  };
  checklistNames: {
    environmental: string;
    fireAssessment: string;
    safetyHealth: string;
    tcEnergization: string;
  };
  toolbox: {
    formTitle: string;
    formSubtitle: string;
    projectName: string;
    projectPlaceholder: string;
    siteLocation: string;
    date: string;
    inductedBy: string;
    topic: string;
    topicPlaceholder: string;
    sessions: string;
    attendees: string;
    lectureDuration: string;
    lectureDurationPlaceholder: string;
    minutesSuffix: string;
    trainingManHours: string;
    details: string;
    detailsPlaceholder: string;
    attachments: string;
    submit: string;
    success: string;
    listTitle: string;
    listSubtitle: string;
    newBtn: string;
    empty: string;
    emptyCta: string;
    col: {
      date: string;
      project: string;
      topic: string;
      attendees: string;
      manHours: string;
      actions: string;
    };
    view: string;
    detailTitle: string;
    back: string;
    recordedOn: string;
  };
  hse: {
    searchEmployee: string;
    searchPlaceholder: string;
    noMatches: string;
    changeEmployee: string;
    emptyState: string;
    addBtn: string;
    cancel: string;
    submit: string;
    date: string;
    attachments: string;
    details: string;
    disciplinary: {
      title: string;
      filterByProject: string;
      filterByDepartment: string;
      allProjects: string;
      allDepartments: string;
      verbalWarning: string;
      writtenWarning: string;
      violation: string;
      lsr: string;
      lifeSavingRulesTitle: string;
      chartTitle: string;
      addTitle: string;
      employee: string;
      type: string;
      violationCategory: string;
    };
    ppe: {
      title: string;
      description: string;
      received: string;
      dateReceived: string;
      replacementDue: string;
      condition: string;
      remarks: string;
      total: string;
      addTitle: string;
      ppeType: string;
    };
    training: {
      title: string;
      totalPerformance: string;
      completed: string;
      remaining: string;
      totalCourses: string;
      totalHours: string;
      trainingEnded: string;
      historyTitle: string;
      courseName: string;
      status: string;
      valid: string;
      expired: string;
      bendingTitle: string;
      addTitle: string;
      hours: string;
    };
  };
  weeklyKpi: {
    formTitle: string;
    formSubtitle: string;
    projectName: string;
    projectPlaceholder: string;
    date: string;
    submit: string;
    cancel: string;
    success: string;
    listTitle: string;
    listSubtitle: string;
    newBtn: string;
    empty: string;
    emptyCta: string;
    colProject: string;
    colDate: string;
    colActions: string;
    view: string;
    detailTitle: string;
    back: string;
    recordedOn: string;
    save: string;
    saved: string;
  };
  ptw: {
    formTitle: string;
    formSubtitle: string;
    permitNumber: string;
    issuerBy: string;
    receiver: string;
    receiverPlaceholder: string;
    hseValidator: string;
    hseValidatorPlaceholder: string;
    supervisorForeman: string;
    supervisorForemanPlaceholder: string;
    emergencyContactNumber: string;
    emergencyContactNumberPlaceholder: string;
    projectName: string;
    projectPlaceholder: string;
    permitType: string;
    permitTypePlaceholder: string;
    permitTypeOther: string;
    permitTypeOtherPlaceholder: string;
    workLocation: string;
    workLocationPlaceholder: string;
    contractor: string;
    contractorPlaceholder: string;
    numberOfWorkers: string;
    workDescription: string;
    workDescriptionPlaceholder: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    permitStatus: string;
    permitStatusHint: string;
    statusNewPermit: string;
    statusInProgress: string;
    statusClosed: string;
    hazardsIdentified: string;
    addHazardPlaceholder: string;
    addHazardBtn: string;
    ppeRequired: string;
    isolationRequired: string;
    isolationYes: string;
    isolationNo: string;
    precautions: string;
    precautionsPlaceholder: string;
    permitPhoto: string;
    attachments: string;
    issuerSignature: string;
    receiverSignature: string;
    signatureClear: string;
    signatureRequired: string;
    submit: string;
    cancel: string;
    success: string;
    other: string;
    listTitle: string;
    listSubtitle: string;
    newBtn: string;
    empty: string;
    emptyCta: string;
    search: string;
    myPermitsTitle: string;
    myPermitsSubtitle: string;
    col: {
      permitNumber: string;
      project: string;
      type: string;
      location: string;
      validity: string;
      status: string;
      permitStatus: string;
      actions: string;
    };
    view: string;
    detailTitle: string;
    back: string;
    requestedOn: string;
    updateStatus: string;
    status: string;
    statusPlaceholder: string;
    approvedBy: string;
    notApprovedYet: string;
    permitProgressTitle: string;
    closePermitBtn: string;
    permitClosedNote: string;
    closeOutDetails: string;
    closeOutDetailsPlaceholder: string;
    closeOutPhoto: string;
    save: string;
    saved: string;
  };
  dashboard: {
    titlePrefix: string;
    observations: string;
    totalObservations: string;
    openLabel: string;
    closedLabel: string;
    toolboxTalk: string;
    sessions: string;
    attendees: string;
    manHours: string;
    weeklyKpi: string;
    totalManhours: string;
    totalSafeWorkHours: string;
    nearMisses: string;
    latestRecordFrom: string;
    ficc: string;
    monthlyChecklists: string;
    submittedOn: string;
    hsePassport: string;
    totalViolations: string;
    permitToWork: string;
    totalPermits: string;
    activePermits: string;
    pendingApproval: string;
    noDataYet: string;
    notSubmittedYet: string;
    trendTitle: string;
    trendOpen: string;
    trendClosed: string;
    safetyTipTitle: string;
    team: string;
    totalEmployees: string;
    recentObservations: string;
    recentPermits: string;
    viewAll: string;
  };
}

export const translations: Record<Locale, TranslationShape> = {
  en: {
    appName: "First Fix HSE",
    tagline: "Safety Today Secures Tomorrow",
    common: {
      genericError: "Something went wrong. Please try again.",
      autoAssigned: "Assigned automatically on submit",
      loading: "Loading...",
    },
    login: {
      title: "Welcome back",
      subtitle: "Sign in to continue to First Fix HSE",
      email: "Email",
      emailPlaceholder: "name@company.com",
      password: "Password",
      passwordPlaceholder: "Enter your password",
      submit: "Log In",
      submitting: "Signing in...",
      rememberMe: "Remember me",
      forgot: "Forgot password?",
      error: "Please enter a valid email and password.",
      footer: "Protect People. Protect Projects. Protect Future.",
    },
    nav: {
      dashboard: "Dashboard",
      newObservation: "New Observation",
      myObservations: "My Observations",
      envChecklist: "Environmental Checklist",
      fireChecklist: "Fire Assessment Checklist",
      shChecklist: "Health & Safety Checklist",
      tcChecklist: "T&C and Energization Checklist",
      toolboxTalk: "Toolbox Talk & Training",
      hsePassport: "HSE Passport",
      disciplinaryAction: "Disciplinary Action",
      ppe: "PPE",
      training: "Training",
      weeklyKpi: "Weekly KPI",
      monthlyChecklists: "Monthly Checklists",
      permitToWork: "Permit to Work",
      myPermits: "My Permits",
      logout: "Log Out",
      hello: "Hello",
    },
    form: {
      title: "New Observation",
      subtitle: "Record a new HSE observation. Fields marked with * are required.",
      reportNumber: "Report Number",
      projectName: "Project Name",
      projectPlaceholder: "Select a project",
      observationType: "Observation Type",
      observationTypePlaceholder: "Select observation type",
      observationTypeOther: "Observation Type (If Other)",
      observationTypeOtherPlaceholder: "Please specify",
      observationDetails: "Observation Details",
      observationDetailsPlaceholder: "Describe what you observed in detail...",
      classification: "Classification",
      classificationPlaceholder: "Select classification",
      riskRating: "Risk Rating",
      riskRatingPlaceholder: "Select risk rating",
      observationPhoto: "Observation Photo",
      closeOutPhoto: "Close-out Photo",
      uploadHint: "Click to upload or drag & drop (multiple images allowed)",
      closeOutDetails: "Close-out Details",
      closeOutDetailsPlaceholder: "Describe corrective actions taken...",
      status: "Status",
      statusPlaceholder: "Select status",
      inspectedBy: "Inspected By / ID",
      submit: "Submit Observation",
      cancel: "Cancel",
      success: "Observation submitted successfully!",
      filesSelected: "file(s) selected",
      other: "Other",
    },
    list: {
      title: "My Observations",
      subtitle: "Observations you have submitted",
      newBtn: "+ New Observation",
      empty: "No observations yet. Create your first one!",
      emptyCta: "New Observation",
      col: {
        reportNumber: "Report #",
        project: "Project",
        type: "Type",
        classification: "Classification",
        risk: "Risk",
        status: "Status",
        date: "Date",
        actions: "Actions",
      },
      view: "View / Edit",
      search: "Search by report number, project...",
    },
    detail: {
      title: "Observation",
      back: "Back to My Observations",
      updateStatus: "Update Status",
      save: "Save Changes",
      saved: "Changes saved successfully!",
      reportedOn: "Reported on",
    },
    lang: {
      switchTo: "العربية",
    },
    checklist: {
      generalInfo: "General Information",
      inspectedBy: "Inspected by",
      inspectionDate: "Inspection Date",
      projectDirector: "Project Director",
      totalManpower: "Total Manpower",
      activity: "Activity",
      possible: "Total Points Possible",
      scored: "Total Points Scored",
      possiblePointsAwarded: "POSSIBLE POINTS AWARDED",
      summaryReport: "Summary Report",
      section: "Section",
      totalPossible: "Total Points Possible",
      totalScored: "Total Points Scored",
      finalScore: "Final Score %",
      grandTotal: "FINAL AVERAGE SCORE",
      submit: "Submit Checklist",
      submitting: "Submitting...",
      submitted: "Submitted",
      success: "Checklist submitted successfully!",
      selectProjectAndDate: "Please select a project and an inspection date before submitting.",
    },
    checklistNames: {
      environmental: "Environmental Checklist",
      fireAssessment: "Fire Assessment Checklist",
      safetyHealth: "Health & Safety Checklist",
      tcEnergization: "T&C / Energization Checklist",
    },
    toolbox: {
      formTitle: "Toolbox Talk & Training",
      formSubtitle: "Record a new toolbox talk / training session.",
      projectName: "Project Name",
      projectPlaceholder: "Select a project",
      siteLocation: "Site/Location",
      date: "Date",
      inductedBy: "Inducted By",
      topic: "Topic",
      topicPlaceholder: "Select a topic",
      sessions: "Sessions",
      attendees: "Number of Attendees",
      lectureDuration: "Lecture Duration",
      lectureDurationPlaceholder: "Select duration",
      minutesSuffix: "min",
      trainingManHours: "Training Man-Hours",
      details: "TBT/Training Details",
      detailsPlaceholder: "Describe the session content, key points, and any additional notes...",
      attachments: "Attachments",
      submit: "Submit Record",
      success: "Training record submitted successfully!",
      listTitle: "My Toolbox Talks",
      listSubtitle: "Training records you have submitted",
      newBtn: "+ New Record",
      empty: "No training records yet. Add your first one!",
      emptyCta: "New Record",
      col: {
        date: "Date",
        project: "Project",
        topic: "Topic",
        attendees: "Attendees",
        manHours: "Man-Hours",
        actions: "Actions",
      },
      view: "View",
      detailTitle: "Toolbox Talk Record",
      back: "Back to My Toolbox Talks",
      recordedOn: "Recorded on",
    },
    hse: {
      searchEmployee: "Search Employee",
      searchPlaceholder: "Search by name or employee ID...",
      noMatches: "No employees found.",
      changeEmployee: "Change",
      emptyState: "Search for an employee above to view their records.",
      addBtn: "+ Add",
      cancel: "Cancel",
      submit: "Submit",
      date: "Date",
      attachments: "Attachments",
      details: "Details",
      disciplinary: {
        title: "Disciplinary Action",
        filterByProject: "Filter by Project",
        filterByDepartment: "Filter by Department",
        allProjects: "All Projects",
        allDepartments: "All Departments",
        verbalWarning: "Verbal Warning",
        writtenWarning: "Written Warning",
        violation: "Violation",
        lsr: "LSR",
        lifeSavingRulesTitle: "Life Saving Rules",
        chartTitle: "Type of Violation",
        addTitle: "Add Disciplinary Record",
        employee: "Employee",
        type: "Type",
        violationCategory: "Violation Category",
      },
      ppe: {
        title: "PPE",
        description: "PPE Description",
        received: "Received",
        dateReceived: "Date Received",
        replacementDue: "Replacement Due Date",
        condition: "Condition at Return",
        remarks: "Remarks",
        total: "Total PPE",
        addTitle: "Add PPE Record",
        ppeType: "PPE Type",
      },
      training: {
        title: "Training",
        totalPerformance: "Total Performance",
        completed: "Completed",
        remaining: "Remaining",
        totalCourses: "Total Courses",
        totalHours: "Total Hours",
        trainingEnded: "Training Ended",
        historyTitle: "Training History",
        courseName: "Course Name",
        status: "Status",
        valid: "Valid",
        expired: "Expired",
        bendingTitle: "Training Bending",
        addTitle: "Add Training Record",
        hours: "Hours",
      },
    },
    weeklyKpi: {
      formTitle: "Weekly KPI",
      formSubtitle: "Record a new weekly HSE KPI report.",
      projectName: "Project Name",
      projectPlaceholder: "Select a project",
      date: "Date",
      submit: "Submit Record",
      cancel: "Cancel",
      success: "Weekly KPI record submitted successfully!",
      listTitle: "Weekly KPI",
      listSubtitle: "Weekly KPI records you have submitted",
      newBtn: "+ New Record",
      empty: "No weekly KPI records yet. Add your first one!",
      emptyCta: "New Record",
      colProject: "Project",
      colDate: "Date",
      colActions: "Actions",
      view: "View / Edit",
      detailTitle: "Weekly KPI Record",
      back: "Back to Weekly KPI",
      recordedOn: "Recorded on",
      save: "Save Changes",
      saved: "Changes saved successfully!",
    },
    ptw: {
      formTitle: "New Permit to Work",
      formSubtitle: "Request a new Permit to Work (PTW). Fields marked with * are required.",
      permitNumber: "Permit Number",
      issuerBy: "Issuer By / ID",
      receiver: "Receiver",
      receiverPlaceholder: "Name of the person receiving the permit",
      hseValidator: "HSE Validator",
      hseValidatorPlaceholder: "Name of the HSE validator",
      supervisorForeman: "Supervisor / Foreman",
      supervisorForemanPlaceholder: "Name of the supervisor / foreman",
      emergencyContactNumber: "Emergency Contact Number",
      emergencyContactNumberPlaceholder: "e.g. +966 5x xxx xxxx",
      projectName: "Project Name",
      projectPlaceholder: "Select a project",
      permitType: "Permit Type",
      permitTypePlaceholder: "Select permit type",
      permitTypeOther: "Permit Type (If Other)",
      permitTypeOtherPlaceholder: "Please specify",
      workLocation: "Work Location / Area",
      workLocationPlaceholder: "e.g. Level 3, East Wing",
      contractor: "Contractor / Company",
      contractorPlaceholder: "e.g. First Fix Contracting",
      numberOfWorkers: "Number of Workers",
      workDescription: "Description of Work",
      workDescriptionPlaceholder: "Describe the work to be carried out...",
      startDate: "Start Date",
      startTime: "Start Time",
      endDate: "End Date",
      endTime: "End Time",
      permitStatus: "Permit Status",
      permitStatusHint: "Set automatically to \"New Permit\" — it updates itself while the permit is open, and edit access is enabled to close it.",
      statusNewPermit: "New Permit",
      statusInProgress: "In Progress",
      statusClosed: "Closed",
      hazardsIdentified: "Hazards Identified",
      addHazardPlaceholder: "Add another hazard...",
      addHazardBtn: "+ Add",
      ppeRequired: "PPE Required",
      isolationRequired: "Isolation / LOTO Certificate Required?",
      isolationYes: "Yes",
      isolationNo: "No",
      precautions: "Precautions / Control Measures",
      precautionsPlaceholder: "Describe the control measures in place...",
      permitPhoto: "Site / Permit Photo",
      attachments: "Attachments (Risk Assessment, Isolation Certificate, etc.)",
      issuerSignature: "Issuer Signature",
      receiverSignature: "Receiver Signature",
      signatureClear: "Clear",
      signatureRequired: "Please provide both the Issuer and Receiver signatures before submitting.",
      submit: "Submit Permit",
      cancel: "Cancel",
      success: "Permit to Work submitted successfully!",
      other: "Other",
      listTitle: "Permit to Work",
      listSubtitle: "Permits you have requested",
      newBtn: "+ New Permit",
      empty: "No permits yet. Create your first one!",
      emptyCta: "New Permit",
      search: "Search by permit number, project...",
      myPermitsTitle: "My Permits",
      myPermitsSubtitle: "Permits requested for your project",
      col: {
        permitNumber: "Permit #",
        project: "Project",
        type: "Type",
        location: "Location",
        validity: "Validity",
        status: "Status",
        permitStatus: "Permit Status",
        actions: "Actions",
      },
      view: "View / Edit",
      detailTitle: "Permit to Work",
      back: "Back to Permit to Work",
      requestedOn: "Requested on",
      updateStatus: "Update Status",
      status: "Status",
      statusPlaceholder: "Select status",
      approvedBy: "Approved By",
      notApprovedYet: "Not approved yet",
      permitProgressTitle: "Permit Status",
      closePermitBtn: "Close Permit",
      permitClosedNote: "This permit is closed.",
      closeOutDetails: "Close-out Details",
      closeOutDetailsPlaceholder: "Describe how the work was completed and the area left safe...",
      closeOutPhoto: "Close-out Photo",
      save: "Save Changes",
      saved: "Changes saved successfully!",
    },
    dashboard: {
      titlePrefix: "Dashboard",
      observations: "Observations",
      totalObservations: "Total",
      openLabel: "Open",
      closedLabel: "Closed",
      toolboxTalk: "Toolbox Talk & Training",
      sessions: "Sessions",
      attendees: "Attendees",
      manHours: "Man-Hours",
      weeklyKpi: "Weekly KPI",
      totalManhours: "Total Manhours",
      totalSafeWorkHours: "Total Safe Work Hours",
      nearMisses: "Near Misses",
      latestRecordFrom: "Latest record from",
      ficc: "FICC",
      monthlyChecklists: "Monthly Checklists",
      submittedOn: "Submitted",
      hsePassport: "HSE Passport",
      totalViolations: "Total Violations (Disciplinary)",
      permitToWork: "Permit to Work",
      totalPermits: "Total Permits",
      activePermits: "Active",
      pendingApproval: "Pending Approval",
      noDataYet: "No data yet",
      notSubmittedYet: "Not submitted yet",
      trendTitle: "Observations Trend — Last 6 Weeks",
      trendOpen: "Open",
      trendClosed: "Closed",
      safetyTipTitle: "Safety Tip of the Day",
      team: "Team",
      totalEmployees: "Total Employees",
      recentObservations: "Recent Observations",
      recentPermits: "Recent Permits",
      viewAll: "View all",
    },
  },
  ar: {
    appName: "فيرست فيكس - الصحة والسلامة",
    tagline: "السلامة اليوم تؤمّن الغد",
    common: {
      genericError: "حدث خطأ ما. من فضلك حاول مرة أخرى.",
      autoAssigned: "يتم تعيينه تلقائيًا عند الإرسال",
      loading: "جارٍ التحميل...",
    },
    login: {
      title: "أهلاً بعودتك",
      subtitle: "سجّل الدخول للمتابعة إلى First Fix HSE",
      email: "البريد الإلكتروني",
      emailPlaceholder: "name@company.com",
      password: "كلمة المرور",
      passwordPlaceholder: "أدخل كلمة المرور",
      submit: "تسجيل الدخول",
      submitting: "جاري تسجيل الدخول...",
      rememberMe: "تذكرني",
      forgot: "نسيت كلمة المرور؟",
      error: "من فضلك أدخل بريد إلكتروني وكلمة مرور صحيحين.",
      footer: "نحمي الأفراد. نحمي المشاريع. نحمي المستقبل.",
    },
    nav: {
      dashboard: "الرئيسية",
      newObservation: "ملاحظة جديدة",
      myObservations: "ملاحظاتي",
      envChecklist: "قائمة الفحص البيئي",
      fireChecklist: "قائمة فحص السلامة من الحريق",
      shChecklist: "قائمة الصحة والسلامة المهنية",
      tcChecklist: "قائمة فحص التشغيل والطاقة (T&C)",
      toolboxTalk: "التدريب والتوعية اليومية (Toolbox Talk)",
      hsePassport: "جواز السلامة (HSE Passport)",
      disciplinaryAction: "الإجراءات التأديبية",
      ppe: "معدات الوقاية الشخصية",
      training: "التدريب",
      weeklyKpi: "مؤشرات الأداء الأسبوعية",
      monthlyChecklists: "القوائم الشهرية",
      permitToWork: "تصريح العمل",
      myPermits: "تصاريحي",
      logout: "تسجيل الخروج",
      hello: "أهلاً",
    },
    form: {
      title: "ملاحظة جديدة",
      subtitle: "سجّل ملاحظة صحة وسلامة جديدة. الحقول المميزة بـ * إلزامية.",
      reportNumber: "رقم التقرير",
      projectName: "اسم المشروع",
      projectPlaceholder: "اختر المشروع",
      observationType: "نوع الملاحظة",
      observationTypePlaceholder: "اختر نوع الملاحظة",
      observationTypeOther: "نوع الملاحظة (إذا أخرى)",
      observationTypeOtherPlaceholder: "من فضلك حدد النوع",
      observationDetails: "تفاصيل الملاحظة",
      observationDetailsPlaceholder: "اكتب وصفًا تفصيليًا لما تمت ملاحظته...",
      classification: "التصنيف",
      classificationPlaceholder: "اختر التصنيف",
      riskRating: "تقييم الخطورة",
      riskRatingPlaceholder: "اختر مستوى الخطورة",
      observationPhoto: "صورة الملاحظة",
      closeOutPhoto: "صورة الإغلاق",
      uploadHint: "اضغط للرفع أو اسحب الصور هنا (يمكن رفع أكثر من صورة)",
      closeOutDetails: "تفاصيل الإغلاق",
      closeOutDetailsPlaceholder: "اكتب الإجراءات التصحيحية التي تم اتخاذها...",
      status: "الحالة",
      statusPlaceholder: "اختر الحالة",
      inspectedBy: "تم الفحص بواسطة / الرقم الوظيفي",
      submit: "إرسال الملاحظة",
      cancel: "إلغاء",
      success: "تم إرسال الملاحظة بنجاح!",
      filesSelected: "ملف(ات) تم اختيارها",
      other: "أخرى",
    },
    list: {
      title: "ملاحظاتي",
      subtitle: "الملاحظات التي قمت برفعها",
      newBtn: "+ ملاحظة جديدة",
      empty: "لا توجد ملاحظات بعد. أضف أول ملاحظة لك!",
      emptyCta: "ملاحظة جديدة",
      col: {
        reportNumber: "رقم التقرير",
        project: "المشروع",
        type: "النوع",
        classification: "التصنيف",
        risk: "الخطورة",
        status: "الحالة",
        date: "التاريخ",
        actions: "إجراءات",
      },
      view: "عرض / تعديل",
      search: "ابحث برقم التقرير أو المشروع...",
    },
    detail: {
      title: "الملاحظة",
      back: "الرجوع إلى ملاحظاتي",
      updateStatus: "تحديث الحالة",
      save: "حفظ التغييرات",
      saved: "تم حفظ التغييرات بنجاح!",
      reportedOn: "تاريخ الإبلاغ",
    },
    lang: {
      switchTo: "English",
    },
    checklist: {
      generalInfo: "معلومات عامة",
      inspectedBy: "تم الفحص بواسطة",
      inspectionDate: "تاريخ الفحص",
      projectDirector: "مدير المشروع",
      totalManpower: "إجمالي عدد العمالة",
      activity: "النشاط",
      possible: "النقاط الممكنة",
      scored: "النقاط المحققة",
      possiblePointsAwarded: "مجموع النقاط الممنوحة",
      summaryReport: "التقرير التلخيصي",
      section: "القسم",
      totalPossible: "إجمالي النقاط الممكنة",
      totalScored: "إجمالي النقاط المحققة",
      finalScore: "النتيجة النهائية %",
      grandTotal: "المتوسط النهائي للنتيجة",
      submit: "إرسال القائمة",
      submitting: "جارٍ الإرسال...",
      submitted: "تم الإرسال",
      success: "تم إرسال القائمة بنجاح!",
      selectProjectAndDate: "من فضلك اختر المشروع وتاريخ الفحص قبل الإرسال.",
    },
    checklistNames: {
      environmental: "القائمة البيئية",
      fireAssessment: "قائمة تقييم الحريق",
      safetyHealth: "قائمة الصحة والسلامة",
      tcEnergization: "قائمة الفحص والتشغيل الكهربائي",
    },
    toolbox: {
      formTitle: "التدريب والتوعية اليومية",
      formSubtitle: "سجّل جلسة تدريب أو توعية يومية جديدة.",
      projectName: "اسم المشروع",
      projectPlaceholder: "اختر المشروع",
      siteLocation: "الموقع",
      date: "التاريخ",
      inductedBy: "قدّم التدريب",
      topic: "الموضوع",
      topicPlaceholder: "اختر الموضوع",
      sessions: "عدد الجلسات",
      attendees: "عدد الحاضرين",
      lectureDuration: "مدة المحاضرة",
      lectureDurationPlaceholder: "اختر المدة",
      minutesSuffix: "دقيقة",
      trainingManHours: "ساعات العمل التدريبية",
      details: "تفاصيل التدريب",
      detailsPlaceholder: "اكتب محتوى الجلسة والنقاط الأساسية وأي ملاحظات إضافية...",
      attachments: "المرفقات",
      submit: "إرسال السجل",
      success: "تم إرسال سجل التدريب بنجاح!",
      listTitle: "سجلات التدريب الخاصة بي",
      listSubtitle: "سجلات التدريب التي قمت بإضافتها",
      newBtn: "+ سجل جديد",
      empty: "لا توجد سجلات تدريب بعد. أضف أول سجل لك!",
      emptyCta: "سجل جديد",
      col: {
        date: "التاريخ",
        project: "المشروع",
        topic: "الموضوع",
        attendees: "الحاضرون",
        manHours: "ساعات العمل",
        actions: "إجراءات",
      },
      view: "عرض",
      detailTitle: "سجل التدريب",
      back: "الرجوع إلى سجلات التدريب",
      recordedOn: "تاريخ التسجيل",
    },
    hse: {
      searchEmployee: "البحث عن موظف",
      searchPlaceholder: "ابحث بالاسم أو الرقم الوظيفي...",
      noMatches: "لا يوجد موظفون مطابقون.",
      changeEmployee: "تغيير",
      emptyState: "ابحث عن موظف بالأعلى لعرض سجلاته.",
      addBtn: "+ إضافة",
      cancel: "إلغاء",
      submit: "إرسال",
      date: "التاريخ",
      attachments: "المرفقات",
      details: "التفاصيل",
      disciplinary: {
        title: "الإجراءات التأديبية",
        filterByProject: "فلترة حسب المشروع",
        filterByDepartment: "فلترة حسب القسم",
        allProjects: "كل المشاريع",
        allDepartments: "كل الأقسام",
        verbalWarning: "إنذار شفهي",
        writtenWarning: "إنذار كتابي",
        violation: "مخالفة",
        lsr: "قواعد إنقاذ الحياة",
        lifeSavingRulesTitle: "قواعد إنقاذ الحياة",
        chartTitle: "نوع المخالفة",
        addTitle: "إضافة سجل تأديبي",
        employee: "الموظف",
        type: "النوع",
        violationCategory: "فئة المخالفة",
      },
      ppe: {
        title: "معدات الوقاية الشخصية",
        description: "وصف المعدة",
        received: "تم الاستلام",
        dateReceived: "تاريخ الاستلام",
        replacementDue: "تاريخ الاستبدال المستحق",
        condition: "الحالة عند الإرجاع",
        remarks: "ملاحظات",
        total: "إجمالي المعدات",
        addTitle: "إضافة معدة وقاية",
        ppeType: "نوع المعدة",
      },
      training: {
        title: "التدريب",
        totalPerformance: "الأداء الإجمالي",
        completed: "مكتمل",
        remaining: "متبقي",
        totalCourses: "إجمالي الدورات",
        totalHours: "إجمالي الساعات",
        trainingEnded: "تدريبات منتهية",
        historyTitle: "سجل التدريب",
        courseName: "اسم الدورة",
        status: "الحالة",
        valid: "سارٍ",
        expired: "منتهٍ",
        bendingTitle: "بنود إضافية",
        addTitle: "إضافة سجل تدريب",
        hours: "الساعات",
      },
    },
    weeklyKpi: {
      formTitle: "مؤشرات الأداء الأسبوعية",
      formSubtitle: "سجّل تقرير مؤشرات الأداء الأسبوعية الجديد.",
      projectName: "اسم المشروع",
      projectPlaceholder: "اختر المشروع",
      date: "التاريخ",
      submit: "إرسال السجل",
      cancel: "إلغاء",
      success: "تم إرسال سجل مؤشرات الأداء بنجاح!",
      listTitle: "مؤشرات الأداء الأسبوعية",
      listSubtitle: "السجلات الأسبوعية التي قمت بإضافتها",
      newBtn: "+ سجل جديد",
      empty: "لا توجد سجلات بعد. أضف أول سجل لك!",
      emptyCta: "سجل جديد",
      colProject: "المشروع",
      colDate: "التاريخ",
      colActions: "إجراءات",
      view: "عرض / تعديل",
      detailTitle: "سجل مؤشرات الأداء الأسبوعية",
      back: "الرجوع إلى مؤشرات الأداء الأسبوعية",
      recordedOn: "تاريخ التسجيل",
      save: "حفظ التغييرات",
      saved: "تم حفظ التغييرات بنجاح!",
    },
    ptw: {
      formTitle: "طلب تصريح عمل جديد",
      formSubtitle: "قدّم طلب تصريح عمل (PTW) جديد. الحقول المميزة بـ * إلزامية.",
      permitNumber: "رقم التصريح",
      issuerBy: "مُصدر التصريح / الرقم الوظيفي",
      receiver: "المستلم",
      receiverPlaceholder: "اسم الشخص المستلم للتصريح",
      hseValidator: "مدقق السلامة (HSE Validator)",
      hseValidatorPlaceholder: "اسم مدقق السلامة",
      supervisorForeman: "المشرف / رئيس العمال",
      supervisorForemanPlaceholder: "اسم المشرف / رئيس العمال",
      emergencyContactNumber: "رقم الطوارئ",
      emergencyContactNumberPlaceholder: "مثال: 05xxxxxxxx",
      projectName: "اسم المشروع",
      projectPlaceholder: "اختر المشروع",
      permitType: "نوع التصريح",
      permitTypePlaceholder: "اختر نوع التصريح",
      permitTypeOther: "نوع التصريح (إذا أخرى)",
      permitTypeOtherPlaceholder: "من فضلك حدد النوع",
      workLocation: "موقع العمل / المنطقة",
      workLocationPlaceholder: "مثال: الدور الثالث، الجناح الشرقي",
      contractor: "المقاول / الشركة",
      contractorPlaceholder: "مثال: فيرست فيكس للمقاولات",
      numberOfWorkers: "عدد العمال",
      workDescription: "وصف العمل",
      workDescriptionPlaceholder: "اكتب وصفًا للعمل المطلوب تنفيذه...",
      startDate: "تاريخ البدء",
      startTime: "وقت البدء",
      endDate: "تاريخ الانتهاء",
      endTime: "وقت الانتهاء",
      permitStatus: "حالة التصريح",
      permitStatusHint: "تُحدَّد تلقائيًا بـ \"تصريح جديد\" — وتتحدث تلقائيًا أثناء سريان التصريح، مع إتاحة التعديل لإغلاقه.",
      statusNewPermit: "تصريح جديد",
      statusInProgress: "قيد التنفيذ",
      statusClosed: "مغلق",
      hazardsIdentified: "المخاطر المحددة",
      addHazardPlaceholder: "أضف خطرًا آخر...",
      addHazardBtn: "+ إضافة",
      ppeRequired: "معدات الوقاية الشخصية المطلوبة",
      isolationRequired: "هل يلزم شهادة عزل الطاقة (LOTO)؟",
      isolationYes: "نعم",
      isolationNo: "لا",
      precautions: "الاحتياطات / إجراءات التحكم",
      precautionsPlaceholder: "اكتب إجراءات التحكم المتبعة...",
      permitPhoto: "صورة الموقع / التصريح",
      attachments: "المرفقات (تقييم المخاطر، شهادة العزل، إلخ)",
      issuerSignature: "توقيع المُصدر",
      receiverSignature: "توقيع المستلم",
      signatureClear: "مسح",
      signatureRequired: "من فضلك وقّع كل من المُصدر والمستلم قبل الإرسال.",
      submit: "إرسال التصريح",
      cancel: "إلغاء",
      success: "تم إرسال تصريح العمل بنجاح!",
      other: "أخرى",
      listTitle: "تصاريح العمل",
      listSubtitle: "التصاريح التي قمت بطلبها",
      newBtn: "+ تصريح جديد",
      empty: "لا توجد تصاريح بعد. أضف أول تصريح لك!",
      emptyCta: "تصريح جديد",
      search: "ابحث برقم التصريح أو المشروع...",
      myPermitsTitle: "تصاريحي",
      myPermitsSubtitle: "التصاريح الخاصة بمشروعك",
      col: {
        permitNumber: "رقم التصريح",
        project: "المشروع",
        type: "النوع",
        location: "الموقع",
        validity: "الصلاحية",
        status: "الحالة",
        permitStatus: "حالة التصريح",
        actions: "إجراءات",
      },
      view: "عرض / تعديل",
      detailTitle: "تصريح العمل",
      back: "الرجوع إلى تصاريح العمل",
      requestedOn: "تاريخ الطلب",
      updateStatus: "تحديث الحالة",
      status: "الحالة",
      statusPlaceholder: "اختر الحالة",
      approvedBy: "تمت الموافقة بواسطة",
      notApprovedYet: "لم تتم الموافقة بعد",
      permitProgressTitle: "حالة التصريح",
      closePermitBtn: "إغلاق التصريح",
      permitClosedNote: "هذا التصريح مغلق.",
      closeOutDetails: "تفاصيل الإغلاق",
      closeOutDetailsPlaceholder: "اكتب كيف تم إنجاز العمل وترك المنطقة آمنة...",
      closeOutPhoto: "صورة الإغلاق",
      save: "حفظ التغييرات",
      saved: "تم حفظ التغييرات بنجاح!",
    },
    dashboard: {
      titlePrefix: "الرئيسية",
      observations: "الملاحظات",
      totalObservations: "الإجمالي",
      openLabel: "مفتوح",
      closedLabel: "مغلق",
      toolboxTalk: "التدريب والتوعية اليومية",
      sessions: "الجلسات",
      attendees: "الحضور",
      manHours: "ساعات العمل التدريبية",
      weeklyKpi: "مؤشرات الأداء الأسبوعية",
      totalManhours: "إجمالي ساعات العمل",
      totalSafeWorkHours: "إجمالي ساعات العمل الآمنة",
      nearMisses: "حالات الكاد يحدث",
      latestRecordFrom: "آخر سجل بتاريخ",
      ficc: "FICC",
      monthlyChecklists: "القوائم الشهرية",
      submittedOn: "تم الإرسال",
      hsePassport: "جواز السلامة",
      totalViolations: "إجمالي المخالفات (تأديبي)",
      permitToWork: "تصريح العمل",
      totalPermits: "إجمالي التصاريح",
      activePermits: "نشط",
      pendingApproval: "بانتظار الموافقة",
      noDataYet: "لا توجد بيانات بعد",
      notSubmittedYet: "لم يتم الإرسال بعد",
      trendTitle: "اتجاه الملاحظات — آخر 6 أسابيع",
      trendOpen: "مفتوح",
      trendClosed: "مغلق",
      safetyTipTitle: "نصيحة السلامة اليومية",
      team: "الفريق",
      totalEmployees: "إجمالي الموظفين",
      recentObservations: "أحدث الملاحظات",
      recentPermits: "أحدث تصاريح العمل",
      viewAll: "عرض الكل",
    },
  },
};
