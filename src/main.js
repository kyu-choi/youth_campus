(function () {
  const container = document.getElementById("root");

  if (!container) {
    return;
  }

  const root = ReactDOM.createRoot(container);
  root.render(React.createElement(window.App.App));
})();
