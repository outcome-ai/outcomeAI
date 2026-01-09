
(function(){
  const data = window.OUTCOME_DEMO;
  if(!data){ console.warn("OUTCOME_DEMO not found"); return; }

  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  
  function renderDecodedChips(obj){
    const el = document.getElementById("aaDecoded");
    if(!el) return;
    if(!obj){
      el.style.display = "none";
      el.innerHTML = "";
      return;
    }
    const chip = (k,v,cls="") => `
      <span class="decodedChip ${cls}">
        <span class="k">${k}</span>
        <span class="v" title="${String(v||"")}">${String(v||"")}</span>
      </span>`;
    el.style.display = "flex";
    el.innerHTML = [
      obj.year ? chip("Year", obj.year) : "",
      obj.make ? chip("Make", obj.make) : "",
      obj.model ? chip("Model", obj.model) : "",
      chip("Trim", obj.trim || "—"),
      chip("VIN", (obj.vin||"").toUpperCase(), "vin"),
      obj.hint ? `<span class="decodedHint">${obj.hint}</span>` : ""
    ].filter(Boolean).join("");
  }

  function setAppraisalMode(mode){
    const panel = document.getElementById("aaPanel");
    const m = (mode || "").toLowerCase();
    const isContext = (m === "context");
    if(panel){
      panel.classList.toggle("aaModeContext", isContext);
      panel.classList.toggle("aaModePerformance", !isContext);
    }
  }

  function handleAppraisalLookup(){
    const input = document.getElementById("aaInput");
    const valRaw = (input && input.value ? input.value : "").trim();
    const val = valRaw.toLowerCase();

    // deterministic demo VINs
    if(val.includes("wp0ab2a97ks115693")){
      renderDecodedChips({year:"2019", make:"Porsche", model:"911", trim:"Carrera 4S", vin:"WP0AB2A97KS115693", hint:"Context Mode"});
      setAppraisalMode("context");
      return { mode: "Context Mode", vehicle: "2019 Porsche 911 Carrera 4S" };
    }
    if(val.includes("1ftew1ep5mfa12345") || val.includes("f-150") || val.includes("302a") || val.length === 0){
      renderDecodedChips({year:"2021", make:"Ford", model:"F-150", trim:"XLT 302A", vin:"1FTEW1EP5MFA12345", hint:"Internal History Found"});
      setAppraisalMode("performance");
      return { mode: "Internal History Found", vehicle: "2021 Ford F-150 XLT 302A" };
    }

    // generic VIN capture
    if(/^[a-hj-npr-z0-9]{17}$/i.test(valRaw)){
      renderDecodedChips({trim:"—", vin: valRaw.toUpperCase(), hint:"VIN captured — production decodes Y/M/M/T instantly"});
      setAppraisalMode("context");
      return { mode: "VIN Captured", vehicle: valRaw.toUpperCase() };
    } else {
      renderDecodedChips(null);
      setAppraisalMode("context");
      return { mode: "Context Mode", vehicle: "" };
    }
  }

  function clearAppraisal(){
    const input = document.getElementById("aaInput");
    if(input) input.value = "";
    renderDecodedChips(null);
    setAppraisalMode("performance");
  }

  function showToast(message, detail){
    const el = document.getElementById("oaToast");
    if(!el) return;
    const msg = message || "Analyzed";
    const det = detail ? ` <span class="muted">${detail}</span>` : "";
    el.innerHTML = `${msg}${det}`;
    el.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      el.classList.remove("show");
      setTimeout(()=>{ if(!el.classList.contains("show")) el.style.display = "none"; }, 220);
    }, 1200);
  }


