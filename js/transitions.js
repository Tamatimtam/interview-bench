// js/transitions.js - GSAP Animation & Screen Momentum Choreography
import { prefersReducedMotion } from "./utils.js";

export function initTransitions({ homeView, workspaceView, navViewHomeBtn, navViewWorkspaceBtn, editor }) {
  let currentActiveView = "home";

  function switchView(viewName) {
    if (currentActiveView === viewName) return;
    currentActiveView = viewName;

    const reducedMotion = prefersReducedMotion();

    if (viewName === "workspace") {
      if (navViewHomeBtn) navViewHomeBtn.classList.remove("active");
      if (navViewWorkspaceBtn) navViewWorkspaceBtn.classList.add("active");

      if (window.gsap && !reducedMotion) {
        const homeIntro = homeView ? homeView.querySelector(".home-intro-card") : null;
        const problemLedger = homeView ? homeView.querySelector(".problem-ledger") : null;

        const tl = gsap.timeline({
          onComplete: () => {
            if (homeView) homeView.style.display = "none";
            if (workspaceView) {
              workspaceView.style.display = "flex";
              workspaceView.style.opacity = 0;
            }

            if (editor) editor.refresh();

            const leftPane = workspaceView.querySelector(".left-pane");
            const rightPane = workspaceView.querySelector(".right-pane");

            gsap.fromTo(workspaceView, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out" });
            gsap.fromTo(
              [leftPane, rightPane],
              { opacity: 0, y: 22, scale: 0.992 },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.55,
                stagger: 0.12,
                ease: "expo.out",
                clearProps: "transform,opacity"
              }
            );
          }
        });

        tl.to([homeIntro, problemLedger], {
          opacity: 0,
          y: -16,
          scale: 0.995,
          duration: 0.28,
          stagger: 0.05,
          ease: "power3.inOut"
        });
      } else {
        if (homeView) homeView.style.display = "none";
        if (workspaceView) workspaceView.style.display = "flex";
        if (editor) editor.refresh();
      }
    } else {
      if (navViewHomeBtn) navViewHomeBtn.classList.add("active");
      if (navViewWorkspaceBtn) navViewWorkspaceBtn.classList.remove("active");

      if (window.gsap && !reducedMotion) {
        const leftPane = workspaceView.querySelector(".left-pane");
        const rightPane = workspaceView.querySelector(".right-pane");

        const tl = gsap.timeline({
          onComplete: () => {
            if (workspaceView) workspaceView.style.display = "none";
            if (homeView) {
              homeView.style.display = "block";
              homeView.style.opacity = 0;
            }

            const homeIntro = homeView.querySelector(".home-intro-card");
            const problemLedger = homeView.querySelector(".problem-ledger");

            gsap.fromTo(homeView, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out" });
            gsap.fromTo(
              [homeIntro, problemLedger],
              { opacity: 0, y: 24, scale: 0.99 },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.6,
                stagger: 0.14,
                ease: "expo.out",
                clearProps: "transform,opacity"
              }
            );
          }
        });

        tl.to([rightPane, leftPane], {
          opacity: 0,
          y: 16,
          scale: 0.995,
          duration: 0.26,
          stagger: 0.05,
          ease: "power3.inOut"
        });
      } else {
        if (homeView) homeView.style.display = "block";
        if (workspaceView) workspaceView.style.display = "none";
      }
    }
  }

  return {
    switchView,
    getCurrentView: () => currentActiveView
  };
}

export function animateProblemLoad(paneContent, updateFn) {
  const reducedMotion = prefersReducedMotion();
  if (window.gsap && !reducedMotion && paneContent && paneContent.offsetParent !== null) {
    gsap.to(paneContent, {
      opacity: 0,
      y: -10,
      scale: 0.995,
      duration: 0.18,
      ease: "power2.in",
      onComplete: () => {
        updateFn();
        gsap.fromTo(
          paneContent,
          { opacity: 0, y: 14, scale: 0.99 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.45,
            ease: "expo.out",
            clearProps: "transform,opacity"
          }
        );
      }
    });
  } else {
    updateFn();
  }
}

export function animateTabSwitch(activeViews, targetView) {
  const reducedMotion = prefersReducedMotion();
  if (window.gsap && !reducedMotion) {
    activeViews.forEach(v => {
      if (v.classList.contains("active") && v !== targetView) {
        gsap.to(v, {
          opacity: 0,
          y: -6,
          duration: 0.14,
          ease: "power2.in",
          onComplete: () => {
            v.classList.remove("active");
            targetView.classList.add("active");
            gsap.fromTo(
              targetView,
              { opacity: 0, y: 10, scale: 0.997 },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.38,
                ease: "expo.out",
                clearProps: "transform,opacity"
              }
            );
          }
        });
      }
    });
  } else {
    activeViews.forEach(v => v.classList.remove("active"));
    targetView.classList.add("active");
  }
}
