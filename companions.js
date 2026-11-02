const logger = {
  warn: (tag, msg) => console.warn(`[${tag}]`, msg),
  success: (tag, msg) => console.log(`%c[${tag}] ${msg}`, "color: #00ff88; font-weight: bold;"),
  error: (tag, msg) => console.error(`[${tag}]`, msg)
};

// Web Audio API Procedural Synthesizer for 8-bit Character SFX
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audioCtx = new AC();
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function playCharSfx(type) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === "mario") {
      osc.type = "square";
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(620, now + 0.18);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    } else if (type === "sans") {
      osc.type = "square";
      osc.frequency.setValueAtTime(85, now);
      osc.frequency.setValueAtTime(95, now + 0.05);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    } else if (type === "megaman") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.15);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    } else if (type === "sonic") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(950, now + 0.22);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    } else if (type === "shovel") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.setValueAtTime(780, now + 0.04);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  } catch {
    // Ignore audio restrictions
  }
}

function initCompanions() {
  const partyEl = document.getElementById("companion-party");
  if (!partyEl) {
    logger.warn("Companions", "#companion-party belum siap, mencoba lagi sebentar lagi...");
    setTimeout(initCompanions, 60);
    return;
  }

  // 5 Characters Configuration with distinct speeds & behaviors
  const charConfigs = [
    {
      id: "companion-mario",
      key: "mario",
      name: "MARIO",
      walkSpeed: 1.35,
      dir: 1,
      initOffsetPercent: 0.04,
      stepInterval: 7,
      quotes: ["WAHOO!", "LET'S-A GO!", "MAMMA MIA!", "SUPER!", "YAHOO!", "1-UP!"],
      popup: "🪙 +100",
      sfxType: "mario"
    },
    {
      id: "companion-sans",
      key: "sans",
      name: "SANS",
      walkSpeed: 0.95, // Sans strolls leisurely
      dir: 1,
      initOffsetPercent: 0.26,
      stepInterval: 9,
      quotes: ["heya.", "bad time?", "get dunked on.", "heh.", "wanna hotdog?", "greetings."],
      popup: "🦴 +100",
      sfxType: "sans"
    },
    {
      id: "companion-megaman",
      key: "megaman",
      name: "MEGA MAN",
      walkSpeed: 1.45,
      dir: 1,
      initOffsetPercent: 0.48,
      stepInterval: 7,
      quotes: ["READY!", "MEGA BUSTER!", "CHARGE SHOT!", "VICTORY!", "FULL POWER!"],
      popup: "⚡ +100",
      sfxType: "megaman"
    },
    {
      id: "companion-sonic",
      key: "sonic",
      name: "SONIC",
      walkSpeed: 2.35, // Sonic dashes rapidly across the screen!
      dir: 1,
      initOffsetPercent: 0.70,
      stepInterval: 4,
      quotes: ["GOTTA GO FAST!", "TOO SLOW!", "SONIC'S THE NAME!", "YEAH!", "SPIN DASH!"],
      popup: "💍 +100",
      sfxType: "sonic"
    },
    {
      id: "companion-shovel",
      key: "shovel",
      name: "SHOVEL KNIGHT",
      walkSpeed: 1.25,
      dir: -1,
      initOffsetPercent: 0.88,
      stepInterval: 7,
      quotes: ["FOR SHOVELRY!", "STRIKE THE EARTH!", "JUSTICE!", "DIG IN!", "STEEL THYSELF!"],
      popup: "💎 +100",
      sfxType: "shovel"
    }
  ];

  function getScreenBounds() {
    const minX = 12;
    const maxX = Math.max(120, window.innerWidth - 68);
    return { minX, maxX };
  }

  // Inisialisasi masing-masing karakter companion
  const companions = charConfigs.map((cfg) => {
    const el = document.getElementById(cfg.id);
    if (!el) return null;

    const useTag = el.querySelector(".char-use");
    const speechEl = el.querySelector(".mario-speech");
    const coinPopupEl = el.querySelector(".mario-coin-popup");
    const popupTextEl = el.querySelector(".popup-coin");

    const bounds = getScreenBounds();
    const span = Math.max(80, bounds.maxX - bounds.minX);
    let posX = bounds.minX + span * cfg.initOffsetPercent;
    let dir = cfg.dir;
    let pauseTimer = 0;
    let state = "walk"; // 'walk', 'fall', 'squash', 'jump', 'landing'
    let walkFrame = 1;
    let frameTick = Math.floor(Math.random() * 12);
    let isDragging = false;
    let dragStartX = 0;
    let dragStartLeft = 0;
    let jumpTimeout = null;

    function updateSprite() {
      if (!useTag) return;
      let pose = "walk-1";
      if (state === "walk" || state === "landing") {
        pose = "walk-" + walkFrame;
      } else if (state === "fall") {
        pose = "fall";
      } else if (state === "squash") {
        pose = "squash";
      } else if (state === "jump") {
        pose = "jump";
      }
      useTag.setAttribute("href", "#" + cfg.key + "-" + pose);
    }

    function triggerJump() {
      if (state === "jump" || isDragging) return;
      state = "jump";
      el.dataset.state = "jump";
      updateSprite();
      playCharSfx(cfg.sfxType);

      // Speech bubble
      if (speechEl) {
        const q = cfg.quotes;
        speechEl.textContent = q[Math.floor(Math.random() * q.length)];
        speechEl.classList.add("show");
        setTimeout(() => speechEl.classList.remove("show"), 1200);
      }

      // Popup coin / item
      if (coinPopupEl && popupTextEl) {
        popupTextEl.textContent = cfg.popup;
        coinPopupEl.classList.remove("pop");
        void coinPopupEl.offsetWidth; // force reflow
        coinPopupEl.classList.add("pop");
      }

      clearTimeout(jumpTimeout);
      jumpTimeout = setTimeout(() => {
        if (!isDragging) {
          state = "walk";
          el.dataset.state = "walk";
          el.dataset.frame = String(walkFrame);
          updateSprite();
        }
      }, 580);
    }

    // Drag-and-drop mechanics
    function onDragStart(clientX) {
      isDragging = true;
      dragStartX = clientX;
      dragStartLeft = posX;
      el.classList.add("dragging");
      el.style.zIndex = "10000";
    }

    function onDragMove(clientX) {
      if (!isDragging) return;
      const diff = clientX - dragStartX;
      const b = getScreenBounds();
      posX = Math.max(b.minX, Math.min(b.maxX, dragStartLeft + diff));
      el.style.left = posX + "px";
    }

    function onDragEnd() {
      if (!isDragging) return;
      isDragging = false;
      el.classList.remove("dragging");
      el.style.zIndex = "";
      state = "landing";
      el.dataset.state = "landing";
      updateSprite();
      setTimeout(() => {
        state = "walk";
        el.dataset.state = "walk";
        el.dataset.frame = String(walkFrame);
        updateSprite();
      }, 180);
    }

    el.addEventListener("click", () => {
      triggerJump();
    });

    el.addEventListener("mousedown", (e) => {
      onDragStart(e.clientX);
      const onMouseMove = (ev) => onDragMove(ev.clientX);
      const onMouseUp = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        onDragEnd();
      };
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    });

    el.addEventListener("touchstart", (e) => {
      if (e.touches.length > 0) onDragStart(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener("touchmove", (e) => {
      if (isDragging && e.touches.length > 0) onDragMove(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener("touchend", () => {
      if (isDragging) onDragEnd();
    });

    // Initial position & visual setup
    el.style.left = posX + "px";
    el.dataset.dir = dir === 1 ? "right" : "left";
    updateSprite();

    return {
      cfg,
      el,
      triggerJump,
      getState: () => state,
      setState: (s) => {
        state = s;
        el.dataset.state = s;
        updateSprite();
      },
      isDragging: () => isDragging,
      updateStep: (b) => {
        if (state !== "walk" || isDragging) return;

        if (pauseTimer > 0) {
          pauseTimer--;
        } else {
          posX += dir * cfg.walkSpeed;

          // Turnaround di tepi layar
          if (posX >= b.maxX) {
            posX = b.maxX;
            dir = -1;
            pauseTimer = 18 + Math.floor(Math.random() * 20);
          } else if (posX <= b.minX) {
            posX = b.minX;
            dir = 1;
            pauseTimer = 18 + Math.floor(Math.random() * 20);
          }

          frameTick++;
          if (frameTick % cfg.stepInterval === 0) {
            walkFrame = (walkFrame % 3) + 1;
            el.dataset.frame = String(walkFrame);
            updateSprite();
          }
        }

        el.dataset.dir = dir === 1 ? "right" : "left";
        el.style.left = posX + "px";
      },
      restoreWalk: () => {
        if (state !== "jump" && !isDragging) {
          state = "landing";
          el.dataset.state = "landing";
          updateSprite();
          setTimeout(() => {
            if (state !== "jump" && !isDragging) {
              state = "walk";
              el.dataset.state = "walk";
              el.dataset.frame = String(walkFrame);
              updateSprite();
            }
          }, 180);
        }
      }
    };
  }).filter(Boolean);

  // 60FPS animation loop running all 5 characters simultaneously
  function loop() {
    const bounds = getScreenBounds();
    companions.forEach((c) => c.updateStep(bounds));
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // Global Scroll Reactions: ALL 5 characters dive / squash together!
  let lastScrollY = window.scrollY || window.pageYOffset;
  let scrollEndTimeout = null;

  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY || window.pageYOffset;
    const delta = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;

    if (Math.abs(delta) < 1) return;

    if (delta > 0) {
      // SCROLL DOWN: Terjun! (All 5 dive down with wind lines)
      companions.forEach((c) => {
        if (c.getState() !== "jump" && !c.isDragging()) {
          c.setState("fall");
        }
      });
    } else {
      // SCROLL UP: Tekanan! (All 5 squash flat under pressure)
      companions.forEach((c) => {
        if (c.getState() !== "jump" && !c.isDragging()) {
          c.setState("squash");
        }
      });
    }

    clearTimeout(scrollEndTimeout);
    scrollEndTimeout = setTimeout(() => {
      companions.forEach((c) => c.restoreWalk());
    }, 120);
  }, { passive: true });

  // Keyboard interactions: 1-5 jump individually, J or Space to jump all
  window.addEventListener("keydown", (e) => {
    if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
    if (e.key === "j" || e.key === "J") {
      companions.forEach((c, idx) => {
        setTimeout(() => c.triggerJump(), idx * 70);
      });
    } else if (e.key >= "1" && e.key <= "5") {
      const idx = parseInt(e.key, 10) - 1;
      if (companions[idx]) companions[idx].triggerJump();
    }
  });

  logger.success("Companions", `${companions.length} karakter roaming berhasil diinisialisasi.`);
}

// Auto-initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCompanions);
} else {
  initCompanions();
}
