// FIXME: 잘안됨..
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

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (!visible[0]) return;

        const id = visible[0].target.id;

        navLinks.forEach((link) => {
          const isActive = link.getAttribute("href") === `#${id}`;
          if (isActive) console.log("🚀 ~ ScrollSpyClient ~ isActive:", id);
          // border-b-2 border-black
          link.style.fontWeight = isActive ? "bold" : "normal";
          link.style.borderBottom = isActive ? "solid 2px" : "none";
          link.setAttribute("aria-current", isActive ? "true" : "false");
        });
      },
      {
        rootMargin: "0px 0px 0px 0px", // sticky 헤더 고려
        threshold: 0.1,
      },
    );

    // biome-ignore lint/suspicious/useIterableCallbackReturn: <explanation>
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return null;
}
