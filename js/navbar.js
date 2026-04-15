// Shared navbar component
// Detects current page and sets the active link accordingly
(function () {
  var page = location.pathname.split('/').pop() || 'index.html';
  var isIndex = page === '' || page === '/' || page === 'index.html';
  var prefix = isIndex ? '' : 'index.html';

  function active(p) {
    if (p === 'index.html' || p === '/') return isIndex ? ' active' : '';
    return page === p ? ' active' : '';
  }

  var html = '<ul class="navbar-nav d-md-inline-flex">' +
    '<li class="nav-item"><a class="nav-link' + active('index.html') + '" href="' + (isIndex ? '/' : 'index.html') + '"><span>Home</span></a></li>' +
    '<li class="nav-item"><a class="nav-link' + active('experience') + '" href="' + prefix + '#section-experience"><span>Experience</span></a></li>' +
    '<li class="nav-item"><a class="nav-link' + active('projects.html') + '" href="projects.html"><span>Projects</span></a></li>' +
    '<li class="nav-item"><a class="nav-link' + active('blog.html') + '" href="blog.html"><span>Blog</span></a></li>' +
    '<li class="nav-item"><a class="nav-link" href="https://drive.google.com/file/d/1zskfXtsBf8umIZYlWt7eQXDO2aXMF_NF/view?usp=sharing" target="_blank" rel="noopener"><span>Resume</span></a></li>' +
    '<li class="nav-item"><a class="nav-link" href="' + prefix + '#section-about"><span>About Me</span></a></li>' +
    '<li class="nav-item"><a class="nav-link" href="' + prefix + '#contact"><span>Contact</span></a></li>' +
    '<li class="nav-item"><a class="nav-link topmate-link" href="https://topmate.io/thakursatyam/" target="_blank" rel="noopener"><span style="display:inline-flex;align-items:center;gap:4px">I\'m live on <img src="https://topmate.io/cdn-cgi/image/width=384,quality=90/images/common/topmate-light.svg" alt="Topmate!" style="height:19px"></span></a></li>' +
    '</ul>';

  var target = document.getElementById('navbar-links');
  if (target) target.innerHTML = html;
})();
