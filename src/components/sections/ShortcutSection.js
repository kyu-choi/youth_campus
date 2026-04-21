(function () {
  window.App = window.App || {};
  const e = React.createElement;

  function ShortcutSection(config) {
    const content = e(
      "div",
      { className: "button-grid" },
      ...config.buttons.map(function (button, index) {
        return window.App.OpenButton({ button: button, index: index });
      })
    );

    return window.App.renderSection({
      title: window.App.text.buttonPanel.title,
      content: content,
      hint: window.App.text.buttonPanel.hint
    });
  }

  window.App.ShortcutSection = ShortcutSection;
})();
