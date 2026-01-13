const PORT_COLORS: Record<string, string> = {
  '5173': '#22c55e', // green - default Vite port
  '5174': '#3b82f6', // blue
  '5175': '#f97316', // orange
  '5176': '#a855f7', // purple
  '5177': '#ec4899', // pink
  '5178': '#14b8a6', // teal
  '5179': '#eab308', // yellow
  '5180': '#ef4444', // red
};

function getPortColor(port: string): string {
  return PORT_COLORS[port] || '#6b7280'; // gray fallback
}

function createFaviconWithDot(color: string): string {
  const svg = `
    <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="200px" width="200px"
         xmlns="http://www.w3.org/2000/svg">
      <path fill="none" d="M0 0h24v24H0z"></path>
      <path d="M20 6h-3V4c0-1.11-.89-2-2-2H9c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zM9 4h6v2H9V4zm11 15H4v-2h16v2zm0-5H4V8h3v2h2V8h6v2h2V8h3v6z"></path>
      <circle cx="19" cy="5" r="5" fill="${color}" stroke="white" stroke-width="1"/>
    </svg>
  `;
  return `data:image/svg+xml,${encodeURIComponent(svg.trim())}`;
}

export function setupDynamicFavicon() {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  if (!isLocalhost) {
    return;
  }

  const port = window.location.port;
  const color = getPortColor(port);
  const faviconUrl = createFaviconWithDot(color);

  const link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
  if (link) {
    link.href = faviconUrl;
  }
}