const fmtMoney = (n) => {
    try { return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n); }
    catch(e){ return "$" + Math.round(n).toLocaleString(); }
  };

  // meta
  const upd = $("#meta-updated"); if(upd) upd.textContent = data.meta.updated;
  const store = $("#meta-store"); if(store) store.textContent = data.meta.store;

  // KPIs
  const acq = data.kpis.acquire, stop = data.kpis.stop, cap = data.kpis.capital;

  const elAcqCount = $("#kpi-acquire-count"); if(elAcqCount) elAcqCount.textContent = acq.count;
  const elAcqRisk  = $("#kpi-acquire-atrisk"); if(elAcqRisk) elAcqRisk.textContent = fmtMoney(acq.atRisk);
  const elAcqBadge = $("#kpi-acquire-badge"); if(elAcqBadge) elAcqBadge.textContent = acq.badge;

  const elStopCount = $("#kpi-stop-count"); if(elStopCount) elStopCount.textContent = stop.count;
  const elStopSegs  = $("#kpi-stop-segments"); if(elStopSegs) elStopSegs.textContent = stop.segmentsOver;

  const elCapAmt = $("#kpi-capital-amount"); if(elCapAmt) elCapAmt.textContent = fmtMoney(cap.amount);
  const elCapOff = $("#kpi-capital-offenders"); if(elCapOff) elCapOff.textContent = cap.offenders;

  // Dashboard insights preview: Top 3 only (keeps UI clean)
  const insightList = $(".insightList");
  if(insightList){
    insightList.innerHTML = data.insights.top.slice(0,3).map((i)=>`
      <div class="insightItem">
        <div class="rank">${i.rank}</div>
        <div class="insText">
          <div class="insTitle">${i.title}</div>
          <div class="insSub">${i.tags.map(t=>`<span class="tag">${t}</span>`).join("")}</div>
        </div>
      </div>
    `).join("");
  }

  // Feed
  const feed = $(".feed");
  if(feed){
    feed.innerHTML = data.insights.feed.map((f)=>`
      <div class="feedItem">
        <div class="feedIcon">${f.icon}</div>
        <div class="feedMain">
          <div class="feedTitle">${f.title}</div>
          <div class="feedDesc">${f.desc}</div>
          <div class="feedMeta">
            ${f.meta.map(m=>`<span class="pillMini ${m.includes('$') || m.includes('+') ? 'money':''} ${m.toLowerCase().includes('risk') ? 'risk':''}">${m}</span>`).join("")}
          </div>
        </div>
      </div>
    `).join("");
  }

  // modal
  const modal = $("#oa-modal");
  const modalTitle = $("#oa-modal-title");
  const modalSub = $("#oa-modal-sub");
  const modalBody = $("#oa-modal-body");
  const closeBtn = $("#oa-modal-close");
  const backdrop = $("#oa-modal-backdrop");

  function closeModal(){
    if(modal) modal.style.display = "none";
    if(modalBody) modalBody.innerHTML = "";
    document.body.style.overflow = "";
  }
  if(closeBtn) closeBtn.addEventListener("click", closeModal);
  if(backdrop) backdrop.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e)=>{ if(e.key === "Escape") closeModal(); });

  function openModal({title, sub, bodyHtml}){
    if(!modal) return;
    modalTitle.textContent = title || "Details";
    modalSub.textContent = sub || "";
    modalBody.innerHTML = bodyHtml || "";
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
  }

  function table(headers, rows, opts={}){
    const wrap = !!opts.wrap;
    const noXScroll = !!opts.noXScroll;
    const wrapCols = opts.wrapCols || [];
    const cellStyle = (idx) => {
      if(wrap) return "white-space:normal; word-break:break-word;";
      if(wrapCols.includes(idx)) return "white-space:normal; word-break:break-word;";
      return "white-space:nowrap;";
    };
    const pad = (idx) => idx <= 1 ? "6px 8px" : "10px";

    return `
      <div style="overflow:${noXScroll ? "hidden" : "auto"}; border:1px solid var(--line); border-radius: 16px;">
        <table style="width:100%; border-collapse:collapse; font-size: 12.5px; table-layout: fixed;">
          <colgroup>
            <col style="width:44px" />
            <col style="width:180px" />
            <col />
            <col style="width:90px" />
            <col style="width:70px" />
            <col style="width:95px" />
            <col style="width:120px" />
            <col />
          </colgroup>
          <thead>
            <tr style="background: rgba(15,23,42,.04);">
              ${headers.map((h,idx)=>`<th style="text-align:left; padding:${pad(idx)}; border-bottom:1px solid var(--line); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${h}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${rows.map(r=>`
              <tr>
                ${r.map((c,idx)=>`<td style="padding:${pad(idx)}; border-bottom:1px solid rgba(232,235,242,.8); ${cellStyle(idx)} overflow:hidden; text-overflow:ellipsis;">${c}</td>`).join("")}
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }



  function viewAcquire(){
    const filters = [
      {key:"all", label:"All"},
      {key:"internal", label:"Internal"},
      {key:"auction", label:"Auction"},
      {key:"retail", label:"Retail"}
    ];

    const iconChip = (kind) => {
      if(kind === "Internal") return `<span class="pillMini money" title="Internal sourcing" style="display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(34,197,94,.16);">🏠 Internal</span>`;
      if(kind === "Auction") return `<span class="pillMini" title="Auction sourcing" style="display:inline-flex;align-items:center;gap:6px;">🏁 Auction</span>`;
      if(kind === "Retail") return `<span class="pillMini" title="Retail listings" style="display:inline-flex;align-items:center;gap:6px;">🛰️ Retail</span>`;
      return kind ? `<span class="pillMini">${kind}</span>` : "";
    };

    const build = (filterKey="all") => {
      const list = acq.items.filter(i=>{
        const t = (i.sourceType || "").toLowerCase();
        if(filterKey==="all") return true;
        if(filterKey==="internal") return t==="internal";
        if(filterKey==="auction") return t==="auction";
        if(filterKey==="retail") return t==="retail";
        return true;
      });

      const headers = ["Rank","Vehicle","Why","Avg Edge","Turn","Confidence","Signal","Where to Source"];
      const rows = list.map(i=>[
        i.rank,
        i.vehicle,
        i.reason,
        fmtMoney(i.edge),
        `${i.turnDays}d`,
        i.confidence,
        i.serviceSignal
          ? `<div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
               ${iconChip("Internal")}
               <span class="pillMini money" style="border:1px solid rgba(34,197,94,.16);">${i.serviceSignal}</span>
             </div>`
          : `<div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
               ${iconChip(i.sourceType)}
             </div>`,
        (i.serviceDetail
          ? `<div style="font-weight:900;">${i.source}</div>
             <div style="margin-top:4px; color:rgba(15,23,42,.62); font-size:11px; font-weight:800;">${i.serviceDetail}</div>`
          : (i.source || ""))
      ]);

      return {headers, rows, count:list.length};
    };

    const initial = build("all");

    openModal({
      title: "Acquire Now — Demand Matches",
      sub: `${acq.count} high-confidence profiles • Now with internal + market sourcing`,
      bodyHtml: `
        <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:12px;">
          <span class="pillMini money">At risk: ${fmtMoney(acq.atRisk)}</span>
          <span class="pillMini">Action: buy under guardrails</span>
          <span class="pillMini">Filter by source</span>
        </div>

        <div id="acq-filterbar" style="display:flex; gap:10px; flex-wrap:wrap; align-items:center; margin: 2px 0 12px;">
          ${filters.map(f=>`
            <button data-acq-filter="${f.key}" class="btn" style="padding:8px 10px; box-shadow:none; ${f.key==="all" ? "background: rgba(99,102,241,.10); border-color: rgba(99,102,241,.20); color: rgba(67,56,202,.92);" : ""}">
              ${f.label}
            </button>
          `).join("")}
          <span id="acq-filtercount" class="pillMini" style="margin-left:auto;">Showing: ${initial.count}</span>
        </div>

        <div id="acq-tablewrap">
          ${table(initial.headers, initial.rows, {wrapCols:[1,2], noXScroll:true})}
        </div>

        <div style="margin-top:12px; color: var(--muted); font-size:12px; font-weight:800;">
          Tip: show <b>Internal</b> first to demonstrate “we can source from your service drive,” then switch to <b>Auction</b>/<b>Retail</b>.
        </div>
      `
    });

    const wrap = document.getElementById("acq-tablewrap");
    const countEl = document.getElementById("acq-filtercount");
    const bar = document.getElementById("acq-filterbar");
    if(bar){
      bar.addEventListener("click", (e)=>{
        const btn = e.target.closest("[data-acq-filter]");
        if(!btn) return;
        e.preventDefault();
        const key = btn.getAttribute("data-acq-filter");

        Array.from(bar.querySelectorAll("[data-acq-filter]")).forEach(b=>{
          b.style.background = "rgba(255,255,255,.85)";
          b.style.borderColor = "var(--line)";
          b.style.color = "rgba(15,23,42,.85)";
        });
        btn.style.background = "rgba(99,102,241,.10)";
        btn.style.borderColor = "rgba(99,102,241,.20)";
        btn.style.color = "rgba(67,56,202,.92)";

        const out = build(key);
        if(wrap) wrap.innerHTML = table(out.headers, out.rows);
        if(countEl) countEl.textContent = `Showing: ${out.count}`;
      });
    }
  }

  function viewStop(){
    const headers = ["Segment","Why it’s flagged","On hand","Target Max","Risk"];
    const rows = stop.segments.map(s=>[s.segment, s.why, s.inventoryCount, s.targetMax, s.risk]);
    openModal({
      title: "Stop Buying — Segments to Pause",
      sub: `${stop.segmentsOver} segments oversupplied • Prevent future gross compression`,
      bodyHtml: `
        <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:12px;">
          <span class="pillMini risk">Risk rising</span>
          <span class="pillMini">Goal: stop feeding early</span>
          <span class="pillMini">Watch: days 30–45</span>
        </div>
        ${table(headers, rows)}
      `
    });
  }

  function viewCapital(){
    const headers = ["Stock","Vehicle","Days","Your Price","Market","Gap","Exposure","Recommendation"];
    const rows = cap.units.map(u=>[u.stock, u.vehicle, `${u.days}d`, fmtMoney(u.price), fmtMoney(u.market), fmtMoney(u.gap), fmtMoney(u.exposure), u.recommendation]);
    openModal({
      title: "Expected Gross at Risk — Offenders",
      sub: `${fmtMoney(cap.amount)} exposed • Fix where gross erodes first`,
      bodyHtml: `
        <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:12px;">
          <span class="pillMini money">Exposed: ${fmtMoney(cap.amount)}</span>
          <span class="pillMini">Offenders: ${cap.offenders}</span>
          <span class="pillMini">Principle: focus fixes</span>
        </div>
        ${table(headers, rows)}
      `
    });
  }

  function viewInsights(){
    const top = data.insights.top.slice(0,10).map(i=>`
      <div class="insightItem" style="margin-bottom:10px;">
        <div class="rank">${i.rank}</div>
        <div class="insText">
          <div class="insTitle">${i.title}</div>
          <div class="insSub">${i.tags.map(t=>`<span class="tag">${t}</span>`).join("")}</div>
        </div>
      </div>
    `).join("");

    const feedItems = data.insights.feed.map(f=>`
      <div class="feedItem" style="margin-bottom:10px;">
        <div class="feedIcon">${f.icon}</div>
        <div class="feedMain">
          <div class="feedTitle">${f.title}</div>
          <div class="feedDesc">${f.desc}</div>
          <div class="feedMeta">
            ${f.meta.map(m=>`<span class="pillMini ${m.includes('$') || m.includes('+') ? 'money':''} ${m.toLowerCase().includes('risk') ? 'risk':''}">${m}</span>`).join("")}
          </div>
        </div>
      </div>
    `).join("");

    openModal({ 
      title:"Insights — Top 10 + Action Feed", 
      sub:"Top 3 preview on dashboard • Full Top 10 lives here", 
      bodyHtml: `
        <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:12px;">
          <span class="pillMini">Top 10 insights</span>
          <span class="pillMini">Explainable signals</span>
          <span class="pillMini">No noise</span>
        </div>
        <div style="font-weight:950; margin: 4px 0 10px;">Top 10</div>
        ${top}
        <div style="font-weight:950; margin: 14px 0 10px;">Action Feed</div>
        ${feedItems}
      ` 
    });
  }

  function viewGuardrails(){
    const g = data.appraisalAssist.guardrails;
    openModal({
      title: "Appraisal Guardrails",
      sub: "Context Mode protections (market + peer signals)",
      bodyHtml: `
        <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:12px;">
          <span class="pillMini money">Max Buy: ${fmtMoney(g.maxBuy)}</span>
          <span class="pillMini">Expected Turn: ${g.expectedTurnDays} days</span>
          <span class="pillMini">Recon Buffer: ${fmtMoney(g.reconBuffer)}</span>
        </div>
        <div style="border:1px solid var(--line); border-radius:16px; padding:12px; background: rgba(255,255,255,.92);">
          <div style="font-weight:950; margin-bottom:8px;">Notes</div>
          <ul style="margin:0; padding-left:18px; color: rgba(15,23,42,.78); font-size: 13px; line-height:1.4;">
            ${g.notes.map(n=>`<li style="margin:6px 0;">${n}</li>`).join("")}
          </ul>
        </div>
      `
    });
  }

  function setAppraisalMode(mode){
    const states = $$(".state");
    if(states.length < 2) return;

    if(mode === "performance"){
      states[0].style.opacity = "1";
      states[0].style.outline = "2px solid rgba(34,197,94,.20)";
      states[1].style.opacity = ".55";
      states[1].style.outline = "none";
    } else {
      states[1].style.opacity = "1";
      states[1].style.outline = "2px solid rgba(99,102,241,.18)";
      states[0].style.opacity = ".55";
      states[0].style.outline = "none";
    }

    const confs = $$(".confText");
    const bars = $$(".meter .bar");
    if(confs.length >= 2 && bars.length >= 2){
      confs[0].textContent = data.appraisalAssist.performanceMode.confidencePct + "%";
      bars[0].style.width = data.appraisalAssist.performanceMode.confidencePct + "%";
      confs[1].textContent = data.appraisalAssist.contextMode.confidencePct + "%";
      bars[1].style.width = data.appraisalAssist.contextMode.confidencePct + "%";
    }
  }

  setAppraisalMode("performance");

  function handleAction(action){
    switch(action){
      case "open-acquire": return viewAcquire();
      case "open-stop": return viewStop();
      case "open-capital": return viewCapital();
      case "open-insights": return viewInsights();
      case "open-guardrails": return viewGuardrails();
      case "open-appraisal":
        return openModal({
          title:"Appraisal Assist",
          sub:"Use Analyze on the dashboard to toggle Performance vs Context Mode.",
          bodyHtml:`<div style="color: rgba(15,23,42,.78); font-size: 13px; line-height:1.45;">
            Type a profile in the Appraisal Assist input:
            <ul style="margin:8px 0 0; padding-left:18px;">
              <li><b>F-150</b> = Internal History Found</li>
              <li>Anything else = Context Mode</li>
            </ul>
          </div>`
        });
      case "aa-analyze": { const r = handleAppraisalLookup(); if(r && r.mode){ showToast("Analyzed", r.mode); } else { showToast("Analyzed"); } return; }
      case "aa-clear": { clearAppraisal(); return; }

      default:
        return;
    }
  }

  document.addEventListener("click", (e)=>{
    const t = e.target.closest("[data-action]");
    if(!t) return;
    e.preventDefault();
    handleAction(t.getAttribute("data-action"));
  });
})();
