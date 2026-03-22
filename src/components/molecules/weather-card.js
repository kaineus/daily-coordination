import { LitElement, html, css } from 'lit';
import { tokens } from '../../styles/tokens.css.js';
import { reset } from '../../styles/reset.css.js';
import { bp } from '../../styles/breakpoints.css.js';
import { materialIcons } from '../../styles/material-icons.css.js';
import { WEATHER_TYPES } from '../../constants/weather.js';

export class WeatherCard extends LitElement {
  static properties = {
    type: { type: String },
    temp: { type: String },
    tempMin: { type: String, attribute: 'temp-min' },
    tempMax: { type: String, attribute: 'temp-max' },
    location: { type: String },
    condition: { type: String },
    precipitation: { type: String },
    windSpeed: { type: String, attribute: 'wind-speed' },
  };

  static styles = [
    reset,
    tokens,
    materialIcons,
    css`
      :host { display: block; }

      .card {
        border-radius: 1.25rem;
        padding: var(--dc-space-6);
        color: white;
        position: relative;
        overflow: hidden;
      }
      .card.cloudy, .card.snowy { color: var(--dc-text); }

      .content { position: relative; z-index: 1; }

      .top-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }

      .location {
        font-size: var(--dc-font-body);
        font-weight: 500;
        opacity: 0.9;
        margin-bottom: var(--dc-space-1);
      }

      .temp-row {
        display: flex;
        align-items: baseline;
        gap: var(--dc-space-1);
      }

      .temp {
        font-family: var(--dc-font-headline);
        font-size: 4rem;
        font-weight: 800;
        line-height: 1;
        letter-spacing: -0.04em;
      }

      .condition-text {
        font-size: var(--dc-font-h2);
        font-weight: 600;
        opacity: 0.9;
      }

      .weather-icon {
        font-size: 6rem;
        opacity: 0.9;
      }
      .weather-icon .material-symbols-outlined {
        font-size: inherit;
        font-variation-settings: 'FILL' 1;
        filter: drop-shadow(0 0 1.25rem rgba(255, 255, 255, 0.4));
      }

      /* Glass pill meta */
      .meta-pills {
        display: flex;
        gap: var(--dc-space-3);
        margin-top: var(--dc-space-6);
      }

      .pill {
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(0.75rem);
        border-radius: var(--dc-radius-full);
        padding: 0.375rem 0.75rem;
        font-size: 0.6875rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }
      .pill .material-symbols-outlined { font-size: 0.875rem; }

      .card.cloudy .pill, .card.snowy .pill {
        background: rgba(0, 0, 0, 0.08);
      }

      /* Blur deco */
      .deco {
        position: absolute;
        border-radius: var(--dc-radius-full);
        pointer-events: none;
      }
      .deco-1 {
        top: -1.25rem; right: -1.25rem;
        width: 12rem; height: 12rem;
        background: rgba(255, 255, 255, 0.2);
        filter: blur(3.75rem);
      }

      @media (min-width: ${bp.lg}) {
        .card { padding: var(--dc-space-10); border-radius: 1.25rem; }
        .temp { font-size: 5rem; }
        .weather-icon { font-size: 4.375rem; }
        .location { font-size: var(--dc-font-h2); }
        .condition-text { font-size: 1.5rem; }
        .meta-pills { margin-top: var(--dc-space-12); }
      }
    `,
  ];

  constructor() {
    super();
    this.type = 'sunny';
    this.temp = '18°';
    this.tempMin = '';
    this.tempMax = '';
    this.location = '서울';
    this.condition = '맑음';
    this.precipitation = '';
    this.windSpeed = '';
  }

  render() {
    const w = WEATHER_TYPES[this.type] ?? WEATHER_TYPES.sunny;
    return html`
      <div class="card ${this.type}" style="background: ${w.gradient}">
        <div class="deco deco-1"></div>
        <div class="content">
          <div class="top-row">
            <div>
              <p class="location">${this.location}</p>
              <div class="temp-row">
                <h3 class="temp">${this.temp}</h3>
                <span class="condition-text">${this.condition}</span>
              </div>
            </div>
            <div class="weather-icon">
              <span class="material-symbols-outlined">${w.icon}</span>
            </div>
          </div>
          <div class="meta-pills">
            ${this.tempMin && this.tempMax ? html`
              <div class="pill">
                <span class="material-symbols-outlined">swap_vert</span>
                <span>${this.tempMin} / ${this.tempMax}</span>
              </div>
            ` : ''}
            ${this.precipitation ? html`
              <div class="pill">
                <span class="material-symbols-outlined">water_drop</span>
                <span>${this.precipitation}</span>
              </div>
            ` : ''}
            ${this.windSpeed ? html`
              <div class="pill">
                <span class="material-symbols-outlined">air</span>
                <span>${this.windSpeed}</span>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('weather-card', WeatherCard);
