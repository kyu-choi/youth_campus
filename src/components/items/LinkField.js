(function () {
  window.App = window.App || {};
  const e = React.createElement;

  function LinkField(config) {
    const fieldId = `link${config.index + 1}`;
    const button = config.button;

    return e(
      "div",
      { className: "field", key: `field-${config.index}` },
      e(
        "label",
        { htmlFor: fieldId },
        `${button.name || `웹 주소 ${config.index + 1}`} URL`
      ),
      e("input", {
        id: fieldId,
        type: "url",
        value: button.url,
        readOnly: true
      })
    );
  }

  window.App.LinkField = LinkField;
})();
