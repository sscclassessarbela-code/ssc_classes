# SSC CLASSES — Merged Class 6–12 App

## Architecture
- `student.html` is now the single student-facing UI base, using the new SSC CLASSES design.
- The old login/test/result pages no longer keep their competing UI. They redirect into the matching screen of `student.html`.
- Old test data/question compatibility is preserved:
  - `questionList`
  - `questionsList`
  - `questionsData`
  - `items`
  - `questions`
- Scheduled tests are read from `localStorage` key `sscScheduledTests`, which is the data format used by the existing Admin page.
- Class filtering is consistently Class 6 through Class 12.
- Test scoring is calculated from the student's actual answers:
  - correct
  - wrong
  - unattempted
  - negative marking
  - percentage
  - PASS/FAIL
- Results are saved to `sscLastResult` and `sscResultHistory`.
- The old 60-question practice set remains available as the Class 10 fallback when no Class 10 scheduled test is available.
- `logo.png` is used instead of the old Sonu Sir photo.

## Main flow
`index.html` → `login.html` / `register.html` → `student.html`

Inside `student.html`:
`Home → Online Test → Start Test → Questions → Submit → Actual Result`

## Admin / Firebase
Existing Admin and Community Chat functionality files are retained so their data/Firebase logic is not discarded.

## Run
Open the folder in VS Code and use Live Server, or serve the folder with any local static web server.
