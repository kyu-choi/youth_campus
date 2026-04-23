window.CheongchunCampus = window.CheongchunCampus || {};

(async function bootstrap() {
  try {
    const elements = window.CheongchunCampus.dom.getLandingElements();
    const content = await window.CheongchunCampus.services.getLandingContent();

    window.CheongchunCampus.ui.renderHero(content.hero, elements);
    window.CheongchunCampus.ui.renderInstagram(content.instagram, elements);
    window.CheongchunCampus.ui.renderQuickLinks(content.quickLinks, elements);
    window.CheongchunCampus.ui.renderContact(content.contact, elements);
  } catch (error) {
    console.error("Landing page bootstrap failed.", error);
  }
})();
