import { LitElement, html, css } from 'lit';
import { tokens } from '../../styles/tokens.css.js';
import { reset } from '../../styles/reset.css.js';

export class UserAvatar extends LitElement {
  static properties = {
    name: { type: String },
    imageUrl: { type: String, attribute: 'image-url' },
    size: { type: String },
  };

  static styles = [
    reset,
    tokens,
    css`
      :host {
        display: inline-flex;
        align-items: center;
        gap: var(--dc-space-2);
      }

      .avatar {
        border-radius: var(--dc-radius-full);
        object-fit: cover;
        background: var(--dc-primary-light);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--dc-primary);
        font-weight: 600;
        font-family: var(--dc-font-headline);
      }

      img {
        border-radius: var(--dc-radius-full);
        object-fit: cover;
      }

      .name {
        font-size: var(--dc-font-body);
        font-weight: 500;
        color: var(--dc-text);
      }
    `,
  ];

  constructor() {
    super();
    this.name = '';
    this.imageUrl = '';
    this.size = '2';
  }

  render() {
    const s = this.size;
    const fontSize = parseFloat(s) * 0.4;
    const initial = this.name?.charAt(0)?.toUpperCase() ?? '?';
    return html`
      ${this.imageUrl
        ? html`<img
            src=${this.imageUrl}
            alt=${this.name}
            style="width: ${s}rem; height: ${s}rem"
          />`
        : html`<div
            class="avatar"
            style="width: ${s}rem; height: ${s}rem; font-size: ${fontSize}rem"
          >
            ${initial}
          </div>`}
      ${this.name ? html`<span class="name">${this.name}</span>` : ''}
    `;
  }
}

customElements.define('user-avatar', UserAvatar);
