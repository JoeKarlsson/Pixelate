// Plausible (self-hosted), skipped for bots and headless browsers, the same setup as joekarlsson.com.
(function () {
  if (
    navigator.webdriver ||
    /bot|crawl|spider|scrape|headless/i.test(navigator.userAgent) ||
    !navigator.languages ||
    navigator.languages.length === 0
  ) {
    return;
  }
  const script = document.createElement('script');
  script.defer = true;
  script.dataset.domain = 'pixelate.joekarlsson.com';
  script.src = 'https://plausible.joekarlsson.io/js/script.tagged-events.outbound-links.file-downloads.js';
  document.head.appendChild(script);

  // Report the first uncaught error on a page as a "JS Error" event, so breakage shows up.
  let reported = false;
  const report = (message, source) => {
    if (reported || typeof window.plausible !== 'function') return;
    reported = true;
    window.plausible('JS Error', {
      props: { message: String(message).slice(0, 200), source, path: location.pathname },
    });
  };
  addEventListener('error', (event) => report(event.message, `${event.filename}:${event.lineno}`));
  addEventListener('unhandledrejection', (event) => report(event.reason, 'promise'));

  if (document.documentElement.dataset.page === '404') {
    script.addEventListener('load', () => window.plausible?.('404', { props: { path: location.pathname } }));
  }
})();
