(function () {
  window.App = window.App || {};
  const e = React.createElement;

  function renderSection(config) {
    const classes = ["section-card"];

    if (config.className) {
      classes.push(config.className);
    }

    const children = [];

    if (config.eyebrow) {
      children.push(
        e("p", { key: "eyebrow", className: "section-eyebrow" }, config.eyebrow)
      );
    }

    if (config.title) {
      children.push(e("h2", { key: "title", className: "section-title" }, config.title));
    }

    if (config.description) {
      children.push(
        e("p", { key: "description", className: "section-description" }, config.description)
      );
    }

    if (config.content) {
      children.push(e("div", { key: "content" }, config.content));
    }

    return e("section", { className: classes.join(" ") }, ...children);
  }

  function renderPill(label, tone) {
    return e(
      "span",
      {
        className: "pill",
        "data-tone": tone || "default"
      },
      label
    );
  }

  function renderEmptyState(message) {
    return e("div", { className: "empty-state" }, message);
  }

  function renderKeyValueRows(rows) {
    return e(
      "dl",
      { className: "key-value-list" },
      ...rows.map(function (row) {
        return e(
          "div",
          { key: row.label, className: "key-value-row" },
          e("dt", null, row.label),
          e("dd", null, row.value || "-")
        );
      })
    );
  }

  window.App.renderSection = renderSection;
  window.App.renderPill = renderPill;
  window.App.renderEmptyState = renderEmptyState;
  window.App.renderKeyValueRows = renderKeyValueRows;
})();
