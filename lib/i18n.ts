export type Locale = "en" | "ar";

export interface TranslationShape {
  appName: string;
  tagline: string;
  common: {
    genericError: string;
    autoAssigned: string;
    loading: string;
    exportExcel: string;
    exportWord: string;
    exporting: string;
    close: string;
    comingSoon: string;
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
    errorPending: string;
    footer: string;
    noAccount: string;
    signUpLink: string;
    forgotTitle: string;
    forgotSubtitle: string;
    forgotSubmit: string;
    forgotSubmitting: string;
    forgotSuccess: string;
    forgotError: string;
    backToLogin: string;
  };
  resetPassword: {
    title: string;
    subtitle: string;
    newPassword: string;
    newPasswordPlaceholder: string;
    confirmPassword: string;
    confirmPasswordPlaceholder: string;
    submit: string;
    submitting: string;
    success: string;
    goToLogin: string;
    errorMismatch: string;
    errorGeneric: string;
    errorSession: string;
  };
  signup: {
    title: string;
    subtitle: string;
    fullName: string;
    fullNamePlaceholder: string;
    employeeCode: string;
    employeeCodePlaceholder: string;
    project: string;
    projectPlaceholder: string;
    email: string;
    emailPlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    confirmPassword: string;
    confirmPasswordPlaceholder: string;
    submit: string;
    submitting: string;
    haveAccount: string;
    loginLink: string;
    errorMismatch: string;
    errorGeneric: string;
    successTitle: string;
    successMessage: string;
    backToLogin: string;
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
    myChecklist: string;
    logout: string;
    hello: string;
    userManagement: string;
    incidents: string;
    injury: string;
    reports: string;
    pmv: string;
    summaryPerformanceReport: string;
    editRequests: string;
  };
  userManagement: {
    title: string;
    subtitle: string;
    pendingSection: string;
    noPending: string;
    colName: string;
    colEmail: string;
    colEmployeeCode: string;
    colProject: string;
    colRequestedAt: string;
    colActions: string;
    approve: string;
    approving: string;
    reject: string;
    rejecting: string;
    accessDenied: string;
    allApprovedSection: string;
    confirmRevoke: string;
    revoke: string;
    revoking: string;
    deleteAccount: string;
    deleting: string;
    confirmDelete: string;
    deleteError: string;
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
  appearance: {
    openLabel: string;
    title: string;
    colorTheme: string;
    morphismStyle: string;
  };
  reports: {
    subtitle: string;
    tabDaily: string;
    tabWeekly: string;
    tabMonthly: string;
    monthlyIntro: string;
    viewMyChecklist: string;
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
  myChecklist: {
    title: string;
    subtitle: string;
    empty: string;
    search: string;
    colType: string;
    colInspectedBy: string;
    colInspectionDate: string;
    colProjectDirector: string;
    colTotalManpower: string;
    colActivity: string;
    colProjectName: string;
    colFinalScore: string;
    colActions: string;
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
    employeeName: string;
    employeeIdCol: string;
    projectCol: string;
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
    totalsRow: string;
    readOnlyNotice: string;
    requestEdit: string;
    requestEditTitle: string;
    requestEditNotesLabel: string;
    requestEditNotesPlaceholder: string;
    requestEditSubmit: string;
    requestEditSubmitting: string;
    requestEditSuccess: string;
    requestEditError: string;
  };
  editRequests: {
    title: string;
    subtitle: string;
    colRecord: string;
    colRequester: string;
    colProject: string;
    colNotes: string;
    colStatus: string;
    colDate: string;
    approve: string;
    reject: string;
    empty: string;
    statusPending: string;
    statusApproved: string;
    statusRejected: string;
  };
  summaryReport: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    noSelection: string;
    noResults: string;
    employeeCode: string;
    project: string;
    department: string;
    phone: string;
    jobGrade: string;
    notProvided: string;
    statsTitle: string;
    disciplinaryTotal: string;
    ppeTotal: string;
    trainingTotal: string;
    trainingHoursTotal: string;
    observationsInspected: string;
    toolboxInductions: string;
    lsrViolations: string;
  };
  injury: {
    title: string;
    subtitle: string;
    bodyMapTitle: string;
    bodyMapEmpty: string;
    listTitle: string;
    colDate: string;
    colProject: string;
    colClassification: string;
    colBodyPart: string;
    colStatus: string;
    colDescription: string;
    empty: string;
    unspecifiedBodyPart: string;
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
    contractorFirstFix: string;
    contractorSubcontractor: string;
    subcontractorNamePlaceholder: string;
    contractorTypeRequired: string;
    subcontractorNameRequired: string;
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
    qrCode: string;
    qrCodeHint: string;
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
    analyticsTitle: string;
    byClassification: string;
    byRiskRating: string;
    permitStatusBreakdown: string;
    kpiTrendTitle: string;
    noPermitsYet: string;
    companyOverview: string;
    totalSafeManhours: string;
    totalTrainingHours: string;
    totalLsrViolations: string;
    manhoursUnit: string;
    hoursUnit: string;
    recordsUnit: string;
    topProjectsTitle: string;
    mostObservationsByProject: string;
    mostLsrByProject: string;
    mostTrainingByProject: string;
    observationsCount: string;
    lsrCount: string;
    trainingHoursCount: string;
  };
  topbar: {
    greetingMorning: string;
    greetingAfternoon: string;
    greetingEvening: string;
    notifications: string;
    noNotifications: string;
    permitsNeedingAttention: string;
    ppeReplacementDue: string;
    trainingExpired: string;
    checklistsNotSubmitted: string;
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
      exportExcel: "Export to Excel",
      exportWord: "Export to Word",
      exporting: "Exporting...",
      close: "Close",
      comingSoon: "This page is under construction — check back soon.",
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
      errorPending: "Your account is still awaiting admin approval.",
      footer: "Protect People. Protect Projects. Protect Future.",
      noAccount: "New here?",
      signUpLink: "Create an account",
      forgotTitle: "Reset your password",
      forgotSubtitle: "Enter your account email and we'll send you a reset link.",
      forgotSubmit: "Send reset link",
      forgotSubmitting: "Sending...",
      forgotSuccess: "If an account exists for that email, a reset link is on its way. Check your inbox.",
      forgotError: "Couldn't send the reset link. Please try again.",
      backToLogin: "Back to login",
    },
    resetPassword: {
      title: "Set a new password",
      subtitle: "Choose a new password for your account.",
      newPassword: "New password",
      newPasswordPlaceholder: "Enter a new password",
      confirmPassword: "Confirm new password",
      confirmPasswordPlaceholder: "Re-enter the new password",
      submit: "Update password",
      submitting: "Updating...",
      success: "Your password has been updated successfully.",
      goToLogin: "Go to login",
      errorMismatch: "Passwords don't match.",
      errorGeneric: "Couldn't update your password. Please request a new reset link.",
      errorSession: "This reset link is invalid or has expired. Please request a new one.",
    },
    signup: {
      title: "Create your account",
      subtitle: "Sign up to request access to First Fix HSE",
      fullName: "Full name",
      fullNamePlaceholder: "Your full name",
      employeeCode: "Employee code",
      employeeCodePlaceholder: "e.g. FF-1024",
      project: "Project",
      projectPlaceholder: "Select your project",
      email: "Email",
      emailPlaceholder: "name@company.com",
      password: "Password",
      passwordPlaceholder: "Create a password",
      confirmPassword: "Confirm password",
      confirmPasswordPlaceholder: "Re-enter your password",
      submit: "Create Account",
      submitting: "Creating account...",
      haveAccount: "Already have an account?",
      loginLink: "Log in",
      errorMismatch: "Passwords do not match.",
      errorGeneric: "Couldn't create your account. Please try again.",
      successTitle: "Request submitted",
      successMessage: "Your account has been created and is now awaiting admin approval. You'll be able to log in once an admin approves it.",
      backToLogin: "Back to login",
    },
    nav: {
      dashboard: "Dashboard",
      newObservation: "New Observation",
      myObservations: "My Observations",
      envChecklist: "Environmental Checklist",
      fireChecklist: "Fire Assessment Checklist",
      shChecklist: "Health & Safety Checklist",
      tcChecklist: "T&C and Energization Checklist",
      toolboxTalk: "Toolbox Talk",
      hsePassport: "HSE Passport",
      disciplinaryAction: "Disciplinary Action",
      ppe: "PPE",
      training: "Training",
      weeklyKpi: "KPI's",
      monthlyChecklists: "Monthly Checklists",
      permitToWork: "Permit to Work",
      myPermits: "My Permits",
      myChecklist: "My Checklist",
      logout: "Log Out",
      hello: "Hello",
      userManagement: "User Management",
      incidents: "Incidents",
      injury: "Injury",
      reports: "Reports",
      pmv: "PMV",
      summaryPerformanceReport: "Summary Performance Report",
      editRequests: "Edit Requests",
    },
    userManagement: {
      title: "User Management",
      subtitle: "Approve new sign-ups and manage access.",
      pendingSection: "Pending Approval",
      noPending: "No accounts waiting for approval.",
      colName: "Name",
      colEmail: "Email",
      colEmployeeCode: "Employee Code",
      colProject: "Project",
      colRequestedAt: "Requested",
      colActions: "Actions",
      approve: "Approve",
      approving: "Approving...",
      reject: "Reject",
      rejecting: "Rejecting...",
      accessDenied: "You don't have access to this page.",
      allApprovedSection: "Approved Users",
      confirmRevoke: "Are you sure you want to revoke access for this user?",
      revoke: "Revoke",
      revoking: "Revoking...",
      deleteAccount: "Delete Account",
      deleting: "Deleting...",
      confirmDelete: "This permanently deletes this user's account and login — this cannot be undone. Are you sure?",
      deleteError: "Couldn't delete this account. Please try again.",
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
    appearance: {
      openLabel: "Appearance settings",
      title: "Appearance",
      colorTheme: "Color Theme",
      morphismStyle: "Card Style",
    },
    reports: {
      subtitle: "Daily, weekly, and monthly HSE reporting in one place.",
      tabDaily: "Daily",
      tabWeekly: "Weekly",
      tabMonthly: "Monthly",
      monthlyIntro: "Monthly checklists",
      viewMyChecklist: "View My Checklist submissions",
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
    myChecklist: {
      title: "My Checklists",
      subtitle: "Monthly checklists submitted for your project",
      empty: "No checklists submitted yet for your project.",
      search: "Search by activity or project director...",
      colType: "Checklist Type",
      colInspectedBy: "Inspected By",
      colInspectionDate: "Inspection Date",
      colProjectDirector: "Project Director",
      colTotalManpower: "Total Manpower",
      colActivity: "Activity",
      colProjectName: "Project Name",
      colFinalScore: "Final Average Score",
      colActions: "Actions",
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
      employeeName: "Employee Name",
      employeeIdCol: "Employee ID",
      projectCol: "Project",
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
      view: "View",
      detailTitle: "Weekly KPI Record",
      back: "Back to Weekly KPI",
      recordedOn: "Recorded on",
      save: "Save Changes",
      saved: "Changes saved successfully!",
      totalsRow: "Total (filtered)",
      readOnlyNotice: "This record is read-only. If you need a change made, submit an edit request below and an admin will review it.",
      requestEdit: "Request Edit",
      requestEditTitle: "Request an edit",
      requestEditNotesLabel: "What would you like changed, and why?",
      requestEditNotesPlaceholder: "Describe the change you need...",
      requestEditSubmit: "Submit Request",
      requestEditSubmitting: "Submitting...",
      requestEditSuccess: "Your edit request has been submitted. An admin will review it.",
      requestEditError: "Couldn't submit your request. Please try again.",
    },
    editRequests: {
      title: "Edit Requests",
      subtitle: "Edit requests submitted by employees, awaiting admin review.",
      colRecord: "Record",
      colRequester: "Requested By",
      colProject: "Project",
      colNotes: "Notes",
      colStatus: "Status",
      colDate: "Date",
      approve: "Approve",
      reject: "Reject",
      empty: "No edit requests yet.",
      statusPending: "Pending",
      statusApproved: "Approved",
      statusRejected: "Rejected",
    },
    summaryReport: {
      title: "Summary Performance Report",
      subtitle: "Search for an employee to view their full HSE performance report.",
      searchPlaceholder: "Search by name or employee code...",
      noSelection: "Search for an employee above to see their report.",
      noResults: "No employees found.",
      employeeCode: "Employee Code",
      project: "Project",
      department: "Department",
      phone: "Phone",
      jobGrade: "Job Grade",
      notProvided: "Not provided yet",
      statsTitle: "Overall Performance",
      disciplinaryTotal: "Disciplinary Records",
      ppeTotal: "PPE Records",
      trainingTotal: "Training Courses",
      trainingHoursTotal: "Total Training Hours",
      observationsInspected: "Observations Inspected",
      toolboxInductions: "Toolbox Talks Inducted",
      lsrViolations: "LSR Violations",
    },
    injury: {
      title: "Injury (FICC)",
      subtitle: "Injury records from the FICC log, with a body-part breakdown.",
      bodyMapTitle: "Injuries by Body Part",
      bodyMapEmpty: "No body-part data to show yet.",
      listTitle: "Injury Records",
      colDate: "Date",
      colProject: "Project",
      colClassification: "Classification",
      colBodyPart: "Body Part",
      colStatus: "Status",
      colDescription: "Description",
      empty: "No injury records yet.",
      unspecifiedBodyPart: "Not specified",
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
      contractorFirstFix: "First Fix",
      contractorSubcontractor: "Subcontractor",
      subcontractorNamePlaceholder: "Enter the subcontractor's company name",
      contractorTypeRequired: "Please select First Fix or Subcontractor.",
      subcontractorNameRequired: "Please enter the subcontractor's name.",
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
      qrCode: "Permit QR Code",
      qrCodeHint: "Scan to view this permit's details",
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
      analyticsTitle: "Analytics",
      byClassification: "Observations by Classification",
      byRiskRating: "Observations by Risk Rating",
      permitStatusBreakdown: "Permit Status Breakdown",
      kpiTrendTitle: "Weekly KPI Trend — Total Manhours",
      noPermitsYet: "No permits yet",
      companyOverview: "Company Overview — All Projects",
      totalSafeManhours: "Total Safe Manhours",
      totalTrainingHours: "Total Training Hours",
      totalLsrViolations: "Total LSR Violations",
      manhoursUnit: "man-hours",
      hoursUnit: "hours",
      recordsUnit: "records",
      topProjectsTitle: "Top Projects",
      mostObservationsByProject: "Most HSE Observations by Project",
      mostLsrByProject: "Most LSR's by Project",
      mostTrainingByProject: "Most HSE Training by Project",
      observationsCount: "observations",
      lsrCount: "LSR violations",
      trainingHoursCount: "training hours",
    },
    topbar: {
      greetingMorning: "Good Morning",
      greetingAfternoon: "Good Afternoon",
      greetingEvening: "Good Evening",
      notifications: "Notifications",
      noNotifications: "You're all caught up — no new notifications",
      permitsNeedingAttention: "{count} permit(s) ending soon or awaiting closure",
      ppeReplacementDue: "{count} PPE item(s) due for replacement soon",
      trainingExpired: "{count} training record(s) have expired",
      checklistsNotSubmitted: "{count} monthly checklist(s) not submitted yet this month",
    },
  },
  ar: {
    appName: "فيرست فيكس - الصحة والسلامة",
    tagline: "السلامة اليوم تؤمّن الغد",
    common: {
      genericError: "حدث خطأ ما. من فضلك حاول مرة أخرى.",
      autoAssigned: "يتم تعيينه تلقائيًا عند الإرسال",
      loading: "جارٍ التحميل...",
      exportExcel: "تصدير إلى إكسل",
      exportWord: "تصدير إلى وورد",
      exporting: "جارٍ التصدير...",
      close: "إغلاق",
      comingSoon: "الصفحة دي لسه تحت الإنشاء — تابعنا قريب.",
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
      errorPending: "حسابك لسه مستني موافقة الأدمن.",
      footer: "نحمي الأفراد. نحمي المشاريع. نحمي المستقبل.",
      noAccount: "لسه معملتش حساب؟",
      signUpLink: "أنشئ حساب جديد",
      forgotTitle: "استعادة كلمة المرور",
      forgotSubtitle: "أدخل البريد الإلكتروني بتاع حسابك وهنبعتلك رابط لإعادة تعيين كلمة المرور.",
      forgotSubmit: "إرسال رابط إعادة التعيين",
      forgotSubmitting: "جارٍ الإرسال...",
      forgotSuccess: "لو فيه حساب مرتبط بالبريد ده، هيوصلك رابط إعادة التعيين. راجع بريدك الإلكتروني.",
      forgotError: "تعذر إرسال رابط إعادة التعيين. حاول مرة أخرى.",
      backToLogin: "الرجوع لتسجيل الدخول",
    },
    resetPassword: {
      title: "تعيين كلمة مرور جديدة",
      subtitle: "اختر كلمة مرور جديدة لحسابك.",
      newPassword: "كلمة المرور الجديدة",
      newPasswordPlaceholder: "أدخل كلمة مرور جديدة",
      confirmPassword: "تأكيد كلمة المرور الجديدة",
      confirmPasswordPlaceholder: "أعد إدخال كلمة المرور الجديدة",
      submit: "تحديث كلمة المرور",
      submitting: "جارٍ التحديث...",
      success: "تم تحديث كلمة المرور بنجاح.",
      goToLogin: "الذهاب لتسجيل الدخول",
      errorMismatch: "كلمتا المرور غير متطابقتين.",
      errorGeneric: "تعذر تحديث كلمة المرور. من فضلك اطلب رابط إعادة تعيين جديد.",
      errorSession: "رابط إعادة التعيين ده غير صالح أو انتهت صلاحيته. من فضلك اطلب رابط جديد.",
    },
    signup: {
      title: "إنشاء حساب جديد",
      subtitle: "اطلب صلاحية الدخول على First Fix HSE",
      fullName: "الاسم بالكامل",
      fullNamePlaceholder: "اكتب اسمك بالكامل",
      employeeCode: "الرقم الوظيفي",
      employeeCodePlaceholder: "مثال: FF-1024",
      project: "المشروع",
      projectPlaceholder: "اختر مشروعك",
      email: "البريد الإلكتروني",
      emailPlaceholder: "name@company.com",
      password: "كلمة المرور",
      passwordPlaceholder: "اختر كلمة مرور",
      confirmPassword: "تأكيد كلمة المرور",
      confirmPasswordPlaceholder: "أعد كتابة كلمة المرور",
      submit: "إنشاء الحساب",
      submitting: "جارٍ إنشاء الحساب...",
      haveAccount: "عندك حساب بالفعل؟",
      loginLink: "سجّل الدخول",
      errorMismatch: "كلمتا المرور غير متطابقتين.",
      errorGeneric: "تعذّر إنشاء حسابك، من فضلك حاول تاني.",
      successTitle: "تم إرسال الطلب",
      successMessage: "تم إنشاء حسابك وهو الآن في انتظار موافقة الأدمن. هتقدر تسجّل دخولك بمجرد ما الأدمن يوافق عليه.",
      backToLogin: "الرجوع لتسجيل الدخول",
    },
    nav: {
      dashboard: "الرئيسية",
      newObservation: "ملاحظة جديدة",
      myObservations: "ملاحظاتي",
      envChecklist: "قائمة الفحص البيئي",
      fireChecklist: "قائمة فحص السلامة من الحريق",
      shChecklist: "قائمة الصحة والسلامة المهنية",
      tcChecklist: "قائمة فحص التشغيل والطاقة (T&C)",
      toolboxTalk: "توعية العمل (Toolbox Talk)",
      hsePassport: "جواز السلامة (HSE Passport)",
      disciplinaryAction: "الإجراءات التأديبية",
      ppe: "معدات الوقاية الشخصية",
      training: "التدريب",
      weeklyKpi: "مؤشرات الأداء (KPI's)",
      monthlyChecklists: "القوائم الشهرية",
      permitToWork: "تصريح العمل",
      myPermits: "تصاريحي",
      myChecklist: "قوائم فحصي",
      logout: "تسجيل الخروج",
      hello: "أهلاً",
      userManagement: "إدارة المستخدمين",
      incidents: "الحوادث (Incidents)",
      injury: "الإصابات (Injury)",
      reports: "التقارير (Reports)",
      pmv: "PMV",
      summaryPerformanceReport: "تقرير الأداء الإجمالي",
      editRequests: "طلبات التعديل",
    },
    userManagement: {
      title: "إدارة المستخدمين",
      subtitle: "وافق على طلبات التسجيل الجديدة وتحكم في صلاحيات الدخول.",
      pendingSection: "في انتظار الموافقة",
      noPending: "مفيش حسابات مستنية موافقة.",
      colName: "الاسم",
      colEmail: "البريد الإلكتروني",
      colEmployeeCode: "الرقم الوظيفي",
      colProject: "المشروع",
      colRequestedAt: "تاريخ الطلب",
      colActions: "إجراءات",
      approve: "موافقة",
      approving: "جارٍ الموافقة...",
      reject: "رفض",
      rejecting: "جارٍ الرفض...",
      accessDenied: "معندكش صلاحية الدخول على الصفحة دي.",
      allApprovedSection: "المستخدمين المفعّلين",
      confirmRevoke: "متأكد إنك عايز تلغي صلاحية الدخول للمستخدم ده؟",
      revoke: "إلغاء الصلاحية",
      revoking: "جارٍ الإلغاء...",
      deleteAccount: "حذف الحساب نهائيًا",
      deleting: "جارٍ الحذف...",
      confirmDelete: "هيتم حذف حساب المستخدم ده وبيانات الدخول بتاعته نهائيًا — الإجراء ده مش ممكن التراجع عنه. متأكد؟",
      deleteError: "تعذر حذف الحساب. حاول مرة أخرى.",
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
    appearance: {
      openLabel: "إعدادات المظهر",
      title: "المظهر",
      colorTheme: "لون الثيم",
      morphismStyle: "نمط الكروت",
    },
    reports: {
      subtitle: "تقارير السلامة اليومية والأسبوعية والشهرية في مكان واحد.",
      tabDaily: "يومي",
      tabWeekly: "أسبوعي",
      tabMonthly: "شهري",
      monthlyIntro: "القوائم الشهرية",
      viewMyChecklist: "عرض القوائم اللي تم إرسالها (My Checklist)",
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
    myChecklist: {
      title: "قوائم الفحص الخاصة بي",
      subtitle: "قوائم الفحص الشهرية المرسلة لمشروعك",
      empty: "لا توجد قوائم فحص مُرسلة بعد لمشروعك.",
      search: "ابحث بالنشاط أو مدير المشروع...",
      colType: "نوع القائمة",
      colInspectedBy: "تم الفحص بواسطة",
      colInspectionDate: "تاريخ الفحص",
      colProjectDirector: "مدير المشروع",
      colTotalManpower: "إجمالي عدد العمالة",
      colActivity: "النشاط",
      colProjectName: "اسم المشروع",
      colFinalScore: "متوسط النتيجة النهائية",
      colActions: "إجراءات",
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
      employeeName: "اسم الموظف",
      employeeIdCol: "الرقم الوظيفي",
      projectCol: "المشروع",
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
      view: "عرض",
      detailTitle: "سجل مؤشرات الأداء الأسبوعية",
      back: "الرجوع إلى مؤشرات الأداء الأسبوعية",
      recordedOn: "تاريخ التسجيل",
      save: "حفظ التغييرات",
      saved: "تم حفظ التغييرات بنجاح!",
      totalsRow: "الإجمالي (حسب البحث)",
      readOnlyNotice: "هذا السجل للعرض فقط. لو محتاج تعديل، ابعت طلب تعديل بالأسفل وهيتم مراجعته من الأدمن.",
      requestEdit: "طلب تعديل",
      requestEditTitle: "طلب تعديل السجل",
      requestEditNotesLabel: "عايز تعدل إيه، وليه؟",
      requestEditNotesPlaceholder: "اشرح التعديل المطلوب...",
      requestEditSubmit: "إرسال الطلب",
      requestEditSubmitting: "جاري الإرسال...",
      requestEditSuccess: "تم إرسال طلب التعديل بنجاح. هيتم مراجعته من الأدمن.",
      requestEditError: "تعذر إرسال الطلب. حاول مرة أخرى.",
    },
    editRequests: {
      title: "طلبات التعديل",
      subtitle: "طلبات التعديل المرسلة من الموظفين، بانتظار مراجعة الأدمن.",
      colRecord: "السجل",
      colRequester: "مقدّم الطلب",
      colProject: "المشروع",
      colNotes: "الملاحظات",
      colStatus: "الحالة",
      colDate: "التاريخ",
      approve: "موافقة",
      reject: "رفض",
      empty: "لا توجد طلبات تعديل بعد.",
      statusPending: "قيد الانتظار",
      statusApproved: "تمت الموافقة",
      statusRejected: "مرفوض",
    },
    summaryReport: {
      title: "تقرير الأداء الإجمالي",
      subtitle: "ابحث عن موظف لعرض تقرير أدائه الكامل في السلامة والصحة المهنية.",
      searchPlaceholder: "ابحث بالاسم أو الرقم الوظيفي...",
      noSelection: "ابحث عن موظف بالأعلى لعرض تقريره.",
      noResults: "لا يوجد موظفين مطابقين.",
      employeeCode: "الرقم الوظيفي",
      project: "المشروع",
      department: "القسم",
      phone: "رقم الهاتف",
      jobGrade: "الدرجة الوظيفية",
      notProvided: "لم تُضاف بعد",
      statsTitle: "الأداء الإجمالي",
      disciplinaryTotal: "الإجراءات التأديبية",
      ppeTotal: "سجلات معدات الوقاية",
      trainingTotal: "الدورات التدريبية",
      trainingHoursTotal: "إجمالي ساعات التدريب",
      observationsInspected: "الملاحظات التي تم رصدها",
      toolboxInductions: "جلسات التوعية التي قادها",
      lsrViolations: "مخالفات LSR",
    },
    injury: {
      title: "الإصابات (FICC)",
      subtitle: "سجلات الإصابات من ملف FICC، مع توزيع حسب منطقة الإصابة في الجسم.",
      bodyMapTitle: "الإصابات حسب منطقة الجسم",
      bodyMapEmpty: "لا توجد بيانات كافية لعرض توزيع الإصابات بعد.",
      listTitle: "سجلات الإصابات",
      colDate: "التاريخ",
      colProject: "المشروع",
      colClassification: "التصنيف",
      colBodyPart: "منطقة الإصابة",
      colStatus: "الحالة",
      colDescription: "الوصف",
      empty: "لا توجد سجلات إصابات بعد.",
      unspecifiedBodyPart: "غير محدد",
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
      contractorFirstFix: "فيرست فيكس",
      contractorSubcontractor: "مقاول من الباطن",
      subcontractorNamePlaceholder: "اكتب اسم شركة المقاول من الباطن",
      contractorTypeRequired: "من فضلك اختر فيرست فيكس أو مقاول من الباطن.",
      subcontractorNameRequired: "من فضلك اكتب اسم المقاول من الباطن.",
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
      qrCode: "رمز QR الخاص بالتصريح",
      qrCodeHint: "امسح الرمز لعرض بيانات هذا التصريح",
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
      analyticsTitle: "التحليلات",
      byClassification: "الملاحظات حسب التصنيف",
      byRiskRating: "الملاحظات حسب درجة الخطورة",
      permitStatusBreakdown: "توزيع حالة التصاريح",
      kpiTrendTitle: "اتجاه مؤشرات الأداء الأسبوعية — إجمالي ساعات العمل",
      noPermitsYet: "لا توجد تصاريح بعد",
      companyOverview: "نظرة عامة على الشركة — كل المشاريع",
      totalSafeManhours: "إجمالي ساعات العمل الآمنة",
      totalTrainingHours: "إجمالي ساعات التدريب",
      totalLsrViolations: "إجمالي مخالفات LSR",
      manhoursUnit: "ساعة عمل",
      hoursUnit: "ساعة",
      recordsUnit: "سجل",
      topProjectsTitle: "أفضل المشاريع",
      mostObservationsByProject: "الأكثر في ملاحظات السلامة حسب المشروع",
      mostLsrByProject: "الأكثر في مخالفات LSR حسب المشروع",
      mostTrainingByProject: "الأكثر في التدريب حسب المشروع",
      observationsCount: "ملاحظة",
      lsrCount: "مخالفة LSR",
      trainingHoursCount: "ساعة تدريب",
    },
    topbar: {
      greetingMorning: "صباح الخير",
      greetingAfternoon: "مساء الخير",
      greetingEvening: "مساء الخير",
      notifications: "الإشعارات",
      noNotifications: "لا توجد إشعارات جديدة",
      permitsNeedingAttention: "{count} تصريح على وشك الانتهاء أو بانتظار الإغلاق",
      ppeReplacementDue: "{count} من مهمات الوقاية الشخصية بحاجة للاستبدال قريبًا",
      trainingExpired: "{count} من سجلات التدريب منتهية الصلاحية",
      checklistsNotSubmitted: "{count} من قوائم الفحص الشهرية لم تُرسل بعد هذا الشهر",
    },
  },
};
