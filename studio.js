// studio.js - Secret Console-Triggered Visual Homepage Canvas ("Canva Mode")
// Activate via browser console: type studio() or studio.on()

(function() {
  let isStudioActive = false;
  let activeElement = null;
  const STORAGE_KEY = "algo_studio_saved_home";

  // Check and restore persisted design on initial boot
  function restoreSavedHome() {
    const savedHtml = localStorage.getItem(STORAGE_KEY);
    if (!savedHtml) return;
    const homeContent = document.querySelector("#homeView .home-content");
    if (homeContent) {
      homeContent.innerHTML = savedHtml;
    }
  }

  // Create the floating Studio Dock
  function ensureStudioDock() {
    let dock = document.getElementById("studioDock");
    if (dock) return dock;

    dock = document.createElement("div");
    dock.id = "studioDock";
    dock.className = "studio-dock";
    dock.innerHTML = `
      <div class="studio-dock-inner">
        <div class="studio-pill">
          <span class="studio-dot"></span>
          <span>Studio Mode (Dev Only)</span>
        </div>
        <div class="studio-dock-actions">
          <button id="studioAddTextBtn" class="studio-btn" title="Add new editable text card">
            <span>+ Text Card</span>
          </button>
          <button id="studioAddImageBtn" class="studio-btn" title="Upload or insert image box">
            <span>+ Image Box</span>
          </button>
          <input type="file" id="studioFileInput" accept="image/*" style="display:none;">
          <button id="studioSaveLocalBtn" class="studio-btn studio-btn-save" title="Save changes to your browser's localStorage">
            <span>💾 Save</span>
          </button>
          <button id="studioExportBtn" class="studio-btn studio-btn-primary" title="Export and copy clean HTML to clipboard">
            <span>📋 Copy Clean HTML</span>
          </button>
          <button id="studioExitBtn" class="studio-btn studio-btn-danger" title="Exit Studio Mode">
            <span>✕ Exit</span>
          </button>
        </div>
      </div>
      <div id="studioToast" class="studio-toast" style="display:none;"></div>
    `;

    document.body.appendChild(dock);

    // Event listeners on dock buttons
    document.getElementById("studioExitBtn").addEventListener("click", () => studio.off());
    document.getElementById("studioExportBtn").addEventListener("click", () => studio.export());
    document.getElementById("studioSaveLocalBtn").addEventListener("click", () => {
      saveToStorage();
      showToast("✓ Saved layout to localStorage!");
    });

    document.getElementById("studioAddTextBtn").addEventListener("click", () => {
      insertNewTextCard();
    });

    const fileInput = document.getElementById("studioFileInput");
    document.getElementById("studioAddImageBtn").addEventListener("click", () => {
      fileInput.click();
    });

    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        insertImageElement(ev.target.result);
      };
      reader.readAsDataURL(file);
      fileInput.value = "";
    });

    return dock;
  }

  function showToast(msg) {
    const toast = document.getElementById("studioToast");
    if (!toast) return;
    toast.textContent = msg;
    toast.style.display = "block";
    setTimeout(() => {
      toast.style.display = "none";
    }, 2800);
  }

  // Insert a new editable text card
  function insertNewTextCard() {
    const homeContent = document.querySelector("#homeView .home-content");
    if (!homeContent) return;

    const card = document.createElement("section");
    card.className = "workbench-note studio-block";
    card.setAttribute("draggable", "true");
    card.innerHTML = `
      <div class="note-kicker-row">
        <span class="kicker-pill" contenteditable="true">CUSTOM NOTE</span>
        <span class="kicker-sub" contenteditable="true">DRAG OR EDIT ME</span>
        <button class="studio-remove-block-btn" title="Delete block">×</button>
      </div>
      <h2 class="workbench-lead" contenteditable="true">Click here to write your custom heading</h2>
      <p class="workbench-paragraph" contenteditable="true">Click here to write notes, explanations, or interview tips. You can drag this card up or down to reorder it anytime!</p>
    `;

    attachCardHandlers(card);
    homeContent.insertBefore(card, homeContent.querySelector(".problem-ledger") || homeContent.lastElementChild);
    showToast("Added new text card!");
  }

  // Insert an image element with resize handles
  function insertImageElement(srcUrl) {
    const homeContent = document.querySelector("#homeView .home-content");
    if (!homeContent) return;

    const wrap = document.createElement("div");
    wrap.className = "studio-img-wrap studio-block";
    wrap.setAttribute("draggable", "true");
    wrap.innerHTML = `
      <div class="studio-img-toolbar">
        <span class="studio-img-label">Image Asset</span>
        <button class="studio-remove-block-btn" title="Delete image">×</button>
      </div>
      <div class="studio-img-container" style="max-width: 650px; margin: 0 auto; position: relative;">
        <img src="${srcUrl}" class="studio-editable-img" style="width: 100%; border-radius: 8px; border: 1px solid var(--border-color); display: block;" alt="Uploaded Asset">
        <div class="studio-resize-handle" title="Drag to resize"></div>
      </div>
    `;

    attachCardHandlers(wrap);
    homeContent.insertBefore(wrap, homeContent.querySelector(".problem-ledger") || homeContent.lastElementChild);
    showToast("✓ Image added! Drag corner handle to resize.");
  }

  // Attach drag, delete, and resize handlers to a block
  function attachCardHandlers(el) {
    // Delete button handler
    const delBtn = el.querySelector(".studio-remove-block-btn");
    if (delBtn) {
      delBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        el.remove();
        showToast("Removed element");
      });
    }

    // Drag & Drop reordering
    el.setAttribute("draggable", "true");
    el.addEventListener("dragstart", (e) => {
      if (!isStudioActive) return;
      el.classList.add("studio-dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", "studio-drag");
    });

    el.addEventListener("dragend", () => {
      el.classList.remove("studio-dragging");
      document.querySelectorAll(".studio-drag-over").forEach(n => n.classList.remove("studio-drag-over"));
    });

    el.addEventListener("dragover", (e) => {
      if (!isStudioActive) return;
      e.preventDefault();
      el.classList.add("studio-drag-over");
    });

    el.addEventListener("dragleave", () => {
      el.classList.remove("studio-drag-over");
    });

    el.addEventListener("drop", (e) => {
      if (!isStudioActive) return;
      e.preventDefault();
      el.classList.remove("studio-drag-over");
      const dragging = document.querySelector(".studio-dragging");
      if (dragging && dragging !== el) {
        const homeContent = document.querySelector("#homeView .home-content");
        const rect = el.getBoundingClientRect();
        const next = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
        homeContent.insertBefore(dragging, next ? el.nextSibling : el);
        showToast("✓ Reordered block");
      }
    });

    // Resize handle for images
    const handle = el.querySelector(".studio-resize-handle");
    const container = el.querySelector(".studio-img-container");
    if (handle && container) {
      let startX, startWidth;
      function onMouseMove(e) {
        const newWidth = Math.max(200, Math.min(860, startWidth + (e.clientX - startX)));
        container.style.maxWidth = `${newWidth}px`;
      }
      function onMouseUp() {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      }
      handle.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        startX = e.clientX;
        startWidth = container.offsetWidth;
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
      });
    }
  }

  // Handle Clipboard Paste (`Ctrl + V`)
  function setupClipboardPaste() {
    window.addEventListener("paste", (e) => {
      if (!isStudioActive) return;

      const items = (e.clipboardData || e.originalEvent.clipboardData).items;
      for (let item of items) {
        if (item.kind === "file" && item.type.startsWith("image/")) {
          e.preventDefault();
          const blob = item.getAsFile();
          const reader = new FileReader();
          reader.onload = (ev) => {
            insertImageElement(ev.target.result);
          };
          reader.readAsDataURL(blob);
          return;
        }
      }
    });

    // Handle Drag and Drop of Image Files from Desktop
    const homeView = document.getElementById("homeView");
    if (homeView) {
      homeView.addEventListener("dragover", (e) => {
        if (!isStudioActive) return;
        e.preventDefault();
      });

      homeView.addEventListener("drop", (e) => {
        if (!isStudioActive) return;
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          const file = e.dataTransfer.files[0];
          if (file.type.startsWith("image/")) {
            e.preventDefault();
            const reader = new FileReader();
            reader.onload = (ev) => {
              insertImageElement(ev.target.result);
            };
            reader.readAsDataURL(file);
          }
        }
      });
    }
  }

  // Enable contenteditable on text elements
  function enableTextEditing(enable) {
    const homeContent = document.querySelector("#homeView .home-content");
    if (!homeContent) return;

    const targets = homeContent.querySelectorAll(
      ".workbench-lead, .workbench-paragraph, .kicker-pill, .kicker-sub, .meta-value, .meta-label, .ledger-heading, .ledger-tag, .home-footer p"
    );

    targets.forEach(el => {
      if (enable) {
        el.setAttribute("contenteditable", "true");
        el.setAttribute("spellcheck", "false");
      } else {
        el.removeAttribute("contenteditable");
        el.removeAttribute("spellcheck");
      }
    });

    // Setup draggable cards
    const blocks = homeContent.querySelectorAll(".workbench-note, .studio-img-wrap, .home-meta-bar, .problem-ledger");
    blocks.forEach(b => {
      if (enable) {
        b.classList.add("studio-block");
        attachCardHandlers(b);
        // Add delete button if not exists
        if (!b.querySelector(".studio-remove-block-btn") && b.classList.contains("studio-img-wrap")) {
          const d = document.createElement("button");
          d.className = "studio-remove-block-btn";
          d.textContent = "×";
          d.title = "Delete element";
          d.addEventListener("click", () => b.remove());
          b.appendChild(d);
        }
      } else {
        b.classList.remove("studio-block", "studio-dragging", "studio-drag-over");
        b.removeAttribute("draggable");
      }
    });
  }

  // Clean serialization for export
  function getCleanHtml() {
    const homeContent = document.querySelector("#homeView .home-content");
    if (!homeContent) return "";

    const clone = homeContent.cloneNode(true);

    // Strip editor-only attributes and elements
    clone.querySelectorAll("[contenteditable]").forEach(el => {
      el.removeAttribute("contenteditable");
      el.removeAttribute("spellcheck");
    });
    clone.querySelectorAll("[draggable]").forEach(el => el.removeAttribute("draggable"));
    clone.querySelectorAll(".studio-remove-block-btn, .studio-resize-handle, .studio-img-toolbar").forEach(el => el.remove());
    clone.querySelectorAll(".studio-block, .studio-dragging, .studio-drag-over").forEach(el => {
      el.classList.remove("studio-block", "studio-dragging", "studio-drag-over");
    });

    return clone.innerHTML.trim();
  }

  function saveToStorage() {
    const clean = getCleanHtml();
    if (clean) {
      localStorage.setItem(STORAGE_KEY, clean);
    }
  }

  // The Public Studio API
  window.studio = function() {
    if (isStudioActive) {
      studio.off();
    } else {
      studio.on();
    }
  };

  studio.on = function() {
    isStudioActive = true;
    document.body.classList.add("studio-active");
    const dock = ensureStudioDock();
    dock.style.display = "block";
    enableTextEditing(true);

    // Switch view to home so user is on homepage
    if (typeof window.switchView === "function") {
      window.switchView("home");
    } else {
      const homeBtn = document.getElementById("navViewHomeBtn");
      if (homeBtn) homeBtn.click();
    }

    console.log(
      "%c✨ STUDIO MODE ACTIVATED ✨%c\n• Click any text to edit directly.\n• Hit Ctrl+V to paste screenshots / images.\n• Drag blocks to reorder.\n• Click 'Copy Clean HTML' when finished.",
      "color: #3fb950; font-weight: bold; font-size: 14px;",
      "color: #8b949e; font-size: 12px;"
    );
    showToast("✨ Studio Mode Active — Click text to edit, Ctrl+V to paste images!");
  };

  studio.off = function() {
    isStudioActive = false;
    document.body.classList.remove("studio-active");
    const dock = document.getElementById("studioDock");
    if (dock) dock.style.display = "none";
    enableTextEditing(false);
    saveToStorage();
    console.log("%cStudio Mode deactivated. Changes saved locally.", "color: #58a6ff;");
  };

  studio.export = function() {
    const cleanHtml = getCleanHtml();
    saveToStorage();

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(cleanHtml).then(() => {
        showToast("✓ Clean HTML copied to clipboard!");
      }).catch(() => {
        showToast("✓ Export ready! (Check browser console for HTML)");
      });
    }

    console.log(
      "%c📋 CLEAN EXPORTED HOMEPAGE HTML:%c\n" + cleanHtml,
      "color: #e3b341; font-weight: bold; font-size: 13px;",
      "color: #f0f6fc; font-family: monospace;"
    );

    return cleanHtml;
  };

  studio.reset = function() {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  };

  // On DOM ready, restore saved edits & set up listeners
  document.addEventListener("DOMContentLoaded", () => {
    restoreSavedHome();
    setupClipboardPaste();
    console.log(
      "%c💡 Hint: Type %cstudio()%c in this console anytime to edit the homepage visually!",
      "color: #8b949e;",
      "color: #58a6ff; font-weight: bold;",
      "color: #8b949e;"
    );
  });
})();
