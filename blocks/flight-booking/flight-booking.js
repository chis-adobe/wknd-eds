/**
 * Static flight booking block - no user inputs, presentational only.
 * @param {HTMLElement} block
 */
export default function decorate(block) {
  block.innerHTML = `
    <div class="flight-booking-hero">
      <div class="flight-booking-header">
        <h2 class="flight-booking-title">Fly the Flag</h2>
        <div class="flight-booking-logos">
          <div class="flight-booking-logo logo-olympic">Olympic</div>
          <div class="flight-booking-logo logo-aircanada">AIR CANADA<br><span>OFFICIAL AIRLINE</span></div>
          <div class="flight-booking-logo logo-paralympic">Paralympic</div>
        </div>
      </div>
      <div class="flight-booking-card">
        <div class="flight-booking-controls">
          <div class="flight-booking-dropdown">Round-trip <span class="arrow">▼</span></div>
          <div class="flight-booking-dropdown">1 Adult <span class="arrow">▼</span></div>
          <div class="flight-booking-checkbox">
            <span class="checkbox-icon">≡</span>
            <span>Book with Aeroplan points</span>
            <span class="checkbox-box"></span>
          </div>
        </div>
        <div class="flight-booking-route">
          <div class="flight-booking-field origin">
            <span class="flight-code">YVR</span>
            <span class="flight-city">Vancouver</span>
          </div>
          <div class="flight-booking-swap">⇄</div>
          <div class="flight-booking-field destination">
            <span class="flight-code">SLC</span>
            <span class="flight-city">Salt Lake City</span>
          </div>
          <div class="flight-booking-dates">
            <div class="flight-booking-date">
              <span class="date-label">Departure date</span>
              <span class="date-value"><span class="date-icon" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span> Mon Mar 23</span>
            </div>
            <div class="flight-booking-date">
              <span class="date-label">Return date</span>
              <span class="date-value">Thu Mar 26</span>
            </div>
          </div>
        </div>
        <div class="flight-booking-footer">
          <div class="flight-booking-promo">
            <span class="promo-icon">🏷</span>
            <span>Promotion code</span>
          </div>
          <button type="button" class="flight-booking-search">Search</button>
        </div>
      </div>
    </div>
  `;
}
