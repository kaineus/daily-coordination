import { LitElement, html, css, svg } from 'lit';
import { tokens } from '../../styles/tokens.css.js';
import { reset } from '../../styles/reset.css.js';
import { materialIcons } from '../../styles/material-icons.css.js';
import { SKY_ICONS } from '../../constants/weather.js';
import { getKSTHour } from '../../utils/timezone.js';
import { buildBezierPath } from '../../utils/weather-chart.js';

export class HourlyWeather extends LitElement {
  static properties = {
    hours: { type: Array },
  };

  static styles = [
    reset,
    tokens,
    materialIcons,
    css`
      :host { display: block; }

      .container {
        background: var(--dc-surface-lowest);
        border-radius: var(--dc-radius-lg);
        padding: var(--dc-space-5);
        box-shadow: var(--dc-shadow-sm);
      }

      .chart-wrap {
        position: relative;
        width: 100%;
        padding: var(--dc-space-8) var(--dc-space-2) 0;
      }

      .chart-svg {
        width: 100%;
        height: auto;
        display: block;
      }

      /* Temperature labels positioned over SVG */
      .temp-labels {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 100%;
        display: flex;
        justify-content: space-between;
        pointer-events: none;
        padding: 0 var(--dc-space-2);
      }

      .temp-label {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 0;
        flex: 1;
      }

      .temp-text {
        font-family: var(--dc-font-headline);
        font-size: var(--dc-font-caption);
        font-weight: 700;
        color: var(--dc-text);
      }
      .temp-text.highlight {
        font-size: var(--dc-font-body);
        font-weight: 800;
        color: var(--dc-primary);
      }

      /* X-axis: icons + time */
      .x-axis {
        display: flex;
        justify-content: space-between;
        padding: var(--dc-space-3) var(--dc-space-2) 0;
      }

      .x-slot {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.125rem;
        flex: 1;
      }

      .x-slot .material-symbols-outlined {
        font-size: 1.125rem;
        font-variation-settings: 'FILL' 1;
      }

      .x-time {
        font-size: 0.625rem;
        font-weight: 500;
        color: var(--dc-outline);
      }

      .x-slot.highlight .x-time {
        font-weight: 700;
        color: var(--dc-primary);
      }
    `,
  ];

  constructor() {
    super();
    this.hours = [];
  }

  render() {
    if (!this.hours?.length) return '';

    const temps = this.hours.map(h => h.temp ?? 15);
    const svgW = 700;
    const svgH = 120;
    const padX = 44;
    const padY = 10;

    const { path: d, fillPath: fillD, points, minT, maxT, range, ySteps } = buildBezierPath(temps, svgW, svgH, padX, padY);

    const kstHour = getKSTHour();

    return html`
      <div class="container">
        <div class="chart-wrap">
          <!-- Temp labels above dots -->
          <div class="temp-labels" style="padding-top: 0">
            ${this.hours.map((h, i) => {
              const isHighlight = parseInt(h.time) === kstHour;
              const topPct = ((1 - (temps[i] - minT) / range) * (svgH - padY * 2) + padY) / svgH * 100;
              return html`
                <div class="temp-label">
                  <span class="temp-text ${isHighlight ? 'highlight' : ''}"
                    style="margin-top: calc(${topPct}% - 1.5rem)">${temps[i]}°</span>
                </div>
              `;
            })}
          </div>

          <svg class="chart-svg" viewBox="0 0 ${svgW} ${svgH}" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#005ea1" stop-opacity="0.12"/>
                <stop offset="100%" stop-color="#005ea1" stop-opacity="0"/>
              </linearGradient>
            </defs>

            <!-- Y-axis guide lines -->
            ${ySteps.map(t => {
              const y = padY + (1 - (t - minT) / range) * (svgH - padY * 2);
              return svg`<line x1="${padX}" y1="${y}" x2="${svgW - padX}" y2="${y}"
                stroke="#C1C7D2" stroke-width="0.5" stroke-dasharray="4,4" opacity="0.4"/>`;
            })}

            <!-- Fill -->
            ${svg`<path d="${fillD}" fill="url(#hg)"/>`}
            <!-- Line -->
            ${svg`<path d="${d}" fill="none" stroke="#005ea1" stroke-width="2.5" stroke-linecap="round"/>`}

            <!-- Dots -->
            ${points.map((p, i) => {
              const isHighlight = parseInt(this.hours[i]?.time) === kstHour;
              return svg`
                <circle cx="${p.x}" cy="${p.y}" r="${isHighlight ? 5 : 3.5}"
                  fill="${isHighlight ? '#005ea1' : 'white'}"
                  stroke="${isHighlight ? 'white' : '#005ea1'}"
                  stroke-width="${isHighlight ? 2.5 : 2}"/>
              `;
            })}

            <!-- Y-axis labels -->
            ${ySteps.map(t => {
              const y = padY + (1 - (t - minT) / range) * (svgH - padY * 2);
              return svg`<text x="8" y="${y + 4}" fill="#717782" font-size="11" font-family="Manrope, sans-serif">${t}°</text>`;
            })}
          </svg>
        </div>

        <!-- X-axis -->
        <div class="x-axis">
          ${this.hours.map(h => {
            const isHighlight = parseInt(h.time) === kstHour;
            const skyInfo = SKY_ICONS[h.sky] ?? SKY_ICONS.sunny;
            return html`
              <div class="x-slot ${isHighlight ? 'highlight' : ''}">
                <span class="material-symbols-outlined" style="color: ${skyInfo.color}">${skyInfo.icon}</span>
                <span class="x-time">${h.time}시</span>
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }
}

customElements.define('hourly-weather', HourlyWeather);
