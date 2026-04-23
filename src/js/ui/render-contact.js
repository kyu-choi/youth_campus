window.CheongchunCampus = window.CheongchunCampus || {};
window.CheongchunCampus.ui = window.CheongchunCampus.ui || {};

window.CheongchunCampus.ui.renderContact = function renderContact(
  contact,
  elements
) {
  elements.contactPrefix.textContent = contact.prefix;
  elements.contactLink.textContent = contact.linkLabel;
  elements.contactLink.href = contact.url;
  elements.contactSuffix.textContent = contact.suffix;
};
