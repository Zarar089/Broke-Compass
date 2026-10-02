/**
 * The hero compass, made to behave like a real one with a magnet nearby.
 *
 * The needle aligns with the net field acting on it: a constant pull toward
 * north (with the gentle drift of a page being carried), plus a pull toward
 * the cursor that falls off with the cube of distance, as a magnet's does.
 * Far away the cursor does nothing; close in, it takes the needle over.
 *
 * The needle doesn't snap to the field — it's a damped spring, so it swings
 * past, comes back, and settles, the way a needle on a pivot does.
 *
 * Without this script the CSS idle drift in hero.css still runs.
 */
(function(){
  var wrap = document.querySelector('.compass-wrap');
  if (!wrap) return;
  var svg = wrap.querySelector('svg');
  var needle = wrap.querySelector('.needle');
  if (!svg || !needle) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---- Tuning ---------------------------------------------------------- */
  var REACH = 2.6;        // cursor matches north's pull at this many compass radii
  var CUTOFF = 4;         // beyond REACH × CUTOFF, the cursor is ignored outright
  var STIFFNESS = 55;     // how hard the field turns the needle
  var MAX_PULL = 2.5;     // caps stiffness so a close cursor doesn't make it buzz
  var DAMPING = 4.2;      // friction on the pivot; lower swings longer
  var DAMPING_REDUCED = 30; // reduced motion: follows, but never swings past
  var DRIFT_DEG = 3.5;    // idle drift amplitude, matching the CSS animation
  var DRIFT_PERIOD = 9;   // seconds

  var RING = 118 / 300;   // outer ring radius as a share of the SVG's width

  var angle = 0;          // radians, clockwise from north
  var velocity = 0;
  var pointer = null;     // {x, y} in client pixels, or null when absent
  var frame = 0;
  var last = 0;
  var visible = true;

  wrap.classList.add('is-live');   // hands the needle from CSS to this script

  function step(now){
    frame = 0;
    var dt = Math.min((now - (last || now)) / 1000, 1 / 30);
    last = now;

    // North, wandering a few degrees either side.
    var north = reduceMotion.matches ? 0 :
      (DRIFT_DEG * Math.sin(2 * Math.PI * now / 1000 / DRIFT_PERIOD) + 0.5) * Math.PI / 180;
    var fx = Math.sin(north);
    var fy = Math.cos(north);

    // The cursor, as a magnet.
    if (pointer){
      var rect = svg.getBoundingClientRect();
      var dx = pointer.x - (rect.left + rect.width / 2);
      var dy = pointer.y - (rect.top + rect.height / 2);
      var dist = Math.sqrt(dx * dx + dy * dy);
      var reach = rect.width * RING * REACH;
      if (dist > 1 && dist < reach * CUTOFF){
        var pull = Math.pow(reach / Math.max(dist, reach / 4), 3);
        fx += pull * (dx / dist);    // screen y runs down; compass "up" is -y
        fy += pull * (-dy / dist);
      }
    }

    var target = Math.atan2(fx, fy);
    var strength = Math.min(Math.sqrt(fx * fx + fy * fy), MAX_PULL);
    var damping = reduceMotion.matches ? DAMPING_REDUCED : DAMPING;

    // sin() of the offset turns it the short way round and eases near alignment.
    var torque = STIFFNESS * strength * Math.sin(target - angle) - damping * velocity;
    velocity += torque * dt;
    angle += velocity * dt;

    needle.style.transform = 'rotate(' + (angle * 180 / Math.PI).toFixed(2) + 'deg)';

    schedule();
  }

  function schedule(){
    if (!frame && visible) frame = requestAnimationFrame(step);
  }

  function track(e){ pointer = { x:e.clientX, y:e.clientY }; }
  function release(){ pointer = null; }

  window.addEventListener('pointermove', track, { passive:true });
  window.addEventListener('pointerdown', track, { passive:true });
  // A finger lifting is the magnet being taken away; a mouse stays put.
  window.addEventListener('pointerup', function(e){ if (e.pointerType !== 'mouse') release(); });
  window.addEventListener('pointercancel', release);
  document.documentElement.addEventListener('pointerleave', release);
  window.addEventListener('blur', release);

  // No point animating a compass nobody can see.
  if ('IntersectionObserver' in window){
    new IntersectionObserver(function(entries){
      visible = entries[0].isIntersecting;
      if (visible){ last = 0; schedule(); }
      else if (frame){ cancelAnimationFrame(frame); frame = 0; }
    }).observe(wrap);
  }

  schedule();
})();
