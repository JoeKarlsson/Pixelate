// Plausible (self-hosted), set up like Joe's other sites: skipped for bots and headless browsers,
// with the 404 page and the first script error on each page sent as events.
(function () {
  // Defined first, so page scripts can call plausible() before the real script loads, or when it's skipped.
  window.plausible =
    window.plausible ||
    function () {
      (window.plausible.q = window.plausible.q || []).push(arguments);
    };
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

  if (document.documentElement.dataset.page === '404') {
    window.plausible('404', { props: { path: location.pathname } });
  }

  // Browser extensions run code inside the page; their errors aren't the site's.
  const EXTENSION_URL = /(chrome|moz|safari(-web)?)-extension:\/\//;
  // The site creates no Trusted Types policies, so a policy error comes from an extension.
  const TRUSTED_TYPES_POLICY = /TrustedTypePolicy|trusted-types/i;

  // Report the first uncaught error on a page, so breakage on the live site shows up.
  // One per page keeps a looping error from flooding the dashboard.
  let reported = false;
  const report = (message, source, stack) => {
    if (reported) return;
    if (EXTENSION_URL.test(source) || EXTENSION_URL.test(stack || '') || TRUSTED_TYPES_POLICY.test(message)) return;
    reported = true;
    window.plausible('JS Error', {
      props: { message: String(message).slice(0, 200), source, path: location.pathname },
    });
  };
  addEventListener('error', (e) => report(e.message, `${e.filename}:${e.lineno}`, e.error && e.error.stack));
  addEventListener('unhandledrejection', (e) => {
    const reason = e.reason;
    report(reason && reason.message ? reason.message : reason, 'promise', reason && reason.stack);
  });
})();
