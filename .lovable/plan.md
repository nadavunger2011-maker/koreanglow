## הוספת אנליטיקס מלאה דרך GTM + קובץ ייבוא לקונטיינר

### מה ייעשה

1. **הוספת dataLayer לאירועי הקוויז** — `src/components/SkinQuizPopup.tsx`
   - `quiz_start` כשהמשתמש לוחץ "להתחלת השאלון"
   - `quiz_step` בכל בחירה (שלב 1/2/3) עם `quiz_step_number` ו-`quiz_answer`
   - `generate_lead` בעת שליחת אימייל מוצלחת (פרמטר `currency: ILS`, `value: 0`)
   - `quiz_complete` בכניסה למסך תוצאות, עם `skin_type`/`concern`/`texture`
   - `coupon_copy` בלחיצה על "העתקת קוד"
   - תוספת קצרה ל-`src/lib/analytics.ts`: פונקציית עזר `pushEvent(event, params)` כללית (לא-ecommerce) שלא מאפסת את `ecommerce`.

2. **קובץ ייבוא ל-GTM** — `/mnt/documents/kbeauty-gtm-container.json`
   קובץ Container Export רגיל שאפשר לייבא דרך GTM → Admin → Import Container (Merge/Overwrite).
   הקונטיינר יכיל:
   - **תגית בסיס**: GA4 Configuration עם Measurement ID `G-GZ6X1ZZRZF`, נטענת על All Pages עם consent mode (analytics_storage).
   - **DataLayer Variables**: `ecommerce.currency`, `ecommerce.value`, `ecommerce.items`, `quiz_step_number`, `quiz_answer`, `skin_type`, `concern`, `texture`.
   - **Triggers (Custom Event)** לכל אירוע:
     - Ecommerce: `view_item_list`, `select_item`, `view_item`, `add_to_cart`, `remove_from_cart`, `view_cart`, `begin_checkout`
     - Quiz/lead: `quiz_start`, `quiz_step`, `quiz_complete`, `generate_lead`, `coupon_copy`
   - **GA4 Event Tags** לכל אירוע, מעבירות את הפרמטרים הרלוונטיים (items/value/currency לecommerce; quiz_* ל-quiz).

3. **תיעוד קצר** — `/mnt/documents/GTM-IMPORT-README.md` עם 3 צעדים: ייבוא, בחירת Workspace, Publish; והערה ש-`purchase` מטופל ע"י Shopify ולא בקונטיינר הזה.

### מחוץ לטווח

- Meta Pixel ב-GTM (נשאר ב-`index.html` כפי שהוא).
- Conversions API / server-side tagging.
- אירוע `purchase` (קורה ב-Shopify checkout, מחוץ לדומיין שלנו).

### פלט שתקבלי

- קישור להורדה של `kbeauty-gtm-container.json` (קובץ אחד, מוכן ל-Import Container ב-GTM).
- README קצר לצידו.
- עדכוני קוד קטנים ב-`SkinQuizPopup.tsx` ו-`analytics.ts` כדי שאירועי הקוויז יידחפו ל-dataLayer.
