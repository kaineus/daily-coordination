import { css } from 'lit';

export const reset = css`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :host {
    font-family: var(--dc-font-family, 'Be Vietnam Pro', -apple-system, sans-serif);
    color: var(--dc-text, #1A1C1F);
    line-height: 1.6;
  }

  button {
    font: inherit;
    cursor: pointer;
    border: none;
    background: none;
  }

  a {
    color: inherit;
    text-decoration: none;
  }
`;
