window.CheongchunCampus = window.CheongchunCampus || {};
window.CheongchunCampus.ui = window.CheongchunCampus.ui || {};

window.CheongchunCampus.ui.renderQuickLinks = function renderQuickLinks(
  quickLinks,
  elements
) {
  elements.linkList.replaceChildren();

  quickLinks.forEach(({ id, label, url }) => {
    const anchor = document.createElement("a");
    const labelText = document.createElement("strong");
    const icon = document.createElement("span");

    anchor.className = "link-button";
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noreferrer";
    anchor.dataset.linkId = id;

    labelText.textContent = label;
    icon.textContent = "↗";
    icon.setAttribute("aria-hidden", "true");

    anchor.append(labelText, icon);
    elements.linkList.appendChild(anchor);
  });
};
