import type {
  User,
  Project,
  Activity,
  AppNotification,
  AIRecommendation,
  DashboardStats,
} from "@/types";

export const currentUsers: Record<"MANAGER" | "EMPLOYEE" | "INNOVATOR", User> = {
  MANAGER: {
    id: "u-1",
    name: "سارة العتيبي",
    email: "sara.otaibi@innovate.sa",
    role: "MANAGER",
    status: "ACTIVE",
    specialization: "إدارة الابتكار المؤسسي",
    projectsCount: 18,
    joinedAt: "2023-02-11",
  },
  EMPLOYEE: {
    id: "u-2",
    name: "فهد المطيري",
    email: "fahad.mutairi@innovate.sa",
    role: "EMPLOYEE",
    status: "ACTIVE",
    specialization: "تطوير الأعمال",
    projectsCount: 5,
    joinedAt: "2023-08-02",
  },
  INNOVATOR: {
    id: "u-3",
    name: "نورة القحطاني",
    email: "noura.qahtani@innovate.sa",
    role: "INNOVATOR",
    status: "ACTIVE",
    specialization: "الذكاء الاصطناعي التطبيقي",
    projectsCount: 3,
    joinedAt: "2024-01-20",
  },
};

export const dashboardStats: DashboardStats = {
  totalProjects: 84,
  activeProjects: 52,
  atRiskProjects: 7,
  totalEmployees: 136,
  totalProjectsDelta: 12,
  activeProjectsDelta: 8,
  atRiskProjectsDelta: -3,
  totalEmployeesDelta: 5,
};

export const projects: Project[] = [
  {
    id: "p-1",
    name: "منصة الرعاية الصحية الذكية",
    description: "نظام تنبؤي لإدارة مواعيد المرضى وتحسين تدفق العمليات في المستشفيات باستخدام التعلم الآلي.",
    domain: "الصحة الرقمية",
    status: "ACTIVE",
    progress: 78,
    healthScore: 91,
    aiScore: 88,
    startDate: "2026-01-10",
    endDate: "2026-09-30",
    assignedEmployees: [
      { id: "u-2", name: "فهد المطيري" },
      { id: "u-4", name: "ريم الشهري" },
      { id: "u-5", name: "خالد الدوسري" },
    ],
    createdBy: "u-1",
  },
  {
    id: "p-2",
    name: "نظام إدارة المخزون الذكي",
    description: "حل يعتمد على إنترنت الأشياء لتتبع المخزون في الوقت الفعلي وتقليل الفاقد التشغيلي.",
    domain: "سلاسل الإمداد",
    status: "AT_RISK",
    progress: 34,
    healthScore: 48,
    aiScore: 55,
    startDate: "2025-11-01",
    endDate: "2026-08-15",
    assignedEmployees: [
      { id: "u-6", name: "عبدالله الغامدي" },
      { id: "u-7", name: "لمى الحربي" },
    ],
    createdBy: "u-1",
  },
  {
    id: "p-3",
    name: "تطبيق التعلم التكيفي",
    description: "منصة تعليمية تخصص المحتوى لكل طالب اعتمادًا على أدائه ونمط تعلمه.",
    domain: "التعليم",
    status: "ACTIVE",
    progress: 63,
    healthScore: 82,
    aiScore: 79,
    startDate: "2026-02-01",
    endDate: "2026-11-20",
    assignedEmployees: [
      { id: "u-3", name: "نورة القحطاني" },
      { id: "u-8", name: "سلطان العنزي" },
    ],
    createdBy: "u-1",
  },
  {
    id: "p-4",
    name: "منصة الدفع اللامركزي",
    description: "بنية تحتية آمنة للمدفوعات بين الشركات الصغيرة باستخدام تقنية البلوك تشين.",
    domain: "التقنية المالية",
    status: "PLANNING",
    progress: 12,
    healthScore: 70,
    aiScore: 60,
    startDate: "2026-05-01",
    endDate: "2027-02-28",
    assignedEmployees: [{ id: "u-9", name: "منيرة الزهراني" }],
    createdBy: "u-1",
  },
  {
    id: "p-5",
    name: "نظام رصد الطاقة المتجددة",
    description: "لوحة تحكم مركزية لمراقبة أداء محطات الطاقة الشمسية وتوقع أعطال المعدات.",
    domain: "الطاقة",
    status: "COMPLETED",
    progress: 100,
    healthScore: 96,
    aiScore: 93,
    startDate: "2025-06-15",
    endDate: "2026-03-01",
    assignedEmployees: [
      { id: "u-5", name: "خالد الدوسري" },
      { id: "u-10", name: "أمل السبيعي" },
    ],
    createdBy: "u-1",
  },
  {
    id: "p-6",
    name: "روبوت خدمة العملاء الذكي",
    description: "مساعد محادثة متعدد اللغات لدعم العملاء يعتمد على نماذج اللغة الكبيرة.",
    domain: "تجربة العملاء",
    status: "ACTIVE",
    progress: 55,
    healthScore: 75,
    aiScore: 81,
    startDate: "2026-03-05",
    endDate: "2026-10-10",
    assignedEmployees: [
      { id: "u-2", name: "فهد المطيري" },
      { id: "u-3", name: "نورة القحطاني" },
    ],
    createdBy: "u-1",
  },
];

