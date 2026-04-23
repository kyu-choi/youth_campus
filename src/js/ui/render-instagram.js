window.CheongchunCampus = window.CheongchunCampus || {};
window.CheongchunCampus.ui = window.CheongchunCampus.ui || {};

window.CheongchunCampus.ui.renderInstagram = function renderInstagram(
  instagram,
  elements
) {
  elements.instagramLink.textContent = instagram.label;
  elements.instagramLink.href = instagram.url;
  elements.instagramBadge.textContent = instagram.badge;
};
