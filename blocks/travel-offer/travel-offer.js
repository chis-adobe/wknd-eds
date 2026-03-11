import { getMetadata } from '../../scripts/aem.js';
import { isAuthorEnvironment } from '../../scripts/scripts.js';
import { getHostname } from '../../scripts/utils.js';

const GRAPHQL_QUERY = '/graphql/execute.json/aircanada/GetFlightOfferByPath';
const TEMPLATE_URL = 'https://unpkg.com/@ac-comp-lib/component-library/templates/promo-banner.html';

/**
 * Populates the promo-banner template with offer data.
 * @param {string} html - Template HTML from component library
 * @param {Object} offer - Offer data from GraphQL
 * @param {string|null} imgUrl - Banner image URL
 * @param {string} ctaUrl - CTA link URL
 * @returns {string} Populated HTML
 */
function populateTemplate(html, offer, imgUrl, ctaUrl) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const section = doc.querySelector('.ac-promo-banner');
  if (!section) return html;

  const img = section.querySelector('.ac-promo-banner__card-img');
  if (img) {
    if (imgUrl) {
      img.src = imgUrl;
    } else {
      img.remove();
    }
  }

  const badge = section.querySelector('.ac-promo-banner__badge');
  if (badge) badge.remove();

  const headline = section.querySelector('.ac-promo-banner__headline');
  if (headline) headline.textContent = offer.offerTitle || '';

  const description = section.querySelector('.ac-promo-banner__description');
  if (description) {
    if (offer.offerDescription?.html) {
      const div = doc.createElement('div');
      div.className = 'ac-promo-banner__description';
      div.innerHTML = offer.offerDescription.html;
      description.replaceWith(div);
    } else {
      description.remove();
    }
  }

  const dates = section.querySelector('.ac-promo-banner__dates');
  if (dates) {
    const hasBookBy = !!offer.bookBy;
    const hasTravelBy = !!offer.travelBy;
    if (!hasBookBy && !hasTravelBy) {
      dates.remove();
    } else {
      const dateEls = dates.querySelectorAll('.ac-promo-banner__date');
      const sep = dates.querySelector('.ac-promo-banner__date-sep');
      const formatDateDisplay = (isoStr) => {
        if (!isoStr) return '';
        const d = new Date(isoStr);
        return Number.isNaN(d.getTime()) ? isoStr : d.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
      };
      if (dateEls[0]) {
        const value = dateEls[0].querySelector('.ac-promo-banner__date-value');
        if (value) value.textContent = hasBookBy ? formatDateDisplay(offer.bookBy) : '';
        if (!hasBookBy) dateEls[0].remove();
      }
      if (sep) {
        if (!hasBookBy || !hasTravelBy) sep.remove();
      }
      if (dateEls[1]) {
        const value = dateEls[1].querySelector('.ac-promo-banner__date-value');
        if (value) value.textContent = hasTravelBy ? formatDateDisplay(offer.travelBy) : '';
        if (!hasTravelBy) dateEls[1].remove();
      }
    }
  }

  const cta = section.querySelector('.ac-promo-banner__cta-btn');
  if (cta) {
    cta.href = ctaUrl;
    cta.textContent = offer.ctaLabel || 'Book now';
  }

  return section.outerHTML;
}

/**
 * @param {HTMLElement} block
 */
export default async function decorate(block) {
  const hostnameFromPlaceholders = await getHostname();
  const hostname = hostnameFromPlaceholders || getMetadata('hostname');
  const aemauthorurl = getMetadata('authorurl') || '';
  const aempublishurl = hostname?.replace('author', 'publish')?.replace(/\/$/, '');
  const isAuthor = isAuthorEnvironment();

  const contentPath = block.querySelector('p.button-container > a')?.textContent?.trim();

  if (!contentPath) {
    console.error('Travel Offer: Missing content fragment path');
    block.innerHTML = '';
    return;
  }

  const baseUrl = isAuthor ? aemauthorurl : aempublishurl;
  const url = `${baseUrl}${GRAPHQL_QUERY};path=${contentPath};ts=${Date.now()}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      console.error(`Travel Offer: GraphQL request failed: ${response.status}`);
      block.innerHTML = '';
      return;
    }

    const json = await response.json();
    const offer = json?.data?.flightOfferByPath?.item;

    if (!offer) {
      block.innerHTML = '';
      return;
    }

    const dmS7Url = offer.bannerPath?._dmS7Url;
    let imgUrl = null;
    if (dmS7Url) {
      const smartCrops = offer.bannerPath?._smartCrops || [];
      const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
      let cropName = null;
      if (smartCrops.length) {
        const sorted = [...smartCrops].sort((a, b) => a.width - b.width);
        const best = sorted.find((c) => c.width >= screenWidth) || sorted[sorted.length - 1];
        cropName = best?.name;
      }
      imgUrl = cropName ? `${dmS7Url}:${cropName}` : dmS7Url;
      imgUrl += (imgUrl.includes('?') ? '&' : '?') + `ts=${Date.now()}`;
    }
    const ctaUrl = offer.ctaUrl?._publishUrl || offer.ctaUrl?._authorUrl || '#';

    const templateRes = await fetch(`${TEMPLATE_URL}?ts=${Date.now()}`);
    const template = await templateRes.text();
    block.innerHTML = populateTemplate(template, offer, imgUrl, ctaUrl);
  } catch (error) {
    console.error('Travel Offer: Error fetching or rendering offer', error);
    block.innerHTML = '';
  }
}
