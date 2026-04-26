window.CheongchunCampus = window.CheongchunCampus || {};
window.CheongchunCampus.ui = window.CheongchunCampus.ui || {};

window.CheongchunCampus.ui.renderInstagram = function renderInstagram(
  instagram,
  elements
) {
  elements.instagramLinkLabel.textContent = instagram.label;
  elements.instagramLink.href = instagram.url;
  elements.instagramBadge.textContent = instagram.badge || "";
  elements.instagramBadge.hidden = !instagram.badge;
};
