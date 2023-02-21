- Mydealz web scraper
builded a webscraper for mydealz. 

# How to

## Test Firebase
Check  for key Project > Settings > Service Account > Neuen privaten Schlüssel
https://firebase.google.com/docs/functions/local-emulator?hl=de
- export GOOGLE_APPLICATION_CREDENTIALS="path/to/key.json"
### In index.ts
1. Comment in: `functions.https.onCall(async (data: any) => { // For testing local via npm run shell`
2. Comment out `
    // .pubsub
    //   .schedule('0 18 * * *') // Run at 18:00 https://crontab.guru/#0_18_*_*_*
    //   .timeZone('Europe/Berlin') // specify the timezone for the schedule
    //   .onRun(async (context: any) => {`

### In shell
1. Go to function folder
2. Run `npm run shell`
3. Execute function e.g. `myDealzScraper({data: {}})`



- das programm scraped gleiche deal gruppen nur einmal und sendet sie an alle user

# Todo
## BUGS
- [x] Deal (Link) is not working

## Features
- [ ] Get Hotness (cept-vote-temp)

## Arbeitspakete

### AP 0 META
- [x] if price is 0 write Gratis bold
- [x] meta aufräumen, da ist auch lieferkosten mit drinnen,..
- [x] add description how many new deals are found (in suject and mail body (abstract))

### AP 0 File
- [x] Check for abgelaufene deals in files
- [x] change to sub route in url and name file after that
- [x] is file writing necessary? Could lead to performance issues when long json files are checked. Maybe keep the just for one week then discard. Delete file on sunday and then send new report. So on Weekdays you get it nice an short (Only new ones) on sunday all

### AP 1 Async
- [x] Verstehe async await
- [x] Verstehe async chains
- [x] Baue async await ein und sorge dafür, dass die Mail Funktion erst aufgerufen wird, wenn alle andrenen Prozesse beendet sind. -> $ cheerio is async

### AP 2 More Groups
- [x] Ermögliche bei *einem* user (recipient) mehrere gruppen (Payback Rewe)

### AP 3 More User
- [x] Ermögliche mehrere user
- [x] Ermögliche mehrere user, die mehrere Gruppen haben
- [x] jede Gruppe soll nur einmal gescraped werden auch wenn sie öfter vor kommt

### AP 3 Pagination
- [ ] scrape page 2, 3,.. (?page=XXX) <- sinnvoll, die ersten 3 pages zu scrapen>

### AP 4 Config
- [ ] Erstelle konfigurations Möglichkeiten in einer Datei
    - Welcher User welche gruppen hat
    - Zeiträume
    - Nach wie vielen Deals expired scraped er nicht mehr
    - wie viele Seiten

### AP 5 Firebase
- [ ] Informiere über amazon funktion kosten dafür
- [ ] Deploy (Fire base zu letzt. Wenn alles läuft )
- [ ] firebase function. run every day 18. send a update once a week
- [ ] dont write to file (leave option), write to database <- on shell not possible to test, because of production protection. Change to dev, than possible >

## AP 6 Keywords
- [ ] Suche nach bestimmten Stickworten
    - Wann ist Wintersale, und co? Also mal schauen wann sind bestimmte Kategorien günstig, benachrichtigungen anhängen
    - Eine Mail mit solchen informationen schicken, welche produktgruppen sind grade günstig

## AP 7 READ ME
- [ ] erstelle eine gute readme ChatGPT
- [ ] wrappe up, schreibe erklärungen (schritt für schritt
- [ ] lösche sensible daten
- [ ] upload git und public!

