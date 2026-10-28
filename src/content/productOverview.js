export const featureGroups = [
  { id: 'remember', features: ['persistentMemory', 'contextGraph', 'fileIntelligence'] },
  { id: 'everyday', features: ['integrations', 'routines', 'modelRouting'] },
  { id: 'control', features: ['portability', 'homeHub', 'semanticCache'] },
]

export const productOverview = {
  en: {
    examplesLabel: 'Start with something useful',
    examplesTitle: 'What would you like a little help with?',
    examples: [
      ['Find the words', 'Ask Pär to draft a reply, then edit it to make it yours.'],
      ['Think it through', 'Talk through an idea or ask for another way to explain something.'],
      ['Explore your notes', 'With Plus or above, attach supported notes or PDFs and ask questions. Check the answer against the original.'],
    ],
    featuresLabel: 'Explore the features',
    featuresTitle: 'More help, with clear choices.',
    featuresNote: 'These features require Plus or above. Availability depends on your version and setup; check the plans and setup guide before choosing.',
    groups: {
      remember: ['Pick up where you left off', 'Find earlier conversations and work with information you choose to keep.'],
      everyday: ['Bring everyday work together', 'Connect supported services and choose how Pär helps with recurring tasks.'],
      control: ['Keep your options open', 'Move your data, connect nearby devices, and reuse earlier answers.'],
    },
    developmentLink: 'Our purpose and development updates',
  },
  sv: {
    examplesLabel: 'Börja med något användbart',
    examplesTitle: 'Vad vill du ha lite hjälp med?',
    examples: [
      ['Hitta orden', 'Be Pär skriva ett utkast till ett svar. Redigera det så att det blir ditt.'],
      ['Tänk igenom en idé', 'Bolla en idé eller be om ett annat sätt att förklara något.'],
      ['Utforska dina anteckningar', 'Med Plus eller högre kan du bifoga anteckningar eller PDF-filer som stöds och ställa frågor. Kontrollera svaret mot originalet.'],
    ],
    featuresLabel: 'Utforska funktionerna',
    featuresTitle: 'Mer hjälp, med tydliga val.',
    featuresNote: 'De här funktionerna kräver Plus eller högre. Tillgängligheten beror på version och inställningar; läs om abonnemangen och installationen innan du väljer.',
    groups: {
      remember: ['Fortsätt där du slutade', 'Hitta tidigare samtal och arbeta med information du väljer att spara.'],
      everyday: ['Samla vardagens arbete', 'Anslut tjänster som stöds och välj hur Pär hjälper till med återkommande uppgifter.'],
      control: ['Behåll dina valmöjligheter', 'Flytta dina data, anslut enheter i närheten och återanvänd tidigare svar.'],
    },
    developmentLink: 'Vårt syfte och uppdateringar om utvecklingen',
  },
}
