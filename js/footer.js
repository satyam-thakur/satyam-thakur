// Shared footer component
// Renders the social icon row + copyright, so every page stays in sync.
// X / Substack / Scholar / Linktree are inline SVG: the inner pages load
// Font Awesome 6.0.0 (no fa-x-twitter or fa-google-scholar) and no Academicons.
(function () {
  var links = [
    ['mailto:satyamthakur8822@gmail.com', 'Email', '<i class="fas fa-envelope" aria-hidden="true"></i>', false],
    ['https://www.linkedin.com/in/satyam-thakur-6265b4197/', 'LinkedIn', '<i class="fab fa-linkedin" aria-hidden="true"></i>', true],
    ['https://github.com/satyam-thakur', 'GitHub', '<i class="fab fa-github" aria-hidden="true"></i>', true],
    ['https://x.com/sat__yam', 'X (Twitter)',
      '<svg viewBox="0 0 24 24" fill="currentColor" role="img" aria-hidden="true">' +
      '<path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>' +
      '</svg>', true],
    ['https://substack.com/@thakursatyam', 'Substack',
      '<svg viewBox="0 0 24 24" fill="currentColor" role="img" aria-hidden="true">' +
      '<path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/>' +
      '</svg>', true],
    ['https://scholar.google.com/citations?user=7Ym_jw4AAAAJ', 'Google Scholar',
      '<svg viewBox="0 0 24 24" fill="currentColor" role="img" aria-hidden="true">' +
      '<path d="M5.242 13.769 0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.29 14.978 9.5 12 9.5c-2.977 0-5.548 1.79-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"/>' +
      '</svg>', true],
    ['https://topmate.io/thakursatyam/', 'Topmate',
      '<img src="/authors/logos/topmate.svg" alt="" aria-hidden="true">', true],
    ['https://linktr.ee/satyam2479', 'All links on Linktree',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" role="img" aria-hidden="true">' +
      '<path d="M12 1.5V9.8M6.1 3.9 12 9.8M17.9 3.9 12 9.8M3.7 9.8h16.6M12 9.8 6.1 15.7M12 9.8l5.9 5.9M12 18.2V23"/>' +
      '</svg>', true],
  ];

  var items = links.map(function (l) {
    var rel = l[3] ? ' target="_blank" rel="noopener"' : '';
    return '<li><a href="' + l[0] + '"' + rel + ' aria-label="' + l[1] + '" title="' + l[1] + '">' + l[2] + '</a></li>';
  }).join('');

  var html =
    '<ul class="social-icons-list">' + items + '</ul>' +
    '<p class="powered-by copyright-license-text">© 2025 Satyam Thakur · Network Development Engineer</p>';

  var target = document.getElementById('footer-content');
  if (target) target.innerHTML = html;
})();
