(function () {
  window.App = window.App || {};
  const e = React.createElement;

  function AdminApplicationList(config) {
    if (!config.applications.length) {
      return window.App.renderEmptyState(config.emptyMessage || "조건에 맞는 신청자가 없습니다.");
    }

    return e(
      "div",
      { className: "admin-list" },
      ...config.applications.map(function (item) {
        const itemId = config.getId(item);
        const isSelected =
          config.selectedApplicationId === itemId
            ? "admin-list-item is-selected"
            : "admin-list-item";

        return e(
          "button",
          {
            key: itemId,
            type: "button",
            className: isSelected,
            onClick: function () {
              config.onSelect(itemId);
            }
          },
          e(
            "div",
            { className: "admin-list-row" },
            e("strong", null, config.getTitle(item)),
            window.App.renderPill(config.getStatusLabel(item), config.getStatusTone(item))
          ),
          e("p", { className: "admin-list-meta" }, config.getMeta(item)),
          e("p", { className: "admin-list-sub" }, config.getSub(item))
        );
      })
    );
  }

  window.App.AdminApplicationList = AdminApplicationList;
})();
