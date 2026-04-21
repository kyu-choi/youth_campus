(function () {
  window.App = window.App || {};
  const e = React.createElement;

  function LinkListSection(config) {
    const content = e(
      "div",
      { className: "form-list" },
      ...config.buttons.map(function (button, index) {
        return window.App.LinkField({ button: button, index: index });
      })
    );

    return window.App.renderSection({
      title: window.App.text.linkPanel.title,
      content: content,
      hint: window.App.text.linkPanel.hint
    });
  }

  window.App.LinkListSection = LinkListSection;
})();
