(function () {
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var canvas = document.getElementById("mist");
  if (canvas) {
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w, h;
    var resize = function () {
      w = canvas.offsetWidth; h = canvas.offsetHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    var blobs = [
      { x: 0.30, y: 0.42, r: 0.55, c: "62,158,140", a: 0.07, sx: 0.00016, sy: 0.00011, p: 0 },
      { x: 0.72, y: 0.30, r: 0.45, c: "196,122,28", a: 0.05, sx: 0.00012, sy: 0.00017, p: 2 },
      { x: 0.55, y: 0.75, r: 0.60, c: "62,158,140", a: 0.05, sx: 0.00010, sy: 0.00013, p: 4 }
    ];
    var frame = function (t) {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < blobs.length; i++) {
        var b = blobs[i];
        var bx = (b.x + 0.10 * Math.sin(t * b.sx + b.p)) * w;
        var by = (b.y + 0.08 * Math.cos(t * b.sy + b.p)) * h;
        var br = b.r * Math.min(w, h) * (1 + 0.06 * Math.sin(t * 0.0002 + b.p));
        var g = ctx.createRadialGradient(bx, by, 0, bx, by, br);
        g.addColorStop(0, "rgba(" + b.c + "," + b.a + ")");
        g.addColorStop(1, "rgba(" + b.c + ",0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
      if (!reduced) requestAnimationFrame(frame);
    };
    frame(reduced ? 6000 : 0);
  }

  // threshold is a fraction of the *target's own* height, not the viewport —
  // a tall element (e.g. a full blog post body) can be taller than
  // viewport_height / threshold, making that fraction mathematically
  // unreachable while scrolling and leaving it stuck at opacity:0 forever.
  // Shorter viewports (mobile Safari, especially with its address bar) hit
  // this first. threshold: 0 fires as soon as any part is visible, which
  // has no such ceiling.
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0, rootMargin: "0px 0px -10% 0px" });
  document.querySelectorAll(".reveal, .rule").forEach(function (el) { io.observe(el); });

  var card = document.getElementById("tiltcard");
  if (card && window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reduced) {
    var scene = card.parentElement;
    scene.addEventListener("mousemove", function (e) {
      var r = scene.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      card.style.animation = "none";
      card.style.transform = "rotate(-1.6deg) rotateY(" + (px * 10) + "deg) rotateX(" + (-py * 8) + "deg)";
    });
    scene.addEventListener("mouseleave", function () {
      card.style.transform = "";
      card.style.animation = "";
    });
  }

  // Rotating prompt/koan widget (homepage) — brief-koans-qigong-rotating-
  // prompt.md: "rotates on page load," random is fine, small refresh
  // button to cycle without reloading. Label swaps to match what's
  // actually shown rather than one generic label for both content types.
  var promptDataEl = document.getElementById("quiet-prompt-data");
  if (promptDataEl) {
    var promptItems = JSON.parse(promptDataEl.textContent || "[]");
    var promptLabelEl = document.getElementById("quiet-prompt-label");
    var promptTextEl = document.getElementById("quiet-prompt-text");
    var promptRefreshBtn = document.getElementById("quiet-prompt-refresh");
    var lastIndex = -1;
    var showRandomItem = function () {
      if (!promptItems.length) return;
      var i = Math.floor(Math.random() * promptItems.length);
      if (promptItems.length > 1 && i === lastIndex) {
        i = (i + 1) % promptItems.length;
      }
      lastIndex = i;
      var item = promptItems[i];
      promptLabelEl.textContent = item.type === "koan" ? "Sit With This" : "Today's Prompt";
      promptTextEl.textContent = item.attribution ? item.text + " — " + item.attribution : item.text;
    };
    showRandomItem();
    if (promptRefreshBtn) promptRefreshBtn.addEventListener("click", showRandomItem);
  }
})();
