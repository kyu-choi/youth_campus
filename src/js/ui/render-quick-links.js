window.CheongchunCampus = window.CheongchunCampus || {};
window.CheongchunCampus.ui = window.CheongchunCampus.ui || {};

function isInstagramUrl(url) {
  if (!url) {
    return false;
  }

  try {
    const hostname = new URL(url, window.location.href).hostname.toLowerCase();
    return hostname === "instagram.com" || hostname.endsWith(".instagram.com");
  } catch {
    return false;
  }
}

window.CheongchunCampus.ui.renderQuickLinks = function renderQuickLinks(
  quickLinks,
  elements
) {
  elements.linkList.replaceChildren();

  quickLinks.forEach(({ id, label, url, featured }) => {
    const isDisabled = !url || isInstagramUrl(url);
    const link = document.createElement(isDisabled ? "span" : "a");
    const labelText = document.createElement("strong");
    const isInternalAnchor = !isDisabled && url.startsWith("#");

    link.className = featured ? "link-button link-button-featured" : "link-button";
    link.dataset.linkId = id;

    if (isDisabled) {
      link.classList.add("is-disabled");
      link.setAttribute("aria-disabled", "true");
    } else {
      link.href = url;

      if (!isInternalAnchor) {
        link.target = "_blank";
        link.rel = "noreferrer";
      }
    }

    labelText.textContent = label;

    if (isInternalAnchor) {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        window.dispatchEvent(
          new CustomEvent("cheongchun:navigate", {
            detail: { target: url },
          })
        );
      });
    }

    link.append(labelText);
    elements.linkList.appendChild(link);
  });
};
