

function confidenceModifier(conf){
  if(conf >= 90) return 1.00;
  if(conf >= 80) return 0.98;
  if(conf >= 70) return 0.95;
  return null; // escalation required
}
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Outcome AI: one-line statements + Why tooltip (injected UI, no HTML dependency)
  const tip = (() => {
    const el = document.createElement("div");
    el.className = "oa-tip";
    el.dataset.open = "false";
    el.innerHTML = `
      <div class="oa-tip__panel" role="dialog" aria-hidden="true">
        <div class="oa-tip__title">Why you’re seeing this</div>
        <div class="oa-tip__body"></div>
      </div>`;
    document.addEventListener("DOMContentLoaded", () => document.body.appendChild(el));
    el.addEventListener("click", (e) => { if (e.target === el) setOpen(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
    function setOpen(open){
      el.dataset.open = open ? "true" : "false";
      const panel = el.querySelector(".oa-tip__panel");
      if(panel) panel.setAttribute("aria-hidden", open ? "false" : "true");
    }
    function position(anchor){
      const panel = el.querySelector(".oa-tip__panel");
      if(!panel || !anchor) return;
      const r = anchor.getBoundingClientRect();
      const x = Math.min(window.innerWidth - panel.offsetWidth - 12, Math.max(12, r.left));
      const y = Math.min(window.innerHeight - panel.offsetHeight - 12, r.bottom + 10);
      panel.style.left = x + "px";
      panel.style.top = y + "px";
    }
    function esc(s){return String(s??"").replace(/[&<>\"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));}
    function confidence(n){
      n = Number(n||0);
      if(n >= 30) return "High";
      if(n >= 12) return "Medium";
      return "Low";
    }
    function render(statement, evidence){
      const ev = evidence || { window:"—", n:"—", updated:"—" };
      const notes = ev.notes ? `<div style="margin-top:8px;">${esc(ev.notes)}</div>` : "";
      const body = el.querySelector(".oa-tip__body");
      if(!body) return;
      body.innerHTML = `
        <div>${esc(statement || "")}</div>
        <div class="oa-tip__meta">
          <div class="oa-tip__pill"><div class="oa-tip__k">Window</div><div class="oa-tip__v">${esc(ev.window)}</div></div>
          <div class="oa-tip__pill"><div class="oa-tip__k">Sample</div><div class="oa-tip__v">${esc(ev.n)} units</div></div>
          <div class="oa-tip__pill"><div class="oa-tip__k">Updated</div><div class="oa-tip__v">${esc(ev.updated)}</div></div>
          <div class="oa-tip__pill"><div class="oa-tip__k">Confidence</div><div class="oa-tip__v">${confidence(ev.n)}</div></div>
        </div>
        ${notes}`;
    }
    return { setOpen, position, render, el };
  })();

  function ensureInsightUI(container){
    if(!container) return null;
    let wrap = container.querySelector(".oa-insight");
    if(!wrap){
      wrap = document.createElement("div");
      wrap.className = "oa-insight";
      wrap.innerHTML = `<div class="oa-insight__text"></div><button class="oa-why" type="button">Why?</button>`;
      container.appendChild(wrap);
    }
    const textEl = wrap.querySelector(".oa-insight__text");
    const btn = wrap.querySelector(".oa-why");
    return { wrap, textEl, btn };
  }

  const demo = {
    board: {
      stop_buying: { value: 30 },
      capital_risk: { value: 53771, deltaPct: -6 },
      acquire_now: { value: 8 },
      internal_supply: { value: 21 },
      external: { value: 5 }
    },
    reconRealityStoreAvg: 987,

    stopBuyingMeta: {
      "2021 Ford F-150 XLT": { confidence: 86, band: "Moderate Confidence", breakpoint: "Confidence drops below 70% if paid above MMR + $1,250." },
      "2020 Silverado LTZ": { confidence: 79, band: "Moderate Confidence", breakpoint: "Confidence drops below 65% if projected days-to-sell exceeds 52 days." },
      "2019 Ram 1500 Big Horn": { confidence: 77, band: "Moderate Confidence", breakpoint: "Confidence drops below 60% if needed price-to-market is >1.5% under comps." },
      "2020 Explorer Limited": { confidence: 81, band: "Moderate Confidence", breakpoint: "Confidence drops below 65% if recon exceeds $1,800." },
      "2022 Altima SV": { confidence: 88, band: "Moderate Confidence", breakpoint: "Confidence drops below 70% if competing supply within 50 miles exceeds 28 units." },
      "2021 Equinox LT": { confidence: 76, band: "Moderate Confidence", breakpoint: "Confidence drops below 60% if days-to-sell exceeds 45 days." },
      "2018 Tahoe LT": { confidence: 74, band: "Low Confidence", breakpoint: "Confidence drops below 60% if wholesale spread widens beyond $2,500." }
    },
    details: {
      stop_buying: {
        title: "STOP BUYING",
        subtitle: "Vehicles that consistently lose money here",
      insight: "These trims averaged $1,340 less front gross here, despite comparable market pricing.",
      evidence: { window: "365d", n: 204, updated: "Updated today" },
        columns: ["Profile", "Plain-English reason", "Confidence"],
        rows: [
          ["2021 Ford F-150 XLT", "We keep paying up for the wrong trim mix", "86%"],
          ["2020 Silverado LTZ", "Sits too long → price cuts kill you", "79%"],
          ["2019 Ram 1500 Big Horn", "Easy to buy, harder to retail here", "77%"],
          ["2020 Explorer Limited", "Recon surprises show up late", "81%"],
          ["2022 Altima SV", "Too common → always a price fight", "88%"],
          ["2021 Equinox LT", "Too many days to sell", "76%"],
          ["2018 Tahoe LT", "Wholesale hit risk if it doesn’t move", "74%"]
        ]
      },
      capital_risk: {
        title: "CAPITAL AT RISK",
        subtitle: "Units already owned that are burning time or gross",
      insight: "Margin decay accelerates after 35 days on lot for this segment at this store.",
      evidence: { window: "90d", n: 118, updated: "Updated today" },
        columns: ["Vehicle", "Days in Stock", "Revenue at Risk"],
        rows: [
          ["2022 F-150 Lariat", "41", "$2,150"],
          ["2021 Yukon SLT", "53", "$4,800"],
          ["2020 Camry XSE", "36", "$1,250"],
          ["2021 Escape SEL", "44", "$1,100"],
          ["2022 Explorer ST", "58", "$6,300"],
          ["2020 Accord Sport", "39", "$1,600"],
          ["2021 Wrangler Sahara", "47", "$3,250"]
        ]
      },
      acquire_now: {
        title: "ACQUIRE NOW",
        subtitle: "Profiles to intentionally acquire (with internal match counts)",
      insight: "F-250 XLT Tremor units average ~$2,900 more front gross when acquired under 38k miles here.",
      evidence: { window: "180d", n: 31, updated: "Updated today" },
        columns: ["#", "Profile", "Why it works", "Match"],
        rows: [
          ["1", "2022 F-250 XLT Tremor (Gas)", "Trim premium holds + fast exits", "3"],
          ["2", "2021 F-150 XLT 302A", "Repeatable front gross here", "2"],
          ["3", "2022 Expedition XLT", "Low friction exits", "1"],
          ["4", "2021 Tahoe RST", "Buyer pull-through", "2"],
          ["5", "2022 4Runner SR5", "Stable recon + strong demand", "1"],
          ["6", "2021 Sierra SLT", "Strong exit paths", "1"],
          ["7", "2020 Wrangler Rubicon", "Trim premium holds", "2"]
        ]
      },
      internal_supply: {
        title: "INTERNAL SUPPLY",
        subtitle: "Where your Acquire Now profiles are located inside your store (RO Open = Repair Order currently open)",
      insight: "61% of vehicles you want already exist in your service or appraisal pipeline.",
      evidence: { window: "30d", n: 52, updated: "Updated today" },
        views: {
          service: {
            columns: ["Vehicle", "Customer", "Appointment / RO", "Next step"],
            rows: [
              ["2022 F-250 XLT Tremor • VIN …3195", "B. Fox", "Appt: 12/30 8:15a", "Call now"],
              ["2021 Tahoe RST • VIN …7721", "J. Carter", "RO Open (In Shop)", "Notify advisor"],
              ["2020 Wrangler Rubicon • VIN …4430", "M. Diaz", "RO Open (Parts)", "Set buy offer"],
              ["2021 F-150 XLT 302A • VIN …1188", "T. Nguyen", "Appt: 12/29 3:40p", "Text customer"],
              ["2022 4Runner SR5 • VIN …9002", "S. Hall", "RO Open (Diag)", "Call now"],
              ["2022 Expedition XLT • VIN …6114", "A. Patel", "Appt: 12/31 9:10a", "Text customer"],
              ["2021 Sierra SLT • VIN …2219", "K. Reed", "RO Open (In Shop)", "Notify advisor"]
            ]
          },
          appraisals: {
            columns: ["Vehicle", "Customer", "Status", "Next step"],
            rows: [
              ["2021 F-150 XLT 302A • VIN …1188", "T. Nguyen", "Active", "Run Appraisal Assist"],
              ["2022 F-250 XLT Tremor • VIN …3195", "B. Fox", "Active", "Run Appraisal Assist"],
              ["2020 Wrangler Rubicon • VIN …4430", "M. Diaz", "Pending", "Get photos"],
              ["2021 Tahoe RST • VIN …7721", "J. Carter", "Active", "Set max buy"],
              ["2022 4Runner SR5 • VIN …9002", "S. Hall", "Active", "Review recon"],
              ["2021 Sierra SLT • VIN …2219", "K. Reed", "Pending", "Confirm trim"],
              ["2022 Expedition XLT • VIN …6114", "A. Patel", "Active", "Set max buy"]
            ]
          }
        }
      },
      external: {
        title: "EXTERNAL",
        subtitle: "Use only when internal supply is insufficient",
      insight: "Use external sourcing only when internal supply is insufficient and within Max Buy.",
      evidence: { window: "90d", n: 18, updated: "Updated today" },
        columns: ["Profile", "Source", "Why this source"],
        rows: [
          ["2022 4Runner SR5", "Partner dealer network", "Fastest path to a clean unit"],
          ["2021 Tahoe RST", "Auction (select)", "Only if within max buy"],
          ["2022 F-250 XLT Tremor", "Buy-bid", "Trim premium holds"],
          ["2021 F-150 XLT 302A", "Direct purchase", "Repeatable gross pattern"],
          ["2020 Wrangler Rubicon", "Partner dealer network", "Trim premium holds"]
        ]
      }
    },
    acquireMatches: {
      "2022 F-250 XLT Tremor (Gas)": [
        { where: "Service", vehicle: "2022 F-250 XLT Tremor • VIN …3195", customer: "B. Fox", when: "12/30 8:15a" },
        { where: "Service", vehicle: "2022 F-250 XLT Tremor • VIN …6420", customer: "R. Myers", when: "12/31 1:20p" },
        { where: "Appraisal", vehicle: "2022 F-250 XLT Tremor • VIN …3195", customer: "B. Fox", when: "Active" }
      ],
      "2021 F-150 XLT 302A": [
        { where: "Service", vehicle: "2021 F-150 XLT 302A • VIN …1188", customer: "T. Nguyen", when: "12/29 3:40p" },
        { where: "Appraisal", vehicle: "2021 F-150 XLT 302A • VIN …1188", customer: "T. Nguyen", when: "Active" }
      ],
      "2021 Tahoe RST": [
        { where: "Service", vehicle: "2021 Tahoe RST • VIN …7721", customer: "J. Carter", when: "RO Open" },
        { where: "Appraisal", vehicle: "2021 Tahoe RST • VIN …7721", customer: "J. Carter", when: "Active" }
      ]
    },
    acquireMath: {
      "2022 F-250 XLT Tremor (Gas)": { retail: 67995, recon: 1400, targetGross: 3500, pack: 900, confidence: 92 },
      "2021 F-150 XLT 302A": { retail: 44995, recon: 1200, targetGross: 3000, pack: 900, confidence: 88 },
      "2022 Expedition XLT": { retail: 52995, recon: 1600, targetGross: 3200, pack: 900, confidence: 84 },
      "2021 Tahoe RST": { retail: 58995, recon: 2100, targetGross: 3500, pack: 900, confidence: 86 },
      "2022 4Runner SR5": { retail: 38995, recon: 900, targetGross: 3000, pack: 900, confidence: 90 },
      "2021 Sierra SLT": { retail: 45995, recon: 1700, targetGross: 3100, pack: 900, confidence: 80 },
      "2020 Wrangler Rubicon": { retail: 41995, recon: 1300, targetGross: 2900, pack: 900, confidence: 78 }
    },

    vinStub: {
      "1FT8W2BN9RED53195": {
        decoded: { year: 2024, make: "Ford", model: "F-250", trim: null },
        trimOptions: ["F-250 XLT", "F-250 XLT Tremor", "F-250 Lariat", "F-250 Platinum"],
        signals: { confidence: "High", friction: "Medium", elasticity: "High" },
        alignment: "ACQUIRE NOW",
      insights: {
        decision: "Recon variance spikes above ~42k miles on this model at this store — confirm trim and recon early.",
        maxBuy: "Similar units exceeded recon assumptions on ~38% of acquisitions above this Max Buy.",
        profit: "This profit band historically exits within ~21 days here when priced correctly."
      },
      evidence: { window: "180d", n: 14, updated: "Updated today", notes: "Based on similar units retailed here." },
      retail: 67995,
      recon: 1400,
      targetGross: 3500,
      pack: 800
      }
,
      "1FTFW1E50MFA12345": {
        decoded: { year: 2021, make: "Ford", model: "F-150", trim: "XLT" },
        trimOptions: ["F-150 XLT", "F-150 XLT Sport", "F-150 Lariat", "F-150 Tremor"],
        signals: { confidence: "High", friction: "Low", elasticity: "High", whyConfidence: "Strong retail velocity with consistent outcomes at this store.", whyFriction: "Turns quickly with minimal recon variance.", whyTrim: "Small option changes materially impact buyer demand." },
        alignment: "ACQUIRE NOW",
        insights: {
          decision: "High-liquidity profile. Low recon volatility at this store when mileage is under ~55k.",
          maxBuy: "Buying above Max Buy materially increases downside risk.",
          profit: "Best outcomes occur when days-to-sale stays under ~24 days. Price-to-market discipline required."
        },
        evidence: { window: "180d", n: 18, updated: "Updated today", notes: "Demo stub for end-to-end appraisal flow." },
        retail: 45995,
        recon: 1600,
        targetGross: 3000,
        pack: 800
      },
      "1FM5K8FW2LGA54321": {
        decoded: { year: 2020, make: "Ford", model: "Explorer", trim: "Limited" },
        trimOptions: ["Explorer Limited", "Explorer XLT", "Explorer ST", "Explorer Platinum"],
        signals: { confidence: "Moderate", friction: "High", elasticity: "Medium", whyConfidence: "Outcomes depend on recon and pricing discipline.", whyFriction: "Extended holding periods reduce capital efficiency.", whyTrim: "Small option changes materially impact buyer demand." },
        alignment: "STOP BUYING",
        insights: {
          decision: "Recon variance and market compression increase beyond ~35 days. Avoid repeating this profile at current conditions.",
          maxBuy: "Confidence drops below authorization threshold if recon exceeds $1,800.",
          profit: "This profile erodes gross quickly when aged; prioritize faster-turn profiles instead."
        },
        evidence: { window: "180d", n: 12, updated: "Updated today", notes: "Demo stub for discipline / risk showcase." },
        retail: 34995,
        recon: 1800,
        targetGross: 2500,
        pack: 800
      }
}
  };


  const fmtMoney = (n) => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0
      }).format(n);
    } catch {
      return "$" + String(n);
    }
  };

  const setText = (sel, val) => {
    const el = $(sel);
    if (el) el.textContent = val;
  };

  // Populate board
  setText(".js-stopBuyingValue", String(demo.board.stop_buying.value));
  setText(".js-capitalRiskValue", fmtMoney(demo.board.capital_risk.value));
  setText(".js-acquireNowValue", String(demo.board.acquire_now.value));
  setText(".js-internalSupplyValue", String(demo.board.internal_supply.value));
  setText(".js-externalValue", String(demo.board.external.value));

  // Capital delta
  const deltaWrap = $(".js-capitalRiskDelta");
  if (deltaWrap && typeof demo.board.capital_risk.deltaPct === "number") {
    deltaWrap.hidden = false;
    const pct = demo.board.capital_risk.deltaPct;
    const arrow = $(".js-capitalRiskArrow");
    const txt = $(".js-capitalRiskDeltaText");
    if (arrow && txt) {
      if (pct < 0) {
        arrow.textContent = "↓";
        arrow.classList.remove("delta--up");
        arrow.classList.add("delta--down");
      } else {
        arrow.textContent = "↑";
        arrow.classList.remove("delta--down");
        arrow.classList.add("delta--up");
      }
      txt.textContent = Math.abs(pct) + "% WoW";
    }
  }

  // Drawer logic
  const drawer = $(".js-drawer");
  const drawerTitle = $(".js-drawerTitle");
  const drawerSubtitle = $(".js-drawerSubtitle");
  const tableHead = $(".js-tableHead");
  const tableBody = $(".js-tableBody");
  const reconChip = $(".js-reconChip");
  const reconValue = $(".js-reconValue");
  const internalToggle = $(".js-internalToggle");
  const actionStrip = $(".js-actionStrip");
  const actCall = $(".js-actCallCustomer");
  const actNotify = $(".js-actNotifyAdvisor");
  const actCRM = $(".js-actOpenCRM");

  let activeCol = null;
  let internalView = "service";

  function openDrawer() {
    if (!drawer) return;
    drawer.dataset.open = "true";
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.dataset.open = "false";
    activeCol = null;
    $$(".js-board-col").forEach((b) => b.classList.remove("is-active"));
  }

  function renderTable(columns, rows, opts = {}) {
    const { rowClickable = false, onRowClick = null, profileIndex = 1 } = opts;

    if (tableHead) {
      tableHead.innerHTML =
        "<tr>" +
        columns
          .map((c, i) => {
            const cls = i === columns.length - 1 ? ' class="right"' : "";
            return `<th${cls}>${c}</th>`;
          })
          .join("") +
        "</tr>";
    }

    if (tableBody) {
      tableBody.innerHTML = rows
        .slice(0, 7)
        .map((r) => {
          const profile = String(r[profileIndex] ?? r[0] ?? "");
          const rowAttr = rowClickable
            ? ' class="row-click" data-profile="' + profile.replace(/"/g, "&quot;") + '"'
            : "";
          return (
            `<tr${rowAttr}>` +
            r
              .map((cell, idx) => {
                const cls = idx === r.length - 1 ? ' class="right"' : "";
                return `<td${cls}>${cell}</td>`;
              })
              .join("") +
            "</tr>"
          );
        })
        .join("");

      if (rowClickable && typeof onRowClick === "function") {
        $$(".row-click", tableBody).forEach((tr) => {
          tr.addEventListener("click", () => {
            const profile = tr.getAttribute("data-profile") || "";
            onRowClick(profile);
          });
        });
      }
    }
  }

  function renderCol(col) {
    const d = demo.details[col];
    if (!d) return;

    openDrawer();
    if (drawerTitle) drawerTitle.textContent = d.title;
    if (drawerSubtitle) drawerSubtitle.textContent = d.subtitle;

    
    // oaLaneInsightPatch: one-line statement + Why?
    try {
      const headerBox = (drawerSubtitle && drawerSubtitle.parentElement) || (drawerTitle && drawerTitle.parentElement);
      const ui = ensureInsightUI(headerBox);
      if (ui) {
        ui.textEl.textContent = d.insight || "";
        ui.wrap.style.display = d.insight ? "" : "none";
        ui.btn.onclick = () => { tip.render(d.insight || "", d.evidence); tip.position(ui.btn); tip.setOpen(true); };
      }
    } catch(e) {}
if (reconChip) {
      if (col === "capital_risk") {
        reconChip.hidden = false;
        if (reconValue) reconValue.textContent = fmtMoney(demo.reconRealityStoreAvg);
      } else {
        reconChip.hidden = true;
      }
    }

    if (internalToggle) internalToggle.hidden = col !== "internal_supply";
    if (actionStrip) actionStrip.hidden = col !== "internal_supply";

    if (col === "internal_supply") {
      const viewData = d.views[internalView] || d.views.service;
      renderTable(viewData.columns, viewData.rows);
    } else if (col === "acquire_now") {
      renderTable(d.columns, d.rows, { rowClickable: true, onRowClick: (profile) => openAcquireModal(profile), profileIndex: 1 });
    } else if (col === "stop_buying") {
      renderTable(d.columns, d.rows, { rowClickable: true, onRowClick: (profile) => openStopBuyingModal(profile), profileIndex: 0 });
    } else {
      renderTable(d.columns, d.rows);
    }
  }

  $$(".js-board-col").forEach((btn) => {
    btn.addEventListener("click", () => {
      const col = btn.dataset.col;
      if (!col) return;

      const isSame = activeCol === col && drawer && drawer.dataset.open === "true";
      if (isSame) {
        closeDrawer();
        return;
      }

      activeCol = col;
      $$(".js-board-col").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      renderCol(col);
    });
  });

  $$(".js-toggle").forEach((t) => {
    t.addEventListener("click", () => {
      const view = t.dataset.view;
      if (!view) return;
      internalView = view;

      $$(".js-toggle").forEach((x) => x.classList.remove("is-active"));
      t.classList.add("is-active");

      if (activeCol === "internal_supply") renderCol("internal_supply");
    });
  });

  // Dock open/close
  const dock = $(".dock");
  const dockToggle = $(".js-dockToggle");
  const dockClose = $(".js-dockClose");
  const setDockOpen = (open) => {
    if (!dock) return;
    dock.dataset.open = open ? "true" : "false";
  };
  dockToggle?.addEventListener("click", () => setDockOpen(true));
  dockClose?.addEventListener("click", () => setDockOpen(false));

  // Appraisal Assist elements
  const vinInput = $(".js-vinInput");
  const vinStatus = $(".js-vinStatus");
  const alignWrap = $(".js-align");
  const alignValue = $(".js-alignValue");
  const trimWrap = $(".js-trim");
  const trimSelect = $(".js-trimSelect");

  const sigConfidence = $(".js-signalConfidence");
  const sigConfidenceWhy = $(".js-signalConfidenceWhy");
  const sigFriction = $(".js-signalFriction");
  const sigFrictionWhy = $(".js-signalFrictionWhy");
  const sigElasticity = $(".js-signalElasticity");
  const sigElasticityWhy = $(".js-signalElasticityWhy");

  const retailEl = $(".js-retail");
  const reconEl = $(".js-reconEst");
  const grossEl = $(".js-targetGross");
  const packEl = $(".js-pack");
  const maxBuyEl = $(".js-maxBuy");

  const acvInput = $(".js-acvInput");
  const profitWrap = $(".js-profitWrap");
  const profitEl = $(".js-profit");
  const statusPillWrap = $(".js-statusPill");

  let currentMath = null;

  
function setGauge(el, level, kind){
  if(!el) return;
  const gauge = el.querySelector(".gauge");
  const marker = el.querySelector(".gauge__marker");
  if(!gauge || !marker){
    el.textContent = level || "—";
    return;
  }
  const v = (level || "—").toString().trim().toUpperCase();
  let pos = 50;
  if(v === "LOW") pos = 20;
  else if(v === "MED" || v === "MEDIUM" || v === "MODERATE") pos = 50;
  else if(v === "HIGH") pos = 80;

  gauge.classList.toggle("gauge--risk", kind === "risk");
  marker.style.left = pos + "%";

  const sr = el.querySelector(".sr-only");
  if(sr) sr.textContent = (level || "—");
}

function setSignals(s) {
    if (sigConfidence) setGauge(sigConfidence, s?.confidence || "—", "positive");
    if (sigFriction) setGauge(sigFriction, s?.friction || "—", "risk");
    if (sigElasticity) setGauge(sigElasticity, s?.elasticity || "—", "risk");

    if (sigConfidenceWhy) sigConfidenceWhy.textContent = s?.whyConfidence || "";
    if (sigFrictionWhy) sigFrictionWhy.textContent = s?.whyFriction || "";
    if (sigElasticityWhy) sigElasticityWhy.textContent = s?.whyTrim || "";
  }

  function setAlignment(text) {
    if (!alignWrap || !alignValue) return;
    alignWrap.hidden = false;
    alignValue.textContent = text || "—";
  }

  function setTrimOptions(options) {
    if (!trimWrap || !trimSelect) return;
    trimSelect.innerHTML = "";
    options.forEach((o) => {
      const opt = document.createElement("option");
      opt.value = o;
      opt.textContent = o;
      trimSelect.appendChild(opt);
    });
    trimWrap.hidden = false;
  }

  function clearTrim() {
    if (!trimWrap) return;
    trimWrap.hidden = true;
    if (trimSelect) trimSelect.innerHTML = "";
  }

  // Modal (Acquire Now drill-down)
  const modal = $(".js-modal");
  const modalTitle = $(".js-modalTitle");
  const modalSub = $(".js-modalSub");
  const modalWhere = $(".js-modalWhere");
  const modalWhereNote = $(".js-modalWhereNote");
  const modalMaxBuy = $(".js-modalMaxBuy");
  const modalMaxBuyNote = $(".js-modalMaxBuyNote");
  const modalAction = $(".js-modalAction");
  const modalMatches = $(".js-modalMatches");

  function setModalOpen(open){
    if(!modal) return;
    modal.dataset.open = open ? 'true' : 'false';
    modal.setAttribute('aria-hidden', open ? 'false' : 'true');
  }
  $$(".js-modalClose").forEach(el=>el.addEventListener('click', ()=>setModalOpen(false)));
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') setModalOpen(false); });

  // Build an index for Internal Supply rows (so we can click any row)
  const internalSupplyIndex = {
    service: new Map((demo.details.internal_supply.views.service.rows || []).map(r=>[r[0], r])),
    appraisals: new Map((demo.details.internal_supply.views.appraisals.rows || []).map(r=>[r[0], r]))
  };

  const modalCall = $(".js-modalCall");
  const modalAdvisor = $(".js-modalAdvisor");
  const modalOffer = $(".js-modalOffer");

  function setActionHighlights({call=false, advisor=false, crm=false} = {}){
    if(modalCall) modalCall.classList.toggle("btn--highlight", !!call);
    if(modalAdvisor) modalAdvisor.classList.toggle("btn--highlight", !!advisor);
    if(modalOffer) modalOffer.classList.toggle("btn--highlight", !!crm);
  }

  const modalActions = $(".js-modalActions");
  let modalContext = { vehicle: null, customer: null, when: null, where: null };
  modalCall?.addEventListener('click', ()=>toast(`Outcome action: Call/Text ${modalContext.customer || 'customer'} (stub)`));
  modalAdvisor?.addEventListener('click', ()=>toast(`Outcome action: Notify advisor for ${modalContext.vehicle || 'unit'} (stub)`));
  modalOffer?.addEventListener('click', ()=>toast(`Outcome action: Set buy offer for ${modalContext.vehicle || 'unit'} (stub)`));

  function openInternalModal(row, sourceLabel){
    if(!modal) return;
    const vehicle = row?.[0] || 'Vehicle';
    const customer = row?.[1] || '—';
    const when = row?.[2] || '—';
    const next = row?.[3] || '—';
    modalContext = { vehicle, customer, when, where: sourceLabel };

    if(modalTitle) modalTitle.textContent = vehicle;
    if(modalSub) modalSub.textContent = `${sourceLabel} • ${customer} • ${when}`;
    if(modalWhere) modalWhere.textContent = sourceLabel;
    if(modalWhereNote) modalWhereNote.textContent = `Next step: ${next}`;

    if(modalMaxBuy){
      if(currentMath){
        const maxBuy = currentMath.retail - currentMath.recon - currentMath.targetGross - currentMath.pack;
        modalMaxBuy.textContent = fmtMoney(maxBuy);
      } else {
        modalMaxBuy.textContent = 'Run Appraisal Assist to set';
      }
    }
    if(modalAction) modalAction.textContent = next;
    if(modalActions) modalActions.hidden = false;

    if(modalMatches){
      modalMatches.innerHTML = `<tr><td>${vehicle}</td><td>${sourceLabel}</td><td>${customer}</td><td class="right">${when}</td></tr>`;
    }
    setModalOpen(true);
  }

  function openAcquireModal(profile){
    if(!modal) return;

    const math = (demo.acquireMath && demo.acquireMath[profile]) ? demo.acquireMath[profile] : null;
    const conf = math?.confidence ?? 85;
    const band = conf >= 90 ? "High Confidence" : conf >= 75 ? "Moderate Confidence" : "Low Confidence";

    if(modalTitle) modalTitle.textContent = profile;
    if(modalSub) modalSub.textContent = `${band} • ${conf}% Confidence`;

    const matches = demo.acquireMatches[profile] || [];
    const whereSummary = matches.length ? Array.from(new Set(matches.map(m=>m.where))).join(' • ') : 'No internal matches';
    if(modalWhere) modalWhere.textContent = whereSummary;
    if(modalWhereNote) modalWhereNote.textContent = matches.length
      ? 'Matches are inside your store right now.'
      : 'Use External lane if needed.';

    let maxBuy = null;
    if(math){
      const baseMaxBuy = math.retail - math.recon - math.targetGross - math.pack;
      const mod = confidenceModifier(conf);
      maxBuy = mod ? Math.floor(baseMaxBuy * mod) : null;
    }

    if(modalMaxBuy) modalMaxBuy.textContent = maxBuy ? fmtMoney(maxBuy) : "—";
    if(modalMaxBuyNote){
      modalMaxBuyNote.textContent = maxBuy
        ? "Buying above this price materially increases downside risk."
        : "Confidence below authorization threshold. Escalation required.";
    }

    if(modalAction) modalAction.textContent = matches.length ? "Call / Text the best match now." : "Source a match inside Max Buy.";
    if(modalActions) modalActions.hidden = maxBuy ? false : true;

    modalContext = { vehicle: profile, customer: matches[0]?.customer || null, when: matches[0]?.when || null, where: matches[0]?.where || null , handoff: true};

    // Immediate Action highlights (0, 1, or multiple)
    setActionHighlights({call:false, advisor:false, crm:false});
    if(modalActions && !modalActions.hidden){
      const hasCustomer = !!modalContext?.customer;
      const where = (modalContext?.where || "").toLowerCase();
      const isService = where.includes("service");
      const call = hasCustomer;
      const advisor = hasCustomer && isService;
      const crm = hasCustomer && (conf < 90 || !!modalContext?.handoff);
      setActionHighlights({call, advisor, crm});
    }

    if(modalMatches){
      if(!matches.length){
        modalMatches.innerHTML = '<tr><td colspan="4" class="muted">No internal matches.</td></tr>';
      } else {
        modalMatches.innerHTML = matches.slice(0,7).map(m=>{
          return `<tr class="row-click"><td>${m.vehicle}</td><td>${m.where}</td><td>${m.customer}</td><td class="right">${m.when}</td></tr>`;
        }).join('');
      }
    }

    modal.dataset.open = "true";
    modal.setAttribute("aria-hidden", "false");
}


function openStopBuyingModal(profile){
    if(!modal) return;
    const meta = (demo.stopBuyingMeta && demo.stopBuyingMeta[profile]) || { confidence: 75, band: "Moderate Confidence", breakpoint: "Confidence drops below 60% if recon exceeds $1,800." };

    if(modalTitle) modalTitle.textContent = profile;
    if(modalSub) modalSub.textContent = `STOP BUYING • ${meta.confidence}% Confidence`;

    if(modalWhere) modalWhere.textContent = "Avoid acquiring this profile at current market/recon conditions.";
    if(modalWhereNote) modalWhereNote.textContent = meta.band;

    if(modalMaxBuy) modalMaxBuy.textContent = "—";
    // Reuse the 'Next best action' card to show the breakpoint (the only thing you asked to reveal)
    if(modalAction) modalAction.textContent = meta.breakpoint;

    // Hide action buttons for Stop Buying
    if(modalActions) modalActions.hidden = true;

    modal.dataset.open = "true";
    modal.setAttribute("aria-hidden", "false");
}


  function highlightBoardForAlignment(alignment) {
    const map = {
      "STOP BUYING": "stop_buying",
      "CAPITAL AT RISK": "capital_risk",
      "ACQUIRE NOW": "acquire_now",
      "INTERNAL SUPPLY": "internal_supply",
      EXTERNAL: "external"
    };
    const key = map[alignment] || null;
    if (!key) return;
    $$(".js-board-col").forEach((b) => b.classList.remove("is-active"));
    const btn = $(`.js-board-col[data-col="${key}"]`);
    btn?.classList.add("is-active");
  }

  function renderDealMath(math) {
    currentMath = math;
    if (retailEl) retailEl.textContent = fmtMoney(math.retail);
    if (reconEl) reconEl.textContent = fmtMoney(math.recon);
    if (grossEl) grossEl.textContent = fmtMoney(math.targetGross);
    if (packEl) packEl.textContent = fmtMoney(math.pack);

    const maxBuy = math.retail - math.recon - math.targetGross - math.pack;
    if (maxBuyEl) maxBuyEl.textContent = fmtMoney(maxBuy);

    // reset profit area
    if (profitWrap) profitWrap.hidden = true;
    if (profitEl) profitEl.textContent = "—";
    if (statusPillWrap) statusPillWrap.innerHTML = '<span class="pill pill--neutral">Enter ACV</span>';
    if (acvInput) acvInput.value = "";
  }

  function computeFromACV() {
    if (!currentMath) return;
    const raw = (acvInput?.value || "").toString().replace(/[^0-9.]/g, "");
    if (!raw) {
      if (profitWrap) profitWrap.hidden = true;
      return;
    }
    const acv = Number(raw);
    if (!Number.isFinite(acv) || acv <= 0) return;

    const maxBuy = currentMath.retail - currentMath.recon - currentMath.targetGross - currentMath.pack;
    const profit = currentMath.retail - acv - currentMath.recon - currentMath.pack;

    if (profitWrap) profitWrap.hidden = false;
    try {
      const vin = (vinInput?.value || "").trim().toUpperCase();
      const stub = demo.vinStub[vin];
      if (stub?.insights?.profit) setAssistInsight(stub.insights.profit, stub.evidence);
    } catch(e) {};
    if (profitEl) profitEl.textContent = fmtMoney(profit);

    if (statusPillWrap) {
      if (acv <= maxBuy) {
        statusPillWrap.innerHTML = '<span class="pill pill--good">Within Max Buy</span>';
      } else {
        statusPillWrap.innerHTML = '<span class="pill pill--bad">Over Max Buy</span>';
      }
    }
  }

  acvInput?.addEventListener("input", computeFromACV);

  // Clear VIN
  const clearBtn = $(".js-clearVin");
  clearBtn?.addEventListener("click", () => {
    if (vinInput) vinInput.value = "";
    if (acvInput) acvInput.value = "";
    if (vinStatus) vinStatus.textContent = "Paste a VIN to start.";
    try { setAssistInsight("", null); } catch(e) {};
    if (alignWrap) alignWrap.hidden = true;
    clearTrim();
    setSignals(null);
    currentMath = null;
    if (retailEl) retailEl.textContent = "—";
    if (reconEl) reconEl.textContent = "—";
    if (grossEl) grossEl.textContent = "—";
    if (packEl) packEl.textContent = "—";
    if (maxBuyEl) maxBuyEl.textContent = "—";
    if (profitWrap) profitWrap.hidden = true;
  });

  function toast(msg){
    try { console.log(msg); } catch {}
  }

  actCall?.addEventListener('click', ()=>toast('Outcome action: Call/Text customer (stub)'));
  actNotify?.addEventListener('click', ()=>toast('Outcome action: Notify advisor (stub)'));
  actCRM?.addEventListener('click', ()=>toast('Outcome action: Open CRM record (stub)'));

  function decodeVin(vin) {
    if (!vinStatus) return;
    vinStatus.textContent = "Decoding VIN…";
    clearTrim();
    if (alignWrap) alignWrap.hidden = true;

    setSignals(null);

    window.setTimeout(() => {
      const hit = demo.vinStub[vin];
      if (!hit) {
        vinStatus.textContent = "VIN not recognized in demo (stub).";
        setSignals({ confidence: "—", friction: "—", elasticity: "—" });
        currentMath = null;
        renderDealMath({ retail: 0, recon: 0, targetGross: 0, pack: 0 });
        return;
      }

      const { decoded, trimOptions, signals, alignment, retail, recon, targetGross, pack } = hit;
      const base = `${decoded.year} ${decoded.make} ${decoded.model}`;
      vinStatus.textContent = decoded.trim ? base + " • " + decoded.trim : base + " • Trim not confirmed";

      setSignals(signals);
      setAlignment(alignment);
      highlightBoardForAlignment(alignment);

      renderDealMath({ retail, recon, targetGross, pack });

      if (!decoded.trim && Array.isArray(trimOptions) && trimOptions.length) {
        setTrimOptions(trimOptions);
      }
    }, 250);
  }

  vinInput?.addEventListener("input", () => {
    const vin = (vinInput.value || "").trim().toUpperCase();
    if (vin.length < 17) {
      if (vinStatus) vinStatus.textContent = "Paste a VIN to start.";
    try { setAssistInsight("", null); } catch(e) {};
      clearTrim();
      if (alignWrap) alignWrap.hidden = true;
      setSignals(null);
      currentMath = null;
      if (retailEl) retailEl.textContent = "—";
      if (reconEl) reconEl.textContent = "—";
      if (grossEl) grossEl.textContent = "—";
      if (packEl) packEl.textContent = "—";
      if (maxBuyEl) maxBuyEl.textContent = "—";
      if (profitWrap) profitWrap.hidden = true;
      return;
    }
    if (vin.length === 17) decodeVin(vin);
  });

  trimSelect?.addEventListener("change", () => {
    const choice = trimSelect.value;
    if (vinStatus && vinStatus.textContent.includes("Trim not confirmed")) {
      vinStatus.textContent = vinStatus.textContent.replace("Trim not confirmed", choice);
    }
  });

  function initDefaultOpen() {
    // Open Acquire Now by default so the board never feels empty on login
    const btn = document.querySelector('.js-board-col[data-col="acquire_now"]');
    if (!btn) return;

    activeCol = "acquire_now";
    $$(".js-board-col").forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    renderCol("acquire_now");
  }

  
  // Dealer name + login stamp
  const dealerNameInput = document.querySelector(".js-dealerName");
  const loginStampEl = document.querySelector(".js-loginStamp");

  function formatStamp(d){
    try{
      return d.toLocaleString(undefined, { weekday:"short", month:"short", day:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" });
    }catch(e){
      return d.toString();
    }
  }

  function setLoginStamp(){
    if(!loginStampEl) return;
    loginStampEl.textContent = formatStamp(new Date());
  }

  function loadDealerName(){
    if(!dealerNameInput) return;
    const saved = localStorage.getItem("oa_dealer_name");
    if(saved) dealerNameInput.value = saved;
  }

  dealerNameInput?.addEventListener("change", ()=>{
    localStorage.setItem("oa_dealer_name", dealerNameInput.value || "");
  });

  // stamp once on load; update every minute for "live" feel
  window.addEventListener("load", ()=>{
    loadDealerName();
    setLoginStamp();
    setInterval(setLoginStamp, 60000);
  });

  window.addEventListener("load", initDefaultOpen);

})();
