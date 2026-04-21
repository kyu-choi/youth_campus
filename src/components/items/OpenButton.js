(function () {
  window.App = window.App || {};
  const e = React.createElement;

  function OpenButton(config) {
    const button = config.button;
    const hasValidLink = window.App.isValidHttpUrl(button.url);
    const textChildren = [
      e("strong", { key: "name" }, button.name || `버튼 ${config.index + 1}`)
    ];

    if (button.description) {
      textChildren.push(
        e(
          "span",
          { key: "description", className: "link-button-description" },
          button.description
        )
      );
    }

    const contentChildren = [];

    if (button.imageSrc) {
      contentChildren.push(
        e("img", {
          key: "image",
          className: "link-button-image",
          src: button.imageSrc,
          alt: button.imageAlt || button.name
        })
      );
    }

    contentChildren.push(
      e("div", { key: "content", className: "link-button-content" }, ...textChildren)
    );

    return e(
      "button",
      {
        key: `button-${config.index}`,
        className: "link-button",
        id: `open${config.index + 1}`,
        type: "button",
        disabled: !hasValidLink,
        onClick: function () {
          if (hasValidLink) {
            window.App.openLink(button.url);
          }
        }
      },
      ...contentChildren
    );
  }

  window.App.OpenButton = OpenButton;
})();
