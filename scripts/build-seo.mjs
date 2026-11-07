import fs from 'node:fs/promises';
import path from 'node:path';

const dist = path.resolve(import.meta.dirname, '../dist');
const origin = 'https://adiarya.vercel.app';
const personId = origin + '/#aditya';
const siteId = origin + '/#website';
const person = {
  '@type': 'Person',
  '@id': personId,
  name: 'Aditya Arya',
  alternateName: ['Adi Arya', 'adiarya05'],
  url: origin + '/',
  image: origin + '/media/aditya-avatar-4k.webp',
  jobTitle: 'AI product builder',
  description: 'Aditya Arya is an AI product builder based in Singapore, building Catch SG Buses, Soja and digital projects.',
  homeLocation: { '@type': 'Place', name: 'Singapore' },
  knowsAbout: ['Artificial intelligence', 'Product development', 'Product design', 'iOS app development'],
  sameAs: [
    'https://www.linkedin.com/in/aditya-arya1/',
    'https://x.com/adiarya05',
    'https://github.com/AdiArya05',
  ],
};
const site = {
  '@type': 'WebSite',
  '@id': siteId,
  url: origin + '/',
  name: 'Aditya Arya',
  alternateName: 'Adi Arya',
  author: { '@id': personId },
  inLanguage: 'en',
};
const pages = [
  {
    route: '/', file: 'index.html', type: 'ProfilePage',
    title: 'Aditya Arya — AI Product Builder in Singapore',
    description: 'Aditya Arya is an AI product builder in Singapore. Explore Catch SG Buses, Soja, Maritime Fusion, and the design and development behind his digital projects.',
    image: '/media/aditya-arya-social.jpg', imageAlt: 'Aditya Arya, AI product builder based in Singapore',
  },
  {
    route: '/work', file: 'work/index.html', type: 'CollectionPage',
    title: 'Selected Work — Aditya Arya',
    description: 'Explore Aditya Arya’s apps, interfaces, websites and motion studies, including Catch SG Buses, Soja and Sailorfy.',
    image: '/media/catch-live-detail.webp', imageAlt: 'Catch SG Buses Live Activity designed by Aditya Arya',
  },
  {
    route: '/stories', file: 'stories/index.html', type: 'CollectionPage',
    title: 'Project Explorations — Aditya Arya',
    description: 'How Aditya Arya designed and built Catch SG Buses and Soja. Read the thinking, prototypes, design decisions and lessons behind each app.',
    image: '/media/soja-recovery.webp', imageAlt: 'Soja recovery dashboard designed by Aditya Arya',
  },
  {
    route: '/icons', file: 'icons/index.html', type: 'CollectionPage',
    title: 'App Icon Design — Aditya Arya',
    description: 'App icon explorations by Aditya Arya for Catch SG Buses and Soja, from painted bus icons to sleeping-flame designs.',
    image: '/media/catch-icon-collection-grey.webp', imageAlt: 'Catch app icon explorations by Aditya Arya',
  },
  {
    route: '/work/catch', file: 'work/catch/index.html', type: 'Article',
    title: 'Designing Catch SG Buses — Aditya Arya',
    headline: 'Designing Catch',
    description: 'How Aditya Arya designed and built Catch SG Buses, a Singapore bus timing app with nearby stops, leave-now guidance and iPhone Live Activities.',
    image: '/media/catch-live-board.webp', imageAlt: 'Catch SG Buses arrival board designed by Aditya Arya',
  },
  {
    route: '/work/soja', file: 'work/soja/index.html', type: 'Article',
    title: 'Designing Soja Sleep Recovery — Aditya Arya',
    headline: 'Designing Soja',
    description: 'How Aditya Arya designed and built Soja, a sleep recovery app that turns circadian timing into a clear daily plan. Explore prototypes, app screens and design decisions.',
    image: '/work/soja/media/final-home.webp', imageAlt: 'Soja sleep recovery app designed by Aditya Arya',
  },
];
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;');

for (const page of pages) {
  await fs.access(path.join(dist, page.image));
  const url = origin + page.route;
  const entity = {
    '@type': page.type,
    '@id': url + (page.route === '/' ? '#profile' : '#page'),
    url,
    name: page.title,
    description: page.description,
    image: origin + page.image,
    inLanguage: 'en',
    isPartOf: { '@id': siteId },
    ...(page.type === 'ProfilePage' ? { mainEntity: { '@id': personId } } : { author: { '@id': personId } }),
    ...(page.type === 'Article' ? { headline: page.headline, mainEntityOfPage: url } : {}),
  };
  const graph = [person, site, entity];
  if (page.route !== '/') {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': url + '#breadcrumb',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Aditya Arya', item: origin + '/' },
        { '@type': 'ListItem', position: 2, name: page.headline || page.title.split(' — ')[0], item: url },
      ],
    });
    entity.breadcrumb = { '@id': url + '#breadcrumb' };
  }
  const metadata = [
    `<title>${escape(page.title)}</title>`,
    `<meta name="description" content="${escape(page.description)}" />`,
    '<meta name="robots" content="index, follow, max-image-preview:large" />',
    '<meta name="author" content="Aditya Arya" />',
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="${page.type === 'Article' ? 'article' : 'website'}" />`,
    '<meta property="og:site_name" content="Aditya Arya" />',
    '<meta property="og:locale" content="en_SG" />',
    ...['title', 'description', 'url', 'image'].map(key =>
      `<meta property="og:${key}" content="${escape(key === 'url' ? url : key === 'image' ? origin + page.image : page[key])}" />`),
    `<meta property="og:image:alt" content="${escape(page.imageAlt)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    '<meta name="twitter:creator" content="@adiarya05" />',
    ...['title', 'description', 'image'].map(key =>
      `<meta name="twitter:${key}" content="${escape(key === 'image' ? origin + page.image : page[key])}" />`),
    `<meta name="twitter:image:alt" content="${escape(page.imageAlt)}" />`,
    `<script type="application/ld+json">\n${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })}\n</script>`,
  ].join('\n  ');
  const filename = path.join(dist, page.file);
  let html = await fs.readFile(filename, 'utf8');
  html = html
    .replace(/\s*<title>[\s\S]*?<\/title>/g, '')
    .replace(/\s*<meta\b(?=[^>]*(?:name="(?:description|robots|author|twitter:[^"]+)"|property="(?:og:|article:)[^"]+"))[^>]*>/g, '')
    .replace(/\s*<link\b(?=[^>]*rel="canonical")[^>]*>/g, '')
    .replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
  if (!html.includes('src="/_vercel/insights/script.js"')) {
    html = html.replace('</head>', '<script defer src="/_vercel/insights/script.js"></script>\n</head>');
  }
  await fs.writeFile(filename, html.replace('</head>', '  ' + metadata + '\n</head>'));
}
console.log('Updated search metadata and structured data for all six public pages.');
