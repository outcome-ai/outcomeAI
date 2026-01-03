

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
      wrap.innerHTML = `<div class="oa-insight__k">Store Insight</div><div class="oa-insight__text"></div><button class="oa-why" type="button">Why?</button>`;
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
    
    stopBuyingDrivers: {
      "2021 Ford F-150 XLT": [
        ["2021 F-150 XLT — Stock #U1842", "On Hand", "High days supply", "52d"],
        ["2020 F-150 XLT — Stock #U1739", "On Hand", "Price-to-market lagging", "47d"]
      ],
      "2020 Silverado LTZ": [
        ["2020 Silverado LTZ — Stock #U1620", "On Hand", "Recon trending high", "49d"]
      ],
      "__default__": [
        ["Similar unit — Stock #U1508", "On Hand", "Sits too long here", "45d"]
      ]
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
          ["2022 F-150 Lariat — Stock #U2214", "41", "$2,150"],
          ["2021 Yukon SLT — Stock #U1988", "53", "$4,800"],
          ["2020 Camry XSE — Stock #U1762", "36", "$1,250"],
          ["2021 Escape SEL — Stock #U2051", "44", "$1,100"],
          ["2022 Explorer ST — Stock #U1907", "58", "$6,300"],
          ["2020 Accord Sport — Stock #U1710", "39", "$1,600"],
          ["2021 Wrangler Sahara — Stock #U1879", "47", "$3,250"]
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
          ["2022 4Runner SR5", "<span class='src-badge' data-tip='Partner inventory via opt-in feed.'>Partner Dealer Network</span>", "Fastest path to a clean unit"],
          ["2021 Tahoe RST", "<span class='src-badge' data-tip='Upcoming auction listing (feed).'>Auction Feed</span>", "Only if within max buy"],
          ["2022 F-250 XLT Tremor", "<span class='src-badge' data-tip='Dealer-to-dealer listing (Buy Bid network).'>Buy Bid Network</span>", "Trim premium holds"],
          ["2021 F-150 XLT 302A", "<span class='src-badge' data-tip='Direct purchase source you configured.'>Direct Purchase</span>", "Repeatable gross pattern"],
          ["2020 Wrangler Rubicon", "<span class='src-badge' data-tip='Partner inventory via opt-in feed.'>Partner Dealer Network</span>", "Trim premium holds"],
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
    try { renderCIEExposureOnly(); } catch(e) {}
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
    const meta = (demo.stopBuyingMeta && demo.stopBuyingMeta[profile]) || { confidence: 74, band: "Low Confidence", breakpoint: "Confidence drops below 60% if recon exceeds $1,800." };

    if(modalTitle) modalTitle.textContent = profile;
    if(modalSub) modalSub.textContent = `STOP BUYING • ${meta.confidence}% Confidence`;

    if(modalWhere) modalWhere.textContent = "Avoid acquiring this profile under current market/recon conditions.";
    if(modalWhereNote) modalWhereNote.textContent = meta.band;

    if(modalMaxBuy) modalMaxBuy.textContent = "—";
    if(modalAction) modalAction.textContent = meta.breakpoint;

    // Hide action buttons for Stop Buying
    if(modalActions) modalActions.hidden = true;

    // Replace the 'matches' area with what is actually driving stop-buying (on-hand / aged / bleeding units)
    const matchesTitle = document.querySelector(".js-modalMatchesTitle");
    if(matchesTitle) matchesTitle.textContent = "Units driving Stop Buying";

    const rows = (demo.stopBuyingDrivers && (demo.stopBuyingDrivers[profile] || demo.stopBuyingDrivers["__default__"])) || [];
    if(modalMatches){
      // Columns are fixed in HTML: Vehicle | Source | Customer | When
      // For Stop Buying we use: Vehicle | Where | Note | Age
      modalMatches.innerHTML = rows.map(r=>(
        `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td class="right">${r[3]}</td></tr>`
      )).join("");
    }

    setModalOpen(true);
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

  /* ===========================
     COST OF INACTION (wired demo)
  =========================== */
  const cieEls = {
    loss: document.getElementById("cieLoss"),
    lossDelta: document.getElementById("cieLossDelta"),
    avoided: document.getElementById("cieAvoided"),
    escCount: document.getElementById("cieEscCount"),
    nextEsc: document.getElementById("cieNextEsc"),
    barFill: document.getElementById("cieBarFill"),
    barKnob: document.getElementById("cieBarKnob"),
    rows: document.getElementById("cieRowsRight"),
    attentionFlowList: document.getElementById("attentionFlowList"),
    agedTodayList: document.getElementById("agedTodayList"),
    resolvedTodayList: document.getElementById("resolvedTodayList"),
    openLedgerBtn: document.getElementById("openLedgerBtn"),
    ledger: document.getElementById("ledger"),
    ledgerBackdrop: document.getElementById("ledgerBackdrop"),
    closeLedgerBtn: document.getElementById("closeLedgerBtn"),
    ledgerBody: document.getElementById("ledgerBody"),
    ledgerLoss: document.getElementById("ledgerLoss"),
    ledgerEscPct: document.getElementById("ledgerEscPct"),
    ledgerAvgDays: document.getElementById("ledgerAvgDays"),
    ledgerTopCat: document.getElementById("ledgerTopCat"),
    ledgerDetail: document.getElementById("ledgerDetail"),
    ledgerDetailContent: document.getElementById("ledgerDetailContent"),
    closeDetailBtn: document.getElementById("closeDetailBtn"),
    ledgerRange: document.getElementById("ledgerRange"),
    ledgerType: document.getElementById("ledgerType"),
    ledgerDept: document.getElementById("ledgerDept"),
    ledgerStatus: document.getElementById("ledgerStatus")
  };

  // COI extensions: lightweight "Handled" tracking (demo only)
  const cieHandled = new Set(); // ids marked as handled
  const cieResolvedLog = [
    { id: "res-acq-1", lane: "Online Buy Opportunity", col: "acquire_now", status: "Released", when: "Handled today" },
    { id: "res-int-1", lane: "Service Retention Lead", col: "internal_supply", status: "Assigned", when: "Handled today" }
  ]; // {id,label,amt,time,when,outcome,col}

  function ensureHandledModal(){
    let modal = document.getElementById("coiHandledModal");
    if(modal) return modal;
    modal = document.createElement("div");
    modal.id = "coiHandledModal";
    modal.className = "oa-tip"; // reuse overlay behavior styling
    modal.dataset.open = "false";
    modal.innerHTML = `
      <div class="oa-tip__panel" role="dialog" aria-hidden="true">
        <div class="oa-tip__title">What happened?</div>
        <div class="oa-tip__body">
          <div class="coiHandled__grid">
            <button class="coiHandled__btn" data-outcome="Completed">✅ Completed</button>
            <button class="coiHandled__btn" data-outcome="Deferred">⏸️ Deferred</button>
            <button class="coiHandled__btn" data-outcome="Passed / Released">❌ Passed / Released</button>
            <button class="coiHandled__btn" data-outcome="Reassigned">🔁 Reassigned</button>
          </div>
          <div class="coiHandled__note">No explanation required. Just acknowledgment.</div>
        </div>
      </div>`;
    document.addEventListener("DOMContentLoaded", () => document.body.appendChild(modal));
    modal.addEventListener("click", (e) => { if(e.target === modal) setOpen(false); });

    function setOpen(open){
      modal.dataset.open = open ? "true" : "false";
      const panel = modal.querySelector(".oa-tip__panel");
      if(panel) panel.setAttribute("aria-hidden", open ? "false" : "true");
    }
    modal._setOpen = setOpen;
    return modal;
  }

  function openHandledModal(item){
    const modal = ensureHandledModal();
    modal._current = item;
    modal._setOpen(true);
  }

  function closeHandledModal(){
    const modal = document.getElementById("coiHandledModal");
    if(modal && modal._setOpen) modal._setOpen(false);
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest && e.target.closest(".coiHandled__btn");
    const modal = document.getElementById("coiHandledModal");
    if(!btn || !modal || !modal._current) return;
    const outcome = btn.getAttribute("data-outcome") || "Completed";
    const item = modal._current;
    cieHandled.add(item.id);
    cieResolvedLog.unshift({
      id: item.id,
      label: item.lane || "Opportunity",
      amt: fmtMoney(item.estLoss || 0),
      time: outcome,
      when: Date.now(),
      outcome,
      col: item.col
    });
    // slight nudge to exposure when handled
    try{ renderCIE(); }catch(err){}
    closeHandledModal();
  });


  function parseMoneyCell(s){
    const n = Number(String(s || "").replace(/[^0-9.-]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }

  function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

  function fmtCountdown(ms){
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    if (h <= 0) return `${m}m`;
    return `${h}h ${m}m`;
  }

  function focusCol(col){
    const btn = document.querySelector(`.js-board-col[data-col="${col}"]`);
    if (!btn) return;
    activeCol = col;
    $$(".js-board-col").forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    renderCol(col);
    try{ renderCIEExposureOnly(); }catch(e){}
    try { renderCIEExposureOnly(); } catch(e) {}
    btn.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
  }

  
function highlightProfileInTable(profile){
  const wrap = document.querySelector('.js-tableWrap');
  const body = document.querySelector('.js-tableBody');
  if (!wrap || !body) return;
  const key = String(profile || '').split('•')[0].trim();
  if (!key) return;

  const rows = Array.from(body.querySelectorAll('tr[data-profile]'));
  let target = rows.find(r => String(r.dataset.profile || '').includes(key));
  if (!target){
    // fallback: looser match
    target = rows.find(r => String(r.dataset.profile || '').toLowerCase().includes(key.toLowerCase()));
  }
  if (!target) return;

  rows.forEach(r => r.classList.remove('row-highlight'));
  target.classList.add('row-highlight');

  // scroll within the table wrap
  const top = target.offsetTop - 48;
  wrap.scrollTop = Math.max(0, top);

  window.setTimeout(() => target.classList.remove('row-highlight'), 2200);
}

function buildCIEModel(){
    const now = Date.now();

    const candidates = [];

    // Capital at Risk candidates (use provided Revenue at Risk)
    (demo.details.capital_risk?.rows || []).forEach((r, i) => {
      const vehicle = String(r[0] || "Unit");
      const days = Number(String(r[1] || "0").replace(/[^0-9]/g, "")) || (30 + i * 2);
      const estLoss = parseMoneyCell(r[2]);
      candidates.push({
        id: `cie-cap-${i}`,
        lane: "Capital at Risk",
        col: "capital_risk",
        dept: "Used",
        owner: "Inventory",
        profile: vehicle,
        estLoss: estLoss || 1500,
        days,
        reason: "Revenue at risk accelerates after the store's lot-day inflection."
      });
    });

    // Acquire Now candidates (use target gross as a proxy for value at risk)
    (demo.details.acquire_now?.rows || []).forEach((r, i) => {
      const profile = String(r[1] || r[0] || "Profile");
      const math = (demo.acquireMath && demo.acquireMath[profile]) ? demo.acquireMath[profile] : null;
      const estLoss = (math?.targetGross || 2800) + 200; // small lift for opportunity cost
      candidates.push({
        id: `cie-acq-${i}`,
        lane: "Acquire Now",
        col: "acquire_now",
        dept: "Used",
        owner: "Acquisitions",
        profile,
        estLoss,
        days: 1 + (i % 5),
        reason: "High-gross profile available; decay increases as competitors source first."
      });
    });

    // Internal Supply candidates (service / appraisals rows)
    const svc = demo.details.internal_supply?.views?.service?.rows || [];
    const appr = demo.details.internal_supply?.views?.appraisals?.rows || [];
    svc.slice(0, 4).forEach((r, i) => {
      const vehicle = String(r[0] || "Internal unit");
      candidates.push({
        id: `cie-int-s-${i}`,
        lane: "Internal Supply",
        col: "internal_supply",
        dept: "Service",
        owner: "Used Manager",
        profile: vehicle,
        internalSource: "Service",
        estLoss: 2400 + i * 250,
        days: 1 + (i % 4),
        reason: "Internal equity opportunity; probability decays as touchpoints lapse."
      });
    });
    appr.slice(0, 3).forEach((r, i) => {
      const vehicle = String(r[0] || "Internal unit");
      candidates.push({
        id: `cie-int-a-${i}`,
        lane: "Internal Supply",
        col: "internal_supply",
        dept: "Sales",
        owner: "Used Manager",
        profile: vehicle,
        internalSource: "Appraisal",
        estLoss: 2100 + i * 200,
        days: 2 + (i % 4),
        reason: "Live appraisal window; value decays quickly without rapid follow-up."
      });
    });

    // Stop Buying candidates (use a conservative gross leakage proxy)
    Object.keys(demo.stopBuyingMeta || {}).slice(0, 4).forEach((k, i) => {
      const meta = demo.stopBuyingMeta[k];
      const estLoss = 1300 + i * 150;
      candidates.push({
        id: `cie-stop-${i}`,
        lane: "Stop Buying",
        col: "stop_buying",
        dept: "Used",
        owner: "Acquisitions",
        profile: k,
        estLoss,
        days: 3 + (i % 5),
        reason: meta?.breakpoint ? meta.breakpoint : "Repeated trim mix underperforms here." 
      });
    });

    // Sort by economic weight
    const sorted = candidates.slice().sort((a, b) => (b.estLoss || 0) - (a.estLoss || 0));
    const approaching = [
      {
        id: "appr-cap-1",
        lane: "Capital at Risk Soon",
        col: "capital_risk",
        dept: "Used",
        owner: "Used Car Manager",
        profile: "2021 Yukon SLT",
        estLoss: 4800,
        days: 2,
        reason: "Aging unit; gross erodes as market moves.",
        why: "Escalation pending",
        escalatesAt: now + 6 * 60 * 60 * 1000,
        displayTime: "6 hrs remaining"
      },
      {
        id: "appr-int-1",
        lane: "Service Retention Opportunity",
        col: "internal_supply",
        dept: "Service",
        owner: "Service Manager",
        profile: "High-equity RO unassigned",
        estLoss: 2100,
        days: 1,
        reason: "High-equity customer; probability decays as RO closes.",
        why: "RO closing soon",
        escalatesAt: now + 12 * 60 * 60 * 1000,
        displayTime: "Today"
      },
      {
        id: "appr-acq-1",
        lane: "Online Appraisal Review",
        col: "acquire_now",
        dept: "Used",
        owner: "GM",
        profile: "Online appraisal / trade review",
        estLoss: 1300,
        days: 0,
        reason: "Buy leverage decays with time; competitor bids increase.",
        why: "Leverage decays with time",
        escalatesAt: now + 24 * 60 * 60 * 1000,
        displayTime: "Tomorrow"
      }
    ];

    const capSum = sorted.filter(x => x.col === "capital_risk").slice(0, 7).reduce((s, x) => s + (x.estLoss || 0), 0);
    const internalSum = sorted.filter(x => x.col === "internal_supply").slice(0, 7).reduce((s, x) => s + (x.estLoss || 0), 0);
    const otherSum = sorted.filter(x => x.col !== "capital_risk" && x.col !== "internal_supply").slice(0, 7).reduce((s, x) => s + (x.estLoss || 0), 0);

    const preventableLoss30 = Math.round(capSum + internalSum * 0.45 + otherSum * 0.25);
    const preventableLossDelta = Math.round(preventableLoss30 * 0.18);
    const lossAvoided30 = Math.round(preventableLoss30 * 0.52);

    // Exposure (Rolling 30 Days)
// For demo credibility we anchor exposure to *visible* dashboard numbers:
//   - Preventable Loss (30d)
//   - Capital at Risk (tile value)
//   - Approaching Escalation dollars + count pressure
// Then we add a small context nudge based on which tile is active (handled in renderCIE).
const capAtRisk = Number(demo?.board?.capital_risk?.value) || Math.max(1, Math.round(preventableLoss30 * 1.35));
const escDollars = (approaching || []).reduce((s,o)=> s + (Number(o.estLoss)||0), 0);
const escCount = (approaching || []).length;

// Base exposure: "how much preventable loss is stacking up relative to capital at risk?"
const base = preventableLoss30 / Math.max(1, capAtRisk);

// Urgency: escalation dollars represent near-term exposure.
const urgency = (escDollars / Math.max(1, capAtRisk));

// Count pressure: small additive bump; capped so it stays "slight".
const countPressure = Math.min(0.15, escCount * 0.05);

const exposureBasePct = clamp(Math.round((base + urgency + countPressure) * 100), 6, 95);

// Lane risk shares for slight context movement when tiles are clicked.
function laneDecayWeight(col){
  if(col === "internal_supply") return 1.35;
  if(col === "external") return 1.20;
  if(col === "acquire_now") return 1.00;
  if(col === "capital_risk") return 0.95;
  if(col === "stop_buying") return 0.70;
  return 1.00;
}
function ageWeight(days){
  const d = Math.max(0, Number(days) || 0);
  return clamp(0.75 + (d / 6.5), 0.75, 1.55);
}
const topRiskPool = sorted.slice(0, 15);
const laneRisk = topRiskPool.reduce((m, o) => {
  const base = Number(o.estLoss) || 0;
  const r = base * laneDecayWeight(o.col) * ageWeight(o.days);
  m[o.col] = (m[o.col] || 0) + r;
  m.__total = (m.__total || 0) + r;
  return m;
}, {});
const totalRisk = Math.max(1, laneRisk.__total || 1);
const avgShare = 0.20; // 5 lanes
const exposureDeltaByCol = ["acquire_now","internal_supply","external","capital_risk","stop_buying"].reduce((m, col) => {
  const share = (laneRisk[col] || 0) / totalRisk;
  m[col] = clamp(Math.round((share - avgShare) * 40), -6, 6);
  return m;
}, {});

const exposurePct = exposureBasePct;

    // Ledger rows (derived from candidates; immutable demo)
    const ledgerRows = sorted.slice(0, 12).map((o, i) => {
      const dayBack = i + 1;
      const d = new Date(now - dayBack * 24 * 60 * 60 * 1000);
      const date = d.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
      const statusCycle = ["Expired", "Escalated", "Dismissed", "Expired"]; 
      const status = statusCycle[i % statusCycle.length];
      const escalated = status === "Escalated" || (status === "Expired" && i % 2 === 0) ? "Yes" : "No";
      const loss = status === "Dismissed" ? 0 : status === "Escalated" ? Math.round(o.estLoss * 0.45) : Math.round(o.estLoss);
      const grossLow = Math.round(o.estLoss * 0.88);
      const grossHigh = Math.round(o.estLoss * 1.12);
      const grossRange = `${fmtMoney(grossLow)}–${fmtMoney(grossHigh)}`;
      const timeline = status === "Dismissed"
        ? ["Surfaced", "Review attempted", "Dismissed (reason logged)"]
        : status === "Escalated"
          ? ["Surfaced", "Warning shown", "Countdown reached", "Escalated to GM"]
          : ["Surfaced", "Warning shown", "Countdown reached", "Expired"];
      return {
        id: `led-${i}`,
        date,
        type: o.lane,
        dept: o.dept,
        owner: o.owner,
        profile: o.profile,
        grossRange,
        days: o.days,
        status,
        loss,
        escalated,
        confidence: o.col === "acquire_now" ? ((demo.acquireMath?.[o.profile]?.confidence || 80) / 100) : 0.68,
        decay: o.col === "internal_supply" ? "Fast" : o.col === "capital_risk" ? "Medium" : "Slow",
        timeline
      };
    });

    const escPct = Math.round((ledgerRows.filter(r => r.escalated === "Yes").length / Math.max(1, ledgerRows.length)) * 100);
    const avgDays = (ledgerRows.reduce((s, r) => s + (Number(r.days) || 0), 0) / Math.max(1, ledgerRows.length)).toFixed(1);
    const topCat = Object.entries(
      ledgerRows.reduce((m, r) => (m[r.type] = (m[r.type] || 0) + 1, m), {})
    ).sort((a,b)=>b[1]-a[1])[0]?.[0] || "—";

    return {
      preventableLoss30,
      preventableLossDelta,
      lossAvoided30,
      exposureBasePct,
      exposureDeltaByCol,
      exposurePct,
      approaching,
      ledgerRows,
      escPct,
      avgDays,
      topCat
    };
  }

  let cieModel = null;

  
  function getCieBadge(o){
    const col = String(o?.col || "");
    if (col === "capital_risk") return "CR";
    if (col === "internal_supply") return "SR";
    if (col === "acquire_now") return "AN";
    if (col === "external") return "EX";
    if (col === "stop_buying") return "SB";
    return "OA";
  }
function renderCIERows(){
    if (!cieEls.rows) return;
    cieEls.rows.innerHTML = "";
    (cieModel?.approaching || []).filter(o => !cieHandled.has(o.id)).forEach((o) => {
      const el = document.createElement("div");
      el.className = "cieRow";
      el.title = o.why;
      el.innerHTML = `
        <div class="cieRow__type">
          <div class="cieRow__badge" aria-hidden="true">${getCieBadge(o)}</div>
          <div class="cieRow__stack">
            <div class="cieRow__name">${String(o.lane || "Opportunity")}</div>
            <div class="cieRow__why">${String(o.why || "")}</div>
          </div>
        </div>
        <div class="cieRow__stack">
          <div class="cieRow__val">${fmtMoney(o.estLoss || 0)}</div>
          <div class="cieRow__sub">Est. loss</div>
        </div>
        <div class="cieRow__stack">
          <div class="cieRow__val cie__mono" data-escalate="${o.escalatesAt}">—</div>
          <div class="cieRow__sub">Escalates in</div>
        </div>
        <div class="cieRow__actions">
          <button class="cieRow__btn" type="button" data-review="${o.id}">Review</button>
          <button class="cieRow__btnSecondary" type="button" data-handle="${o.id}">Mark as Handled</button>
        </div>
      `;
      cieEls.rows.appendChild(el);
    });

    // Wire review buttons
    $$('[data-review]', cieEls.rows).forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-review');
        const item = (cieModel?.approaching || []).find(x => x.id === id);
        if (!item) return;
        openFromCIE(item);
      });


    // Wire handle buttons
    $$('[data-handle]', cieEls.rows).forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-handle');
        const item = (cieModel?.approaching || []).find(x => x.id === id);
        if (!item) return;
        openHandledModal(item);
      });
    });
    });
  }

  function updateCIECountdowns(){
    if (!cieModel) return;
    const now = Date.now();
    const times = (cieModel.approaching || []).map(o => o.escalatesAt || now + 9999999);
    const next = times.length ? Math.min(...times) : null;
    if (cieEls.nextEsc) cieEls.nextEsc.textContent = next ? fmtCountdown(next - now) : "—";
    $$('[data-escalate]').forEach((node) => {
      const t = Number(node.getAttribute('data-escalate'));
      node.textContent = fmtCountdown(t - now);
    });
  }


  

  function severityClass(item){
    // derive severity from time remaining
    const now = Date.now();
    const t = Number(item.escalatesAt || now + 9999999);
    const ms = t - now;
    if(ms <= 6*60*60*1000) return "red";
    if(ms <= 16*60*60*1000) return "amber";
    return "yellow";
  }

  function renderCOIDashboard(){
    // Attention Flow: top 3 by (estLoss weighted by time remaining)
    const listEl = cieEls.attentionFlowList;
    const agedEl = cieEls.agedTodayList;
    const resEl = cieEls.resolvedTodayList;
    const approaching = (cieModel?.approaching || []).filter(o => !cieHandled.has(o.id));

    function score(o){
      const now = Date.now();
      const t = Number(o.escalatesAt || now + 9999999);
      const hrs = Math.max(0.25, (t - now) / (60*60*1000));
      return (Number(o.estLoss)||0) / hrs;
    }

    const top = approaching.slice().sort((a,b)=>score(b)-score(a)).slice(0,3);

    if(listEl){
      listEl.innerHTML = top.map(o => {
        const sev = severityClass(o);
        return `
          <button class="coiItem coiItem--${sev}" type="button" data-coi-col="${o.col}" data-coi-id="${o.id}">
            <div class="coiItem__left">
              <div class="coiItem__label">${String(o.lane || "Opportunity")}</div>
              <div class="coiItem__sub">${String(o.owner || "Next touch owner")}</div>
            </div>
            <div class="coiItem__right">
              <div class="coiItem__amt">${fmtMoney(o.estLoss || 0)}</div>
              <div class="coiItem__time">${o.displayTime ? o.displayTime : (fmtCountdown((o.escalatesAt||Date.now()) - Date.now()) + " remaining")}</div>
            </div>
          </button>`;
      }).join("") || `<div class="muted">No items approaching escalation.</div>`;
    }

    // Aged Today: demo-specific threshold crossings (dealer-readable)
    const agedDemo = [
      { id: "aged-cap-1", lane: "Used Car Buy crossed 48 hrs", col: "capital_risk", estLoss: 3800, sub: "Now at risk", severity: "red" },
      { id: "aged-int-1", lane: "High-equity service RO unassigned", col: "internal_supply", estLoss: 1600, sub: "RO closing soon", severity: "amber" }
    ];

    if(agedEl){
      agedEl.innerHTML = agedDemo.map(o => {
        const sev = o.severity === "red" ? "red" : o.severity === "amber" ? "amber" : "yellow";
        return `
          <button class="coiItem coiItem--${sev}" type="button" data-coi-col="${o.col}" data-coi-id="${o.id}">
            <div class="coiItem__left">
              <div class="coiItem__label">${String(o.lane)}</div>
              <div class="coiItem__sub">${String(o.sub)}</div>
            </div>
            <div class="coiItem__right">
              <div class="coiItem__amt">${fmtMoney(o.estLoss || 0)}</div>
              <div class="coiItem__time">Today</div>
            </div>
          </button>`;
      }).join("") || `<div class="muted">No threshold crossings today.</div>`;
    }

    // Resolved Today: from log
    if(resEl){
      const recent = cieResolvedLog.slice(0,3);
      resEl.innerHTML = recent.map(r => `
        <div class="coiItem" role="group" aria-label="Resolved item">
          <div class="coiItem__left">
            <div class="coiItem__label">✔ ${String(r.label || "Opportunity")}</div>
            <div class="coiItem__sub">${String(r.outcome || "Handled")}</div>
          </div>
          <div class="coiItem__right">
            <div class="coiItem__amt">${String(r.amt || "—")}</div>
            <div class="coiItem__time">Handled</div>
          </div>
        </div>
      `).join("") || `<div class="muted">Nothing handled yet today.</div>`;
    }

    // Wire row clicks → focus relevant tile and open context
    document.querySelectorAll("[data-coi-col]").forEach(btn => {
      btn.onclick = () => {
        const col = btn.getAttribute("data-coi-col");
        if(!col) return;
        focusCol(col);
      };
    });

    // Update micro COI on tiles
    ["acquire_now","internal_supply","external","capital_risk","stop_buying"].forEach(col => {
      const micro = document.getElementById(`coiMicro-${col}`);
      if(!micro) return;
      const items = approaching.filter(o => o.col === col);
      const sum = items.reduce((s,o)=> s + (Number(o.estLoss)||0), 0);
      {
      const valEl = micro.querySelector(".board-col__coiVal");
      const label = (col === "acquire_now")
        ? (sum ? `${fmtMoney(sum)} expires if delayed` : "No items aging")
        : (col === "internal_supply")
          ? (sum ? `${fmtMoney(sum)} invisible unless touched` : "No immediate risk")
          : (col === "capital_risk")
            ? (sum ? `${fmtMoney(sum)} approaching escalation` : "No immediate risk")
            : (sum ? `${fmtMoney(sum)} at risk` : "No immediate risk");

      if (valEl) valEl.textContent = label;

      // Tooltip (hover only, no clutter)
      const tip = (col === "acquire_now")
        ? "Dealer speak: this is money you can make or save, but it decays if the buy/appraisal sits untouched."
        : (col === "internal_supply")
          ? "Dealer speak: high-equity customers / internal opportunities that quietly pass through unless someone owns the next touch."
          : (col === "capital_risk")
            ? "Dealer speak: units already owned where time is now working against you—this is what escalates if nobody touches it."
            : "Dealer speak: value that gets more expensive the longer it waits.";
      micro.setAttribute("data-tip", tip);
    }
      const tileBtn = document.querySelector(`.js-board-col[data-col="${col}"]`);
      if(tileBtn) tileBtn.classList.toggle("is-hot", sum > 0 && col !== "stop_buying");
    });
  }
