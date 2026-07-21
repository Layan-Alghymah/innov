import React, { useState } from "react";

const COLORS = {
  navy: "#0E1A3A", navy2: "#152452", purple: "#6D3FC0", purpleDeep: "#4A2A8C",
  amber: "#E8A33D", red: "#D9534F", green: "#3FA772", bg: "#F4F5F9",
  card: "#FFFFFF", line: "#E7E8F0", text: "#1C2340", muted: "#8790A8",
};

const TITLES = {
  dashboard: "لوحة المؤشرات العامة", alerts: "مركز التنبيهات الزمنية",
  strategy: "التوجه الاستراتيجي", requirements: "متطلبات الابتكار وفعالياته",
  governance: "حوكمة الابتكار — من الفكرة إلى الاعتماد",
  solutions: "السجل الرئيسي للحلول الابتكارية", impact: "قياس الأثر",
  partners: "سجل الجهات والشراكات", dga: "ملف الامتثال (DGA)",
};

const NAV_GROUPS = [
  { label: "الرئيسية", items: [
    { key: "dashboard", icon: "🏠", label: "لوحة المؤشرات" },
    { key: "alerts", icon: "🔔", label: "مركز التنبيهات" },
  ]},
  { label: "وحدات المسار الظاهر — 5.23 الابتكار المؤسسي", items: [
    { key: "strategy", icon: "🎯", label: "التوجه الاستراتيجي" },
    { key: "requirements", icon: "✳️", label: "متطلبات الابتكار وفعالياته" },
    { key: "governance", icon: "🏛️", label: "حوكمة الابتكار" },
  ]},
  { label: "وحدات المسار الظاهر — 5.24 الحلول الابتكارية", items: [
    { key: "solutions", icon: "💡", label: "حصر الحلول الابتكارية" },
    { key: "impact", icon: "📈", label: "قياس الأثر" },
  ]},
  { label: "الإدارة والتشغيل", items: [
    { key: "partners", icon: "🤝", label: "سجل الجهات والشراكات" },
    { key: "dga", icon: "📁", label: "ملف الامتثال (DGA)" },
  ]},
];

const STAGE_STYLE = {
  "مفهوم": { bg: "#EEEEF4", color: "#666F8C" },
  "نموذج أولي (Prototype)": { bg: "#EEEEF4", color: "#666F8C" },
  "إثبات مفهوم (PoC)": { bg: "#E7EEFC", color: "#2A5CC7" },
  "نسخة تجريبية": { bg: "#E4F6EC", color: "#1C7A48" },
  "تشغيل فعلي": { bg: "#E4F6EC", color: "#1C7A48" },
};
const STAGE_LIST = Object.keys(STAGE_STYLE);
const KANBAN_COLUMNS = ["قيد المراجعة الفنية", "احتضان فوري (Pilot)", "مكتملة"];
const SOURCES = ["هاكاثون المعسكر", "مقترح داخلي", "شراكة خارجية"];

