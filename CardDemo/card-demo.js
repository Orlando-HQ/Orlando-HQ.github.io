document.addEventListener('DOMContentLoaded', function(){
  const card = document.getElementById('card-demo');
  if(!card) return;

  // Assumed media paths (present in Media/):
  // Media/card_front.jpg, Media/card_back.jpg, Media/grain.webp, Media/glitter.png

  // Ensure CSS vars for grain/glitter point to CardDemo/IMGs
  card.style.setProperty('--grain-url', "url('IMGs/grain.webp')");
  card.style.setProperty('--glitter-url', "url('IMGs/glitter.png')");

  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  let targetScale = 1, currentScale = 1;

  function onPointerMove(e, isTouch = false){
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0..1
    const y = (e.clientY - rect.top) / rect.height; // 0..1
    // unified sensitivity for both desktop and mobile
    const sensitivity = 1.8;
    // center at 0, range -0.5..0.5, then apply sensitivity
    targetX = (x - 0.5) * sensitivity;
    targetY = (y - 0.5) * sensitivity;
    // make sure interacting state is set
    card.classList.add('interacting');
    targetScale = 1.03;
  }

  // update CSS variables for holo layers (percentages and distance)
  function updatePointerVars(e){
    const rect = card.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    const dx = (px - 50) / 50;
    const dy = (py - 50) / 50;
    const dist = Math.min(1, Math.sqrt(dx*dx + dy*dy));
    card.style.setProperty('--pointer-x', px.toFixed(2) + '%');
    card.style.setProperty('--pointer-y', py.toFixed(2) + '%');
    card.style.setProperty('--background-x', px.toFixed(2) + '%');
    card.style.setProperty('--background-y', py.toFixed(2) + '%');
    card.style.setProperty('--pointer-from-center', dist.toFixed(3));
    // modulate overall card holo opacity from distance
    const cardOpacity = (1 - dist * 0.7);
    card.style.setProperty('--card-opacity', Math.max(0, Math.min(1, cardOpacity)).toFixed(3));
  }

  function onPointerLeave(){
    targetX = 0; targetY = 0; targetScale = 1; card.classList.remove('interacting');
  }

  card.addEventListener('pointermove', onPointerMove);
  card.addEventListener('pointermove', (e)=> updatePointerVars(e));
  card.addEventListener('pointerenter', (e)=>{ card.setPointerCapture && card.setPointerCapture(e.pointerId); targetScale = 1.03; });
  card.addEventListener('pointerleave', onPointerLeave);
  // prevent default scrolling when interacting by touch and update pointer
  card.addEventListener('touchmove', function(e){
    e.preventDefault();
    onPointerMove(e.touches ? e.touches[0] : e, true);
  }, {passive: false});

  // flip on click / tap
  card.addEventListener('click', ()=>{
    card.classList.toggle('flipped');
  });

  // simple animation loop with easing
  function lerp(a,b,t){return a + (b-a)*t}
  function animate(){
    currentX = lerp(currentX, targetX, 0.12);
    currentY = lerp(currentY, targetY, 0.12);
    currentScale = lerp(currentScale, targetScale, 0.12);

    const rotateY = (currentX) * 22; // degrees
    const rotateX = -(currentY) * 14; // degrees

    card.style.setProperty('--rotate-x', rotateX.toFixed(2) + 'deg');
    card.style.setProperty('--rotate-y', rotateY.toFixed(2) + 'deg');
    card.style.setProperty('--card-scale', currentScale.toFixed(3));
    // small rotation delta used by holo shaders to vary scanline orientation
    const rotateDelta = (targetX - currentX) * 22;
    card.style.setProperty('--rotate-delta', rotateDelta.toFixed(2) + 'deg');

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
});
