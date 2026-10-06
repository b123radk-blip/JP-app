// Where the open data comes from and where it is cached. Everything under .cache/ is gitignored and can be re-fetched;
// only compact derived files (data/lexicon/) and the cards themselves are committed. Licences: see README "Credits".
export const CACHE = '.cache/sources';
export const SOURCES = [
  // KANJIDIC2 and JMdict: EDRDG, CC BY-SA 4.0 (https://www.edrdg.org/edrdg/licence.html)
  { file: 'kanjidic2.xml.gz', url: 'http://ftp.edrdg.org/pub/Nihongo/kanjidic2.xml.gz' },
  { file: 'JMdict_e.gz', url: 'http://ftp.edrdg.org/pub/Nihongo/JMdict_e.gz' },
  // JLPT levels (Jonathan Waller's lists, tanos.co.uk) via open-anki-jlpt-decks (MIT) and kanji-data (MIT). Only levels are used.
  ...['n5', 'n4', 'n3', 'n2', 'n1'].map((l) => ({ file: `jlpt-${l}.csv`, url: `https://raw.githubusercontent.com/jamsinclair/open-anki-jlpt-decks/main/src/${l}.csv` })),
  { file: 'kanji-data.json', url: 'https://raw.githubusercontent.com/davidluzgouveia/kanji-data/master/kanji.json' },
  // Tatoeba (CC BY 2.0 FR): Japanese and English sentences, and the Japanese index (word headwords per sentence + English pair)
  { file: 'jpn_sentences.tsv.bz2', url: 'https://downloads.tatoeba.org/exports/per_language/jpn/jpn_sentences.tsv.bz2', unpack: 'bz2' },
  { file: 'eng_sentences.tsv.bz2', url: 'https://downloads.tatoeba.org/exports/per_language/eng/eng_sentences.tsv.bz2', unpack: 'bz2' },
  { file: 'jpn_indices.tar.bz2', url: 'https://downloads.tatoeba.org/exports/jpn_indices.tar.bz2', unpack: 'tar' },
];
export const KANJIVG_URL = (hex5) => `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex5}.svg`;
export const hex5 = (ch) => ch.codePointAt(0).toString(16).padStart(5, '0');
export const hexId = (ch) => ch.codePointAt(0).toString(16);
