window.CheongchunCampus = window.CheongchunCampus || {};
window.CheongchunCampus.dom = window.CheongchunCampus.dom || {};

window.CheongchunCampus.dom.getLandingElements = function getLandingElements() {
  return {
    heroTitle: document.getElementById("hero-title"),
    heroSubtitle: document.getElementById("hero-subtitle"),
    instagramLink: document.getElementById("instagram-link"),
    instagramBadge: document.getElementById("instagram-badge"),
    linkList: document.getElementById("link-list"),
    contactPrefix: document.getElementById("contact-prefix"),
    contactLink: document.getElementById("contact-link"),
    contactSuffix: document.getElementById("contact-suffix"),
  };
};
