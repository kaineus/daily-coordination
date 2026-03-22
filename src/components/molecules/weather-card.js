import { LitElement, html, css, unsafeCSS } from 'lit';
import { tokens } from '../../styles/tokens.css.js';
import { reset } from '../../styles/reset.css.js';

const WEATHER = {
  sunny: { gradient: 'linear-gradient(135deg, #FF9966, #FF5E62)', icon: 'light_mode' },
  cloudy: { gradient: 'linear-gradient(135deg, #BDC3C7, #2C3E50)', icon: 'cloud' },
  rainy: { gradient: 'linear-gradient(135deg, #4B79A1, #283E51)', icon: 'water_drop' },
  snowy: { gradient: 'linear-gradient(135deg, #E0EAFC, #CFDEF3)', icon: 'ac_unit' },
};

export class WeatherCard extends LitElement {
  static properties = {
    type: { type: String },
    temp: { type: String },
    location: { type: String },
    condition: { type: String },
    precipitation: { type: String },
  };

  static styles = [
    reset,
    tokens,
    css`
      :host { display: block; }

      .card {
        border-radius: var(--dc-radius-lg);
        padding: var(--dc-space-6);
        color: white;
        position: relative;
        overflow: hidden;
      }

      .card.snowy { color: var(--dc-text); }
      .card.snowy .temp { color: var(--dc-primary); }

      .content { position: relative; z-index: 1; }

      .location {
        font-size: var(--dc-font-caption);
        font-weight: 500;
        opacity: 0.9;
        margin-bottom: var(--dc-space-1);
      }

      .temp {
        font-family: var(--dc-font-headline);
        font-size: 2.5rem;
        font-weight: 700;
        line-height: 1;
      }

      .condition {
        display: flex;
        align-items: center;
        gap: var(--dc-space-2);
        margin-top: var(--dc-space-4);
      }
      .condition .material-symbols-outlined { font-size: 1.5rem; }
      .condition span:last-child { font-size: var(--dc-font-title); font-weight: 500; }

      .precip {
        font-size: var(--dc-font-caption);
        opacity: 0.7;
        margin-top: var(--dc-space-1);
      }

      .deco {
        position: absolute;
        right: -0.25rem;
        bottom: -0.25rem;
        font-size: 7.5rem;
        opacity: 0.2;
        transform: rotate(12deg);
        transition: transform 0.5s;
      }
      .card:hover .deco { transform: rotate(12deg) scale(1.1); }
    `,
  ];

  constructor() {
    super();
    this.type = 'sunny';
    this.temp = '18°';
    this.location = '서울특별시';
    this.condition = '맑음';
    this.precipitation = '강수확률 10%';
  }

  render() {
    const w = WEATHER[this.type] ?? WEATHER.sunny;
    return html`
      <div class="card ${this.type}" style="background: ${w.gradient}">
        <div class="content">
          <p class="location">${this.location}</p>
          <h3 class="temp">${this.temp}</h3>
          <div class="condition">
            <span class="material-symbols-outlined">${w.icon}</span>
            <span>${this.condition}</span>
          </div>
          <p class="precip">${this.precipitation}</p>
        </div>
        <span class="material-symbols-outlined deco">${w.icon}</span>
      </div>
    `;
  }
}

customElements.define('weather-card', WeatherCard);
