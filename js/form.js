// Renders window.FORM, keeps a draft in this browser, and sends the answers through Web3Forms.
(() => {
  const F = window.FORM;
  const STORE = "idamho-consulta-v1";
  const $ = (sel, el = document) => el.querySelector(sel);

  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (const k of kids.flat()) if (k != null && k !== false) el.append(k instanceof Node ? k : document.createTextNode(k));
    return el;
  }

  // ---------- draft storage (per-viewer convenience only; the page works without it) ----------
  function loadDraft() { try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch { return {}; } }
  function saveDraft() { try { localStorage.setItem(STORE, JSON.stringify(collect())); } catch {} }

  // ---------- render ----------
  const form = $("#form");
  const questions = F.sections.flatMap((s) => s.questions);
  let qNumber = 0;

  $("#intro").append(
    h("h1", null, F.intro.heading),
    ...F.intro.paragraphs.map((p) => h("p", null, p)),
    h("p", { class: "signature" }, F.intro.signature),
    h("p", { class: "note" }, F.intro.note),
  );
  $("#by").textContent = F.meta.by;

  for (const sec of F.sections) {
    const box = h("section", { class: "section" }, h("h2", null, sec.title), sec.intro ? h("p", { class: "section-intro" }, sec.intro) : null);
    for (const q of sec.questions) box.append(renderQuestion(q, ++qNumber));
    form.append(box);
  }

  const c = F.contact;
  form.append(h("section", { class: "section section-contact" },
    h("h2", null, c.title),
    h("div", { class: "field" }, h("label", { for: "nombre" }, c.nameLabel), h("input", { id: "nombre", name: "nombre", type: "text", autocomplete: "name", required: true })),
    h("div", { class: "field" }, h("label", { for: "correo" }, c.emailLabel), h("input", { id: "correo", name: "correo", type: "email", autocomplete: "email", "aria-describedby": "correo-help" }),
      h("p", { class: "help", id: "correo-help" }, c.emailHelp)),
    // honeypot for spam bots (Web3Forms convention); hidden from people and screen readers
    h("input", { type: "checkbox", name: "botcheck", class: "hp", tabindex: "-1", "aria-hidden": "true" }),
    h("p", { class: "privacy" }, F.send.privacy),
    h("p", { class: "status", id: "status", role: "status", "aria-live": "polite" }),
    h("div", { class: "actions" },
      h("button", { type: "submit", class: "btn", id: "send" }, F.send.button),
      h("button", { type: "button", class: "btn-quiet", id: "download", onclick: download }, F.send.download)),
  ));

  function renderQuestion(q, n) {
    const id = `q-${q.id}`;
    const num = h("span", { class: "q-num", "aria-hidden": "true" }, String(n));
    const help = q.help ? h("p", { class: "help", id: `${id}-help` }, q.help) : null;

    if (q.type === "text" || q.type === "long") {
      const input = q.type === "text"
        ? h("input", { id, name: q.id, type: "text", placeholder: q.placeholder || null })
        : h("textarea", { id, name: q.id, rows: 3, placeholder: q.placeholder || null });
      return h("div", { class: "q", "data-q": q.id }, h("label", { class: "q-label", for: id }, num, q.label), help, input);
    }

    const fs = h("fieldset", { class: `q q-${q.type}`, "data-q": q.id, "aria-describedby": help ? `${id}-help` : null },
      h("legend", { class: "q-label" }, num, q.label), help);

    if (q.type === "choice" || q.type === "multi") {
      const kind = q.type === "choice" ? "radio" : "checkbox";
      const list = h("div", { class: "chips" });
      q.options.forEach((opt, i) => {
        const oid = `${id}-${i}`;
        list.append(h("label", { class: "chip", for: oid }, h("input", { id: oid, type: kind, name: q.id, value: opt }), h("span", null, opt)));
      });
      fs.append(list);
      if (q.other) fs.append(h("div", { class: "other" }, h("label", { for: `${id}-other` }, q.other),
        h("input", { id: `${id}-other`, name: `${q.id}__otro`, type: "text", placeholder: F.otherPlaceholder })));
      if (q.max) fs.append(h("p", { class: "limit", id: `${id}-limit`, "aria-live": "polite" }));
    }

    if (q.type === "words") {
      fs.append(h("div", { class: "words" }, ...q.placeholders.map((p, i) =>
        h("input", { type: "text", name: `${q.id}__${i}`, placeholder: p, "aria-label": `${q.label} (${i + 1})` }))));
    }

    if (q.type === "rating") {
      const table = h("div", { class: "rating", role: "presentation" });
      for (const item of q.items) {
        const name = `${q.id}__${item.id}`;
        const row = h("fieldset", { class: "rating-row" }, h("legend", null, item.text));
        const opts = h("div", { class: "rating-opts" });
        q.scale.forEach((s, i) => {
          const oid = `${id}-${item.id}-${i}`;
          opts.append(h("label", { class: "chip chip-sm", for: oid }, h("input", { id: oid, type: "radio", name, value: s }), h("span", null, s)));
        });
        row.append(opts);
        table.append(row);
      }
      fs.append(table);
      if (q.other) fs.append(h("div", { class: "other" }, h("label", { for: `${id}-other` }, q.other),
        h("textarea", { id: `${id}-other`, name: `${q.id}__otro`, rows: 2, placeholder: F.otherPlaceholder })));
    }

    if (q.type === "sites") {
      const list = h("div", { class: "sites" });
      const add = h("button", { type: "button", class: "btn-link add-site" }, `+ ${q.addLabel}`);
      const addRow = (vals = {}) => {
        const k = list.children.length;
        if (k >= q.max) return;
        const row = h("div", { class: "site" },
          h("div", { class: "field" }, h("label", { for: `${id}-u${k}` }, `${q.urlLabel} ${k + 1}`),
            h("input", { id: `${id}-u${k}`, name: `${q.id}__url`, type: "url", inputmode: "url", placeholder: q.urlPlaceholder, value: vals.url || null })),
          h("div", { class: "field" }, h("label", { for: `${id}-l${k}` }, q.likeLabel),
            h("textarea", { id: `${id}-l${k}`, name: `${q.id}__like`, rows: 2, placeholder: q.likePlaceholder }, vals.like || "")),
          k > 0 ? h("button", { type: "button", class: "btn-link remove", onclick: () => { row.remove(); renumber(); update(); } }, q.removeLabel) : null,
        );
        list.append(row);
        add.hidden = list.children.length >= q.max;
      };
      const renumber = () => [...list.children].forEach((r, i) => { r.querySelector("label").textContent = `${q.urlLabel} ${i + 1}`; });
      add.addEventListener("click", () => { addRow(); list.lastElementChild.querySelector("input").focus(); update(); });
      fs.append(list, add);
      fs._addRow = addRow;
      fs._list = list;
      fs._add = add;
    }
    return fs;
  }

  // ---------- read answers ----------
  function collect() {
    const data = {};
    const fd = new FormData(form);
    for (const [k, v] of fd.entries()) {
      if (k === "botcheck") continue;
      (data[k] ||= []).push(String(v).trim());
    }
    return data;
  }

  function answered(q, d) {
    const has = (k) => (d[k] || []).some(Boolean);
    if (q.type === "words") return q.placeholders.some((_, i) => has(`${q.id}__${i}`));
    if (q.type === "rating") return q.items.some((it) => has(`${q.id}__${it.id}`)) || has(`${q.id}__otro`);
    if (q.type === "sites") return has(`${q.id}__url`) || has(`${q.id}__like`);
    return has(q.id) || has(`${q.id}__otro`);
  }

  /** Plain-text version of all answers, used for the email and the downloaded copy. */
  function summary() {
    const d = collect();
    const out = [F.meta.title, "", `${F.contact.nameLabel}: ${(d.nombre || [""])[0]}`, `${F.contact.emailLabel}: ${(d.correo || [""])[0]}`, ""];
    let n = 0;
    for (const sec of F.sections) {
      out.push(`== ${sec.title}`);
      for (const q of sec.questions) {
        n++;
        out.push(`${n}. ${q.label}`);
        const v = (k) => (d[k] || []).filter(Boolean);
        if (q.type === "words") out.push("   " + (q.placeholders.map((_, i) => v(`${q.id}__${i}`)[0]).filter(Boolean).join(", ") || "—"));
        else if (q.type === "rating") {
          for (const it of q.items) out.push(`   - ${it.text} → ${v(`${q.id}__${it.id}`)[0] || "—"}`);
          if (v(`${q.id}__otro`).length) out.push(`   Otra idea: ${v(`${q.id}__otro`)[0]}`);
        } else if (q.type === "sites") {
          const urls = d[`${q.id}__url`] || [], likes = d[`${q.id}__like`] || [];
          const rows = urls.map((u, i) => [u, likes[i]]).filter(([u, l]) => u || l);
          if (!rows.length) out.push("   —");
          rows.forEach(([u, l], i) => out.push(`   ${i + 1}) ${u || "(sin enlace)"}${l ? "\n      " + l : ""}`));
        } else {
          const vals = v(q.id);
          const other = v(`${q.id}__otro`);
          out.push("   " + ([...vals, ...other.map((o) => `Otro: ${o}`)].join("; ") || "—"));
        }
      }
      out.push("");
    }
    return out.join("\n");
  }

  // ---------- progress, limits, draft ----------
  const progress = $("#progress");
  const bar = $("#bar");
  function update() {
    const d = collect();
    const done = questions.filter((q) => answered(q, d)).length;
    progress.textContent = F.progress(done, questions.length);
    bar.style.transform = `scaleX(${done / questions.length})`;
    for (const q of questions.filter((q) => q.max && q.type === "multi")) {
      const boxes = [...form.querySelectorAll(`input[name="${q.id}"]`)];
      const n = boxes.filter((b) => b.checked).length;
      boxes.forEach((b) => { b.disabled = !b.checked && n >= q.max; b.closest(".chip").classList.toggle("is-off", b.disabled); });
      $(`#q-${q.id}-limit`).textContent = n >= q.max ? F.maxReached(q.max) : "";
    }
    saveDraft();
  }

  function restore() {
    const d = loadDraft();
    const sitesQ = questions.find((q) => q.type === "sites");
    const sitesFs = form.querySelector(`[data-q="${sitesQ.id}"]`);
    const urls = d[`${sitesQ.id}__url`] || [""];
    const likes = d[`${sitesQ.id}__like`] || [];
    urls.forEach((u, i) => sitesFs._addRow({ url: u, like: likes[i] || "" }));
    for (const [k, vals] of Object.entries(d)) {
      if (k.startsWith(`${sitesQ.id}__`)) continue;
      const els = [...form.querySelectorAll(`[name="${CSS.escape(k)}"]`)];
      if (!els.length) continue;
      if (els[0].type === "checkbox" || els[0].type === "radio") els.forEach((el) => { el.checked = vals.includes(el.value); });
      else els.forEach((el, i) => { if (vals[i] != null) el.value = vals[i]; });
    }
  }

  // ---------- send ----------
  const status = $("#status");
  async function send(ev) {
    ev.preventDefault();
    const d = collect();
    const name = (d.nombre || [""])[0];
    if (!name) { status.textContent = F.send.needName; status.className = "status is-error"; $("#nombre").focus(); return; }
    if (form.querySelector('[name="botcheck"]').checked) return;
    const btn = $("#send");
    btn.disabled = true; btn.textContent = F.send.sending;
    status.textContent = ""; status.className = "status";
    try {
      const res = await fetch(F.send.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: F.send.accessKey, subject: F.send.subject, from_name: F.send.fromName,
          name, email: (d.correo || [""])[0] || undefined, message: summary(),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) throw new Error(json.message || res.status);
      $("#done").hidden = false;
      $("main").hidden = true;
      $("#done").focus();
      window.scrollTo({ top: 0, behavior: "auto" });
    } catch (err) {
      console.error(err);
      status.textContent = F.send.errorText; status.className = "status is-error";
      btn.disabled = false; btn.textContent = F.send.button;
    }
  }

  function download() {
    const blob = new Blob([summary()], { type: "text/plain;charset=utf-8" });
    const a = h("a", { href: URL.createObjectURL(blob), download: F.send.fileName });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  $("#done").append(h("h2", null, F.send.successTitle), h("p", null, F.send.successText),
    h("button", { type: "button", class: "btn-quiet", onclick: download }, F.send.download));

  restore();
  form.addEventListener("input", update);
  form.addEventListener("change", update);
  form.addEventListener("submit", send);
  update();
  window.__summary = summary; // handy for checking the email text in the browser console
})();
