export const featureGroups = [
  { id: 'remember', features: ['persistentMemory', 'contextGraph', 'fileIntelligence'] },
  { id: 'everyday', features: ['integrations', 'routines', 'modelRouting'] },
  { id: 'control', features: ['portability', 'homeHub', 'semanticCache'] },
]

export const productOverview = {
  en: {
    examplesLabel: 'Start with something useful',
    examplesTitle: 'Make room for what matters.',
    examples: [
      { icon: 'planner', title: 'Start your day with a clear picture', text: 'See your appointments, important emails and tasks in one daily brief. Choose what to connect, with AI working on your device.', outcome: 'A clearer day' },
      { icon: 'repeat', title: 'Spend less time on repeat work', text: 'Turn meeting notes into a summary and next steps. Save your instructions as a routine, ready to use again.', outcome: 'Less starting over' },
      { icon: 'protectedDocument', title: 'Get help with work you need to keep private', text: 'We’re building financial and contract reviews that work on your device, without uploading your documents to a central Pär server. You review the plan and results.', outcome: 'Your review. Your decision.', status: 'In development', note: 'Not yet a dependable feature of the current beta.' },
    ],
    examplesNote: 'Connected services may send information to their providers.',
    featuresLabel: 'Explore the features',
    featuresTitle: 'More help, with clear choices.',
    featuresNote: 'Feature availability depends on your plan, version and setup. See Pricing for plan details and the setup guide for requirements.',
    groups: {
      remember: ['Pick up where you left off', 'Find earlier conversations and work with information you choose to keep.'],
      everyday: ['Bring everyday work together', 'Connect supported services and choose how Pär helps with recurring tasks.'],
      control: ['Keep your options open', 'Move your data, connect nearby devices, and reuse earlier answers.'],
    },
    developmentLink: 'Development details',
  },
  sv: {
    examplesLabel: 'Börja med något användbart',
    examplesTitle: 'Ge plats åt det som är viktigt.',
    examples: [
      { icon: 'planner', title: 'Börja dagen med en tydlig överblick', text: 'Samla dina möten, viktiga mejl och uppgifter i en daglig översikt. Du väljer vad du ansluter, med AI som arbetar på din enhet.', outcome: 'En tydligare dag' },
      { icon: 'repeat', title: 'Lägg mindre tid på återkommande arbete', text: 'Gör mötesanteckningar till en sammanfattning och nästa steg. Spara dina instruktioner som en rutin, redo att använda igen.', outcome: 'Mindre att börja om med' },
      { icon: 'protectedDocument', title: 'Få hjälp med arbete du behöver hålla privat', text: 'Vi utvecklar granskning av ekonomisk information och avtal på din enhet, utan att ladda upp dina dokument till en central Pär-server. Du granskar planen och resultaten.', outcome: 'Din granskning. Ditt beslut.', status: 'Under utveckling', note: 'Ännu inte en tillförlitlig funktion i den aktuella betan.' },
    ],
    examplesNote: 'Anslutna tjänster kan skicka information till sina leverantörer.',
    featuresLabel: 'Utforska funktionerna',
    featuresTitle: 'Mer hjälp, med tydliga val.',
    featuresNote: 'Tillgängliga funktioner beror på abonnemang, version och inställningar. Se Priser för vad som ingår och installationsguiden för krav.',
    groups: {
      remember: ['Fortsätt där du slutade', 'Hitta tidigare samtal och arbeta med information du väljer att spara.'],
      everyday: ['Samla vardagens arbete', 'Anslut tjänster som stöds och välj hur Pär hjälper till med återkommande uppgifter.'],
      control: ['Behåll dina valmöjligheter', 'Flytta dina data, anslut enheter i närheten och återanvänd tidigare svar.'],
    },
    developmentLink: 'Mer om utvecklingen',
  },
}
