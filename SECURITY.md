# Security Policy — ContentFlix (utraya.com)

## Lingua / Language
Segnalazioni accettate in italiano e inglese.

## Versioni supportate
| Branch / Versione | Supportata |
| --- | --- |
| `main` (produzione, utraya.com) | Sì |
| `preprod` (preview.utraya.com) | Sì |
| Altri branch / vecchi tag | No — aggiornare a `main` prima di segnalare |

## Come segnalare una vulnerabilità (preferito)
Usa il **Private vulnerability reporting** di GitHub (gratis e già attivo):
1. Vai su `Security > Report a vulnerability` nel repo `dardevlowcode-git/ContentFlix`.
2. Descrivi: URL coinvolto, passi per riprodurre, impatto, eventuale PoC.
3. Non aprire issue pubbliche, PR pubbliche o discussioni con dettagli della falla.

Alternative se GitHub non è raggiungibile: contatta il maintainer via i contatti pubblicati sul profilo GitHub dell'owner. Non inviare segreti reali nei report (usa valori redatti).

## Cosa includere
- Tipo di problema (XSS, open redirect, auth bypass, leak secret, ecc.)
- Dove (endpoint, file/riga se noto)
- Come riprodurlo in modo sicuro
- Impatto stimato (lettura dati, takeover account, ecc.)

## Cosa promettiamo
- Conferma di ricezione entro 3 giorni lavorativi.
- Valutazione iniziale entro 7 giorni lavorativi.
- Fix e disclosure coordinata: ti teniamo aggiornato, ti chiediamo di non divulgare prima del fix su `main`.
- Nessun bounty monetario in questa fase — credito pubblico nel release note se lo desideri.

## Scope
In scope: codice in questo repo, `https://utraya.com`, `https://preview.utraya.com`, flusso `Google OAuth -> callback -> allowlist -> provisioning -> redirect sicuro`, cookie `cf_admin_session`.
Fuori scope: Vercel / Supabase / Cloudflare stessi (segnalali al vendor), social engineering, DDoS volumetrico, report automatici senza impatto dimostrabile.

## Controlli automatici già attivi
Dependabot alerts + security updates, secret scanning + push protection, CodeQL default setup (JS/TS + Actions), Semgrep + Trivy + Gitleaks via Actions, CI con lint/type-check/test. Le PR Dependabot non mergiano da sole: richiedono review umana.
