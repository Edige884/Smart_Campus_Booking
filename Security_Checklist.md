# Security review

| Control | Code-based | Low-code |
|---|---|---|
| Input validation | PASS: manual T4–T6; static finite/integer guards | PASS: T4–T6 and S1–S3; regex and integer guard |
| Output / XSS | PASS (static): React text rendering; no dangerous HTML sink reported | PASS (limited static): result text binding and validated inputs; no full XSS test |
| SQL injection | N/A: no database queries | N/A: datasourceList empty; no queries |
| Authentication / access | N/A for app login; anonymous deployment not independently verified | Public demo configured in export; anonymous access / editor roles not independently verified |
| Secrets / connectors | PASS (static review): no credentials or external calls reported | PASS (export review): no external datasource or custom library; no secrets found in app logic |
| SCA / updates | PASS for reported npm audit after remediation; ongoing updates needed | NOT VERIFIED: hosted platform dependency audit unavailable |
| SAST | PASS for reported static inspection, lint and typecheck; not a dedicated scanner | Limited source review of exported JS; no dedicated scanner |
| DAST / runtime | Manual functional invalid-input checks passed; full DAST and headers NOT VERIFIED | S1–S3 passed in preview; full DAST and headers NOT VERIFIED |
| Booking integrity | PASS: T8 and regression tests | PASS: table unchanged; source does not write bookings |

Initial Bolt audit: 25 findings (2 critical, 14 high, 7 moderate, 2 low); production tree 1 high. After removal of unused database client and reviewed upgrades, Bolt reported 0 in both npm audit commands. All 30 tests, lint, typecheck and build reported passing. These runs are supported by supplied screenshots, not independently rerun here. Zero reported advisories does not guarantee security.

Manual runtime checks on the student applications only; no third-party scanning. For real deployment use server-side enforcement, access control, current-time validation and ongoing dependency/host reviews.
