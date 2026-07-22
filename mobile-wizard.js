// ── MOBILE WIZARD ──
// Step-by-step tap-through flow. Reuses card-app.js's state and functions verbatim —
// this file only adds mobile-specific navigation chrome and a few "mirror" render
// helpers for pieces of the UI that only exist on the (here, off-screen) card.
const STEPS=[
  {id:'basics',label:'Basics'},
  {id:'background',label:'Background Art'},
  {id:'class-base',label:'1st Class'},
  {id:'class-second',label:'2nd Class'},
  {id:'class-third',label:'3rd Class'},
  {id:'class-paragon',label:'Paragon'},
  {id:'paragon-skill-tree',label:'Paragon Skill Tree'},
  {id:'mounts',label:'Mount'},
  {id:'companion-fairy',label:'Companion & Fairy'},
  {id:'traits',label:'Trait Combo'},
  {id:'equipment',label:'Equipment Sets'},
  {id:'runes-virtues',label:'Runes & Virtues'},
  {id:'stats',label:'Stats Allocation'},
  {id:'review',label:'Review & Export'},
];
let curStep=0;

function stepValid(i){
  const id=STEPS[i].id;
  if(id==='class-base') return !!classPick.base;
  if(id==='class-second') return !!classPick.second;
  if(id==='class-third') return !!classPick.third;
  if(id==='class-paragon') return !!classPick.paragon;
  return true;
}

function goToStep(i){
  if(i<0||i>=STEPS.length) return;
  curStep=i;
  document.querySelectorAll('.step').forEach(el=>el.classList.toggle('active',el.dataset.step===STEPS[i].id));
  document.getElementById('wiz-title').textContent=STEPS[i].label;
  document.getElementById('wiz-step-label').textContent=`Step ${i+1} of ${STEPS.length}`;
  document.getElementById('wiz-progress-bar').style.width=(100*(i+1)/STEPS.length)+'%';
  document.getElementById('wiz-back').disabled=i===0;
  document.getElementById('wiz-next').style.display=STEPS[i].id==='review'?'none':'';
  onStepEnter(STEPS[i].id);
  document.getElementById('ctrl').scrollTop=0;
  window.scrollTo(0,0);
}
function nextStep(){
  if(!stepValid(curStep)){alert('Pick an option before continuing.');return;}
  goToStep(curStep+1);
}
function prevStep(){goToStep(curStep-1);}

function onStepEnter(id){
  if(id==='paragon-skill-tree') renderMobileParagonTree();
  if(id==='mounts') syncMobileMountLabels();
  if(id==='equipment') renderMobileSets();
  if(id==='runes-virtues') renderMobileRunesVirtues();
}

