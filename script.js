// Promotional bulletin board behavior: rotate spotlight, shuffle, search, pin/unpin.

const tips = [
  {
    title: "Show up like a pro",
    text: "Be early, be prepared, and act like you belong there (because you do). Momentum loves punctuality.",
    tag: "Mindset",
  },
  {
    title: "Use a 3-bullet brag sheet",
    text: "Before interviews or competitions, write 3 bullet points: a win, a skill, and a story. Instant confidence toolkit.",
    tag: "Career",
  },
  {
    title: "Ask for feedback the smart way",
    text: "Don’t ask “Was I good?” Ask “What’s one thing I should keep doing and one thing to improve?”",
    tag: "Growth",
  },
  {
    title: "Practice under “real” conditions",
    text: "Time yourself. Reduce hints. Rehearse with distractions. Comfort is nice, but competence is built in the wild.",
    tag: "Performance",
  },
  {
    title: "Turn nerves into a checklist",
    text: "If you’re anxious, your brain is saying “something matters.” Translate it into tasks: prepare, test, rehearse, pack.",
    tag: "Mindset",
  },
  {
    title: "Make your work easy to read",
    text: "Use clear headings, clean formatting, and short sentences. Clarity is a superpower in resumes and projects.",
    tag: "Communication",
  },
  {
    title: "Build a ‘two-minute network’ habit",
    text: "Once a day: thank someone, ask a question, or share a helpful link. Tiny outreach compounds fast.",
    tag: "Leadership",
  },
  {
    title: "Win the first 10%",
    text: "The start sets the tone. Outline first, gather materials first, warm up first. Your future self will high-five you.",
    tag: "Execution",
  },
  {
    title: "Protect your energy",
    text: "Sleep, hydration, and food aren’t optional. You’re not a robot. Even robots need charging.",
    tag: "Wellness",
  },
  {
    title: "Talk results, not chores",
    text: "Instead of “I helped,” say “I improved ___ by __% / saved __ minutes / reduced errors.”",
    tag: "Career",
  },
  {
    title: "Use the 1% rule",
    text: "Improve something tiny every day. Skills stack like LEGO bricks. Eventually you’ve built a castle.",
    tag: "Growth",
  },
  {
    title: "Lead with curiosity",
    text: "When stuck, ask: What do I know? What do I need? What’s the smallest next step? Curiosity beats panic.",
    tag: "Problem-solving",
  },
];

const els = {
  title: document.getElementById("title"),
  tipsGrid: document.getElementById("tipsGrid"),
  spotlightTitle: document.getElementById("spotlightTitle"),
  spotlightText: document.getElementById("spotlightText"),
  nextTipBtn: document.getElementById("nextTipBtn"),
  copyTipBtn: document.getElementById("copyTipBtn"),
  shuffleBtn: document.getElementById("shuffleBtn"),
  resetPinsBtn: document.getElementById("resetPinsBtn"),
  searchInput: document.getElementById("searchInput"),
  spotlightBadge: document.getElementById("spotlightBadge"),
};

let spotlightIndex = 0;
let pinned = new Set();
let currentList = [...tips];

function setupHeaderGlow() {
  els.title.classList.add("glow-blue");

  els.title.addEventListener("mousemove", (e) => {
    const rect = els.title.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const half = rect.width / 2;

    els.title.classList.toggle("glow-red", x < half);
    els.title.classList.toggle("glow-blue", x >= half);
  });

  els.title.addEventListener("mouseleave", () => {
    els.title.classList.remove("glow-red");
    els.title.classList.add("glow-blue");
  });
}

function renderTips(list) {
  const pinnedItems = list.filter((t) => pinned.has(t.title));
  const others = list.filter((t) => !pinned.has(t.title));
  const ordered = [...pinnedItems, ...others];

  els.tipsGrid.innerHTML = "";

  ordered.forEach((t) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "card" + (pinned.has(t.title) ? " pinned" : "");
    card.setAttribute("aria-pressed", pinned.has(t.title) ? "true" : "false");
    card.innerHTML = `
      <h3 class="card-title">${escapeHtml(t.title)}</h3>
      <p class="card-text">${escapeHtml(t.text)}</p>
      <div class="meta">
        <span class="tag">${escapeHtml(t.tag)}</span>
        <span class="pin"><i aria-hidden="true"></i>${pinned.has(t.title) ? "Pinned" : "Click to pin"}</span>
      </div>
    `;

    card.addEventListener("click", () => togglePin(t.title));
    els.tipsGrid.appendChild(card);
  });
}

function setSpotlight(tip) {
  els.spotlightTitle.textContent = tip.title;
  els.spotlightText.textContent = tip.text;

  els.spotlightBadge.textContent = pinned.has(tip.title) ? "PINNED" : "LIVE";
}

function nextSpotlight() {
  spotlightIndex = (spotlightIndex + 1) % currentList.length;
  setSpotlight(currentList[spotlightIndex]);
}

function togglePin(title) {
  if (pinned.has(title)) pinned.delete(title);
  else pinned.add(title);

  const sTitle = els.spotlightTitle.textContent;
  if (sTitle === title) {
    els.spotlightBadge.textContent = pinned.has(title) ? "PINNED" : "LIVE";
  }

  renderTips(currentList);
}

function shuffleTips() {
  const arr = [...currentList];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  currentList = arr;
  spotlightIndex = 0;
  renderTips(currentList);
  setSpotlight(currentList[spotlightIndex]);
}

function resetPins() {
  pinned.clear();
  renderTips(currentList);
  els.spotlightBadge.textContent = "LIVE";
}

function copySpotlight() {
  const text = `${els.spotlightTitle.textContent}: ${els.spotlightText.textContent}`;
  navigator.clipboard
    .writeText(text)
    .then(() => {
      const old = els.copyTipBtn.textContent;
      els.copyTipBtn.textContent = "Copied!";
      setTimeout(() => (els.copyTipBtn.textContent = old), 900);
    })
    .catch(() => {
      alert(
        "Copy failed (browser security thing). Try hosting it or copy manually.",
      );
    });
}

function applySearch() {
  const q = els.searchInput.value.trim().toLowerCase();
  if (!q) {
    currentList = [...tips];
  } else {
    currentList = tips.filter((t) =>
      (t.title + " " + t.text + " " + t.tag).toLowerCase().includes(q),
    );
  }

  if (currentList.length === 0) {
    els.tipsGrid.innerHTML = `<div style="color: rgba(255,255,255,0.8); padding: 8px 2px;">
      No matches. Try a different keyword.
    </div>`;
    els.spotlightTitle.textContent = "No tips found";
    els.spotlightText.textContent =
      "Try searching for something like “time”, “resume”, or “teamwork”.";
    els.spotlightBadge.textContent = "…";
    return;
  }

  spotlightIndex = 0;
  renderTips(currentList);
  setSpotlight(currentList[spotlightIndex]);
}

function escapeHtml(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

setupHeaderGlow();
renderTips(currentList);
setSpotlight(currentList[spotlightIndex]);

els.nextTipBtn.addEventListener("click", nextSpotlight);
els.copyTipBtn.addEventListener("click", copySpotlight);
els.shuffleBtn.addEventListener("click", shuffleTips);
els.resetPinsBtn.addEventListener("click", resetPins);
els.searchInput.addEventListener("input", applySearch);

setInterval(() => {
  if (document.visibilityState === "visible" && currentList.length > 0) {
    nextSpotlight();
  }
}, 12000);
