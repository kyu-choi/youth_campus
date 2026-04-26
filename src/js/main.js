window.CheongchunCampus = window.CheongchunCampus || {};

function setupViewNavigation() {
  const views = {
    "#": document.getElementById("landing-view"),
    "#application-form": document.getElementById("application-form"),
    "#info-page": document.getElementById("info-page"),
  };

  function showView(target, shouldUpdateUrl = true) {
    const normalizedTarget = views[target] ? target : "#";

    Object.entries(views).forEach(([viewTarget, view]) => {
      view?.classList.toggle("is-active", viewTarget === normalizedTarget);
    });

    if (
      shouldUpdateUrl &&
      normalizedTarget !== "#" &&
      window.location.hash !== normalizedTarget
    ) {
      window.history.pushState(null, "", normalizedTarget);
    }

    if (shouldUpdateUrl && normalizedTarget === "#" && window.location.hash) {
      window.history.pushState(null, "", window.location.pathname);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  window.addEventListener("cheongchun:navigate", (event) => {
    showView(event.detail.target);
  });

  window.addEventListener("popstate", () => {
    showView(window.location.hash || "#", false);
  });

  document.querySelectorAll("[data-home-button]").forEach((button) => {
    button.addEventListener("click", () => showView("#"));
  });

  showView(window.location.hash || "#", false);
}

(async function bootstrap() {
  try {
    const elements = window.CheongchunCampus.dom.getLandingElements();
    const content = await window.CheongchunCampus.services.getLandingContent();

    window.CheongchunCampus.ui.renderHero(content.hero, elements);
    window.CheongchunCampus.ui.renderInstagram(content.instagram, elements);
    window.CheongchunCampus.ui.renderQuickLinks(content.quickLinks, elements);
    window.CheongchunCampus.ui.renderContact(content.contact, elements);
    window.CheongchunCampus.ui.renderApplicationForm(
      window.CheongchunCampus.config.applicationForm,
      document.getElementById("application-form")
    );
    setupViewNavigation();
  } catch (error) {
    console.error("Landing page bootstrap failed.", error);
  }
})();