const INITIAL_SOLUTIONS = [
  { id: 1, name: "شُمّان", maturityStage: "نموذج أولي (Prototype)", kanbanColumn: "احتضان فوري (Pilot)", owner: "إدارة الأصول والعمليات البيانية", source: "هاكاثون المعسكر", pct: 62, problem: "غياب رؤية موحّدة لحالة الأصول يؤخر قرارات الصيانة", duration: "6 أشهر", cost: "18٬000 ر.س", audience: "فرق تشغيل المحطات", strategicGoal: "رفع كفاءة التشغيل" },
  { id: 2, name: "مدار (Madar AI)", maturityStage: "إثبات مفهوم (PoC)", kanbanColumn: "قيد المراجعة الفنية", owner: "إدارة الأصول والعمليات البيانية", source: "هاكاثون المعسكر", pct: 71, problem: "الاعتماد على التقارير التقليدية يؤدي لتأخر اتخاذ قرارات الصيانة قبل وقوع الأعطال", duration: "6 أشهر", cost: "24٬000 ر.س", audience: "مهندسو محطات الطاقة الشمسية", strategicGoal: "تعزيز مظاهر الاستدامة" },
  { id: 3, name: "سنَد (SANAD)", maturityStage: "نسخة تجريبية", kanbanColumn: "احتضان فوري (Pilot)", owner: "الإدارة العامة لشبكات نقل الطاقة", source: "هاكاثون المعسكر", pct: 90, problem: "بطء الاستجابة لأعطال الشبكة يزيد مدة الانقطاع", duration: "9 أشهر", cost: "31٬000 ر.س", audience: "فرق الصيانة الميدانية", strategicGoal: "تحسين موثوقية الشبكة" },
  { id: 4, name: "يّن", maturityStage: "نموذج أولي (Prototype)", kanbanColumn: "قيد المراجعة الفنية", owner: "إدارة التحول الرقمي", source: "هاكاثون المعسكر", pct: 55, problem: "تشتت بيانات المستخدمين بين أنظمة متعددة", duration: "4 أشهر", cost: "12٬000 ر.س", audience: "الموظفون الإداريون", strategicGoal: "تحسين تجربة الموظف" },
  { id: 5, name: "منارة", maturityStage: "نموذج أولي (Prototype)", kanbanColumn: "مكتملة", owner: "الإدارة العامة للتحول الرقمي", source: "هاكاثون المعسكر", pct: 40, problem: "صعوبة تتبع مؤشرات الأداء الرقمي عبر الإدارات", duration: "5 أشهر", cost: "15٬000 ر.س", audience: "قيادات الإدارات", strategicGoal: "دعم اتخاذ القرار" },
  { id: 6, name: "مكتبة", maturityStage: "تشغيل فعلي", kanbanColumn: "مكتملة", owner: "إدارة الأصول والعمليات البيانية", source: "مقترح داخلي", pct: 100, problem: "صعوبة الوصول لأرشيف المستندات الفنية", duration: "12 شهر", cost: "9٬000 ر.س", audience: "الموظفون التقنيون", strategicGoal: "تعزيز إدارة المعرفة" },
  { id: 7, name: "نظام تنبيهات الصيانة الاستباقية للمحطات", maturityStage: "تشغيل فعلي", kanbanColumn: "قيد المراجعة الفنية", owner: "إدارة الأصول والعمليات البيانية", source: "مقترح داخلي", pct: 100, problem: "اكتشاف الأعطال بعد وقوعها بدل توقعها مسبقًا", duration: "10 أشهر", cost: "27٬000 ر.س", audience: "مهندسو الصيانة", strategicGoal: "خفض التوقف غير المخطط" },
];

const ALERTS = [
  { title: "🚩 اجتماع دوري متأخر — شركة سهم", sub: "تجاوز الموعد المحدد للاجتماع الربعي مع... آخر اجتماع: 10 فبراير 2026", tag: "البند 5.23.1 / انتهاء تعاون", urgent: true },
  { title: "📄 ملف بيانات ناقص — شُمّان", sub: "نسبة اكتمال الحقول المطلوبة 62% فقط. غير قابل للإثبات ضمن تقرير", tag: "البند 5.24.1", urgent: false },
  { title: "📄 ملف بيانات ناقص — يّن", sub: "نسبة اكتمال الحقول المطلوبة 55% فقط. غير قابل للإثبات ضمن تقرير", tag: "البند 5.24.1", urgent: false },
  { title: "📄 ملف بيانات ناقص — منارة", sub: "نسبة اكتمال الحقول المطلوبة 40% فقط. غير قابل للإثبات ضمن تقرير", tag: "البند 5.24.1", urgent: false },
];

