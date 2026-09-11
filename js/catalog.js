// js/catalog.js - Problem Catalog Drawer & Multi-Dimensional Filter Modal
import { escapeHtml, prefersReducedMotion } from "./utils.js";

export function initCatalog({
  modal,
  backdrop,
  openBtn,
  closeBtn,
  searchInput,
  clearSearchBtn,
  categoryChipsContainer,
  difficultyChipsContainer,
  cardListContainer,
  countText,
  headerBadge,
  onSelectProblem,
  getCurrentProblemId
}) {
  let activeCategory = "All";
  let activeDifficulty = "All";
  let searchQuery = "";

  function openModal() {
    const reducedMotion = prefersReducedMotion();
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    searchInput.focus();
    renderModalCardList();

    if (window.gsap && !reducedMotion) {
      const drawer = modal.querySelector(".modal-drawer");
      const cards = cardListContainer.querySelectorAll(".problem-card");

      gsap.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power2.out" });
      gsap.fromTo(drawer, { x: "-100%" }, { x: "0%", duration: 0.48, ease: "expo.out" });

      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, x: -20, scale: 0.98 },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.42,
            stagger: 0.05,
            delay: 0.12,
            ease: "expo.out",
            clearProps: "transform,opacity"
          }
        );
      }
    }
  }

  function closeModal() {
    const reducedMotion = prefersReducedMotion();
    const drawer = modal.querySelector(".modal-drawer");

    if (window.gsap && !reducedMotion && drawer && backdrop) {
      gsap.to(backdrop, { opacity: 0, duration: 0.26, ease: "power2.in" });
      gsap.to(drawer, {
        x: "-100%",
        duration: 0.32,
        ease: "power3.in",
        onComplete: () => {
          modal.classList.add("hidden");
          modal.setAttribute("aria-hidden", "true");
        }
      });
    } else {
      modal.classList.add("hidden");
      modal.setAttribute("aria-hidden", "true");
    }
  }

  // Setup category filter chips
  function setupFilterChips() {
    const categories = window.GET_CATEGORIES ? window.GET_CATEGORIES() : ["All"];
    categoryChipsContainer.innerHTML = "";
    categories.forEach(cat => {
      const chip = document.createElement("button");
      chip.className = `filter-chip ${cat === activeCategory ? "active" : ""}`;
      chip.textContent = cat;
      chip.addEventListener("click", () => {
        activeCategory = cat;
        setupFilterChips();
        renderModalCardList();
      });
      categoryChipsContainer.appendChild(chip);
    });

    const diffButtons = difficultyChipsContainer.querySelectorAll(".filter-chip");
    diffButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        diffButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeDifficulty = btn.dataset.diff;
        renderModalCardList();
      });
    });
  }

  // Filter & Render Modal Cards
  function renderModalCardList() {
    cardListContainer.innerHTML = "";
    const currentId = getCurrentProblemId ? getCurrentProblemId() : "";

    const filtered = (window.PROBLEMS || []).filter(prob => {
      if (activeCategory !== "All" && prob.category !== activeCategory) return false;
      if (activeDifficulty !== "All" && prob.difficulty !== activeDifficulty) return false;
      if (searchQuery) {
        const hay = `${prob.title} ${prob.tag} ${prob.summary} ${prob.category}`.toLowerCase();
        if (!hay.includes(searchQuery)) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      cardListContainer.innerHTML = `
        <div class="no-results">
          <p>No problems match your search or filter.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(prob => {
      const card = document.createElement("div");
      card.className = `problem-card ${prob.id === currentId ? "active-problem" : ""}`;

      card.innerHTML = `
        <div class="card-top">
          <div class="card-title">${escapeHtml(prob.title)}</div>
          <div class="card-badges">
            <span class="badge blue">${escapeHtml(prob.category || "Algorithm")}</span>
            <span class="badge ${prob.badgeColor || "green"}">${escapeHtml(prob.difficulty)}</span>
          </div>
        </div>
        <div class="card-summary">${escapeHtml(prob.summary)}</div>
        <div class="card-footer">
          <span>Tag: ${escapeHtml(prob.tag)}</span>
          <span>${prob.testCases ? prob.testCases.length : 0} Test Cases</span>
        </div>
      `;

      card.addEventListener("click", () => {
        if (onSelectProblem) onSelectProblem(prob.id);
        closeModal();
      });

      cardListContainer.appendChild(card);
    });

    if (countText) {
      countText.textContent = `${(window.PROBLEMS || []).length} problems available`;
    }
    if (headerBadge) {
      headerBadge.textContent = (window.PROBLEMS || []).length;
    }
  }

  // Event Listeners
  if (openBtn) openBtn.addEventListener("click", openModal);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (backdrop) backdrop.addEventListener("click", closeModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) {
      closeModal();
    }
  });

  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    clearSearchBtn.style.display = searchQuery ? "block" : "none";
    renderModalCardList();
  });

  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    searchQuery = "";
    clearSearchBtn.style.display = "none";
    searchInput.focus();
    renderModalCardList();
  });

  return {
    openModal,
    closeModal,
    setupFilterChips,
    renderModalCardList
  };
}
