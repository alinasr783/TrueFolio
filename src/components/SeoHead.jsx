import React, { useEffect } from 'react';

function upsertMeta(selectorAttr, nameOrProp, content) {
  if (!content) return;
  const head = document.head;
  const existing = head.querySelector(`[${selectorAttr}="${nameOrProp}"]`);
  if (existing) {
    existing.setAttribute('content', content);
  } else {
    const meta = document.createElement('meta');
    meta.setAttribute(selectorAttr, nameOrProp);
    meta.setAttribute('content', content);
    head.appendChild(meta);
  }
}

function upsertLink(rel, href) {
  if (!href) return;
  const head = document.head;
  const existing = head.querySelector(`link[rel="${rel}"]`);
  if (existing) {
    existing.setAttribute('href', href);
  } else {
    const link = document.createElement('link');
    link.setAttribute('rel', rel);
    link.setAttribute('href', href);
    head.appendChild(link);
  }
}

function upsertJsonLd(id, json) {
  if (!json) return;
  const head = document.head;
  let script = head.querySelector(`script[type="application/ld+json"][data-id="${id}"]`);
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-id', id);
    head.appendChild(script);
  }
  script.textContent = JSON.stringify(json);
}

export default function SeoHead({
  title,
  description,
  keywords,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  twitterCard = 'summary_large_image',
  twitterTitle,
  twitterDescription,
  twitterImage,
  jsonLd
}) {
  useEffect(() => {
    if (title) document.title = title;
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'keywords', keywords);
    upsertLink('canonical', canonical);

    // Open Graph
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:title', ogTitle || title);
    upsertMeta('property', 'og:description', ogDescription || description);
    upsertMeta('property', 'og:image', ogImage);
    upsertMeta('property', 'og:url', ogUrl || canonical);

    // Twitter
    upsertMeta('name', 'twitter:card', twitterCard);
    upsertMeta('name', 'twitter:title', twitterTitle || title);
    upsertMeta('name', 'twitter:description', twitterDescription || description);
    upsertMeta('name', 'twitter:image', twitterImage || ogImage);

    // JSON-LD
    if (jsonLd) upsertJsonLd('page-jsonld', jsonLd);
  }, [
    title,
    description,
    keywords,
    canonical,
    ogTitle,
    ogDescription,
    ogImage,
    ogUrl,
    twitterCard,
    twitterTitle,
    twitterDescription,
    twitterImage,
    jsonLd
  ]);

  return null;
}