function Bar({ pct, color, height = 6 }) {
  return (
    <div style={{ height, background: "#EEEFF5", borderRadius: 20, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 20, transition: "width .3s" }} />
    </div>
  );
}
function Panel({ children, style }) {
  return <div style={{ background: COLORS.card, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: "18px 20px", ...style }}>{children}</div>;
}
const btnPrimary = { background: COLORS.purple, color: "#fff", border: "none", borderRadius: 9, padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" };
const btnOutline = { background: "#fff", border: `1px solid ${COLORS.line}`, color: COLORS.text, borderRadius: 9, padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" };
const td = { padding: "13px 16px", borderBottom: `1px solid ${COLORS.line}` };
const badge = { fontSize: 10.5, padding: "3px 10px", borderRadius: 20, fontWeight: 600, display: "inline-block" };
const inputStyle = { border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "8px 10px", fontSize: 12.8, fontFamily: "inherit", width: "100%" };
const labelStyle = { fontSize: 12, color: COLORS.muted, marginBottom: 5, display: "block" };

export default function InnovationPlatform() {
  const [view, setView] = useState("dashboard");
  const [solutions, setSolutions] = useState(INITIAL_SOLUTIONS);
  const [selectedId, setSelectedId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editDraft, setEditDraft] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [alertFilter, setAlertFilter] = useState("all");
  const [toast, setToast] = useState("");

  const selected = solutions.find((s) => s.id === selectedId) || null;

  function flash(msg) {
    setToast(msg);
    window.clearTimeout(flash._t);
    flash._t = window.setTimeout(() => setToast(""), 2200);
  }
  function openDetail(id) { setSelectedId(id); setEditMode(false); }
  function closeDetail() { setSelectedId(null); setEditMode(false); }
  function startEdit() { setEditDraft({ ...selected }); setEditMode(true); }
  function saveEdit() {
    setSolutions((prev) => prev.map((s) => (s.id === editDraft.id ? editDraft : s)));
    setEditMode(false);
    flash("تم حفظ التعديلات ✅");
  }
  function cancelEdit() { setEditMode(false); }
  function addSolution(data) {
    const nextId = Math.max(0, ...solutions.map((s) => s.id)) + 1;
    setSolutions((prev) => [...prev, { id: nextId, pct: 20, kanbanColumn: "قيد المراجعة الفنية", ...data }]);
    setShowNewForm(false);
    flash("تم تسجيل الحل الابتكاري ✅");
  }
  function goToImpact() { closeDetail(); setView("impact"); }

  const filteredAlerts = ALERTS.filter((a) =>
    alertFilter === "all" ? true : alertFilter === "urgent" ? a.urgent : !a.urgent
  );
  const urgentCount = ALERTS.filter((a) => a.urgent).length;
  const reminderCount = ALERTS.length - urgentCount;

  return (
    <div dir="rtl" style={{ fontFamily: "'IBM Plex Sans Arabic','Tajawal',sans-serif", background: COLORS.bg, color: COLORS.text, minHeight: "100vh", display: "flex", position: "relative" }}>
      <div style={{ width: 250, flexShrink: 0, background: `linear-gradient(180deg, ${COLORS.navy} 0%, ${COLORS.navy2} 100%)`, color: "#DCE1F5", padding: "18px 14px", position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
        <div style={{ padding: "10px 8px 18px", borderBottom: "1px solid rgba(255,255,255,.08)", marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 14.5, color: "#fff" }}>منصة إدارة الابتكار المؤسسي</div>
          <div style={{ fontSize: 11, color: "#9BA5C9", marginTop: 5, lineHeight: 1.6 }}>
            مدينة الملك عبدالله للطاقة الذرية والمتجددة<br />إدارة الابتكار المؤسسي
          </div>
        </div>
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <div style={{ fontSize: 10.5, color: "#7883A8", padding: "14px 10px 6px" }}>{group.label}</div>
            {group.items.map((item) => {
              const active = view === item.key;
              const badgeCount = item.key === "alerts" ? ALERTS.length : null;
              return (
                <div key={item.key} onClick={() => setView(item.key)} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 9,
                  fontSize: 13.3, cursor: "pointer", marginBottom: 2,
                  background: active ? COLORS.purple : "transparent",
                  color: active ? "#fff" : "#C4CBE5", fontWeight: active ? 600 : 400,
                  boxShadow: active ? "0 4px 14px rgba(109,63,192,.4)" : "none",
                }}>
                  <span style={{ width: 18, textAlign: "center", fontSize: 14 }}>{item.icon}</span>
                  {item.label}
                  {badgeCount ? <span style={{ marginRight: "auto", background: COLORS.red, color: "#fff", fontSize: 10, padding: "1px 6px", borderRadius: 20 }}>{badgeCount}</span> : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 28px", background: COLORS.card, borderBottom: `1px solid ${COLORS.line}`, position: "sticky", top: 0, zIndex: 5 }}>
          <h1 style={{ fontSize: 19, fontWeight: 700 }}>{TITLES[view]}</h1>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button style={btnOutline} onClick={() => setView("dga")}>📁 ملف الامتثال</button>
            <div onClick={() => setView("alerts")} style={{ width: 38, height: 38, borderRadius: 9, border: `1px solid ${COLORS.line}`, background: "#fff", cursor: "pointer", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>
              🔔
              <span style={{ position: "absolute", top: -3, left: -3, width: 9, height: 9, background: COLORS.red, borderRadius: "50%", border: "2px solid #fff" }} />
            </div>
            <button style={btnPrimary} onClick={() => setShowNewForm(true)}>+ تسجيل جديد</button>
          </div>
        </div>

        <div style={{ padding: "24px 28px 60px" }}>
          {view === "dashboard" && <Dashboard goTo={setView} solutions={solutions} alerts={ALERTS} />}
          {view === "governance" && <Governance solutions={solutions} onOpenDetail={openDetail} />}
          {view === "solutions" && <Solutions solutions={solutions} onOpenDetail={openDetail} onAddNew={() => setShowNewForm(true)} />}
          {view === "alerts" && (
            <Alerts alerts={filteredAlerts} filter={alertFilter} setFilter={setAlertFilter} urgentCount={urgentCount} reminderCount={reminderCount} total={ALERTS.length} />
          )}
          {["strategy", "requirements", "impact", "partners", "dga"].includes(view) && <Placeholder view={view} />}
        </div>
      </div>

      {selected && (
        <SolutionModal
          solution={selected} editMode={editMode} draft={editDraft} setDraft={setEditDraft}
          onClose={closeDetail} onStartEdit={startEdit} onSave={saveEdit} onCancel={cancelEdit} onGoImpact={goToImpact}
        />
      )}
      {showNewForm && <NewSolutionModal onClose={() => setShowNewForm(false)} onSubmit={addSolution} />}

      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: COLORS.navy, color: "#fff", padding: "10px 20px", borderRadius: 30, fontSize: 13, boxShadow: "0 8px 24px rgba(0,0,0,.25)", zIndex: 100 }}>
          {toast}
        </div>
      )}
    </div>
  );
}

function Dashboard({ goTo, solutions, alerts }) {
  const kpis = [
    { label: "الجاهزية الإجمالية للامتثال (DGA)", value: "82%", sub: "▲ مرتفع عن آخر تقييم بنسبة 6 نقاط", hero: true, view: "dga" },
    { label: "الحلول الابتكارية المسجّلة", value: String(solutions.length), sub: "5 منها من هاكاثون المعسكر 2", view: "solutions" },
    { label: "الفعاليات الابتكارية هذا العام", value: "9", sub: "تجاوزت الحد الأدنى المطلوب (3)", view: "requirements" },
    { label: "تنبيهات تتطلب إجراء", value: String(alerts.length), sub: "1 عاجل / 3 تذكير", danger: true, view: "alerts" },
  ];
  const criteria = [
    { pct: 68, code: "5.23.3", name: "حوكمة الابتكار", color: COLORS.amber, view: "governance" },
    { pct: 91, code: "5.23.2", name: "منهجيات الابتكار وفعالياته", color: COLORS.green, view: "requirements" },
    { pct: 82, code: "5.23.1", name: "التوجه الاستراتيجي", color: COLORS.green, view: "strategy" },
  ];
  const criteria2 = [
    { pct: 100, code: "5.24.2", name: "قياس الأثر", color: COLORS.green, view: "impact" },
    { pct: 70, code: "5.24.1", name: "حصر الحلول الابتكارية", color: COLORS.amber, view: "solutions" },
  ];
  const stageOrder = ["مفهوم", "نموذج أولي (Prototype)", "إثبات مفهوم (PoC)", "نسخة تجريبية", "تشغيل فعلي"];
  const stageColors = { "مفهوم": COLORS.purple, "نموذج أولي (Prototype)": COLORS.purple, "إثبات مفهوم (PoC)": COLORS.purple, "نسخة تجريبية": COLORS.amber, "تشغيل فعلي": COLORS.green };
  const maxCount = Math.max(1, ...stageOrder.map((st) => solutions.filter((s) => s.maturityStage === st).length));

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 18 }}>
        {kpis.map((k) => (
          <div key={k.label} onClick={() => goTo(k.view)} style={{
            background: k.hero ? `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.purpleDeep})` : COLORS.card,
            border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: "16px 18px", cursor: "pointer",
          }}>
            <div style={{ fontSize: 12, color: k.hero ? "#E4D9F7" : COLORS.muted, marginBottom: 8 }}>{k.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: k.hero ? "#fff" : (k.danger ? COLORS.red : COLORS.text) }}>{k.value}</div>
            <div style={{ fontSize: 11, color: k.hero ? "#E4D9F7" : COLORS.muted, marginTop: 6 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 18 }}>
        {criteria.map((c) => (
          <div key={c.code} onClick={() => goTo(c.view)} style={{ background: COLORS.card, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: "16px 18px", cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: c.color }}>{c.pct}%</span>
              <span style={{ fontSize: 10.5, color: COLORS.muted, background: "#F0EFF7", padding: "2px 8px", borderRadius: 20 }}>{c.code}</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>{c.name}</div>
            <Bar pct={c.pct} color={c.color} />
          </div>
        ))}
        <div onClick={() => goTo("dga")} style={{ background: COLORS.navy, color: "#fff", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", cursor: "pointer", padding: 16 }}>
          <div style={{ fontSize: 13.5 }}>📦 عرض حزمة ملف الامتثال الكاملة</div>
        </div>
        {criteria2.map((c) => (
          <div key={c.code} onClick={() => goTo(c.view)} style={{ background: COLORS.card, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: "16px 18px", cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: c.color }}>{c.pct}%</span>
              <span style={{ fontSize: 10.5, color: COLORS.muted, background: "#F0EFF7", padding: "2px 8px", borderRadius: 20 }}>{c.code}</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>{c.name}</div>
            <Bar pct={c.pct} color={c.color} />
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 16 }}>
        <Panel>
          <h3 style={{ fontSize: 14.5, marginBottom: 14 }}>الحلول الابتكارية حسب مرحلة النضج</h3>
          {stageOrder.map((st) => {
            const count = solutions.filter((s) => s.maturityStage === st).length;
            return (
              <div key={st} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, fontSize: 12.5 }}>
                <span style={{ width: 150, color: COLORS.muted, flexShrink: 0 }}>{st}</span>
                <span style={{ width: 36, textAlign: "center", fontWeight: 700, flexShrink: 0 }}>{count} حل</span>
                <div style={{ flex: 1 }}><Bar pct={(count / maxCount) * 100} color={stageColors[st]} height={8} /></div>
              </div>
            );
          })}
        </Panel>
        <Panel>
          <h3 style={{ fontSize: 14.5, marginBottom: 14, display: "flex", justifyContent: "space-between" }}>
            أحدث التنبيهات الزمنية
            <span onClick={() => goTo("alerts")} style={{ fontSize: 11.5, color: COLORS.purple, cursor: "pointer" }}>عرض الكل ‹</span>
          </h3>
          {alerts.slice(0, 3).map((a) => <AlertItem key={a.title} alert={a} />)}
        </Panel>
      </div>
    </div>
  );
}

function AlertItem({ alert }) {
  return (
    <div style={{ borderRadius: 10, padding: "12px 14px", marginBottom: 10, borderInlineStart: `4px solid ${alert.urgent ? COLORS.red : COLORS.amber}`, background: alert.urgent ? "#FCEBEA" : "#FDF3E3" }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{alert.title}</div>
      <div style={{ fontSize: 11, color: COLORS.muted }}>{alert.sub}</div>
      <div style={{ fontSize: 10, color: COLORS.muted, marginTop: 6 }}>{alert.tag}</div>
    </div>
  );
}

function Governance({ solutions, onOpenDetail }) {
  return (
    <div>
      <Panel style={{ background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.purpleDeep})`, color: "#fff", marginBottom: 18 }}>
        <div style={{ fontSize: 12, opacity: 0.85 }}>5.23.3 — حوكمة وتفعيل الابتكار</div>
        <div style={{ fontSize: 26, fontWeight: 800, margin: "6px 0" }}>68%</div>
        <div style={{ fontSize: 12, opacity: 0.85 }}>جاهزية البند</div>
      </Panel>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
        <Panel>
          <h3 style={{ fontSize: 14.5, marginBottom: 14 }}>السياسات وآلية مراجعة الأفكار</h3>
          <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 10 }}>السياسات الداعمة المعتمدة</div>
          <div style={{ fontSize: 13, marginBottom: 8, cursor: "pointer" }} onClick={() => window.alert("سياسة نضج الابتكار الداخلي 2026 — عرض المستند")}>📄 سياسة نضج الابتكار الداخلي 2026</div>
          <div style={{ fontSize: 13, cursor: "pointer" }} onClick={() => window.alert("دليل حوكمة بطاقات المبادرات — عرض المستند")}>📄 دليل حوكمة بطاقات المبادرات</div>
        </Panel>
        <Panel>
          <h3 style={{ fontSize: 14.5, marginBottom: 14 }}>لجنة إدارة الابتكار المؤسسي</h3>
          <div style={{ fontSize: 13 }}>م. عبدالرحمن العتيبي — رئيس النظام</div>
          <div style={{ fontSize: 13, margin: "6px 0" }}>د. أحمد عثمان — عضو</div>
          <div style={{ fontSize: 13 }}>م. يوسف العبدالكريم — عضو</div>
        </Panel>
      </div>

      <Panel>
        <h3 style={{ fontSize: 14.5, marginBottom: 14 }}>لوحة بطاقات مبادرات الابتكار الرقمي — اضغط أي بطاقة لعرض ملفها الكامل</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {KANBAN_COLUMNS.map((col) => {
            const items = solutions.filter((s) => s.kanbanColumn === col);
            return (
              <div key={col} style={{ background: "#F7F7FC", borderRadius: 14, padding: 12 }}>
                <div style={{ fontSize: 12.5, color: COLORS.muted, padding: "6px 8px 10px" }}>{col} <span>({items.length})</span></div>
                {items.map((it) => (
                  <div key={it.id} onClick={() => onOpenDetail(it.id)} style={{ background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: "12px 14px", marginBottom: 10, cursor: "pointer" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{it.name}</div>
                    <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 8 }}>{it.owner}</div>
                    <Bar pct={it.pct} color={it.pct >= 80 ? COLORS.green : it.pct >= 55 ? COLORS.amber : COLORS.red} height={5} />
                    <div style={{ fontSize: 10.5, color: COLORS.muted, textAlign: "left", marginTop: 4 }}>جاهزية الملف: {it.pct}%</div>
                  </div>
                ))}
                {items.length === 0 && <div style={{ fontSize: 11.5, color: COLORS.muted, padding: "10px 4px" }}>لا توجد بطاقات</div>}
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

function Solutions({ solutions, onOpenDetail, onAddNew }) {
  return (
    <div>
      <Panel style={{ background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.purpleDeep})`, color: "#fff", marginBottom: 18 }}>
        <div style={{ fontSize: 12, opacity: 0.85 }}>5.24.1 — حصر وتطوير الحلول الابتكارية وتوطينها</div>
        <div style={{ fontSize: 26, fontWeight: 800, margin: "6px 0" }}>70%</div>
        <div style={{ fontSize: 12, opacity: 0.85 }}>السجل الرئيسي للحلول الابتكارية</div>
      </Panel>

      <div style={{ marginBottom: 14 }}>
        <button style={btnPrimary} onClick={onAddNew}>+ تسجيل حل ابتكاري جديد</button>
      </div>

      <div style={{ background: COLORS.card, border: `1px solid ${COLORS.line}`, borderRadius: 14, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              {["الحل", "مرحلة النضج", "الجهة المالكة", "المصدر", "جاهزية الملف", "حالة الحوكمة"].map((h) => (
                <th key={h} style={{ background: "#FAFAFD", textAlign: "right", padding: "12px 16px", fontSize: 11.5, color: COLORS.muted, fontWeight: 600, borderBottom: `1px solid ${COLORS.line}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {solutions.map((s) => {
              const color = s.pct >= 80 ? COLORS.green : s.pct >= 55 ? COLORS.amber : COLORS.red;
              const st = STAGE_STYLE[s.maturityStage] || { bg: "#EEEEF4", color: "#666F8C" };
              return (
                <tr key={s.id} onClick={() => onOpenDetail(s.id)} style={{ cursor: "pointer" }}>
                  <td style={td}><b>{s.name}</b></td>
                  <td style={td}><span style={{ ...badge, background: st.bg, color: st.color }}>{s.maturityStage}</span></td>
                  <td style={td}>{s.owner}</td>
                  <td style={td}>{s.source}</td>
                  <td style={td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 70 }}><Bar pct={s.pct} color={color} /></div>
                      <span style={{ fontSize: 11.5, fontWeight: 700, width: 32 }}>{s.pct}%</span>
                    </div>
                  </td>
                  <td style={td}><span style={{ ...badge, background: "#EEEEF4", color: "#666F8C" }}>{s.kanbanColumn}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Panel style={{ marginTop: 16, background: "#FAF8FE", borderColor: "#E7DBFB" }}>
        <div style={{ fontSize: 12.5 }}>
          ⏱ متطلب نطاق العمر الزمني للحل (متطلب التطبيق 2-ب): يجب أن يكون الحل مستهدفاً منذ فترة لا تقل عن 6 أشهر ولا تزيد عن 5 سنوات، وفي مرحلة التخطيط أو التجريب، ليكون مؤهلاً للحصر ضمن الملف الرئيسي.
        </div>
      </Panel>
    </div>
  );
}

function Alerts({ alerts, filter, setFilter, urgentCount, reminderCount, total }) {
  const tabs = [
    { key: "all", label: `الكل (${total})` },
    { key: "urgent", label: `عاجلة (${urgentCount})` },
    { key: "reminder", label: `تذكيرات (${reminderCount})` },
  ];
  return (
    <div>
      <Panel style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12.5, color: COLORS.muted, lineHeight: 1.8 }}>
          يبني هذا النظام تلقائيًا كل المحدّدات الزمنية من قاعدة البيانات (مواعيد الاجتماعات الدورية، انتهاء الاتفاقيات، وتجاوز موعد قياس الأثر).
        </div>
      </Panel>
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setFilter(t.key)} style={{ ...(filter === t.key ? btnPrimary : btnOutline), borderRadius: 20 }}>{t.label}</button>
        ))}
      </div>
      <Panel>
        {alerts.length === 0 && <div style={{ fontSize: 12.5, color: COLORS.muted, textAlign: "center", padding: "20px 0" }}>لا توجد تنبيهات في هذا التصنيف</div>}
        {alerts.map((a) => <AlertItem key={a.title} alert={a} />)}
      </Panel>
    </div>
  );
}

function Placeholder({ view }) {
  const labels = {
    strategy: "وحدة التوجه الاستراتيجي (5.23.1) — الجاهزية الحالية 82%",
    requirements: "وحدة متطلبات الابتكار وفعالياته (5.23.2) — الجاهزية الحالية 91%",
    impact: "وحدة قياس الأثر (5.24.2) — الجاهزية الحالية 100%",
    partners: "سجل الجهات والشراكات",
    dga: "ملف الامتثال الكامل (DGA) — الجاهزية الإجمالية 82%",
  };
  return (
    <div style={{ background: COLORS.card, border: `1px dashed ${COLORS.line}`, borderRadius: 14, padding: "60px 20px", textAlign: "center", color: COLORS.muted, fontSize: 13 }}>
      {labels[view]}
    </div>
  );
}

function SolutionModal({ solution, editMode, draft, setDraft, onClose, onStartEdit, onSave, onCancel, onGoImpact }) {
  const fields = [
    ["owner", "الجهة المالكة"], ["problem", "المشكلة أو التحدي"], ["duration", "مدة الاختبار"],
    ["cost", "تكلفة التنفيذ"], ["audience", "الفئات المستهدفة"], ["strategicGoal", "الهدف الاستراتيجي المرتبط"],
  ];
  const data = editMode ? draft : solution;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(14,20,50,.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", width: 600, maxWidth: "100%", maxHeight: "88vh", overflowY: "auto", borderRadius: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px", borderBottom: `1px solid ${COLORS.line}`, position: "sticky", top: 0, background: "#fff" }}>
          <h3 style={{ fontSize: 15 }}>ملف الحل الابتكاري الكامل — {solution.name}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: COLORS.muted }}>✕</button>
        </div>
        <div style={{ padding: "20px 22px" }}>
          <div style={{ marginBottom: 12 }}>
            <span style={{ ...badge, background: STAGE_STYLE[solution.maturityStage]?.bg, color: STAGE_STYLE[solution.maturityStage]?.color, marginInlineEnd: 6 }}>{solution.maturityStage}</span>
            <span style={{ ...badge, background: "#F0EFF7", color: COLORS.purpleDeep }}>{solution.kanbanColumn}</span>
          </div>
          <div style={{ background: "#F7F5FC", borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 6 }}>
              <span>جاهزية الملف بالإثبات (DGA)</span><b>{solution.pct}%</b>
            </div>
            <Bar pct={solution.pct} color={solution.pct >= 80 ? COLORS.green : solution.pct >= 55 ? COLORS.amber : COLORS.red} />
          </div>
          {fields.map(([key, label]) => (
            <div key={key} style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: 10, alignItems: "center", padding: "11px 0", borderBottom: `1px dashed ${COLORS.line}`, fontSize: 12.8 }}>
              <span style={{ color: COLORS.muted }}>{label}</span>
              {editMode ? (
                <input style={inputStyle} value={data[key]} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })} />
              ) : (
                <span style={{ fontWeight: 600 }}>{data[key]}</span>
              )}
            </div>
          ))}
          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            {!editMode ? (
              <>
                <button style={btnPrimary} onClick={onStartEdit}>تعديل السجل</button>
                <button style={btnOutline} onClick={onGoImpact}>الانتقال لقياس الأثر ‹</button>
              </>
            ) : (
              <>
                <button style={btnPrimary} onClick={onSave}>حفظ التعديلات</button>
                <button style={btnOutline} onClick={onCancel}>إلغاء</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function NewSolutionModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: "", owner: "", source: SOURCES[0], maturityStage: STAGE_LIST[0],
    problem: "", duration: "", cost: "", audience: "", strategicGoal: "",
  });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const canSubmit = form.name.trim() && form.owner.trim();

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(14,20,50,.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", width: 560, maxWidth: "100%", maxHeight: "88vh", overflowY: "auto", borderRadius: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px", borderBottom: `1px solid ${COLORS.line}`, position: "sticky", top: 0, background: "#fff" }}>
          <h3 style={{ fontSize: 15 }}>تسجيل حل ابتكاري جديد</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: COLORS.muted }}>✕</button>
        </div>
        <div style={{ padding: "20px 22px", display: "grid", gap: 14 }}>
          <div>
            <label style={labelStyle}>اسم الحل *</label>
            <input style={inputStyle} value={form.name} onChange={set("name")} placeholder="مثال: رصد" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>الجهة المالكة *</label>
              <input style={inputStyle} value={form.owner} onChange={set("owner")} placeholder="اسم الإدارة" />
            </div>
            <div>
              <label style={labelStyle}>مصدر الابتكار</label>
              <select style={inputStyle} value={form.source} onChange={set("source")}>
                {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>مرحلة النضج</label>
            <select style={inputStyle} value={form.maturityStage} onChange={set("maturityStage")}>
              {STAGE_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>المشكلة أو التحدي</label>
            <textarea style={{ ...inputStyle, minHeight: 60 }} value={form.problem} onChange={set("problem")} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>مدة الاختبار</label>
              <input style={inputStyle} value={form.duration} onChange={set("duration")} placeholder="مثال: 6 أشهر" />
            </div>
            <div>
              <label style={labelStyle}>تكلفة التنفيذ</label>
              <input style={inputStyle} value={form.cost} onChange={set("cost")} placeholder="مثال: 20٬000 ر.س" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>الفئات المستهدفة</label>
            <input style={inputStyle} value={form.audience} onChange={set("audience")} />
          </div>
          <div>
            <label style={labelStyle}>الهدف الاستراتيجي المرتبط</label>
            <input style={inputStyle} value={form.strategicGoal} onChange={set("strategicGoal")} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button
              style={{ ...btnPrimary, opacity: canSubmit ? 1 : 0.5, cursor: canSubmit ? "pointer" : "not-allowed" }}
              disabled={!canSubmit}
              onClick={() => canSubmit && onSubmit(form)}
            >
              حفظ الحل
            </button>
            <button style={btnOutline} onClick={onClose}>إلغاء</button>
          </div>
        </div>
      </div>
    </div>
  );
}
