// =============================================================
// OUTCOME AI — V1 CLICKABLE DEMO DATA (REPRESENTATIVE)
// -------------------------------------------------------------
// This file contains representative demo data used to validate the
// UI and demo narrative. It is NOT live dealer data.
// Replace this with real dealer data only after contracting and
// establishing permissions and data handling requirements.
// =============================================================

window.OUTCOME_DEMO = {
  "meta": {
    "updated": "Updated: 2 min ago",
    "store": "Store: Ford \u2022 60 units",
    "live": false
  },
  "kpis": {
    "acquire": {
      "badge": "\u2191 12% week",
      "count": 7,
      "atRisk": 1300,
      "items": [
        {
          "rank": 1,
          "vehicle": "2021 Ford F-150 XLT 302A",
          "reason": "Repeatable gross + fast turn vs peers",
          "edge": 2900,
          "turnDays": 21,
          "confidence": "High",
          "source": "Service Drive \u2014 RO closed 4 days ago",
          "sourceType": "Internal",
          "serviceSignal": "Just in Service",
          "serviceDetail": "RO closed 4 days ago \u2022 R/O #88421"
        },
        {
          "rank": 2,
          "vehicle": "2020 Ford Explorer XLT",
          "reason": "Strong demand pocket in your market",
          "edge": 1700,
          "turnDays": 24,
          "confidence": "Medium",
          "source": "In Service \u2014 Open RO (Day 2)",
          "sourceType": "Internal",
          "serviceSignal": "Currently in Service",
          "serviceDetail": "Open RO (Day 2) \u2022 R/O #88702"
        },
        {
          "rank": 3,
          "vehicle": "2022 Ford Bronco Big Bend",
          "reason": "Supply tight; buyer urgency high",
          "edge": 2400,
          "turnDays": 18,
          "confidence": "High",
          "source": "Scheduled Service \u2014 Jan 15 appointment",
          "sourceType": "Internal",
          "serviceSignal": "Scheduled for Service",
          "serviceDetail": "Appt Jan 15 \u2022 9:20 AM \u2022 Xtime"
        },
        {
          "rank": 4,
          "vehicle": "2021 Ford Edge SEL",
          "reason": "Your store exits faster than peer average",
          "edge": 900,
          "turnDays": 26,
          "confidence": "Medium",
          "source": "Pipeline \u2014 Equity event likely (next 60 days)",
          "sourceType": "Internal",
          "serviceSignal": "Pipeline Opportunity",
          "serviceDetail": "Equity event likely (next 60 days) \u2022 High likelihood"
        },
        {
          "rank": 5,
          "vehicle": "2020 Ford Ranger XLT",
          "reason": "High auction liquidity; fast exit pattern",
          "edge": 1200,
          "turnDays": 22,
          "confidence": "Medium",
          "source": "ADESA Kansas City \u2014 Listing watch",
          "sourceType": "Auction"
        },
        {
          "rank": 6,
          "vehicle": "2021 Jeep Wrangler Unlimited Sport",
          "reason": "Cross-brand demand profile",
          "edge": 1600,
          "turnDays": 19,
          "confidence": "High",
          "source": "CarGurus \u2014 Price drops signal",
          "sourceType": "Retail"
        },
        {
          "rank": 7,
          "vehicle": "2021 Toyota 4Runner SR5",
          "reason": "Always-liquid profile; high gross protection",
          "edge": 2100,
          "turnDays": 20,
          "confidence": "High",
          "source": "Manheim KC \u2014 Lane C \u2022 Run 88",
          "sourceType": "Auction"
        }
      ]
    },
    "stop": {
      "badge": "\u2191 risk",
      "count": 30,
      "segmentsOver": 2,
      "segments": [
        {
          "segment": "Explorer XLT (2019\u20132021)",
          "why": "Oversupply building; gross compresses after 30\u201345 days",
          "inventoryCount": 11,
          "targetMax": 6,
          "risk": "High"
        },
        {
          "segment": "Escape SE (2018\u20132020)",
          "why": "Market supply expanding; price cuts required to move",
          "inventoryCount": 9,
          "targetMax": 5,
          "risk": "Medium"
        }
      ]
    },
    "capital": {
      "badge": "quiet leak",
      "amount": 9800,
      "offenders": 2,
      "units": [
        {
          "stock": "P24103",
          "vehicle": "2020 Ford Explorer Limited",
          "days": 52,
          "price": 31980,
          "market": 30100,
          "gap": 1880,
          "exposure": 4200,
          "recommendation": "Price cut + re-merch; resolve in 7\u201310 days"
        },
        {
          "stock": "P24071",
          "vehicle": "2019 Ford F-150 Lariat",
          "days": 61,
          "price": 39995,
          "market": 37250,
          "gap": 2745,
          "exposure": 5600,
          "recommendation": "Reprice + wholesale trigger at day 68"
        }
      ]
    }
  },
  "insights": {
    "top": [
      {
        "rank": 1,
        "title": "You make ~$1,850 more on 2021\u20132023 F-150 XLTs under 42k miles when they retail inside 32 days.",
        "tags": [
          "Guardrail: < 42k mi",
          "Target: 32-day turn"
        ],
        "type": "Acquire"
      },
      {
        "rank": 2,
        "title": "Explorer XLT supply is building \u2014 once you\u2019re over 6 units, gross compresses inside 45 days.",
        "tags": [
          "Target max: 6",
          "Aging cliff: 30\u201345"
        ],
        "type": "Stop"
      },
      {
        "rank": 3,
        "title": "Your capital risk is concentrated: 2 units represent ~40% of exposure.",
        "tags": [
          "Fix first",
          "Protect gross"
        ],
        "type": "Capital"
      },
      {
        "rank": 4,
        "title": "Ranger XLTs sourced at Manheim KC are exiting ~6 days faster than retail-acquired units.",
        "tags": [
          "Source matters",
          "Faster exits"
        ],
        "type": "Acquire"
      },
      {
        "rank": 5,
        "title": "Escape SE price drift accelerates after day 28 \u2014 expect cuts to move the unit.",
        "tags": [
          "Reprice early",
          "Avoid day-45"
        ],
        "type": "Stop"
      },
      {
        "rank": 6,
        "title": "Wrangler demand stays resilient \u2014 when bought under your max-buy guardrail, your downside shrinks.",
        "tags": [
          "High confidence",
          "Downside control"
        ],
        "type": "Acquire"
      },
      {
        "rank": 7,
        "title": "Edge SEL is stable \u2014 you can buy selectively, but don\u2019t overfeed the segment.",
        "tags": [
          "Selective buy",
          "Watch supply"
        ],
        "type": "Watch"
      },
      {
        "rank": 8,
        "title": "F-150 Lariat risk widens after day 55 \u2014 wholesale trigger at day 68 protects margin.",
        "tags": [
          "Day 55 inflection",
          "Day 68 trigger"
        ],
        "type": "Capital"
      },
      {
        "rank": 9,
        "title": "Bronco supply is tight locally \u2014 the buy window is closing inside 7\u201310 days.",
        "tags": [
          "Low supply",
          "Buy window"
        ],
        "type": "Acquire"
      },
      {
        "rank": 10,
        "title": "Explorer Limited hits an aging cliff at day 60 \u2014 market gap widens fast after that.",
        "tags": [
          "Day 60 cliff",
          "Gap widening"
        ],
        "type": "Capital"
      }
    ],
    "feed": [
      {
        "icon": "\u26a1",
        "title": "F-150 XLT guardrail is real: buy <42k miles, retail <32 days, +$1,850 avg edge.",
        "desc": "Outcome isn\u2019t predicting the market \u2014 it\u2019s showing what your store repeatedly wins on, and the guardrails that protect the win.",
        "meta": [
          "+$1,850 avg edge",
          "Guardrail: <42k mi",
          "Target: <32 days",
          "Confidence: High"
        ]
      },
      {
        "icon": "\u26d4",
        "title": "Stop feeding Explorer XLT once you\u2019re above 6 units \u2014 gross compresses inside 45 days.",
        "desc": "Outcome flags segments before the pain shows up in end-of-month reports. This is the early warning you normally don\u2019t get.",
        "meta": [
          "Target max: 6",
          "Aging cliff: 30\u201345 days",
          "Confidence: Medium"
        ]
      },
      {
        "icon": "\ud83d\udcb0",
        "title": "2 offenders are driving most exposure \u2014 fix them first and stop the leak.",
        "desc": "Outcome focuses attention where it matters: not the oldest units, the units where gross erodes first.",
        "meta": [
          "Exposure concentrated",
          "2 offenders",
          "Confidence: High"
        ]
      }
    ]
  },
  "appraisalAssist": {
    "performanceMode": {
      "repeatableGross": 2900,
      "confidencePct": 68
    },
    "contextMode": {
      "confidencePct": 54
    },
    "guardrails": {
      "maxBuy": 31250,
      "expectedTurnDays": "18\u201328",
      "reconBuffer": 1200,
      "notes": [
        "Guardrails protect gross first \u2014 they do not chase volume.",
        "Confidence increases when internal history exists and market supply is tight."
      ]
    },
    "demoVINs": {
      "internalHistory": {
        "vin": "1FTEW1EP5MFA12345",
        "label": "2021 Ford F-150 XLT 302A"
      },
      "contextMode": {
        "vin": "WP0AB2A97KS115693",
        "label": "2019 Porsche 911 Carrera 4S"
      }
    }
  }
};
