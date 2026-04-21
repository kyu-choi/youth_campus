(function () {
  window.App = window.App || {};

  const routes = {
    home: {
      id: "home",
      path: "./index.html",
      label: "메인",
      title: "청춘캠퍼스",
      topNav: true
    },
    rotation: {
      id: "rotation",
      path: "./rotation.html",
      label: "로테이션 소개팅",
      title: "로테이션 소개팅",
      topNav: true
    },
    rotationApply: {
      id: "rotationApply",
      path: "./rotation-apply.html",
      label: "로테이션 신청",
      title: "로테이션 소개팅 신청",
      topNav: false
    },
    match: {
      id: "match",
      path: "./match.html",
      label: "1대1 소개팅",
      title: "1대1 소개팅",
      topNav: true
    },
    matchApply: {
      id: "matchApply",
      path: "./match-apply.html",
      label: "1대1 신청",
      title: "1대1 소개팅 신청",
      topNav: false
    },
    reviews: {
      id: "reviews",
      path: "./reviews.html",
      label: "후기",
      title: "후기",
      topNav: true
    },
    guide: {
      id: "guide",
      path: "./guide.html",
      label: "이용 안내",
      title: "이용 안내",
      topNav: true
    },
    admin: {
      id: "admin",
      path: "./admin.html",
      label: "관리자",
      title: "관리자 페이지",
      topNav: false
    }
  };

  function registerPage(id, component) {
    if (!routes[id]) {
      return;
    }

    routes[id].component = component;
  }

  function getRoute(id) {
    return routes[id] || routes.home;
  }

  function getNavigationItems(currentPageId) {
    const items = Object.keys(routes)
      .map(function (key) {
        return routes[key];
      })
      .filter(function (route) {
        return route.topNav;
      });

    if (currentPageId === "admin") {
      items.push(routes.admin);
    }

    return items;
  }

  window.App.routes = routes;
  window.App.registerPage = registerPage;
  window.App.getRoute = getRoute;
  window.App.getNavigationItems = getNavigationItems;
})();
