window.CheongchunCampus = window.CheongchunCampus || {};
window.CheongchunCampus.ui = window.CheongchunCampus.ui || {};

window.CheongchunCampus.ui.renderQuickLinks = function renderQuickLinks(
  quickLinks,
  elements
) {
  elements.linkList.replaceChildren();

  quickLinks.forEach(({ id, label, url, featured }) => {
    const anchor = document.createElement("a");
    const labelText = document.createElement("strong");
    const isInternalAnchor = url.startsWith("#");

    anchor.className = featured ? "link-button link-button-featured" : "link-button";
    anchor.href = url;
    anchor.dataset.linkId = id;

    if (!isInternalAnchor) {
      anchor.target = "_blank";
      anchor.rel = "noreferrer";
    }

    labelText.textContent = label;

    if (isInternalAnchor) {
      anchor.addEventListener("click", (event) => {
        event.preventDefault();
        window.dispatchEvent(
          new CustomEvent("cheongchun:navigate", {
            detail: { target: url },
          })
        );
      });
    }

    anchor.append(labelText);
    elements.linkList.appendChild(anchor);
  });
};