export const activities: Activity[] = [
  { id: "a-1", actor: "فهد المطيري", action: "رفع تقريرًا جديدًا لمشروع", target: "منصة الرعاية الصحية الذكية", timestamp: "قبل 12 دقيقة" },
  { id: "a-2", actor: "نورة القحطاني", action: "حدّثت نسبة الإنجاز في مشروع", target: "تطبيق التعلم التكيفي", timestamp: "قبل 40 دقيقة" },
  { id: "a-3", actor: "خالد الدوسري", action: "أضافت ملفًا جديدًا إلى مشروع", target: "نظام رصد الطاقة المتجددة", timestamp: "قبل ساعتين" },
  { id: "a-4", actor: "سارة العتيبي", action: "علّقت على مشروع", target: "نظام إدارة المخزون الذكي", timestamp: "قبل 3 ساعات" },
  { id: "a-5", actor: "لمى الحربي", action: "انضمت إلى فريق مشروع", target: "نظام إدارة المخزون الذكي", timestamp: "أمس" },
];

export const notifications: AppNotification[] = [
  { id: "n-1", title: "تنبيه خطر", message: "مشروع «نظام إدارة المخزون الذكي» تجاوز الجدول الزمني المتوقع.", type: "danger", read: false, timestamp: "قبل 10 دقائق" },
  { id: "n-2", title: "توصية ذكاء اصطناعي جديدة", message: "تحسين تخصيص الموارد في «تطبيق التعلم التكيفي» قد يرفع الأداء بنسبة 15٪.", type: "info", read: false, timestamp: "قبل ساعة" },
  { id: "n-3", title: "تم إنجاز مرحلة", message: "مشروع «نظام رصد الطاقة المتجددة» وصل إلى نسبة إنجاز 100٪.", type: "success", read: true, timestamp: "أمس" },
  { id: "n-4", title: "موعد تسليم قريب", message: "موعد تسليم «منصة الرعاية الصحية الذكية» خلال 5 أيام.", type: "warning", read: true, timestamp: "قبل يومين" },
];

export const aiRecommendations: AIRecommendation[] = [
  {
    id: "r-1",
    projectId: "p-2",
    projectName: "نظام إدارة المخزون الذكي",
    title: "خطر تأخر مرتفع",
    description: "معدل إنجاز المهام أقل بنسبة 40٪ من المعدل الطبيعي لهذه المرحلة. يُنصح بإعادة توزيع الموارد.",
    priority: "HIGH",
    category: "RISK",
  },
  {
    id: "r-2",
    projectId: "p-3",
    projectName: "تطبيق التعلم التكيفي",
    title: "فرصة تسريع الأداء",
    description: "يمكن تقليص مدة الاختبار بمقدار أسبوعين عبر أتمتة سيناريوهات الفحص المتكررة.",
    priority: "MEDIUM",
    category: "PERFORMANCE",
  },
  {
    id: "r-3",
    projectId: "p-1",
    projectName: "منصة الرعاية الصحية الذكية",
    title: "زيادة الطلب على الموارد",
    description: "التحليل التنبؤي يشير إلى الحاجة لعضو فريق إضافي خلال المرحلة القادمة لتفادي الاختناق.",
    priority: "LOW",
    category: "RESOURCE",
  },
];

export const areaChartData = [
  { month: "يناير", إنجاز: 34, مخطط: 40 },
  { month: "فبراير", إنجاز: 41, مخطط: 45 },
  { month: "مارس", إنجاز: 55, مخطط: 52 },
  { month: "أبريل", إنجاز: 60, مخطط: 58 },
  { month: "مايو", إنجاز: 68, مخطط: 65 },
  { month: "يونيو", إنجاز: 74, مخطط: 72 },
  { month: "يوليو", إنجاز: 82, مخطط: 80 },
];

export const projectsByDomain = [
  { name: "الصحة الرقمية", value: 18, color: "#4F46E5" },
  { name: "سلاسل الإمداد", value: 14, color: "#7C3AED" },
  { name: "التعليم", value: 16, color: "#16B364" },
  { name: "التقنية المالية", value: 12, color: "#F5A623" },
  { name: "الطاقة", value: 13, color: "#3B82F6" },
  { name: "أخرى", value: 11, color: "#8A93A6" },
];

export const barChartData = [
  { department: "التقنية", مشاريع: 24 },
  { department: "التسويق", مشاريع: 12 },
  { department: "العمليات", مشاريع: 18 },
  { department: "الموارد البشرية", مشاريع: 8 },
  { department: "المالية", مشاريع: 10 },
];
