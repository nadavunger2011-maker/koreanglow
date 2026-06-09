## K-Beauty Skin Quiz Modal

Replace the existing `NewsletterPopup` with a new multi-step, RTL-first K-Beauty Skin Quiz modal that captures the lead at the end and shows a personalized routine + discount code.

### Files

- **New**: `src/components/SkinQuizPopup.tsx` — self-contained multi-step quiz component.
- **Edit**: `src/App.tsx` — swap `NewsletterPopup` import/usage for `SkinQuizPopup` (keep existing `showPopup` route gating).
- **Keep**: existing `NewsletterPopup.tsx` file untouched for now (unused), so we can revert easily. Delete only if you confirm.

### Trigger & persistence

- Show 4s after mount (page already loaded by then in SPA).
- Skip if `localStorage` contains `kbeauty_quiz_dismissed` or `kbeauty_quiz_completed`.
- Close (X) → set `kbeauty_quiz_dismissed`.
- Successful email submit → set `kbeauty_quiz_completed`.
- Also insert the lead into the existing `leads` table via supabase client (same pattern as current popup: `name` null, `email`, `source_page`), and fire-and-forget the `sync-shopify-customer` function so the existing flow keeps working.

### RTL & design tokens

- Root wrapper `dir="rtl"`, `text-right`, RTL-aware spacing (`space-x-reverse`, `flex-row-reverse` where needed), arrow icon `ArrowLeft` for "next" since visual forward in RTL is leftward.
- Use existing brand tokens only — `bg-background`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `text-primary-foreground`, `border-primary`, `bg-accent`, `ring-primary`. No hardcoded hex.
- Rounded `rounded-2xl` card with `shadow-2xl`, `rounded-full` buttons, soft backdrop blur overlay.
- Progress bar at top: filled `bg-primary` width animating with `transition-all duration-500`, growing right-to-left (use `mr-auto` + RTL container so fill visually progresses from right).
- Smooth step transitions via simple opacity/translate Tailwind transition keyed on step.
- Mobile-first: `w-[92vw] max-w-md sm:max-w-lg`, scrollable inner content if needed.

### Steps (Hebrew copy exactly per spec)

- **Step 0 Welcome** — headline, subtitle, "להתחלת השאלון" button with `ArrowLeft` icon, X in top-left.
- **Step 1 Skin type** — 4 card options (single choice), each card shows label + small description.
- **Step 2 Concern** — 4 card options.
- **Step 3 Texture** — 3 card options.
- **Step 4 Lead capture** — email input + submit button; zod email validation; on success → mark completed, advance to results.
- **Step 5 Results** — dynamic routine based on skin type (dry/oily; fallback to a balanced routine for combo/sensitive), conditional badge for concern (pigmentation → niacinamide/Vit C; acne → centella/tea tree), coupon `KGLOW10` with copy button (`Copy` → `Check` + "הועתק!"), CTA "לרכישת השגרה שלי" closes modal.

Cards use selected-state styling: `border-primary ring-2 ring-primary/30 bg-primary/5` when chosen.

### Technical details

```text
state: step (0..5), answers {skinType, concern, texture}, email, error, loading, copied
```

- Lead insert reuses `supabase.from("leads").insert({ email, source_page })` — same schema as today, no DB changes.
- Quiz answers are NOT persisted server-side (only used to render results). If you want them stored, say so and I'll add columns/a new table.
- Coupon code `KGLOW10` is display-only; creating the actual Shopify discount is out of scope for this task.
- No new dependencies — uses existing `lucide-react`, `zod`, `@/components/ui/input`, `supabase` client.

### Out of scope

- Creating the real `KGLOW10` discount in Shopify.
- Storing quiz answers in the database.
- Changing the existing route gating logic in `App.tsx` (only swapping the component).
