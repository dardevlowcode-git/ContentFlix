> Documento redatto dal Project Manager il 2026-09-09 sulla base di quanto riferito in sessione.
> Contenuto non verificato su fonte terza.

# Vincolo ambiente locale per i test

## Regola

Su questo PC non installare dipendenze, componenti server, Next.js o altri strumenti
necessari per eseguire e testare Utraya/ContentFlix.

## Ambiente di test autorizzato

I test server-side e le verifiche che richiedono l'esecuzione dell'applicazione devono
essere eseguiti esclusivamente sulla macchina dedicata indicata dall'utente.

## Implicazioni operative

- Non eseguire `npm install`, `npm ci` o installazioni equivalenti su questo PC per Utraya.
- Non installare localmente Next.js o componenti necessari all'avvio dell'applicazione.
- Non eseguire test, build o avvii server locali finché non viene definita la procedura
  sulla macchina dedicata.
- Limitare le operazioni locali a lettura, modifica dei file, aggiornamento del lockfile
  tramite procedura concordata e controlli che non richiedano l'installazione dei componenti.
