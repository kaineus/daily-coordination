import { LitElement, html, css } from 'lit';

const ICONS = {
  closet: '\uD83D\uDC55',
  weather: '\u2600\uFE0F',
  home: '\uD83C\uDFE0',
  logout: '\uD83D\uDEAA',
  add: '\u2795',
  delete: '\uD83D\uDDD1\uFE0F',
  refresh: '\uD83D\uDD04',
  user: '\uD83D\uDC64',
  google: 'G',
};

export class DcIcon extends LitElement {
  static properties = {
    name: { type: String },
    size: { type: String },
  };

  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    span {
      line-height: 1;
    }
  `;

  constructor() {
    super();
    this.name = '';
    this.size = '1.25';
  }

  render() {
    const icon = ICONS[this.name] ?? this.name;
    return html`<span style="font-size: ${this.size}rem">${icon}</span>`;
  }
}

customElements.define('dc-icon', DcIcon);
