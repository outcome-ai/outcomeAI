
/* FIX10u: deterministic focus counts + open behavior (no state bleed) */
(function(){
  const $ = (sel, root=document)=>root.querySelector(sel);
  const $$ = (sel, root=document)=>Array.from(root.querySelectorAll(sel));

  function parseMoney(v){
    if(v==null) return 0;
    if(typeof v === "number") return v;
    const m = String(v).match(/-?\d[\d,]*/);
    if(!m) return 0;
    return Number(m[0].replace(/,/g,"")) || 0;
  }
  function fmtMoney(n){
    try{ return `$${Math.round(Number(n||0)).toLocaleString()}`; }catch(_){ return "$0"; }
  }

  function getStores(){
    const appr = (window.__approachingStore || window.__approaching || window.approachingRows || window.approaching || []);
    const res  = (window.__resolvedStore || window.__resolvedLog || window.cieResolvedLog || window.resolvedItems || []);
    return { appr: Array.isArray(appr)?appr:[], res: Array.isArray(res)?res:[] };
  }

  function totals(){
    // Mirror the same “locked headline total” behavior as the working COI tile.
    // AE + RT modals in this demo are static, so these totals must match their hero values.
    const lock = (window.__focusTotals || null);
    const apprTotal = Number(lock?.approaching ?? 6300);
    const resTotal  = Number(lock?.resolved    ?? 6900);
    return { apprN: 0, resN: 0, apprTotal, resTotal };
  }

  function updateFocusUI(){
    const t = totals();

    // Update focus boxes dollars (if present)
    const focusRow = $("#iosWidgetsFocus") || document;
    const aBox = focusRow.querySelector('[data-focus="approaching_escalation"] .board-col__value');
    const rBox = focusRow.querySelector('[data-focus="resolved_today"] .board-col__value');
    if(aBox) aBox.textContent = fmtMoney(t.apprTotal);
    if(rBox) rBox.textContent = fmtMoney(t.resTotal);

    // Count lines are intentionally hidden (counts live in the modal)
    const aCnt = focusRow.querySelector(".js-focusCount-approaching");
    const rCnt = focusRow.querySelector(".js-focusCount-resolved");
    if(aCnt){ aCnt.textContent = ""; aCnt.style.display = "none"; }
    if(rCnt){ rCnt.textContent = ""; rCnt.style.display = "none"; }

    // Update circles (focus gauges): assume order Approaching, COI, Resolved
    const fx = $("#iosGaugesFocus");
    if(fx){
      // The gauge value class is .ios-gauge__val (not __value). Keep this in sync.
      const vals = $$(".ios-gauge__val", fx);
      if(vals[0]) vals[0].textContent = fmtMoney(t.apprTotal);
      if(vals[2]) vals[2].textContent = fmtMoney(t.resTotal);
    }
  }

  function openDrawer(){
    const drawer = $(".js-drawer");
    if(!drawer) return;
    drawer.dataset.open = "true";
    document.body.classList.add("drawer-open");
    document.documentElement.classList.add("drawer-open");
  }

  function setDrawer(titleText, bodyHtml){
    const title=$("#drawerTitle");
    const sub=$("#drawerSub");
    const body=$("#drawerBody");
    if(title) title.textContent = titleText;
    if(sub) sub.textContent = "Today’s Focus • Live Demo";
    if(body) body.innerHTML = bodyHtml;
  }

  function renderApproaching(){
    const {appr}=getStores();
    const total = appr.reduce((s,it)=> s + (typeof it.estLoss==="number" ? it.estLoss : (typeof it.loss==="number"?it.loss: parseMoney(it.value||it.amount||0))), 0);
    const next = appr.reduce((m,it)=> {
      const h = Number(it.deadlineHrs||it.hours||it.hrs||999);
      return Math.min(m,h);
    }, 999);

    return `
      <div class="focus-hero">
        <div class="focus-hero__kicker">Approaching Escalation</div>
        <div class="focus-hero__value">${fmtMoney(total)}</div>
        <div class="focus-hero__sub">at risk soon</div>
        <div class="focus-hero__meta">Next escalation in ${isFinite(next)?next:"—"} hrs • Updated just now</div>
      </div>
      <div class="focus-copy">
        <strong>These aren’t problems yet.</strong><br/>
        They’re opportunities with a clock — and no owner.
      </div>
      <div class="focus-list">
        ${appr.map(it=>`
          <div class="fo-row" role="group">
            <div class="fo-row__l">
              <div class="fo-row__title">${it.title||it.name||"Opportunity"}</div>
              <div class="fo-row__sub">${it.sub||it.subtitle||""}</div>
              <ul class="fo-row__bullets">
                ${(it.bullets||it.details||[]).map(b=>`<li>${b}</li>`).join("")}
              </ul>
            </div>
            <div class="fo-row__r">
              <div class="fo-pill">Escalates in ${it.deadlineHrs||it.hrs||it.hours||"—"} hrs</div>
              <div class="fo-actions">
                <button class="btn btn--primary js-focusResolve" data-id="${it.id}">Assign Owner</button>
                <button class="btn btn--ghost js-logDecision" data-id="${it.id}">Log Decision</button>
                <button class="btn btn--ghost js-defer" data-id="${it.id}">Defer</button>
              </div>
              <div class="fo-note">Escalation stops when ownership is assigned or a decision is logged.</div>
            </div>
          </div>
        `).join("") || `<div class="muted">No items are nearing escalation right now.</div>`}
      </div>
    `;
  }

  function renderResolved(){
    const {res}=getStores();
    const total = res.reduce((s,it)=> s + parseMoney(it.amount||it.saved||0), 0);
    return `
      <div class="focus-hero">
        <div class="focus-hero__kicker">Resolved Today</div>
        <div class="focus-hero__value">${fmtMoney(total)}</div>
        <div class="focus-hero__sub">saved today</div>
        <div class="focus-hero__meta">Recorded outcomes • Updated just now</div>
      </div>
      <div class="focus-list">
        ${res.map(it=>`
          <div class="fo-row" role="group">
            <div class="fo-row__l">
              <div class="fo-row__title">${it.title||it.name||"Handled item"}</div>
              <div class="fo-row__sub">${it.sub||it.subtitle||""}</div>
            </div>
            <div class="fo-row__r">
              <div class="fo-pill">${it.amount?fmtMoney(parseMoney(it.amount)): (it.status||"Handled")}</div>
              <div class="fo-actions">
                <button class="btn btn--ghost js-viewReceipt" data-id="${it.id}">View Receipt</button>
              </div>
            </div>
          </div>
        `).join("") || `<div class="muted">Nothing handled yet today.</div>`}
      </div>
    `;
  }

  function renderCOI(){
    // If existing renderer exists, use it
    if(typeof window.renderCOIDrawer === "function") return window.renderCOIDrawer();
    return `<div class="muted">Cost of Inaction is locked (see COI view).</div>`;
  }

  // Override focus widget click to ensure correct mapping every time
  document.addEventListener("click", (e)=>{
    const btn = e.target.closest(".js-focus-widget");
    if(!btn) return;
    // Only keep the dollars in sync. Drawer rendering is owned by script.js (COI pattern).
    updateFocusUI();
    return; // allow the main handler to open the correct modal
  }, true);

  // Keep counts aligned on load and after actions
  window.addEventListener("load", ()=>{ setTimeout(updateFocusUI, 50); setTimeout(updateFocusUI, 250); });

  // When an item is resolved, move it into resolved store and refresh counts
  document.addEventListener("click", (e)=>{
    const b = e.target.closest(".js-focusResolve");
    if(!b) return;
    const id = b.getAttribute("data-id");
    const s = getStores();
    const idx = s.appr.findIndex(x=>String(x.id)===String(id));
    if(idx>=0){
      const it = s.appr.splice(idx,1)[0];
      const res = (window.__resolvedLog || window.cieResolvedLog || s.res);
      const receipt = {
        id: "res-"+String(it.id||Date.now()),
        title: it.title || "Escalation prevented",
        sub: "Handled today",
        amount: fmtMoney(Number(it.estLoss||it.loss||0))
      };
      if(Array.isArray(res)) res.unshift(receipt);
      window.__resolvedLog = res;
      // Write back approaching
      window.__approaching = s.appr;
      window.__approachingStore = s.appr;
    }
    updateFocusUI();
    // If drawer is on approaching, re-render it
    const title=$("#drawerTitle");
    if(title && title.textContent.toLowerCase().includes("approaching")){
      setDrawer("Approaching Escalation", renderApproaching());
    }
  }, true);

})();