// ── Paragon Skill Tree (new mobile-only UI — no desktop sidebar equivalent) ──
function renderMobileParagonTree(){
  const el=document.getElementById('pst-body');
  if(!el) return;
  if(!classPick.paragon){el.innerHTML='<div class="pst-empty">Pick a Paragon (4th class) first.</div>';return;}
  const row4Name=ROW4_BY_SECOND[classPick.second];
  const row6Name=ROW6_BY_THIRD[classPick.third];
  const sections=[
    {label:'Row 1 — Starting Skill (auto-granted)',row:'row1',fixed:true,items:[ROW1_BY_PARAGON[classPick.paragon]].filter(Boolean)},
    {label:'Row 2 — Choose One',row:'row2',items:PARAGON_TREE_ROW2[classPick.base]||[]},
    {label:'Row 3 — Choose One',row:'row3',items:PARAGON_TREE_ROW3},
    {label:'Row 4 — Auto-granted',row:'row4',fixed:true,items:row4Name?[row4Name]:[]},
    {label:'Row 5 — Choose One',row:'row5',items:PARAGON_TREE_ROW5},
    {label:'Row 6 — Auto-granted',row:'row6',fixed:true,items:row6Name?[row6Name]:[]},
    {label:'Row 7 — Choose One',row:'row7',items:PARAGON_TREE_ROW7[classPick.paragon]||[]},
  ];
  el.innerHTML=sections.map(sec=>{
    const opts=sec.items.map(name=>{
      const picked=sec.fixed?true:paragonTreePicks[sec.row]===name;
      const safe=name.replace(/'/g,"\\'");
      const clickAttr=sec.fixed?'':` onclick="chooseParagonSkill('${sec.row}','${safe}');renderMobileParagonTree();"`;
      return `<div class="pst-opt ${picked?'picked':''}" data-row="${sec.row}" data-name="${name}"${clickAttr}>
        <div class="pst-ic"></div>
        <div class="pst-lbl">${name}</div>
      </div>`;
    }).join('');
    return `<div class="pst-row ${sec.fixed?'pst-fixed':''}"><div class="pst-row-h">${sec.label}</div><div class="pst-opts">${opts||'<div class=\"pst-empty\">—</div>'}</div></div>`;
  }).join('');
  sections.forEach(sec=>{
    sec.items.forEach(name=>{
      tryLoadImage(`icons/paragon-tree/${sec.row}/${name}.png`,src=>{
        const node=el.querySelector(`.pst-opt[data-row="${sec.row}"][data-name="${CSS.escape(name)}"] .pst-ic`);
        if(node) node.innerHTML=`<img src="${src}">`;
      });
    });
  });
}

// ── Generic: mirror a resulting card icon into a mobile trigger button ──
function mirrorCardIconTo(onclickTarget,mobileElId){
  const cardEl=document.querySelector(`[onclick="up('${onclickTarget}')"]`);
  const mobEl=document.getElementById(mobileElId);
  if(!cardEl||!mobEl) return;
  const img=cardEl.querySelector('img');
  if(img) mobEl.innerHTML=`<img src="${img.src}">`;
}

// ── Mounts step ──
function syncMobileMountLabels(){
  showOptMount();
  ['m0','m1','m2','st0','st1','st2'].forEach(k=>mirrorCardIconTo(k,`mob-${k}-ic`));
}

// ── Equipment step ──
function renderMobileSets(){
  const el=document.getElementById('mob-sets');
  if(!el) return;
  el.innerHTML=sets.map((s,si)=>{
    const slotsHtml=s.slots.map((sl,li)=>`
      <button class="wiz-trigger eq-special-ms" onclick="openSetItemPicker(${si},${li},this)">
        <div class="wt-ic">${sl.img?`<img src="${sl.img}">`:'⬦'}</div>
        <div><div class="wt-txt">${sl.n}</div><div class="wt-sub">${s.lbl} — tap to change</div></div>
      </button>`).join('');
    const addHtml=s.slots.length<SET_MAX_ITEMS?`
      <button class="wiz-trigger eq-special-ms" onclick="openSetItemPicker(${si},null,this)">
        <div class="wt-ic">+</div>
        <div><div class="wt-txt">Add Item</div><div class="wt-sub">${s.lbl}</div></div>
      </button>`:'';
    return `<div style="margin-bottom:10px">${slotsHtml}${addHtml}</div>`;
  }).join('');
}

// ── Runes & Virtues step ──
function renderMobileRunesVirtues(){
  mirrorCardIconTo('rn0','mob-rn0-ic');
  mirrorCardIconTo('rn1','mob-rn1-ic');
  const el=document.getElementById('mob-virtues');
  if(!el) return;
  const names=Object.keys(virtueCounts).filter(n=>virtueCounts[n]>0);
  const rows=names.map(name=>{
    const src=virtueImgs[name];
    return `<button class="wiz-trigger virtue-ms" onclick="openVirtueEdit('${name}',this)">
      <div class="wt-ic">${src?`<img src="${src}">`:'⬦'}</div>
      <div><div class="wt-txt">${virtueCounts[name]}x ${name}</div><div class="wt-sub">Tap to edit</div></div>
    </button>`;
  }).join('');
  const addBtn=virtueTotal()<VIRTUE_MAX_SLOTS?`<button class="wiz-trigger virtue-ms" onclick="openVirtueAdd(this)"><div class="wt-ic">+</div><div><div class="wt-txt">Add Virtue</div></div></button>`:'';
  el.innerHTML=rows+addBtn;
}

// ── Review step ──
function mobShowCard(){
  document.body.classList.add('review-active');
  sync();
  renderSkillTree();
  zFit();
}
function mobHideCard(){
  document.body.classList.remove('review-active');
}
function mobExportFlow(){
  mobShowCard();
  setTimeout(()=>doExport(),50);
}

// ── Re-render mobile mirrors whenever a card-only popup picker closes ──
function watchPickerPopups(){
  ['mount-picker','item-picker','rune-picker','virtue-picker','virtue-edit-picker'].forEach(id=>{
    const el=document.getElementById(id);
    if(!el) return;
    new MutationObserver(()=>{
      if(el.style.display==='none') onStepEnter(STEPS[curStep].id);
    }).observe(el,{attributes:true,attributeFilter:['style']});
  });
}

window.addEventListener('load',()=>{
  watchPickerPopups();
  goToStep(0);
});
