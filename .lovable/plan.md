# דשבורד מכירות מרכזי (Looker-Studio-Style) ב-Admin

מחליף את הטאב Analytics הקיים בדשבורד אחוד שמושך נתונים מכל המקורות, עם דרילדאון אינטראקטיבי וצ'אט AI יועץ.

## מה ייבנה

### 1. טאב חדש "Sales Dashboard" (מחליף את Analytics)
פריסה בסגנון Looker Studio – KPIs עליונים, גרפים מרכזיים, טבלת מוצרים בצד, פילטרים גלובליים למעלה.

**שורת פילטרים גלובלית (משפיעה על כל הווידג'טים):**
- טווח תאריכים (היום / 7 / 30 / 90 / מותאם)
- השוואה לתקופה קודמת
- מקור תנועה (All / Organic / Paid / Social / Direct)
- ערוץ פרסום (All / Google Ads / Meta Ads)
- מוצר נבחר (ברירת מחדל: All)

**KPI Cards (שורה עליונה, עם דלתא % מול תקופה קודמת):**
- הכנסות, הזמנות, AOV (ערך הזמנה ממוצע)
- שיעור המרה (Conversion Rate)
- סה״כ עלות פרסום (Ad Spend)
- ROAS (החזר על הוצאת פרסום)
- CAC (עלות גיוס לקוח) = Ad Spend / New Customers
- CPA (עלות לרכישה) = Ad Spend / Orders
- LTV משוער (Repeat Rate × AOV)
- מבקרים, זמן שהייה ממוצע, Bounce Rate

**גרפים מרכזיים:**
- מכירות לאורך זמן (Line) – הכנסות + הזמנות
- מקורות תנועה (Donut) – פילוח מ-GA4
- ביצועי קמפיינים (Bar) – ROAS לכל קמפיין (Google + Meta)
- Funnel: מבקרים → צופי מוצר → Add to Cart → Checkout → רכישה
- מפת חום שעות/ימים של רכישות

**טבלת מוצרים אינטראקטיבית (Side Panel):**
- כל מוצר עם: יחידות שנמכרו, הכנסה, מבקרים, CR, CAC, ROAS
- **קליק על שורה = כל הדשבורד מסונן למוצר זה** (KPIs, גרפים, מקורות תנועה - הכל מתעדכן)
- כפתור "נקה סינון" חוזר ל-All Products

**מודול SEO (פאנל תחתון):**
- Top Queries, Impressions, Clicks, CTR, Average Position מ-Google Search Console (כבר מחובר)
- Top Landing Pages לפי תנועה אורגנית

### 2. צ'אט AI יועץ (Side Drawer במסך)
- כפתור צף ⚡ פותח Drawer ימני
- מקבל את **קונטקסט הפילטרים הנוכחיים + הנתונים שמוצגים** ומעביר ל-Gemini דרך Lovable AI Gateway
- דוגמאות שאלות מוצעות: "למה ROAS ירד השבוע?", "איזה מוצר הכי רווחי?", "מה לשפר בקמפיין X?", "המלץ על תקציב לפי הביצועים"
- תשובות זורמות (streaming), עם Markdown

### 3. אינטגרציות נתונים (Edge Functions)

| מקור | סטטוס | איך נביא נתונים |
|---|---|---|
| **Shopify Orders/Products** | ✅ מחובר | Edge function `shopify-analytics` – משתמש ב-SHOPIFY_ACCESS_TOKEN הקיים (Admin GraphQL: orders, products, customers) |
| **Google Analytics 4** | 🔌 חדש | Connector חדש – נדרשת התחברות עם חשבון Google שיש לו גישה ל-property של GA4 |
| **Google Ads** | 🔌 חדש | Connector חדש – נדרשת התחברות עם חשבון Google Ads + Customer ID |
| **Meta/Facebook Ads** | 🔌 חדש | Connector חדש – נדרשת התחברות עם חשבון Meta Business + Ad Account ID |
| **Google Search Console (SEO)** | ✅ מחובר | קיים `GOOGLE_SEARCH_CONSOLE_API_KEY` – נשתמש דרך Connector Gateway |
| **AI Chat** | ✅ זמין | `LOVABLE_API_KEY` קיים – Gemini 3 Flash |

**הערה חשובה:** GA4 / Google Ads / Meta Ads דורשים אותך לאשר Connectors בצ'אט. אבנה את ה-UI כך שכל מודול שלא מחובר עדיין יציג כפתור "Connect" במקום הנתונים – ככה הדשבורד עובד מיד עם Shopify+GSC, ומתמלא ככל שתחבר עוד מקורות.

### 4. Caching ו-Performance
- כל Edge function משתמש בקאש קצר (5-15 דק') בטבלת `analytics_cache` כדי לא לשרוף קריאות API
- Loading skeletons בכל ווידג'ט עד שהנתונים מגיעים

## פרטים טכניים

**טבלאות חדשות (Supabase):**
- `analytics_cache` (source, key, payload jsonb, fetched_at) – קאש לקריאות API

**Edge functions חדשות:**
- `shopify-analytics` – orders, products, top sellers, customer counts, revenue series
- `ga4-analytics` – sessions, users, bounce rate, avg session duration, traffic sources, funnel events
- `google-ads-analytics` – campaigns, spend, conversions, ROAS
- `meta-ads-analytics` – campaigns, spend, conversions, ROAS
- `gsc-analytics` – top queries, top pages (משתמש בקיים)
- `dashboard-chat` – streaming chat שמקבל את הקונטקסט הנוכחי

**Frontend:**
- `src/pages/SalesDashboard.tsx` החדש – משולב כטאב ב-`AdminDashboard.tsx` במקום BlogAnalytics (BlogAnalytics נשמר כטאב נפרד, רק יוסר מהמיקום הראשי)
- `src/components/dashboard/` – KPICard, FilterBar, RevenueChart, TrafficSourcesChart, CampaignsChart, FunnelChart, ProductsTable, SEOPanel, AIChatDrawer, ConnectorPrompt
- Recharts לגרפים (כבר בפרויקט)
- Context (`DashboardFiltersContext`) שמחזיק את הפילטרים הגלובליים + מוצר נבחר, ומפעיל מחדש את כל ה-queries

**State management:**
- React Query לכל קריאה ל-edge function, עם `queryKey` שכולל את הפילטרים → סינון לפי מוצר/תאריך מטריגר auto-refetch של כל הווידג'טים בו-זמנית

## סדר ביצוע מומלץ

1. **שלב 1 (מיידי):** מבנה הדשבורד + Shopify + GSC + AI Chat (עובדים מיד עם מה שיש)
2. **שלב 2:** חיבור GA4 (אחרי שתאשר את ה-Connector בצ'אט)
3. **שלב 3:** חיבור Google Ads ו-Meta Ads (כל אחד בנפרד)

אחרי שתאשר את התוכנית, נתחיל בשלב 1 ואבקש ממך לאשר את ה-Connectors כשנגיע לכל שלב.