function getContextExposurePct(){
    if(!cieModel) return 0;
    const base = Number(cieModel.exposureBasePct ?? cieModel.exposurePct ?? 0) || 0;
    const deltas = cieModel.exposureDeltaByCol || {};
    const delta = Number(deltas[activeCol] || 0);
    const handledAdj = Math.min(8, cieHandled.size * 2);
    return clamp(Math.round(base + delt - handledAdja), 0, 100);
  }

  function renderCIEExposureOnly(){
    if (!cieEls.barFill) return;
    const p = getContextExposurePct();
    const cover = clamp(100 - p, 0, 100);
    cieEls.barFill.style.width = `${cover}%`;
    if (cieEls.barKnob){
      cieEls.barKnob.style.left = `${p}%`;
      cieEls.barKnob.setAttribute("aria-label", `Exposure ${p}%`);
    }
  }

  function renderCIE(){
    // If dashboard is embedded elsewhere, fail silently.
    if (!cieEls.loss || !cieEls.openLedgerBtn) return;

    if (!cieModel) cieModel = buildCIEModel();

    cieEls.loss.textContent = fmtMoney(cieModel.preventableLoss30);
    cieEls.lossDelta.textContent = `↑ ${fmtMoney(cieModel.preventableLossDelta)} vs prior 30 days`;
    cieEls.avoided.textContent = fmtMoney(cieModel.lossAvoided30);
    cieEls.escCount.textContent = String((cieModel.approaching || []).length);
    renderCIEExposureOnly();

    renderCIERows();
    updateCIECountdowns();
    renderCOIDashboard();
  }

  function openLedger(){
    if (!cieEls.ledger) return;
    cieEls.ledger.classList.add('isOpen');
    cieEls.ledger.setAttribute('aria-hidden', 'false');
    renderLedger();
  }
  function closeLedger(){
    if (!cieEls.ledger) return;
    cieEls.ledger.classList.remove('isOpen');
    cieEls.ledger.setAttribute('aria-hidden', 'true');
    closeLedgerDetail();
  }

  function closeLedgerDetail(){
    if (!cieEls.ledgerDetail) return;
    cieEls.ledgerDetail.classList.remove('isOpen');
    cieEls.ledgerDetail.setAttribute('aria-hidden', 'true');
    if (cieEls.ledgerDetailContent) cieEls.ledgerDetailContent.innerHTML = "";
  }

  function openLedgerDetail(row){
    if (!cieEls.ledgerDetail || !cieEls.ledgerDetailContent) return;
    cieEls.ledgerDetail.classList.add('isOpen');
    cieEls.ledgerDetail.setAttribute('aria-hidden', 'false');
    cieEls.ledgerDetailContent.innerHTML = `
      <div class="detailBlock">
        <div class="detailTitle">Opportunity Summary</div>
        <div class="detailRow"><span>Type</span><span>${row.type}</span></div>
        <div class="detailRow"><span>Date surfaced</span><span>${row.date}</span></div>
        <div class="detailRow"><span>Profile</span><span>${row.profile}</span></div>
        <div class="detailRow"><span>Estimated gross range</span><span>${row.grossRange}</span></div>
        <div class="detailRow"><span>Decay profile</span><span>${row.decay}</span></div>
      </div>
      <div class="detailBlock">
        <div class="detailTitle">Action Timeline</div>
        ${(row.timeline || []).map(x=>`<div class="detailRow"><span>${x}</span><span></span></div>`).join('')}
      </div>
      <div class="detailBlock">
        <div class="detailTitle">Cost Breakdown</div>
        <div class="detailRow"><span>Status</span><span>${row.status}</span></div>
        <div class="detailRow"><span>Recorded preventable loss</span><span>${fmtMoney(row.loss || 0)}</span></div>
        <div class="cie__meta" style="margin-top:8px;">Recorded based on surfaced data and time-based decay model.</div>
      </div>
    `;
  }

  function getLedgerFiltered(){
    const type = cieEls.ledgerType?.value || 'all';
    const dept = cieEls.ledgerDept?.value || 'all';
    const status = cieEls.ledgerStatus?.value || 'all';

    return (cieModel?.ledgerRows || []).filter(r => {
      const okType = type === 'all' || r.type === type;
      const okDept = dept === 'all' || r.dept === dept;
      const okStatus = status === 'all' || r.status === status;
      return okType && okDept && okStatus;
    });
  }

  function renderLedger(){
    if (!cieEls.ledgerBody) return;
    const rows = getLedgerFiltered();

    // KPIs
    if (cieEls.ledgerLoss) cieEls.ledgerLoss.textContent = fmtMoney(cieModel.preventableLoss30);
    if (cieEls.ledgerEscPct) cieEls.ledgerEscPct.textContent = `${cieModel.escPct}%`;
    if (cieEls.ledgerAvgDays) cieEls.ledgerAvgDays.textContent = String(cieModel.avgDays);
    if (cieEls.ledgerTopCat) cieEls.ledgerTopCat.textContent = String(cieModel.topCat);

    cieEls.ledgerBody.innerHTML = "";
    rows.forEach((r) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.date}</td>
        <td>${r.type}</td>
        <td>${r.dept}</td>
        <td>${r.owner}</td>
        <td>${r.grossRange}</td>
        <td>${r.days}</td>
        <td>${r.status}</td>
        <td>${fmtMoney(r.loss || 0)}</td>
        <td>${r.escalated}</td>
        <td><button class="ledger__viewBtn" type="button" data-ledger="${r.id}">View →</button></td>
      `;
      cieEls.ledgerBody.appendChild(tr);
    });

    $$('[data-ledger]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-ledger');
        const row = (cieModel?.ledgerRows || []).find(x => x.id === id);
        if (row) openLedgerDetail(row);
      });
    });
  }

  function openFromCIE(item){
    if (!item?.col) return;

    // Switch the active tile and render the center panel.
    focusCol(item.col);

    // Then highlight the matching row in the center table (no modal).
    window.setTimeout(() => {
      highlightProfileInTable(item.profile);
    }, 60);
  }

  // Wire ledger UI
  cieEls.openLedgerBtn?.addEventListener('click', openLedger);
  cieEls.closeLedgerBtn?.addEventListener('click', closeLedger);
  cieEls.ledgerBackdrop?.addEventListener('click', closeLedger);
  cieEls.closeDetailBtn?.addEventListener('click', closeLedgerDetail);
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && cieEls.ledger?.classList.contains('isOpen')) closeLedger(); });
  ;[cieEls.ledgerType, cieEls.ledgerDept, cieEls.ledgerStatus].forEach((el)=>{
    el?.addEventListener('change', ()=>{ closeLedgerDetail(); renderLedger(); });
  });


  
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
  document.addEventListener("DOMContentLoaded", ()=>{
    loadDealerName();
    setLoginStamp();
    try{ renderCIE(); }catch(e){}
    try{ setInterval(updateCIECountdowns, 30000); }catch(e){}
    setInterval(setLoginStamp, 60000);
    // Open default view right away so the UI never shows placeholders
    try{ initDefaultOpen(); }catch(e){}
  });

})();


/* ==============================
   DEMO DATA — COST OF INACTION
   (Dashboard population + tiles)
   ============================== */

(function () {
  // Utilities
  function $(sel, root = document) { return root.querySelector(sel); }

  function fmt(n) {
    try { return n.toLocaleString("en-US"); } catch (e) { return String(n); }
  }

  function severityClass(sev) {
    if (sev === "red") return "coiItem coiItem--red";
    if (sev === "amber") return "coiItem coiItem--amber";
    return "coiItem coiItem--yellow";
  }

  function renderCOIList(containerId, items) {
    const el = document.getElementById(containerId);
    if (!el) return;

    el.innerHTML = items.map(item => {
      const cls = severityClass(item.severity);
      const tipAttr = item.tip ? ` data-tip="${item.tip.replace(/"/g, "&quot;")}"` : "";
      return `
        <div class="${cls}" data-target="${item.target || ""}"${tipAttr}>
          <div class="coiItem__left">
            <div class="coiItem__label">${item.label}</div>
            <div class="coiItem__sub">${item.sub || ""}</div>
          </div>
          <div class="coiItem__right">
            <div class="coiItem__amt">${item.amount}</div>
            <div class="coiItem__time">${item.time}</div>
          </div>
        </div>
      `;
    }).join("");
  }

  function setText(id, txt) {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  }

  function setBar(pct) {
    const bar = document.getElementById("cieBarFill");
    if (bar) bar.style.width = `${Math.max(0, Math.min(100, pct))}%`;
  }

  // --- Demo story data (exactly as discussed)
  const attentionFlowItems = [
    {
      label: "Used Car Buy Decision",
      sub: "Confirm buy / pass decision today",
      amount: "$4,200",
      time: "6 hrs remaining",
      severity: "red",
      target: "acquire_now",
      tip: "This is time-sensitive leverage. If nobody touches it, the opportunity decays or expires."
    },
    {
      label: "Service Retention Opportunity",
      sub: "Assign follow-up before RO closes",
      amount: "$2,100",
      time: "Today",
      severity: "amber",
      target: "internal_supply",
      tip: "High-equity customers passing through unflagged is silent loss. Outcome makes it visible before it disappears."
    },
    {
      label: "Online Appraisal Review",
      sub: "Approve / release before end of day",
      amount: "$1,300",
      time: "Tomorrow",
      severity: "yellow",
      target: "acquire_now",
      tip: "Not a ‘risk score’. This is value that can evaporate if the decision sits."
    }
  ];

  const agedTodayItems = [
    {
      label: "Used Car Buy crossed 48 hrs",
      sub: "Escalation triggered",
      amount: "$3,800 at risk",
      time: "Now requires acknowledgment",
      severity: "red",
      target: "acquire_now",
      tip: "Past threshold. Silence is no longer neutral."
    },
    {
      label: "High-equity service RO unassigned",
      sub: "RO closing soon",
      amount: "$1,600 at risk",
      time: "Time-sensitive",
      severity: "amber",
      target: "internal_supply",
      tip: "If the RO closes and nobody engaged, the opportunity is gone."
    }
  ];

  const resolvedItems = [
    {
      label: "Online Buy Opportunity",
      sub: "Decision recorded",
      amount: "Released",
      time: "Handled today",
      severity: "yellow",
      target: "acquire_now",
      tip: "Outcome doesn’t care how it was handled — only that it was touched and closed."
    },
    {
      label: "Service Retention Lead",
      sub: "Owner assigned",
      amount: "Assigned",
      time: "Handled today",
      severity: "yellow",
      target: "internal_supply",
      tip: "Closure creates calm. This is how Outcome reduces surprises."
    }
  ];

  // Approaching Escalation rows (right panel)
  const approachingRows = [
    {
      icon: "",
      name: "Capital at Risk Soon",
      why: "Escalation pending — requires acknowledgment",
      value: "$4,800",
      eta: "Next 2 hrs",
      owner: "GM",
      severity: "red"
    },
    {
      icon: "",
      name: "Acquisition Decision",
      why: "Buy / pass not touched",
      value: "$2,200",
      eta: "Today",
      owner: "UCM",
      severity: "amber"
    }
  ];

  function renderApproaching(rows) {
    const el = document.getElementById("cieRowsRight");
    if (!el) return;

    el.innerHTML = rows.map((r, idx) => {
      const sevCls = r.severity === "red" ? "is-red" : (r.severity === "amber" ? "is-amber" : "is-yellow");
      return `
        <div class="cieRow ${sevCls}">
          <div class="cieRow__type">
            <div class="cieRow__icon"></div>
            <div class="cieRow__stack">
              <div class="cieRow__name">${r.name}</div>
              <div class="cieRow__why" data-tip="Outcome escalates silence. This is visibility—not blame.">${r.why}</div>
            </div>
          </div>
          <div class="cieRow__val">${r.value}</div>
          <div class="cieRow__sub">${r.eta}</div>
          <div class="cieRow__sub">${r.owner}</div>
          <button class="cieRow__btn" data-handle="${idx}">Mark as Handled</button>
        </div>
      `;
    }).join("");
  }

  function wireClicks() {
    // COI list click -> jump to tile
    document.addEventListener("click", (e) => {
      const item = e.target.closest(".coiItem");
      if (!item) return;
      const target = item.getAttribute("data-target");
      if (!target) return;

      const tileBtn = document.querySelector(`.js-board-col[data-col="${target}"]`);
      if (tileBtn) {
        tileBtn.scrollIntoView({ behavior: "smooth", block: "center" });
        tileBtn.classList.add("pulse");
        setTimeout(() => tileBtn.classList.remove("pulse"), 650);
      }
    });

    // Mark as handled -> move into Resolved Today + nudge bar
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".cieRow__btn");
      if (!btn) return;

      const row = btn.closest(".cieRow");
      if (!row) return;

      // convert row into a resolved entry (simple demo behavior)
      const name = row.querySelector(".cieRow__name")?.textContent || "Item";
      const resolved = {
        label: name,
        sub: "Acknowledged",
        amount: "Handled",
        time: "Just now",
        severity: "yellow",
        target: "acquire_now",
        tip: "Handled beats perfect. Outcome records the touch and closes the loop."
      };
      resolvedItems.unshift(resolved);
      renderCOIList("resolvedTodayList", resolvedItems.slice(0, 3));

      // Nudge exposure bar & counters (demo)
      setBar(42);

      // Remove row from approaching list
      row.remove();
    });
  }

  function setTileMicro(id, text, tip) {
    const wrap = document.getElementById(id);
    if (!wrap) return;
    const val = wrap.querySelector(".board-col__coiVal");
    if (val) val.textContent = text;
    if (tip) wrap.setAttribute("data-tip", tip);
  }

  function init() {
    // Populate top KPIs so it doesn't look empty
    setText("cieLoss", "$8,100");
    setText("cieEscCount", "2");
    setText("cieNextEsc", "2 hrs");
    setBar(38);

    // Populate right panel + dashboard modules
    renderApproaching(approachingRows);
    renderCOIList("attentionFlowList", attentionFlowItems);
    renderCOIList("agedTodayList", agedTodayItems);
    renderCOIList("resolvedTodayList", resolvedItems);

    // Tile micros (dealer-speak)
    setTileMicro(
      "coiMicro-acquire_now",
      "$1,300 expires if delayed",
      "Dealer-speak: this is money you lose leverage on if the decision sits."
    );
    setTileMicro(
      "coiMicro-internal_supply",
      "$2,100 opportunity aging",
      "Dealer-speak: high-value customers / opportunities slipping quietly."
    );
    setTileMicro(
      "coiMicro-external",
      "$900 tied up if untouched",
      "Dealer-speak: capital/time tied up until someone makes a call."
    );
    setTileMicro(
      "coiMicro-capital_risk",
      "$4,800 escalation pending",
      "Dealer-speak: this is about to require leadership attention if nobody touches it."
    );
    setTileMicro(
      "coiMicro-stop_buying",
      "$1,700 expires if delayed",
      "Dealer-speak: if you wait, the deal (or advantage) disappears."
    );

    wireClicks();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
