> Documento redatto dal Project Manager il 2026-09-09 sulla base della documentazione fornita dall'utente e della verifica SSH effettuata in sessione.
> Contenuto operativo da mantenere aggiornato.

# Ambiente remoto per i test

## Regola operativa

L'esecuzione dei test server-side, delle build e dell'avvio di Utraya/ContentFlix deve
avvenire sulla VM remota Linux Ubuntu dedicata. Su questo PC Windows non devono essere
installati componenti necessari all'esecuzione o al test dell'applicazione.

## Verifica di accesso

Il collegamento SSH alla VM è riuscito il 2026-09-09. Sono stati verificati:

- hostname della VM coerente con la documentazione;
- accesso amministrativo `sudo` non interattivo;
- Docker Server `29.1.3`;
- Docker Compose `2.40.3`;
- spazio disponibile sul filesystem root: circa 101 GiB;
- stack Docker esistenti attivi.

## Container dedicato Utraya

La soluzione preferita è un container Docker dedicato e isolato per Utraya, separato
dagli stack Firecrawl, Hindsight, Paperclip, Kokoro e Portainer già presenti.

Il container dovrà:

- essere creato senza modificare o ricreare gli stack esistenti;
- usare esclusivamente la rete privata Tailscale per eventuali accessi;
- non esporre porte su Internet o su interfacce pubbliche;
- mantenere i dati di test separati dai volumi degli altri servizi;
- poter essere ricreato senza perdita di dati degli stack esistenti.

## Vincoli della VM

- Non modificare né cancellare i dati persistenti di Hindsight.
- Non eseguire `docker compose down` sugli stack esistenti.
- Non eliminare volumi Docker.
- Non modificare file `.env` senza backup preventivo.
- Non eseguire pulizie Docker automatiche.
- Non riportare credenziali, chiavi private o API key nella documentazione del progetto.
