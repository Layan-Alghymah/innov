# دليل تشغيل قاعدة العرض التجريبي

هذه النسخة **Demo MVP / Early Operational Preview** وليست تقييمًا رسميًا من هيئة
الحكومة الرقمية. جميع قيم الجاهزية المعروضة هي **مؤشر جاهزية تقديري داخلي**
محسوب من محرك الامتثال والسجلات الفعلية.

## قبل البدء

- تحتاج Node.js 20 أو أحدث وDocker Desktop.
- قاعدة التطوير اسمها `innovation_platform` ويجب أن تبقى دون حذف أو تنظيف.
- قاعدة العرض المنفصلة اسمها `innovation_demo`.
- لا تشغّل `npm test` أثناء توجيه `DATABASE_URL` إلى قاعدة العرض؛ الاختبارات
  تنشئ سجلات كثيرة عمدًا ويجب تشغيلها على قاعدة اختبار قابلة للتخلص منها.
- لا تستخدم `prisma migrate reset` أو `prisma db push --force-reset` ضد قواعد
  التطوير أو العرض أو الإنتاج.

## 1. معرفة حاوية PostgreSQL

من PowerShell داخل المشروع:

```powershell
docker ps --format "{{.Names}} | {{.Image}} | {{.Ports}}"
```

في الإعداد المحلي الحالي تظهر الحاوية:

```text
innov-postgres | postgres:16-alpine | 0.0.0.0:5433->5432/tcp
```

إذا كان الاسم أو المنفذ مختلفًا، استخدم القيم الظاهرة لديك في الخطوات التالية.

## 2. إعداد ملف بيئة العرض

أنشئ ملفًا محليًا غير متتبع:

```powershell
Copy-Item .env.demo.example .env.demo
```

القيمة المحلية المتوقعة:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/innovation_demo?schema=public"
AUTH_SECRET="replace-with-a-long-random-demo-secret"
AUTH_TRUST_HOST="true"
STORAGE_DRIVER="memory"
```

عدّل اسم المستخدم وكلمة المرور فقط بما يطابق حاويتك. لا تحفظ أسرارًا حقيقية في Git.

## 3. إنشاء وتجهيز `innovation_demo`

السكربت التالي:

1. يرفض العمل إذا كان الرابط يشير إلى `innovation_platform`.
2. يقبل فقط قاعدة باسم `innovation_demo`.
3. ينشئها إذا لم تكن موجودة، ولا يعيد إنشاءها إذا كانت موجودة.
4. يطبق هجرات Prisma الحالية.
5. يشغل بذرة العرض المتكررة بأمان.
6. لا يعدّل `.env` ولا قاعدة التطوير.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass `
  -File .\scripts\setup-demo-db.ps1 `
  -EnvironmentFile .env.demo `
  -ContainerName innov-postgres `
  -PostgresUser postgres
```

للتأكد يدويًا من وجود القاعدتين:

```powershell
docker exec innov-postgres psql -U postgres -d postgres -c "\l"
```

## 4. تشغيل التطبيق ببيئة العرض

حمّل متغيرات `.env.demo` في نافذة PowerShell الحالية:

```powershell
Get-Content .env.demo |
  Where-Object { $_ -match '^\s*[^#][^=]*=' } |
  ForEach-Object {
    $name, $value = $_ -split '=', 2
    Set-Item -Path "Env:$($name.Trim())" -Value $value.Trim().Trim('"').Trim("'")
  }

npm install
npm run dev
```

الرابط:

```text
http://localhost:3000
```

للتشغيل بوضع الإنتاج المحلي:

```powershell
npm run build
npm run start
```

## 5. حسابات العرض

| الدور | البريد | كلمة المرور |
|---|---|---|
| مدير النظام | `admin@innovation.local` | `Admin@12345` |
| محرر داخلي | `editor@innovation.local` | `Demo@12345` |
| شريك خارجي | `partner@innovation.local` | `Demo@12345` |
| مطّلع | `viewer@innovation.local` | `Demo@12345` |

يمكن تغيير كلمات المرور قبل تشغيل البذرة عبر:

```env
SEED_ADMIN_PASSWORD="choose-a-demo-password"
SEED_DEMO_PASSWORD="choose-another-demo-password"
```

## 6. بيانات العرض ومساره

تحتوي القاعدة النظيفة على ثلاثة حلول فقط:

- `منصة الصيانة الاستباقية للأصول`: الحل الرئيسي لمسار الامتثال.
- `نظام متابعة كفاءة استهلاك الطاقة`.
- `بوابة إدارة المقترحات الابتكارية`: تتضمن فجوة حقل مطلوبة مقصودة.

كما تحتوي على دليل اعتماد معتمد، ودليل أثر محلل باقتراحات قابلة للمراجعة
البشرية، وفجوة دليل أثر قبل الاعتماد. اعتماد دليل الأثر يغيّر الجاهزية المحسوبة
فعليًا؛ لا توجد نسبة جاهزية ثابتة في واجهة المستخدم.

مسار العرض:

1. سجل الدخول بحساب مدير النظام.
2. افتح لوحة التحكم ثم ملف الامتثال.
3. افتح `منصة الصيانة الاستباقية للأصول`.
4. راجع فجوة دليل الأثر وروابط السجلات المصدرية.
5. افتح `تقرير قياس أثر التجربة - بانتظار المراجعة`.
6. اقبل الاقتراحات المناسبة، ثم قدم الدليل وابدأ مراجعته واعتمده.
7. ارجع إلى ملف الامتثال لمشاهدة تغير الجاهزية.
8. استخدم الطباعة أو تصدير CSV.

## 7. العودة إلى قاعدة التطوير

أغلق خادم العرض وافتح نافذة PowerShell جديدة، أو أعد تحميل رابط التطوير من
`.env`. الرابط المعتاد:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/innovation_platform?schema=public"
```

ثم:

```powershell
npm run dev
```

لا تنسخ بيانات من `innovation_demo` إلى `innovation_platform`، ولا تشغّل أي أمر
حذف أو reset للعودة بين البيئتين؛ التبديل يتم بتغيير `DATABASE_URL` فقط.

## 8. النقل لاحقًا إلى Neon

أنشئ قاعدة أو مشروع Neon منفصلًا للعرض، وضع رابط Neon في `.env.demo`، ثم شغّل:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass `
  -File .\scripts\setup-demo-db.ps1 `
  -EnvironmentFile .env.demo `
  -SkipCreate
```

مع `-SkipCreate` لا يستخدم السكربت Docker؛ يطبق الهجرات والبذرة على رابط Neon.
لا يحتاج التطبيق أو Prisma إلى تعديل برمجي، فالتغيير الوحيد هو `DATABASE_URL`.

## حدود العرض

- `STORAGE_DRIVER=memory` مناسب لجلسة محلية واحدة فقط؛ استخدم S3 أو MinIO لحفظ
  الملفات بعد إعادة تشغيل الخادم.
- البذرة تنشئ بيانات الملف الوصفية، أما عرض الاستخراج من ملف حقيقي فيتطلب رفع
  PDF أو DOCX أو XLSX منظمًا.
- التصدير المتاح هو الطباعة وCSV، وليس حزمة ZIP متقدمة.
