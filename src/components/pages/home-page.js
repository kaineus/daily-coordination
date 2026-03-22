import { LitElement, html, css } from 'lit';
import { ContextConsumer } from '@lit/context';
import { supabaseContext } from '../../contexts/supabase.context.js';
import { StoreController } from '../../store/store-controller.js';
import { recommendStore } from '../../store/recommend.store.js';
import { getWeather, getRecommendation, getRecommendationWithRefresh } from '../../services/recommend.service.js';
import { tokens } from '../../styles/tokens.css.js';
import { reset } from '../../styles/reset.css.js';
import { bp } from '../../styles/breakpoints.css.js';
import { materialIcons } from '../../styles/material-icons.css.js';
import '../atoms/dc-spinner.js';
import '../molecules/weather-card.js';
import '../molecules/hourly-weather.js';
import '../organisms/outfit-card.js';
import '../organisms/empty-state.js';
import { normalizeOutfitItems } from '../../utils/recommendation.js';

export class HomePage extends LitElement {
  #supabase = new ContextConsumer(this, { context: supabaseContext, subscribe: true });
  #weather = new StoreController(this, recommendStore, (s) => s.weather);
  #hourly = new StoreController(this, recommendStore, (s) => s.hourly);
  #recommendation = new StoreController(this, recommendStore, (s) => s.recommendation);
  #loading = new StoreController(this, recommendStore, (s) => s.loading);
  #error = new StoreController(this, recommendStore, (s) => s.error);

  static styles = [
    reset,
    tokens,
    materialIcons,
    css`
      :host { display: block; }

      .loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--dc-space-4);
        padding: var(--dc-space-12);
      }
      .loading-text {
        font-size: var(--dc-font-body);
        color: var(--dc-text-secondary);
      }

      .page {
        display: flex;
        flex-direction: column;
        gap: var(--dc-space-8);
      }

      .section-title {
        font-family: var(--dc-font-headline);
        font-size: var(--dc-font-h2);
        font-weight: 600;
        color: var(--dc-text);
        margin-bottom: var(--dc-space-4);
      }

      .error-box {
        background: rgba(186, 26, 26, 0.08);
        color: var(--dc-danger);
        font-size: var(--dc-font-body);
        padding: var(--dc-space-4);
        border-radius: var(--dc-radius-md);
        text-align: center;
      }

      @media (min-width: ${bp.lg}) {
        .page {
          display: grid;
          grid-template-columns: 45% 55%;
          gap: var(--dc-space-8);
          align-items: start;
        }

        .weather-col {
          position: sticky;
          top: var(--dc-space-8);
          display: flex;
          flex-direction: column;
          gap: var(--dc-space-6);
        }

        .outfit-col {
          display: flex;
          flex-direction: column;
          gap: var(--dc-space-6);
        }

        .outfit-header {
          display: flex;
          align-items: center;
          gap: var(--dc-space-2);
        }
        .outfit-header .section-title {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0;
        }
        .outfit-header .material-symbols-outlined {
          color: var(--dc-secondary);
          font-size: 1.75rem;
        }
      }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    this.#loadData();
  }

  async #loadData() {
    const sb = this.#supabase.value;
    if (!sb) return;
    recommendStore.actions.setLoading(true);

    const [weatherRes, recRes] = await Promise.all([
      getWeather(),
      getRecommendation(sb),
    ]);

    if (weatherRes.data) recommendStore.actions.setWeather(weatherRes.data);
    if (recRes.error) {
      recommendStore.actions.setError(
        recRes.error.code === 'EMPTY_CLOSET' ? 'EMPTY_CLOSET' : (recRes.error.message ?? recRes.error.error ?? '추천 실패')
      );
    } else if (recRes.data) {
      recommendStore.actions.setRecommendation(recRes.data.recommendation);
      if (recRes.data.weather && !weatherRes.data) recommendStore.actions.setWeather(recRes.data.weather);
    }
    recommendStore.actions.setLoading(false);
  }

  async #handleRefresh() {
    const sb = this.#supabase.value;
    if (!sb) return;
    recommendStore.actions.setLoading(true);
    const { data, error } = await getRecommendationWithRefresh(sb);
    if (error) recommendStore.actions.setError(error.message ?? '추천 실패');
    else if (data) recommendStore.actions.setRecommendation(data.recommendation);
    recommendStore.actions.setLoading(false);
  }

  render() {
    const weather = this.#weather.value;
    const hourly = this.#hourly.value;
    const rec = this.#recommendation.value;
    const loading = this.#loading.value;
    const error = this.#error.value;

    if (loading) {
      return html`
        <div class="loading">
          <dc-spinner size="2.5"></dc-spinner>
          <span class="loading-text">오늘의 코디를 준비하고 있어요...</span>
        </div>
      `;
    }

    return html`
      <div class="page">
        <!-- Weather Column -->
        <div class="weather-col">
          ${this.#renderWeather(weather)}
          ${hourly?.length ? html`
            <section>
              <h2 class="section-title">시간대별 날씨</h2>
              <hourly-weather .hours=${hourly}></hourly-weather>
            </section>
          ` : ''}
        </div>

        <!-- Outfit Column -->
        <div class="outfit-col">
          <div class="outfit-header">
            <h2 class="section-title">오늘의 코디</h2>
            <span class="material-symbols-outlined">auto_awesome</span>
          </div>
          ${error === 'EMPTY_CLOSET'
            ? html`<empty-state icon="checkroom" title="옷장에 옷을 먼저 등록해주세요"
                description="카테고리와 색상으로 옷을 등록하면 날씨에 맞는 코디를 추천해드려요"
                button-text="옷장으로 가기" button-href="/closet"
                @dc-navigate=${(e) => window.location.hash = e.detail.href}></empty-state>`
            : error
              ? html`<div class="error-box">${error}</div>`
              : this.#renderOutfit(rec)
          }
        </div>
      </div>
    `;
  }

  #renderWeather(weather) {
    if (!weather) return '';
    const w = weather.current ?? weather;
    const t = weather.today ?? {};
    return html`
      <section>
        <h2 class="section-title">오늘의 날씨</h2>
        <weather-card
          type=${w.type ?? weather.type}
          temp="${w.temp ?? weather.temp}°"
          temp-min="${t.tempMin ?? weather.tempMin}°"
          temp-max="${t.tempMax ?? weather.tempMax}°"
          location=${weather.location}
          condition=${w.condition ?? weather.condition}
          precipitation="${w.precipitation ?? weather.precipitation}%"
          wind-speed="${w.windSpeed ?? weather.windSpeed}m/s"
        ></weather-card>
      </section>
    `;
  }

  #renderOutfit(rec) {
    if (!rec) return '';
    const items = normalizeOutfitItems(rec);
    return html`
      <outfit-card .items=${items} summary=${rec.summary ?? ''} tip=${rec.tip ?? ''}
        @dc-refresh=${this.#handleRefresh}></outfit-card>
    `;
  }
}

customElements.define('home-page', HomePage);
