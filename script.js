// 이 객체 안의 주소와 버튼 이름만 바꾸면 페이지 내용이 바로 반영됩니다.
const campusProfile = {
  instagramLabel: "@c.c.univ",
  instagramUrl: "https://www.instagram.com/c.c.univ/",
  links: [
    {
      label: "청춘캠퍼스 신청하기",
      url: "https://docs.google.com/forms/d/107QxDUbSF1JMzKZgYLr2YJnse6bZh3GGAx90Gt911JQ/edit",
    },
    {
      label: "프로그램 참여하기",
      url: "https://docs.google.com/forms/d/107QxDUbSF1JMzKZgYLr2YJnse6bZh3GGAx90Gt911JQ/edit",
    },
    {
      label: "신청서 바로가기",
      url: "https://docs.google.com/forms/d/107QxDUbSF1JMzKZgYLr2YJnse6bZh3GGAx90Gt911JQ/edit",
    },
    {
      label: "캠퍼스 폼 열기",
      url: "https://docs.google.com/forms/d/107QxDUbSF1JMzKZgYLr2YJnse6bZh3GGAx90Gt911JQ/edit",
    },
  ],
};

const instagramLink = document.getElementById("instagram-link");
const linkList = document.getElementById("link-list");

instagramLink.textContent = campusProfile.instagramLabel;
instagramLink.href = campusProfile.instagramUrl;

campusProfile.links.forEach(({ label, url }) => {
  const anchor = document.createElement("a");
  const labelText = document.createElement("strong");
  const icon = document.createElement("span");

  anchor.className = "link-button";
  anchor.href = url;
  anchor.target = "_blank";
  anchor.rel = "noreferrer";

  labelText.textContent = label;
  icon.textContent = "↗";
  icon.setAttribute("aria-hidden", "true");

  anchor.append(labelText, icon);
  linkList.appendChild(anchor);
});
