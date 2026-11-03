(() => {
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 const mobile=matchMedia('(max-width:760px)');
 const hero=document.querySelector('.scroll-hero'),heroDevice=document.querySelector('.hero-device');
 const showcase=document.querySelector('.scroll-showcase'),storyDevice=document.querySelector('.story-device');
 const steps=[...document.querySelectorAll('.scroll-step')],screens=[...document.querySelectorAll('[data-screen]')],links=[...document.querySelectorAll('[data-step-link]')];
 let frame=0,current=-1;
 const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
 const update=()=>{
  frame=0;
  const viewport=innerHeight;
  const straightening=clamp(scrollY/160,0,1);
  const heroProgress=straightening*straightening*(3-2*straightening);
  if(!preference.matches) {
   const amplitude=mobile.matches?.35:1;
   heroDevice.style.transform=`perspective(1200px) rotateY(${-15*(1-heroProgress)*amplitude}deg) rotateX(${5*(1-heroProgress)*amplitude}deg) rotateZ(${3*(1-heroProgress)*amplitude}deg)`;
  }else heroDevice.style.transform='none';
  let nearest=0,distance=Infinity;
  steps.forEach((step,index)=>{
   const rect=step.getBoundingClientRect();const d=Math.abs(rect.top+rect.height*.5-viewport*.5);
   if(d<distance){distance=d;nearest=index;}
  });
  if(nearest!==current) {
   current=nearest;
   screens.forEach((screen,index)=>{screen.classList.toggle('is-active',index===current);screen.setAttribute('aria-hidden',String(index!==current));});
   links.forEach((link,index)=>{if(index===current)link.setAttribute('aria-current','step');else link.removeAttribute('aria-current');});
   showcase.dataset.activeStep=String(current);
  }
  // One complete symmetric cycle across the sticky range: left, center, right, center.
  // The same scroll distance is allocated to each side, with no lateral translation.
  if(!mobile.matches&&!preference.matches) {
   const rect=showcase.getBoundingClientRect();
   const progress=clamp(-rect.top/Math.max(1,rect.height-viewport),0,1);
   const tilt=-Math.sin(progress*Math.PI*2)*5;
   storyDevice.style.transform=`perspective(1200px) rotateY(${tilt}deg)`;
  }else storyDevice.style.transform='none';
 };
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
 preference.addEventListener('change',schedule);mobile.addEventListener('change',schedule);

 // A shared reveal rhythm carries the product walkthrough into the rest of the page.
 // Animate on entry without ever hiding content in CSS or depending on JS to read it.
 const animations=new Set();
 const play=(element,frames,options={})=>{
  if(preference.matches||!element.animate)return;
  const animation=element.animate(frames,{duration:580,easing:'cubic-bezier(.2,.65,.3,1)',...options});
  animations.add(animation);animation.finished.then(()=>animations.delete(animation),()=>animations.delete(animation));
 };
 if('IntersectionObserver' in window) {
  const targets=[
   ...document.querySelectorAll('.counselor-visual,.counselor-feature > div:last-child,.schools-heading,.schools-grid,.creator-note,.closing,.home-support')
  ];
  const observer=new IntersectionObserver(entries=>{
   entries.forEach(entry=>{
    if(!entry.isIntersecting)return;observer.unobserve(entry.target);
    if(entry.boundingClientRect.bottom<0)return;
    if(entry.target.matches('.schools-grid')) {
     // One horizontal shelf enters as a unit, without bounce, scale, or stagger.
     play(entry.target,[
      {opacity:.4,transform:'translateX(34px)'},
      {opacity:1,transform:'translateX(0)'}
     ],{duration:780,easing:'cubic-bezier(.16,1,.3,1)'});
    }else if(entry.target.matches('.creator-note')) {
     // The entire note stays together; no paragraph-by-paragraph movement.
     play(entry.target,[{opacity:.65},{opacity:1}],{duration:450});
    }else {
     play(entry.target,[{opacity:.25,transform:'translateY(22px)'},{opacity:1,transform:'translateY(0)'}]);
    }
    if(entry.target.matches('.counselor-visual')&&!preference.matches) {
     entry.target.querySelectorAll('svg path,svg circle').forEach((path,index)=>{
      const length=path.getTotalLength();
      play(path,[{strokeDasharray:`${length} ${length}`,strokeDashoffset:length},{strokeDasharray:`${length} ${length}`,strokeDashoffset:0}],{duration:850,delay:100+index*45});
     });
    }
   });
  },{threshold:.12,rootMargin:'0px 0px -35px 0px'});
  targets.forEach(target=>observer.observe(target));
 }
 preference.addEventListener('change',()=>{if(preference.matches){animations.forEach(animation=>animation.cancel());animations.clear();}});
 schedule();
})();
