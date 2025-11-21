export const SAMPLE_HTML = `<h2>5. FAQs - People also asked about best sleeves for Pokémon cards</h2>
<p>Before wrapping up, let’s answer some common questions collectors and players ask about the best sleeves for Pokémon cards.</p>
<h3>5.1 Which sleeves to use for Pokémon cards?</h3>
<p>Pokémon cards fit standard-size sleeves, typically 63.5mm x 88mm. Choose high-quality brands like Dragon Shield or KMC for maximum protection.</p>
<h3>5.2 Are official Pokémon sleeves better?</h3>
<p>Official Pokémon sleeves are attractive but not the most durable. We would consider them weaker than premium brands, so they are best for casual use or display.</p>
<h3>5.3 What are the rules for Pokémon card sleeves?</h3>
<p>Tournament rules require sleeves to be uniform, opaque, and free from markings. Clear sleeves are allowed for storage, but competitive play usually demands consistency.</p>
<h3>5.4 Should I double penny sleeve Pokémon cards?</h3>
<p>Yes, double-sleeving with penny sleeves inside and a durable outer sleeve provides maximum protection against dirt, moisture, and bending.</p>
<h3>5.5 Why are Dragon Shield sleeves the best?</h3>
<p>Dragon Shield sleeves are 120 microns thick, making them the thickest on the market. Their durability and shuffle feel make them a favorite among competitive players.</p>`;

export const DEFAULT_TEMPLATE = 'jwl';

export const TEMPLATE_CONFIG = {
  jwl: {
    h2: {},
    introDiv: {},
    itemsDiv: {
      display: 'flex',
      flexDirection: 'column',
      margin: 0,
      padding: 0,
      gap: '0px',
    },
    details: {
      borderBottom: '1px solid #E0E0E0',
    },
    summary: {
      listStyle: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
    },
    h3: {
    },
    span: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'transform 0.2s ease',
    },
    answerDiv: {
      lineHeight: 1.7,
    },
    p: {},
    wrapper: {
      backgroundColor: '#F7F7F7',
      border: '1px solid #E0E0E0',
      borderRadius: '12px',
      padding: '18px 22px',
    },
    sharedCss: {},
  },
  jf: {
    h2: {},
    introDiv: {},
    itemsDiv: {},
    details: {},
    summary: {},
    h3: {},
    span: {},
    answerDiv: {},
    p: {},
    wrapper: {},
    sharedCss: {},
  },
  kichiin: {
    h2: {},
    introDiv: {},
    itemsDiv: {
      display: 'flex',
      flexDirection: 'column',
      margin: 0,
      padding: 0,
      gap: '0px',
    },
    details: {
      borderBottom: '1px solid #E0E0E0',
    },
    summary: {
      listStyle: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
    },
    h3: {
    },
    span: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'transform 0.2s ease',
    },
    answerDiv: {
      lineHeight: 1.7,
    },
    p: {},
    wrapper: {
      backgroundColor: '#F7F7F7',
      border: '1px solid #E0E0E0',
      borderRadius: '12px',
      padding: '18px 22px',
    },
    sharedCss: {},
  },
};

