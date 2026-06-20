import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll the main window to the top
    window.scrollTo(0, 0);

    // Reset scroll position for any div containers with overflow scroll/auto
    const scrollContainers = document.querySelectorAll(".overflow-y-auto, .overflow-y-scroll");
    scrollContainers.forEach((container) => {
      container.scrollTop = 0;
    });
  }, [pathname]);

  return null;
}
