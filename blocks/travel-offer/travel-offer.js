import { getMetadata } from '../../scripts/aem.js';
import { isAuthorEnvironment } from '../../scripts/scripts.js';
import { getHostname } from '../../scripts/utils.js';

const GRAPHQL_QUERY = '/graphql/execute.json/aircanada/GetFlightOfferByPath';

/**
 * @param {HTMLElement} block
 */
export default async function decorate(block) {
  const hostnameFromPlaceholders = await getHostname();
  const hostname = hostnameFromPlaceholders || getMetadata('hostname');
  const aemauthorurl = getMetadata('authorurl') || '';
  const aempublishurl = hostname?.replace('author', 'publish')?.replace(/\/$/, '');
  const isAuthor = isAuthorEnvironment();

  const linkEl = block.querySelector(':scope div:nth-child(1) > div a');
  const contentPath = linkEl?.getAttribute('href') || linkEl?.textContent?.trim()
    || block.querySelector(':scope div:nth-child(1) > div')?.textContent?.trim();

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
    const bannerUrl = offer.bannerPath?._dynamicUrl;
    const imgUrl = bannerUrl?.startsWith('http')
      ? bannerUrl
      : bannerUrl && aempublishurl
        ? `${aempublishurl}${bannerUrl}`
        : null;
    const ctaUrl = offer.ctaUrl?._publishUrl || offer.ctaUrl?._authorUrl || '#';

    block.innerHTML = `
      <div class="travel-offer-content">
        ${imgUrl ? `<div class="travel-offer-banner" style="background-image: url(${imgUrl})"></div>` : ''}
        <div class="travel-offer-detail">
          <h2 class="travel-offer-title">${offer.offerTitle || ''}</h2>
          ${offer.offerDescription?.html ? `<div class="travel-offer-description">${offer.offerDescription.html}</div>` : ''}
          ${offer.bookBy ? `<p class="travel-offer-book-by">Book by ${offer.bookBy}</p>` : ''}
          <p class="button-container">
            <a href="${ctaUrl}" class="button" target="_blank" rel="noopener">${offer.ctaLabel || 'Book now'}</a>
          </p>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Travel Offer: Error fetching or rendering offer', error);
    block.innerHTML = '';
  }
}
