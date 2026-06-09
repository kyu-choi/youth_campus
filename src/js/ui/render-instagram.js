window.CheongchunCampus = window.CheongchunCampus || {};
window.CheongchunCampus.ui = window.CheongchunCampus.ui || {};

window.CheongchunCampus.ui.renderInstagram = function renderInstagram(
  instagram,
  elements
) {
  elements.instagramLinkLabel.textContent = instagram.label;
  elements.instagramLink.removeAttribute("href");
  elements.instagramLink.removeAttribute("target");
  elements.instagramLink.removeAttribute("rel");
  elements.instagramLink.setAttribute("aria-disabled", "true");
  elements.instagramLink.setAttribute("tabindex", "-1");
  elements.instagramLink.classList.add("is-disabled");
  elements.instagramLink.closest(".instagram-card")?.classList.add("is-disabled");
  elements.instagramBadge.textContent = "";
  elements.instagramBadge.hidden = true;
};
