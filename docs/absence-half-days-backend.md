# Absences — half-days & overlap (backend work needed)

The frontend now sends half-day boundaries and blocks overlaps **client-side only**.
The Laravel API must enforce the same rules; the client check is a convenience, not a guarantee.

## Data model

Add two columns to the `absences` table:

| column       | type                              | notes                                  |
|--------------|-----------------------------------|----------------------------------------|
| `start_half` | enum(`morning`,`afternoon`)       | default `morning`. Half of `start_date` the absence begins on. |
| `end_half`   | enum(`morning`,`afternoon`)       | default `afternoon`. Half of `end_date` the absence ends on.   |

An absence is the **inclusive** range `[start_date.start_half … end_date.end_half]`.

Legacy rows (no halves) are treated as `morning`/`afternoon` = full days.

### Examples
| start_date | start_half | end_date | end_half | meaning            | days |
|------------|------------|----------|----------|--------------------|------|
| 06-10      | morning    | 06-10    | morning  | 10th AM only       | 0.5  |
| 06-10      | afternoon  | 06-10    | afternoon| 10th PM only       | 0.5  |
| 06-10      | morning    | 06-10    | afternoon| 10th full day      | 1    |
| 06-10      | morning    | 06-12    | morning  | 10th → 12th AM     | 2.5  |

## Endpoints affected

`POST /api/users/{id}/absences` and `PATCH /api/absences/{id}` now accept:

```json
{ "type": "vacation", "start_date": "2026-06-10", "start_half": "afternoon",
  "end_date": "2026-06-12", "end_half": "morning", "reason": "..." }
```

## Validation rules to add (Form Request)

1. `start_half`, `end_half` ∈ {`morning`,`afternoon`}.
2. **Order**: end boundary ≥ start boundary. Linearise each boundary to a *slot*:
   `slot = days_since_epoch(date) * 2 + (half === "afternoon" ? 1 : 0)`
   then require `end_slot >= start_slot`. (Catches e.g. same-day PM→AM.)
3. **No overlap** with the same user's other absences (exclude the current id on update).
   Two ranges overlap iff `a.start_slot <= b.end_slot && b.start_slot <= a.end_slot`.
   Adjacency does **not** overlap (10th-PM end is free for an 11th-AM start).

Return `422` with a clear message; the frontend surfaces the API error string.

## Duration / stats

`days_off` and any FTE math must count halves:
`days = (end_slot - start_slot + 1) / 2` (multiples of 0.5).

## ⚠ Planning module mismatch (resolve when wiring real data)

`src/types/planning.d.ts` already defines `Half = 0 | 1` (0=morning, 1=afternoon) and
`PlanningAbsence.start_half/end_half` as **numbers**, but it is currently fed by
`src/api/planning/mock.ts` (mock only — not the real absence API).

The persisted Absence model uses **string** halves (`"morning"|"afternoon"`). When the
planning endpoints start reading real absences, add a mapping
(`"morning"→0`, `"afternoon"→1`) at that boundary, or migrate planning to the string enum.

## Frontend reference

- Slot math / overlap / duration: `src/utils/absence/halfDay.ts`
- Form + validation: `src/components/specified/models/absence/sheets/absenceForm.ts`
- Client overlap block: `CreateAbsenceSheet.tsx`, `EditAbsenceSheet.tsx`
