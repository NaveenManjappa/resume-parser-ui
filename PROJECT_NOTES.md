# Resume Parser — Frontend

Angular 20 SPA that calls the [Resume Parser API](https://resume-parser-app-cae.wittyisland-f93fd6a8.westeurope.azurecontainerapps.io/api/v1/extract) (FastAPI backend on Azure Container Apps) to extract structured candidate profiles from raw resume text or PDF uploads and deployed on Azure Static Web Apps.

---

## Architecture decisions

### Direct frontend-to-backend, no BFF
The Angular app calls the deployed FastAPI backend directly rather than going through a Backend-for-Frontend (BFF) proxy.

**Trade-off:** Skipping the BFF removes a deployment surface and matches the "small portfolio piece" scope. The cost is that the API has no authentication — anyone can call it. This is mitigated by defending the *cost* of abuse rather than the *access*: IP-based rate limiting (5 req/min) via `slowapi`, max-replica cap of 2 on Container Apps, and an Azure budget alert at £5. The threat model is "don't let a bot rack up my Azure bill," not "don't let strangers use the API."

### State as a single discriminated union
`AppComponent` holds one signal of type `ExtractionState`, a discriminated union with four variants: `idle`, `loading`, `error`, `success`. The template uses `@switch` on the status field.

**Trade-off:** A discriminated union prevents impossible states (e.g., simultaneously loading and successful) that a collection of boolean flags would allow. The cost is occasional TypeScript narrowing friction in templates, sometimes requiring `@let` + inner `@if` to get type-safe property access. Worth it.

### Service returns `Result<Success, Error>` instead of throwing
`ExtractionService.extract()` returns `Observable<ExtractionResult>` where the result is a `success | error` discriminated union — *not* the conventional Angular pattern of throwing into the Observable error channel.

**Trade-off:** This treats expected HTTP error responses (422, 429, 5xx) as return values rather than exceptions, which is internally consistent with the rest of the state model — the service result is structurally a subset of `ExtractionState`, so the caller can do `this.state.set(result)` directly. The cost is that global HTTP interceptors won't see these as errors. Not needed here since errors render inline.

### Client-side PDF parsing via pdf.js
PDF text extraction happens in the browser with `pdfjs-dist`, lazy-loaded via dynamic import. The extracted text populates the textarea, which the user can review and edit before submission.

**Trade-off:** Keeps the backend stateless and avoids file-upload concerns. The cost is that image-based scanned PDFs return empty text — there's no OCR fallback. Treated as a known error category ("No text could be extracted — the PDF may be scanned"). The "textarea as source of truth" pattern also means the LLM sees what the user approved, not raw extraction.

### CDN-hosted pdfjs worker
The pdfjs worker is loaded from jsDelivr (not cdnjs, which lags pdfjs releases).

**Trade-off:** Faster initial setup; eliminates the bundling step. The cost is a runtime CDN dependency — corporate networks blocking jsDelivr would break PDF upload. Acceptable for a portfolio demo; would self-host for production.

### Azure Static Web Apps hosting
Frontend deploys to Azure Static Web Apps, matching the Azure-stack story established by the backend on Container Apps.

**Trade-off:** Keeps the deployment narrative consistent across the project. The cost vs. Vercel/Netlify is marginally rougher DX in places, but SWA's GitHub Actions integration is automatic — the workflow file is generated on resource creation, not hand-written.

---

## Known gaps

These are *deliberate* omissions for MVP scope, listed in roughly priority order for future work:

1. **No unit tests yet.** Three highest-value tests to add first:
   - `mapHttpErrorToExtractionError` — pure function, four error categories, easy to cover
   - `PdfParser.parseFile` — mock the dynamic pdfjs import, test all four error paths (`invalid_type`, `too_large`, `parse_failed`, `empty`)
   - `ResumeInput` — validation flow with reactive forms
2. **Accessibility was minimal.** Only basic `<label>`, `role="status"`, `role="alert"`, `role="tablist"` added. Full AXE pass would require keyboard navigation for tabs, focus management on state transitions, proper `aria-describedby` wiring on all error messages.
3. **DOCX support not implemented.** Currently PDF-only. Would add `mammoth.js` for DOCX, extend `PdfParser` into a `FileParser` facade.
4. **No drag-and-drop upload.** File picker only. Drag-and-drop is polish, not function.
5. **Hardcoded backend URL in `environment.production.ts`.** Changing the backend URL requires a frontend redeploy. Production approach: runtime config endpoint or SWA application settings injected at build time.
6. **pdfjs worker on CDN.** Self-host for production to eliminate the runtime dependency.

---

## Running locally

```bash
# Install dependencies
npm install

# Run the dev server (http://localhost:4200)
ng serve

# Production build (writes to dist/<project>/browser)
ng build --configuration production
```

### Environment configuration

The app uses Angular's file-replacement pattern. Edit:

- `src/environments/environment.ts` — development (defaults to `http://localhost:8000/api/v1/extract`)
- `src/environments/environment.production.ts` — production (points at the deployed Container App)

The production file is swapped in during `ng build --configuration production`.

### Backend dependency

Requires the [Resume Parser API](#) running and reachable. The backend's `CORS_ORIGINS` env var must include the frontend origin:

```
CORS_ORIGINS=["http://localhost:4200","https://<your-swa-url>.azurestaticapps.net"]
```

---

## Deployment

Auto-deploys on push to `main` via the GitHub Actions workflow that Azure SWA committed on resource creation (`.github/workflows/azure-static-web-apps-*.yml`). First build takes 2-4 minutes; subsequent builds typically under 90 seconds.

To deploy a fix:

```bash
git add .
git commit -m "<fix description>"
git push origin main
# Watch progress in the Actions tab on GitHub
```


