# Smart Campus — Software Engineering Practice 12

Comparison of a React/TypeScript code-based checker and an Appsmith low-code checker. Both use the same fictional room A-101 and booking 10:00–11:00, with a fixed 09:00 test clock. Both passed 8/8 shared manual tests.

## Live demos
- Code-based: https://smart-campus-room-av-377z.bolt.host
- Low-code: https://kazakh-british-technical-university.appsmith.com/app/smart-campus-low-code/page1-6b05ae54b238dbe867c4a11d?embed=true

URLs supplied by the student; anonymous access and final hosted versions have not been independently checked. The Appsmith export has public mode enabled and a published page.

## Reproduce
Code-based: use a compatible Node.js version (22.13+ within Node 22, or supported newer LTS); `cd Code_Based`, `npm ci`, `npm run dev`. Verification: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm audit`, `npm audit --omit=dev`.

Low-code: import `Low_Code/SmartCampus_LowCode.json` into Appsmith. No data source required. The extracted JS object is `Low_Code/Availability.js`. Run T1–T8 using `Test_Results.xlsx`.

## Evidence
- Practice12_Report.docx: all seven tasks, findings and recommendation.
- Requirements_and_Acceptance_Criteria.md, Test_Results.xlsx, Comparison_Matrix.xlsx, Security_Checklist.md and AI_USE_RECORD.md.
- Screenshots/: authentic evidence, cropped to remove browser/account chrome for public sharing.
- Code_Based/: application source, lockfile, build and historical Practice 07 material. The original nested README describes an older baseline; this README and the report govern Practice 12. Bolt-specific internal agent metadata omitted from public copy.

## Limitations
Fixed clock and fictional one-day fixture are simulations in both implementations, not a real booking service. Appsmith has no timeline or separate live end-time preview (not required). Mobile layout and full security penetration checks not independently verified. There are some differences in validation precedence/reason codes outside T1–T8; see report.
