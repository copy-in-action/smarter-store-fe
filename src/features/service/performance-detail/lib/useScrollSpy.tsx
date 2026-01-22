"use client";

import { useEffect } from "react";

export function ScrollSpyClient() {
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>(
      "#performance-detail .performance-section",
    );

    const navLinks = document.querySelectorAll<HTMLAnchorElement>(
      "#performance-detail-hashtags a",
    );

    /**
     * 스크롤 위치에 따라 활성 섹션을 업데이트
     */
    const updateActiveSection = () => {
      const scrollPos = window.scrollY + 150; // 헤더 높이 오프셋
      let activeSection: HTMLElement | null = null;

      // 현재 스크롤 위치에서 가장 가까운 섹션 찾기
      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;

        if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
          activeSection = section;
        }
        // 섹션사이 여백부분 고려
        /*  if (!activeSection && scrollPos < sectionTop) {
          activeSection = sections[index];
        } */
      });
      if (!activeSection) return;

      // 네비게이션 링크 업데이트
      navLinks.forEach((link) => {
        const isActive =
          activeSection && link.getAttribute("href") === `#${activeSection.id}`;

        link.style.fontWeight = isActive ? "bold" : "normal";
        link.style.borderBottom = isActive ? "solid 2px" : "none";
        link.setAttribute("aria-current", isActive ? "true" : "false");
      });
    };

    // 스크롤 이벤트에 throttle 적용
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateActiveSection();
          ticking = false;
        });
        ticking = true;
      }
    };

    // 초기 실행 및 이벤트 리스너 등록
    updateActiveSection();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return null;
}
