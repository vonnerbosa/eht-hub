// ── STATE ──
let Z=0.6, upTarget=null;
let classPick={base:null,second:null,third:null,paragon:null};

let paragonTreePicks={}; // 'row2'/'row3'/'row5'/'row7' -> chosen skill name (or absent/null)

const subs=[];
const sets=[
  {lbl:'Set 1',better:false,slots:[]},
];
let statCaps=DEFAULT_STAT_CAPS.map(s=>({...s}));
let statPriority=[];

let mountImgs={}; // "group|name" -> src, remembers auto-loaded AND manually-uploaded art for mount skills/traits/equipment
let mountSlotPicked={}; // m0/m1/m2 -> chosen skill/trait name (or null), used as the label default unless manually overridden
const EQUIP_VER_LABEL_ID={st0:'slv0',st1:'slv1',st2:'slv2'};
let mountEquipPicked={}; // st0/st1/st2 -> chosen version name (or null), shown as its first word above the slot label
function setEquipVerLabel(slot,name){
  mountEquipPicked[slot]=name||null;
  const id=EQUIP_VER_LABEL_ID[slot];
  if(!id)return;
  const el=document.getElementById(id);
  if(el)el.textContent=name?name.split(' ')[0]:'';
}

let specialEquipImgs={}; // "cat|name" -> local icon src, cached like other pickers


let traitImgs={};
let combos=[{}];

// ── INIT ──
onload=()=>{
  renderBasePicker(); updateClassTreeCard();
  renderEqCtrl(); renderSets(); renderVirtues(); renderStatCtrl(); renderStats(); renderComboCtrl(); renderCardCombos(); syncMounts(); syncCompFairy(); sync();
  applyImg('badge','branding/oxo-logo.png');
  preloadTraitIcons();
  preloadMountIcons();
  renderSkillTree();
  setTimeout(()=>{zFit();renderSkillTree();},200);
};
function preloadTraitIcons(){
  TRAITS.forEach(name=>{
    if(traitImgs[name]) return;
    tryLoadImage(`icons/traits/${name}.png`,src=>{
      traitImgs[name]=src;
      renderComboCtrl();renderCardCombos();
    });
  });
}
function preloadMountIcons(){
  Object.values(MOUNT_SLOT_CONFIG).forEach(cfg=>{
    cfg.list.forEach(name=>{
      const ck=mtKey(cfg.group,name);
      if(mountImgs[ck]) return;
      tryLoadImage(cfg.path(name),src=>{mountImgs[ck]=src;});
    });
  });
}

// ── SYNC ──
function sync(){
  const g=id=>document.getElementById(id)?.value||'';
  // Title with per-word coloring
  const words=g('c-title').split(' ');
  const colorStr=g('c-colors')||'';
  const colorMap={gold:'t-gold',white:'t-white',red:'t-pvp',green:'t-pve',blue:'t-dungeon',purple:'t-field',teal:'t-field'};
  const cols=colorStr.split(',').map(c=>c.trim().toLowerCase());
  const titleHtml=words.map((w,i)=>{
    const cl=colorMap[cols[i]]||'t-white';
    return `<span class="${cl}">${w}</span>`;
  }).join(' ');
  const sub=g('c-sub');
  const titleEl=document.getElementById('c-titlecard');
  titleEl.innerHTML=`~${titleHtml}${sub?' <span class="t-gold">'+sub+'</span>':''}~`;
  fitTitle();

  const charName=g('c-char');
  document.getElementById('c-charc2').textContent=charName||'—';
  document.getElementById('c-chardesc').textContent=CHARACTERISTIC_DESC[charName]||'';
  document.getElementById('c-clsc').textContent=g('c-cls')||'Class';
  document.getElementById('c-creditc').textContent=g('c-credit')||'—';
  const desc=g('c-desc').trim();
  document.getElementById('c-desc-box').style.display=desc?'block':'none';
  document.getElementById('c-descbody').textContent=desc;
}

function fitTitle(){
  const el=document.getElementById('c-titlecard');
  const box=document.getElementById('ctb');
  let fs=30;
  el.style.fontSize=fs+'px';
  while(el.scrollWidth>box.clientWidth-220 && fs>14){
    fs--;
    el.style.fontSize=fs+'px';
  }
}

function setType(btn){
  document.querySelectorAll('.tbtn').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  // Set first word color based on type, keeping any custom colors on later words
  const map={DUNGEON:'blue',PVE:'green',PVP:'red',FIELD:'purple',DS:'gold'};
  const ci=document.getElementById('c-colors');
  const parts=ci.value?ci.value.split(',').map(s=>s.trim()):[];
  parts[0]=map[btn.dataset.t]||'white';
  ci.value=parts.join(',');
  sync();
}

function showOptMount(){
  document.getElementById('mt-opt-sep').style.display='';
  document.getElementById('mt-opt-slot').style.display='';
  document.getElementById('mt-add-opt').style.display='none';
}
function syncMounts(){
  ['ml0','ml1','ml2'].forEach((id,i)=>{
    const v=document.getElementById(`mt${i}l`).value;
    const el=document.getElementById(id);
    if(el) el.textContent=v||mountSlotPicked[`m${i}`]||['Skill','Trait','OPT'][i];
  });
  const eqDefaults=['Horseshoe','Saddle','Rein'];
  ['sl0','sl1','sl2'].forEach((id,i)=>{
    const v=document.getElementById(`st${i}l`).value;
    const el=document.getElementById(id);
    if(el) el.textContent=v||eqDefaults[i];
  });
}
function syncCompFairy(){
  document.getElementById('cf-comp-ic').textContent=document.getElementById('c-comp-race').value==='Dragon'?'🐉':'🐾';
  document.getElementById('cf-fairy-ic').textContent=document.getElementById('c-fairy-race').value==='Dragon'?'🐉':'🧚';
}

// ── CLASS PROGRESSION PICKER ──
function renderBasePicker(){
  document.getElementById('base-ctrl').innerHTML=Object.keys(CLASS_TREE).map(b=>
    `<button class="xbtn ${classPick.base===b?'on':''}" onclick="pickBase('${b}')">${b}</button>`).join('');
}
function pickBase(b){
  classPick={base:b,second:null,third:null,paragon:null};
  renderBasePicker();
  document.getElementById('tier2-wrap').style.display='block';
  document.getElementById('tier3-wrap').style.display='none';
  document.getElementById('paragon-wrap').style.display='none';
  document.getElementById('tier2-ctrl').innerHTML=CLASS_TREE[b].second.map(n=>
    `<button class="xbtn" onclick="pickTier('second','${n}')">${n}</button>`).join('');
  updateClassTreeCard();
}
function pickTier(tier,name){
  classPick[tier]=name;
  const wrapId={second:'tier2-ctrl',third:'tier3-ctrl',paragon:'paragon-ctrl'}[tier];
  document.querySelectorAll(`#${wrapId} .xbtn`).forEach(b=>b.classList.toggle('on',b.textContent===name));
  if(tier==='second'){
    classPick.third=null;classPick.paragon=null;
    document.getElementById('tier3-wrap').style.display='block';
    document.getElementById('paragon-wrap').style.display='none';
    document.getElementById('tier3-ctrl').innerHTML=CLASS_TREE[classPick.base].third.map(n=>
      `<button class="xbtn" onclick="pickTier('third','${n}')">${n}</button>`).join('');
  }
  if(tier==='third'){
    classPick.paragon=null;
    document.getElementById('paragon-wrap').style.display='block';
    document.getElementById('paragon-ctrl').innerHTML=CLASS_TREE[classPick.base].paragon.map(n=>
      `<button class="xbtn" onclick="pickTier('paragon','${n}')">${n}</button>`).join('');
  }
  updateClassTreeCard();
}
let skillImgs={}; // class/subclass name -> src, remembers auto-loaded AND manually-uploaded skill icons
function updateClassTreeCard(){
  const oldImgByName={};
  subs.forEach(s=>{oldImgByName[s.n]=s.img;});
  const newSubs=[];
  if(classPick.base) newSubs.push({n:classPick.base,e:'⚔',img:oldImgByName[classPick.base]||skillImgs[classPick.base]||null});
  if(classPick.second) newSubs.push({n:classPick.second,e:'⚔',img:oldImgByName[classPick.second]||skillImgs[classPick.second]||null});
  if(classPick.third) newSubs.push({n:classPick.third,e:'⚔',img:oldImgByName[classPick.third]||skillImgs[classPick.third]||null});
  subs.length=0;subs.push(...newSubs);
  renderCardSubs();
  document.getElementById('c-cls').value=classPick.paragon||'';
  loadParagonArt();
  loadSkillIcons();
  renderParagonTree();
  sync();
}
function skNodeHtml(row,name,picked,clickable,excluded){
  const safe=name.replace(/'/g,"\\'");
  const oc=clickable?` onclick="chooseParagonSkill('${row}','${safe}')"`:'';
  const cls=['sk',picked?'picked':'',clickable?'':'fixed',excluded?'excluded':''].filter(Boolean).join(' ');
  return `<div class="${cls}" data-row="${row}" data-name="${name}"${oc}></div>`;
}
function renderParagonTree(){
  const skc=document.getElementById('c-skills');
  if(!skc)return;
  if(!classPick.paragon){skc.innerHTML='';return;}
  // Row 1 is a free starting skill, always granted. Every other row (even the
  // single-icon rows 4/6, which are locked to whichever 2nd/3rd class was picked)
  // still requires an explicit click to mark as "invested" — matching the in-game
  // tree where nothing but the first node is lit up until you actually spend points.
  const row4Name=ROW4_BY_SECOND[classPick.second];
  const row6Name=ROW6_BY_THIRD[classPick.third];
  const rows=[
    [{row:'row1',name:ROW1_BY_PARAGON[classPick.paragon],picked:true,clickable:false}],
    (PARAGON_TREE_ROW2[classPick.base]||[]).map(n=>({row:'row2',name:n,picked:paragonTreePicks.row2===n,clickable:true})),
    PARAGON_TREE_ROW3.map(n=>({row:'row3',name:n,picked:paragonTreePicks.row3===n,clickable:true})),
    row4Name?[{row:'row4',name:row4Name,picked:paragonTreePicks.row4===row4Name,clickable:true}]:[],
    PARAGON_TREE_ROW5.map(n=>({row:'row5',name:n,picked:paragonTreePicks.row5===n,clickable:true})),
    row6Name?[{row:'row6',name:row6Name,picked:paragonTreePicks.row6===row6Name,clickable:true}]:[],
    (PARAGON_TREE_ROW7[classPick.paragon]||[]).map(n=>({row:'row7',name:n,picked:paragonTreePicks.row7===n,clickable:true})),
  ];
  skc.innerHTML='<svg id="skconn-svg" class="skconn-svg"></svg>'+rows.map(nodes=>{
    const anyPicked=nodes.some(n=>n.picked);
    return `<div class="skr">${nodes.map(nd=>skNodeHtml(nd.row,nd.name,nd.picked,nd.clickable,anyPicked&&!nd.picked)).join('')}</div>`;
  }).join('');
  rows.flat().forEach(nd=>{
    tryLoadImage(`icons/paragon-tree/${nd.row}/${nd.name}.png`,src=>{
      const el=skc.querySelector(`.sk[data-row="${nd.row}"][data-name="${CSS.escape(nd.name)}"]`);
      if(el)el.innerHTML=`<img src="${src}" style="width:100%;height:100%;object-fit:cover">`;
    });
  });
  renderSkillTree();
}
function chooseParagonSkill(row,name){
  paragonTreePicks[row]=(paragonTreePicks[row]===name)?null:name;
  renderParagonTree();
}
function loadSkillIcons(){
  subs.forEach(s=>{
    if(s.img) return;
    tryLoadImage(`icons/skills/${s.n}.png`,src=>{
      skillImgs[s.n]=src;
      const idx=subs.findIndex(x=>x.n===s.n);
      if(idx>=0){subs[idx].img=src;renderCardSubs();}
    });
  });
}
function tryLoadImage(path,onSuccess){
  const img=new Image();
  img.onload=()=>onSuccess(path);
  img.onerror=()=>{};
  img.src=path;
}
let paragonImgs={}; // paragonName -> {badge,m,f,crest} — remembers auto-loaded AND manually-uploaded art per paragon so re-picking never wipes it
let baseCrestImgs={}; // baseClass -> crest src, shown in place of the Paragon crest before a Paragon is picked
function showCrest(src){
  const img=document.getElementById('c-crest-img');
  img.src=src;
  img.style.display='block';
  document.getElementById('badge').style.display='none';
}
function hideCrest(){
  const img=document.getElementById('c-crest-img');
  img.style.display='none';
  img.removeAttribute('src');
  if(document.getElementById('badge-img').src) document.getElementById('badge').style.display='block';
}
function loadParagonArt(){
  const cib=document.querySelector('.cib');
  const par=classPick.paragon,base=classPick.base;
  const cached=(par&&paragonImgs[par])||{};
  cib.innerHTML=cached.badge?`<img src="${cached.badge}" style="width:100%;height:100%;object-fit:cover">`:'⚔';
  if(cached.crest) showCrest(cached.crest);
  else if(!par&&base&&baseCrestImgs[base]) showCrest(baseCrestImgs[base]);
  else hideCrest();
  if(!base) return;
  if(!par){
    if(!baseCrestImgs[base]) tryLoadImage(`icons/classes/${base} Subclasses/crest.png`,src=>{
      baseCrestImgs[base]=src;
      if(classPick.base===base&&!classPick.paragon) showCrest(src);
    });
    return;
  }
  if(!cached.badge) tryLoadImage(`icons/Paragon Badge (subclass)/${base}/${par}.png`,src=>{
    cib.innerHTML=`<img src="${src}" style="width:100%;height:100%;object-fit:cover">`;
    (paragonImgs[par]=paragonImgs[par]||{}).badge=src;
  });
  if(!cached.crest) tryLoadImage(`icons/classes/${base} Subclasses/${par}/crest.png`,src=>{
    (paragonImgs[par]=paragonImgs[par]||{}).crest=src;
    showCrest(src);
  });
}
function renderCardSubs(){
  document.getElementById('c-subs').innerHTML=subs.map((s,i)=>`
    <div class="sc2">
      <div class="si">${s.img?`<img src="${s.img}">`:`${s.e}`}</div>
      <div class="sn2">${s.n}</div>
    </div>
    ${i<subs.length-1?'<div class="pl">+</div>':''}`).join('');
}

// ── TRAIT COMBOS ──
function cycleTrait(ci,name){
  const combo=combos[ci];
  const cur=combo[name]||0;
  const next=(cur+1)%(TRAIT_MAX_LEVEL+1);
  const distinct=Object.values(combo).filter(l=>l>0).length;
  if(cur===0 && next>0 && distinct>=TRAIT_MAX_PICKS){alert(`Max ${TRAIT_MAX_PICKS} traits per combo.`);return;}
  const trial={...combo,[name]:next};
  const cost=Object.values(trial).reduce((s,l)=>s+traitCost(l),0);
  if(cost>TRAIT_BUDGET){alert(`Not enough points left — ${TRAIT_BUDGET} max per combo.`);return;}
  if(next===0) delete trial[name]; else trial[name]=next;
  combos[ci]=trial;
  renderComboCtrl();renderCardCombos();
}
function addCombo(){
  if(combos.length>=3){alert('Max 3 combos.');return;}
  combos.push({});
  renderComboCtrl();renderCardCombos();
}
function renderComboCtrl(){
  document.getElementById('combo-ctrl').innerHTML=combos.map((combo,ci)=>{
    const cost=Object.values(combo).reduce((s,l)=>s+traitCost(l),0);
    const picks=Object.values(combo).filter(l=>l>0).length;
    const rows=TRAITS.map(name=>{
      const lvl=combo[name]||0;
      return `<div class="rc" style="cursor:pointer" onclick="cycleTrait(${ci},'${name}')">
        <div class="ip">${traitImgs[name]?`<img src="${traitImgs[name]}">`:'⚔'}</div>
        <span style="flex:1;font-size:11px;color:${lvl>0?'var(--gold)':'var(--muted)'}">${name}</span>
        <span style="font-family:'Cinzel',serif;font-size:9px;color:${lvl>0?'var(--gold)':'#3a3060'}">${lvl>0?'Lvl '+lvl:'—'}</span>
      </div>`;
    }).join('');
    return `<div style="border:1px solid var(--border2);margin-bottom:7px;background:rgba(0,0,0,.3)">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:4px 7px;background:rgba(0,0,0,.3);border-bottom:1px solid var(--border2)">
        <span style="font-family:'Cinzel',serif;font-size:8px;color:var(--gold)">COMBO ${ci+1} — ${cost}/${TRAIT_BUDGET} pts, ${picks}/${TRAIT_MAX_PICKS} traits</span>
        <div style="display:flex;gap:4px">
          <button class="ub" title="Clear this combo" onclick="combos[${ci}]={};renderComboCtrl();renderCardCombos()">↺</button>
          ${combos.length>1?`<button class="rb" onclick="combos.splice(${ci},1);renderComboCtrl();renderCardCombos()">✕</button>`:''}
        </div>
      </div>
      <div style="padding:6px">${rows}</div>
    </div>`;
  }).join('');
}
function renderCardCombos(){
  document.getElementById('c-trait-combos').innerHTML=combos.map((combo,ci)=>{
    const picks=TRAITS.filter(t=>combo[t]>0);
    const slots=Array.from({length:5},(_,si)=>{
      const name=picks[si];
      if(!name) return `<div class="tsl" style="opacity:.35">□</div>`;
      const img=traitImgs[name];
      return `<div class="tsl" onclick="up('trait|${name}')">${img?`<img src="${img}">`:'⚔'}<div class="tll">Lvl ${combo[name]}</div></div>`;
    }).join('');
    const orDiv=ci<combos.length-1?'<div class="or">— OR —</div>':'';
    return `<div class="tr2">${slots}</div>${orDiv}`;
  }).join('');
}

// ── EQUIP ──
function renderEqCtrl(){
  document.getElementById('eq-ctrl').innerHTML=sets.map((s,si)=>`
    <div style="border:1px solid var(--border2);margin-bottom:7px;background:rgba(0,0,0,.3)">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:4px 7px;background:rgba(0,0,0,.3);border-bottom:1px solid var(--border2)">
        <span style="font-family:'Cinzel',serif;font-size:9px;color:var(--gold)">${s.lbl}</span>
        <div style="display:flex;align-items:center;gap:5px">
          <span class="tl">BETTER</span>
          <div class="tog ${s.better?'on':''}" onclick="sets[${si}].better=!sets[${si}].better;this.classList.toggle('on');renderSets()"></div>
          ${sets.length>1?`<button class="rb" onclick="sets.splice(${si},1);renderEqCtrl();renderSets()">✕</button>`:''}
        </div>
      </div>
      <div style="padding:6px">
        <lbl>SET LABEL</lbl><input type="text" value="${s.lbl}" oninput="sets[${si}].lbl=this.value;renderSets()">
        <div style="font-family:'Cinzel',serif;font-size:8px;color:#3a3060;margin-top:4px">Add/remove the actual items (Unique/PVP/World Boss) directly on the card — click the item icon or the + button.</div>
      </div>
    </div>`).join('');
}
function addSet(){sets.push({lbl:`Set ${sets.length+1}`,better:false,slots:[]});renderEqCtrl();renderSets();}
function renderSets(){
  document.getElementById('c-sets').innerHTML=sets.map((s,si)=>{
    const slotsHtml=s.slots.map((sl,li)=>`
      <div class="ech">
        <div class="eic eq-special-ms" onclick="openSetItemPicker(${si},${li},this)">${sl.img?`<img src="${sl.img}">`:'⬦'}</div>
        <div class="ein">${sl.n} <span class="eic-x" onclick="event.stopPropagation();removeSetItem(${si},${li})">✕</span></div>
      </div>
      ${li<s.slots.length-1?'<span class="esp">+</span>':''}`).join('');
    const addHtml=s.slots.length<SET_MAX_ITEMS?`
      ${s.slots.length?'<span class="esp">+</span>':''}
      <div class="ech">
        <div class="eic eq-special-ms" style="border-style:dashed;opacity:.6;font-size:22px" onclick="openSetItemPicker(${si},null,this)">+</div>
        <div class="ein">Add Item</div>
      </div>`:'';
    const emptyNote=s.slots.length===0?'<div class="es-empty">Abyss equipment? Please refer to Stat Allocation below.</div>':'';
    return `<div class="eset">
      <div class="esh">
        <span class="esl">${s.lbl}</span>
        ${s.better?'<span class="esb">Better Version available 🌿</span>':''}
      </div>
      <div class="ei">${slotsHtml}${addHtml}</div>
      ${emptyNote}
    </div>`;
  }).join('');
}

// ── SET EQUIPMENT ITEM PICKER (Unique / PVP / World Boss items, from ehtmanager.com/database/items) ──
function itemIconPath(cat,folder,name){
  return cat==='unique'?`icons/items/unique/${name}.png`:`icons/items/${cat}/${folder}/${name}.png`;
}
function itKey(cat,folder,name){return `${cat}|${folder||''}|${name}`;}
function flattenPvp(slotFilter){
  const out=[];
  Object.entries(ITEM_PVP).forEach(([folder,arr])=>{
    arr.forEach(it=>{if(!slotFilter||it.s===slotFilter)out.push({...it,folder,cat:'pvp'});});
  });
  return out;
}
function flattenBoss(){
  const out=[];
  Object.entries(ITEM_BOSS).forEach(([folder,arr])=>arr.forEach(it=>out.push({...it,folder,cat:'boss'})));
  return out;
}
function itemListForCategory(cat){
  if(cat==='unique')return ITEM_UNIQUE.map(it=>({...it,folder:null,cat:'unique'}));
  if(cat==='pvp'){
    const hats=flattenPvp('Hat');
    const wpns=flattenPvp('Weapon');
    return [...hats,...(classPick.base?wpns.filter(it=>it.c===classPick.base):wpns)];
  }
  if(cat==='boss')return flattenBoss();
  return [];
}

let itPickerTarget=null; // {si,li} — li===null means "add new" (append), otherwise replaces that slot
let itPickerCategory=null; // null = category-chooser step

function openSetItemPicker(si,li,btn){
  itPickerTarget={si,li};
  itPickerCategory=null;
  renderItemPickerBody();
  const r=btn.getBoundingClientRect();
  const pk=document.getElementById('item-picker');
  pk.style.left=Math.max(8,Math.min(r.left,window.innerWidth-356))+'px';
  pk.style.top=(r.bottom+6)+'px';
  pk.style.display='block';
}
function renderItemPickerBody(){
  const titleEl=document.getElementById('itp-title');
  const tabsEl=document.getElementById('itp-tabs');
  const grid=document.getElementById('itp-grid');
  if(!itPickerCategory){
    titleEl.textContent='CHOOSE CATEGORY';
    tabsEl.innerHTML='';
    grid.innerHTML=`<div class="itp-catrow">
      <div class="itp-catbtn" onclick="event.stopPropagation();chooseItemCategory('unique')">⭐<span>Unique</span></div>
      <div class="itp-catbtn" onclick="event.stopPropagation();chooseItemCategory('pvp')">⚔<span>PVP</span></div>
      <div class="itp-catbtn" onclick="event.stopPropagation();chooseItemCategory('boss')">👹<span>World Boss</span></div>
    </div>`;
    return;
  }
  titleEl.textContent=(itPickerCategory==='pvp'?'PVP':itPickerCategory==='boss'?'WORLD BOSS':'UNIQUE')+' ITEMS';
  tabsEl.innerHTML=`<div class="itp-tab" onclick="event.stopPropagation();backToCategories()">← Back</div>`;
  renderItemPickerGrid();
}
function chooseItemCategory(cat){itPickerCategory=cat;renderItemPickerBody();}
function backToCategories(){itPickerCategory=null;renderItemPickerBody();}
function renderItemPickerGrid(){
  const list=itemListForCategory(itPickerCategory);
  const grid=document.getElementById('itp-grid');
  if(!list.length){
    grid.innerHTML=`<div class="itp-empty" style="grid-column:1/-1">No items found.</div>`;
    return;
  }
  grid.innerHTML=list.map(it=>{
    const ck=itKey(it.cat,it.folder,it.n);
    const src=specialEquipImgs[ck];
    const safe=it.n.replace(/'/g,"\\'");
    return `<div class="itp-opt" onclick="selectSetItem('${it.cat}','${it.folder||''}','${safe}')">
      <div class="itp-ic" id="itp-ic-${mtSafeKey(ck)}">${src?`<img src="${src}">`:'⬦'}</div>
      <div class="itp-lbl">${it.n}</div>
      <div class="itp-tier">${it.t||''}</div>
    </div>`;
  }).join('');
  list.forEach(it=>{
    const ck=itKey(it.cat,it.folder,it.n);
    if(specialEquipImgs[ck])return;
    tryLoadImage(itemIconPath(it.cat,it.folder,it.n),src=>{
      specialEquipImgs[ck]=src;
      const el=document.getElementById(`itp-ic-${mtSafeKey(ck)}`);
      if(el)el.innerHTML=`<img src="${src}" style="width:100%;height:100%;object-fit:cover">`;
    });
  });
}
function selectSetItem(cat,folder,name){
  const target=itPickerTarget;
  const category=itPickerCategory;
  closeItemPicker();
  if(!target)return;
  const it=itemListForCategory(category).find(x=>x.cat===cat&&(x.folder||'')===folder&&x.n===name);
  if(!it)return;
  const {si,li}=target;
  const slotObj={n:it.n,s:it.s,c:it.c||null,t:it.t||null,cat:it.cat,folder:it.folder,img:null};
  if(li===null){
    if(sets[si].slots.length>=SET_MAX_ITEMS)return;
    sets[si].slots.push(slotObj);
  }else{
    sets[si].slots[li]=slotObj;
  }
  const ck=itKey(it.cat,it.folder,it.n);
  if(specialEquipImgs[ck])slotObj.img=specialEquipImgs[ck];
  else tryLoadImage(itemIconPath(it.cat,it.folder,it.n),src=>{specialEquipImgs[ck]=src;slotObj.img=src;renderSets();});
  renderSets();
}
function removeSetItem(si,li){
  sets[si].slots.splice(li,1);
  renderSets();
}
function closeItemPicker(){
  document.getElementById('item-picker').style.display='none';
  itPickerTarget=null;
  itPickerCategory=null;
}

// ── STATS ──
function renderStatCtrl(){
  document.getElementById('stat-caps-ctrl').innerHTML=statCaps.map((s,i)=>`
    <div class="rc">
      <span style="flex:1;font-size:12px;color:var(--muted)">${s.n}</span>
      <input type="text" value="${s.v}" style="width:52px;font-size:11px" oninput="statCaps[${i}].v=this.value;renderStats()">
      <input type="number" min="0" value="${s.lines}" style="width:34px;font-size:11px" oninput="statCaps[${i}].lines=+this.value||0;renderStats()">
    </div>`).join('');
  document.getElementById('stat-priority-ctrl').innerHTML=statPriority.map((s,i)=>`
    <div class="rc">
      <input list="stat-name-suggestions" type="text" value="${s.n}" placeholder="Stat name" style="flex:1;font-size:12px" oninput="statPriority[${i}].n=this.value;renderStats()">
      <input type="text" value="${s.v}" placeholder="Value" style="width:48px;font-size:11px" oninput="statPriority[${i}].v=this.value;renderStats()">
      <input type="number" min="0" value="${s.lines}" style="width:34px;font-size:11px" oninput="statPriority[${i}].lines=+this.value||0;renderStats()">
      <button class="ub" title="Move up" onclick="moveStat(${i},-1)" ${i===0?'disabled style="opacity:.3"':''}>↑</button>
      <button class="ub" title="Move down" onclick="moveStat(${i},1)" ${i===statPriority.length-1?'disabled style="opacity:.3"':''}>↓</button>
      <button class="rb" onclick="removePriorityStat(${i})">✕</button>
    </div>`).join('');
  document.getElementById('stat-name-suggestions').innerHTML=STAT_SUGGESTIONS.map(n=>`<option value="${n}">`).join('');
}
function addPriorityStat(){
  statPriority.push({n:'',v:'',lines:0});
  renderStatCtrl();renderStats();
}
function removePriorityStat(i){
  statPriority.splice(i,1);
  renderStatCtrl();renderStats();
}
function moveStat(i,dir){
  const j=i+dir;
  if(j<0||j>=statPriority.length)return;
  [statPriority[i],statPriority[j]]=[statPriority[j],statPriority[i]];
  renderStatCtrl();renderStats();
}
function renderStats(){
  const rows=[...statCaps,...statPriority].filter(s=>s.n);
  document.getElementById('c-stats').innerHTML=rows.map((s,i)=>`
    <div class="sl2"><span class="sn3">${i+1}.</span><span class="sk2">${s.n}</span><span class="sc3"> : </span><span class="sv">${s.v||'~'}</span><span class="sln"> (${s.lines||0} Line${s.lines===1?'':'s'})</span></div>`
  ).join('');
}

// ── UPLOADS ──
const RUNE_SLOTS=['rn0','rn1'];
function up(t){
  if(MOUNT_SLOT_CONFIG[t]){openMountPicker(t);return;}
  if(RUNE_SLOTS.includes(t)){openRunePicker(t);return;}
  upTarget=t;const f=document.getElementById('fi');f.value='';f.click();
}
// ── SKILL RUNE PICKER (reuses the same icons/skills/{Name}.png art as the Subclasses row) ──
let runePickerTarget=null;
function openRunePicker(t){
  runePickerTarget=t;
  const names=subs.map(s=>s.n); // only the base/2nd/3rd classes actually picked for this build
  const grid=document.getElementById('rnp-grid');
  grid.innerHTML=names.length?names.map(name=>{
    const src=skillImgs[name];
    const safe=name.replace(/'/g,"\\'");
    return `<div class="itp-opt" onclick="selectRuneIcon('${safe}')">
      <div class="itp-ic" id="rnp-ic-${mtSafeKey(name)}">${src?`<img src="${src}">`:'⬦'}</div>
      <div class="itp-lbl">${name}</div>
    </div>`;
  }).join(''):'<div class="itp-empty" style="grid-column:1/-1">Pick a Class Progression first.</div>';
  names.forEach(name=>{
    if(skillImgs[name])return;
    tryLoadImage(`icons/skills/${name}.png`,src=>{
      skillImgs[name]=src;
      const el=document.getElementById(`rnp-ic-${mtSafeKey(name)}`);
      if(el)el.innerHTML=`<img src="${src}" style="width:100%;height:100%;object-fit:cover">`;
    });
  });
  const el=document.querySelector(`[onclick="up('${t}')"]`);
  const r=el.getBoundingClientRect();
  const pk=document.getElementById('rune-picker');
  pk.style.left=Math.max(8,Math.min(r.left,window.innerWidth-356))+'px';
  pk.style.top=(r.bottom+6)+'px';
  pk.style.display='block';
}
function selectRuneIcon(name){
  const t=runePickerTarget;
  closeRunePicker();
  if(!t)return;
  if(skillImgs[name]){applyImg(t,skillImgs[name]);return;}
  tryLoadImage(`icons/skills/${name}.png`,src=>{skillImgs[name]=src;applyImg(t,src);});
}
function closeRunePicker(){
  document.getElementById('rune-picker').style.display='none';
  runePickerTarget=null;
}

// ── VIRTUE (5 virtue types, up to 8 total — grouped "Nx Name" rows like TheGoddess reference cards) ──
let virtueCounts={};
let virtueImgs={};
function virtueTotal(){return Object.values(virtueCounts).reduce((a,b)=>a+b,0);}
function renderVirtues(){
  const wrap=document.getElementById('c-virtues');
  if(!wrap)return;
  const names=Object.keys(virtueCounts).filter(n=>virtueCounts[n]>0);
  const rows=names.map(name=>{
    const src=virtueImgs[name];
    return `<div class="vrow virtue-ms" onclick="openVirtueEdit('${name}',this)">
      <div class="vic">${src?`<img src="${src}">`:'⬦'}</div>
      <div class="vtxt">${virtueCounts[name]}x ${name}</div>
    </div>`;
  }).join('');
  const addRow=virtueTotal()<VIRTUE_MAX_SLOTS?`<div class="vrow virtue-ms" onclick="openVirtueAdd(this)">
      <div class="vic" style="border-style:dashed;opacity:.6">+</div>
      <div class="vtxt" style="color:var(--muted);border-bottom:none">Add Virtue</div>
    </div>`:'';
  wrap.innerHTML=rows+addRow;
  names.forEach(name=>{
    if(virtueImgs[name])return;
    tryLoadImage(`icons/virtues/${name}.png`,src=>{virtueImgs[name]=src;renderVirtues();});
  });
}
function positionVirtuePopup(pkId,btn){
  const r=btn.getBoundingClientRect();
  const pk=document.getElementById(pkId);
  pk.style.left=Math.max(8,Math.min(r.left,window.innerWidth-186))+'px';
  pk.style.top=(r.bottom+6)+'px';
  pk.style.display='block';
}
let virtueEditTarget=null;
function openVirtueEdit(name,btn){
  virtueEditTarget=name;
  renderVirtueEditBody();
  positionVirtuePopup('virtue-edit-picker',btn);
}
function renderVirtueEditBody(){
  const name=virtueEditTarget;
  const count=virtueCounts[name]||0;
  const src=virtueImgs[name];
  document.getElementById('vep-title').textContent=name.toUpperCase();
  document.getElementById('vep-body').innerHTML=`
    <div class="itp-ic" style="width:46px;height:46px;margin:0 auto 8px;">${src?`<img src="${src}">`:'⬦'}</div>
    <div style="display:flex;align-items:center;justify-content:center;gap:12px;">
      <div class="itp-tab" onclick="event.stopPropagation();adjustVirtueCount(-1)" style="cursor:pointer;font-size:11px;padding:2px 10px;">−</div>
      <div style="font-family:'Cinzel',serif;color:var(--gold);font-size:12px;min-width:14px;">${count}</div>
      <div class="itp-tab" onclick="event.stopPropagation();adjustVirtueCount(1)" style="cursor:pointer;font-size:11px;padding:2px 10px;">+</div>
    </div>
    <div class="mtp-upload" style="margin-top:10px" onclick="event.stopPropagation();removeVirtue()">✕ Remove</div>`;
}
function adjustVirtueCount(delta){
  const name=virtueEditTarget;
  const cur=virtueCounts[name]||0;
  if(delta>0&&virtueTotal()>=VIRTUE_MAX_SLOTS)return;
  const next=cur+delta;
  if(next<=0){removeVirtue();return;}
  virtueCounts[name]=next;
  renderVirtueEditBody();
  renderVirtues();
}
function removeVirtue(){
  delete virtueCounts[virtueEditTarget];
  closeVirtueEditPicker();
  renderVirtues();
}
function closeVirtueEditPicker(){
  document.getElementById('virtue-edit-picker').style.display='none';
  virtueEditTarget=null;
}
function openVirtueAdd(btn){
  const grid=document.getElementById('vp-grid');
  const available=VIRTUES.filter(n=>!(virtueCounts[n]>0));
  grid.innerHTML=available.map(name=>{
    const src=virtueImgs[name];
    return `<div class="itp-opt" onclick="addVirtue('${name}')">
      <div class="itp-ic" id="vp-ic-${name}" style="width:38px;height:38px;">${src?`<img src="${src}">`:'⬦'}</div>
      <div class="itp-lbl">${name}</div>
    </div>`;
  }).join('')||`<div class="itp-empty">All 5 virtues already added.</div>`;
  available.forEach(name=>{
    if(virtueImgs[name])return;
    tryLoadImage(`icons/virtues/${name}.png`,src=>{
      virtueImgs[name]=src;
      const el=document.getElementById(`vp-ic-${name}`);
      if(el)el.innerHTML=`<img src="${src}" style="width:100%;height:100%;object-fit:cover">`;
    });
  });
  positionVirtuePopup('virtue-picker',btn);
}
function addVirtue(name){
  closeVirtuePicker();
  if(virtueTotal()>=VIRTUE_MAX_SLOTS)return;
  virtueCounts[name]=(virtueCounts[name]||0)+1;
  renderVirtues();
}
function closeVirtuePicker(){
  document.getElementById('virtue-picker').style.display='none';
}
let mtPickerTarget=null;
const mtKey=(group,name)=>(group+'|'+name);
const mtSafeKey=k=>k.replace(/[^a-zA-Z0-9]/g,'_');
function openMountPicker(t){
  mtPickerTarget=t;
  const cfg=MOUNT_SLOT_CONFIG[t];
  document.getElementById('mtp-title').textContent=cfg.title;
  document.getElementById('mtp-grid').innerHTML=cfg.list.map(name=>{
    const ck=mtKey(cfg.group,name);
    const src=mountImgs[ck];
    return `<div class="mtp-opt" onclick="selectMountIcon('${name}')">
      <div class="mtp-ic" id="mtp-ic-${mtSafeKey(ck)}">${src?`<img src="${src}">`:'⬦'}</div>
      <div class="mtp-lbl">${name}</div>
    </div>`;
  }).join('');
  cfg.list.forEach(name=>{
    const ck=mtKey(cfg.group,name);
    if(mountImgs[ck])return;
    tryLoadImage(cfg.path(name),src=>{
      mountImgs[ck]=src;
      const el=document.getElementById(`mtp-ic-${mtSafeKey(ck)}`);
      if(el)el.innerHTML=`<img src="${src}" style="width:100%;height:100%;object-fit:cover">`;
    });
  });
  const el=document.querySelector(`[onclick="up('${t}')"]`);
  const r=el.getBoundingClientRect();
  const pk=document.getElementById('mount-picker');
  pk.style.left=Math.min(r.left,window.innerWidth-206)+'px';
  pk.style.top=(r.bottom+6)+'px';
  pk.style.display='block';
}
function selectMountIcon(name){
  const t=mtPickerTarget;const cfg=MOUNT_SLOT_CONFIG[t];closeMountPicker();
  if(!t||!cfg)return;
  if(EQUIP_VER_LABEL_ID[t])setEquipVerLabel(t,name);
  if(['m0','m1','m2'].includes(t)){mountSlotPicked[t]=name;syncMounts();}
  const ck=mtKey(cfg.group,name);
  if(mountImgs[ck]){applyImg(t,mountImgs[ck]);return;}
  // no icon file yet — show the name as a text placeholder so the pick is visible either way
  const el=document.querySelector(`[onclick="up('${t}')"]`);
  if(el)el.innerHTML=`<div style="font-family:'Cinzel',serif;font-size:4.5px;line-height:1.15;text-align:center;padding:2px">${name}</div>`;
  tryLoadImage(cfg.path(name),src=>{mountImgs[ck]=src;applyImg(t,src);});
}
function mountPickerUpload(){
  const t=mtPickerTarget;closeMountPicker();
  if(t){
    if(EQUIP_VER_LABEL_ID[t])setEquipVerLabel(t,null);
    if(['m0','m1','m2'].includes(t)){mountSlotPicked[t]=null;syncMounts();}
    upTarget=t;const f=document.getElementById('fi');f.value='';f.click();
  }
}
function closeMountPicker(){
  document.getElementById('mount-picker').style.display='none';
  mtPickerTarget=null;
}
document.addEventListener('click',e=>{
  const pk=document.getElementById('mount-picker');
  if(pk.style.display==='none')return;
  if(pk.contains(e.target))return;
  if(e.target.closest('.mount-ms'))return;
  closeMountPicker();
});
document.addEventListener('click',e=>{
  const pk=document.getElementById('item-picker');
  if(pk.style.display==='none')return;
  if(pk.contains(e.target))return;
  if(e.target.closest('.eq-special-ms'))return;
  closeItemPicker();
});
document.addEventListener('click',e=>{
  const pk=document.getElementById('rune-picker');
  if(pk.style.display==='none')return;
  if(pk.contains(e.target))return;
  if(e.target.closest('.rune-ms'))return;
  closeRunePicker();
});
document.addEventListener('click',e=>{
  const pk=document.getElementById('virtue-picker');
  if(pk.style.display==='none')return;
  if(pk.contains(e.target))return;
  if(e.target.closest('.virtue-ms'))return;
  closeVirtuePicker();
});
document.addEventListener('click',e=>{
  const pk=document.getElementById('virtue-edit-picker');
  if(pk.style.display==='none')return;
  if(pk.contains(e.target))return;
  if(e.target.closest('.virtue-ms'))return;
  closeVirtueEditPicker();
});
function handleUp(e){
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=ev=>applyImg(upTarget,ev.target.result);
  r.readAsDataURL(f);
}
function applyImg(t,src){
  const img=`<img src="${src}" style="width:100%;height:100%;object-fit:cover">`;
  if(t==='bg'){document.getElementById('cbg').style.backgroundImage=`url(${src})`;return;}
  if(t==='badge'){
    const b=document.getElementById('badge');
    b.style.display='block';
    document.getElementById('badge-img').src=src;
    return;
  }
  // trait icon (shared across combos, keyed by trait name)
  const trm=t.match(/^trait\|(.+)$/);if(trm){traitImgs[trm[1]]=src;renderCardCombos();renderComboCtrl();return;}
  // fallback — find by onclick attr
  const el=document.querySelector(`[onclick="up('${t}')"]`);
  if(el){el.innerHTML=img;return;}
}
// ── SKILL TREE (highlight picked path + connecting lines) ──
function renderSkillTree(){
  const skc=document.getElementById('c-skills');
  const svg=document.getElementById('skconn-svg');
  if(!skc||!svg)return;
  const nodesByRow=[...skc.querySelectorAll('.skr')].map(row=>[...row.querySelectorAll('.sk')]);

  const w=skc.offsetWidth,h=skc.offsetHeight;
  if(!w||!h)return;
  svg.setAttribute('width',w);
  svg.setAttribute('height',h);
  svg.setAttribute('viewBox',`0 0 ${w} ${h}`);

  const relPos=el=>{
    let x=0,y=0,node=el;
    while(node&&node!==skc){x+=node.offsetLeft;y+=node.offsetTop;node=node.offsetParent;}
    return{x,y};
  };
  const geo=nodesByRow.map(nodes=>nodes.map(n=>{
    const p=relPos(n);
    return{cx:p.x+n.offsetWidth/2,top:p.y,bottom:p.y+n.offsetHeight,picked:n.classList.contains('picked')};
  }));

  const PURPLE='rgba(180,110,230,.9)',GRAY='rgba(150,120,60,.35)';
  const parts=[];
  for(let i=0;i<geo.length-1;i++){
    const A=geo[i],B=geo[i+1];
    if(!A.length||!B.length)continue;
    const bottomA=A[0].bottom,topB=B[0].top;
    const busY=(bottomA+topB)/2;
    const allX=[...A.map(n=>n.cx),...B.map(n=>n.cx)];
    const minX=Math.min(...allX),maxX=Math.max(...allX);
    if(A.length>1||B.length>1){
      parts.push(`<line x1="${minX}" y1="${busY}" x2="${maxX}" y2="${busY}" stroke="${GRAY}" stroke-width="2"/>`);
    }
    A.forEach(n=>parts.push(`<line x1="${n.cx}" y1="${n.bottom}" x2="${n.cx}" y2="${busY}" stroke="${n.picked?PURPLE:GRAY}" stroke-width="2"/>`));
    B.forEach(n=>parts.push(`<line x1="${n.cx}" y1="${busY}" x2="${n.cx}" y2="${topB}" stroke="${n.picked?PURPLE:GRAY}" stroke-width="2"/>`));
  }
  svg.innerHTML=parts.join('');
}
function clrBg(){document.getElementById('cbg').style.backgroundImage='';}
function setDark(v){
  const o=v/100;
  document.getElementById('cov').style.background=`linear-gradient(135deg,rgba(10,7,4,${o}) 0%,rgba(14,10,6,${o*.82}) 50%,rgba(10,7,4,${o}) 100%)`;
}

// ── ZOOM ──
function apZ(){document.getElementById('sw').style.transform=`scale(${Z})`;document.getElementById('zd').textContent=Math.round(Z*100)+'%';document.getElementById('zd2').textContent=Math.round(Z*100)+'%';}
function zoom(d){Z=Math.max(.12,Math.min(1.2,Z+d));apZ();}
function zFit(){const w=document.getElementById('pv').clientWidth-40;Z=Math.min(w/1100,.9);apZ();}

// ── EXPORT ──
async function doExport(){
  const b=document.querySelector('.btn-g');b.textContent='⏳ RENDERING...';b.disabled=true;
  try{
    const c=document.getElementById('card');
    const cv=await html2canvas(c,{scale:2,backgroundColor:'#14100a',useCORS:true,allowTaint:true,logging:false});
    const a=document.createElement('a');
    const t=(document.getElementById('c-title').value||'build').replace(/\s+/g,'-').toLowerCase();
    a.download=`EHT-${t}.png`;a.href=cv.toDataURL('image/png');a.click();
    const ok=document.getElementById('ok');ok.style.opacity=1;setTimeout(()=>ok.style.opacity=0,2500);
  }catch(err){alert('Export error: '+err.message);}
  b.textContent='⬇ EXPORT PNG';b.disabled=false;
}

// ── SAVE / LOAD ──
function getBuildState(){
  const g=id=>document.getElementById(id)?.value||'';
  const typeBtn=document.querySelector('.tbtn.on');
  const getOnclickImg=k=>{
    const el=document.querySelector(`[onclick="up('${k}')"]`);
    return el?.querySelector('img')?.src||null;
  };
  const bgRaw=document.getElementById('cbg').style.backgroundImage;
  const bgMatch=bgRaw.match(/^url\(["']?(.*?)["']?\)$/);
  const images={
    bg:bgMatch?bgMatch[1]:null,
    badge:document.getElementById('badge').style.display!=='none'?document.getElementById('badge-img')?.src||null:null,
  };
  ['m0','m1','m2','st0','st1','st2','rn0','rn1'].forEach(k=>images[k]=getOnclickImg(k));
  return{
    version:1,
    title:g('c-title'),sub:g('c-sub'),colors:g('c-colors'),
    type:typeBtn?.dataset.t||'DUNGEON',
    bname:g('c-bname'),char:g('c-char'),
    credit:g('c-credit'),cls:g('c-cls'),desc:g('c-desc'),
    virtueCounts:{...virtueCounts},
    dual:document.getElementById('dual').classList.contains('on'),
    dark:document.getElementById('bkd')?.value||84,
    mounts:[0,1,2].map(i=>document.getElementById(`mt${i}l`)?.value||''),
    mountOptShown:document.getElementById('mt-opt-slot')?.style.display!=='none',
    steels:[0,1,2].map(i=>document.getElementById(`st${i}l`)?.value||''),
    mountEquipVersions:[0,1,2].map(i=>mountEquipPicked[`st${i}`]||''),
    mountSkillTrait:[0,1,2].map(i=>mountSlotPicked[`m${i}`]||''),
    compRace:g('c-comp-race'),fairyRace:g('c-fairy-race'),fairyBuff:g('c-fairy-buff'),
    statCaps:statCaps.map(s=>({...s})),
    statPriority:statPriority.map(s=>({...s})),
    subs:subs.map(s=>({n:s.n,img:s.img})),
    sets:sets.map(s=>({lbl:s.lbl,better:s.better,slots:s.slots.map(sl=>({n:sl.n,s:sl.s,c:sl.c,t:sl.t,cat:sl.cat,folder:sl.folder,img:sl.img}))})),
    combos:combos.map(c=>({...c})),
    traitImgs:{...traitImgs},
    paragonImgs:JSON.parse(JSON.stringify(paragonImgs)),
    paragonTreePicks:{...paragonTreePicks},
    images
  };
}

function saveBuild(){
  const state=getBuildState();
  const name=(document.getElementById('c-title').value||'build').replace(/\s+/g,'-').toLowerCase();
  const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=`EHT-${name}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  const ok=document.getElementById('ok');ok.style.opacity=1;setTimeout(()=>ok.style.opacity=0,2500);
}

function loadBuild(){
  const fi=document.createElement('input');
  fi.type='file';fi.accept='.json';
  fi.onchange=e=>{
    const f=e.target.files[0];if(!f)return;
    const r=new FileReader();
    r.onload=ev=>{
      try{applyBuildState(JSON.parse(ev.target.result));}
      catch(err){alert('Could not load build: '+err.message);}
    };
    r.readAsText(f);
  };
  fi.click();
}

function applyBuildState(s){
  const set=(id,val)=>{const el=document.getElementById(id);if(el)el.value=val||'';};
  set('c-title',s.title);set('c-sub',s.sub);set('c-colors',s.colors);
  set('c-bname',s.bname);set('c-char',s.char);
  set('c-credit',s.credit);
  set('c-desc',s.desc);
  set('c-cls',s.cls);
  virtueCounts=s.virtueCounts?{...s.virtueCounts}:{};
  renderVirtues();
  // type buttons
  document.querySelectorAll('.tbtn').forEach(b=>b.classList.toggle('on',b.dataset.t===s.type));
  // dual toggle
  document.getElementById('dual').classList.toggle('on',!!s.dual);
  // dark overlay
  if(s.dark){const bkd=document.getElementById('bkd');if(bkd)bkd.value=s.dark;setDark(s.dark);}
  // mounts & steels
  if(s.mounts)s.mounts.forEach((v,i)=>set(`mt${i}l`,v));
  if(s.steels)s.steels.forEach((v,i)=>set(`st${i}l`,v));
  syncMounts();
  if(s.mountOptShown)showOptMount();
  if(s.mountEquipVersions)s.mountEquipVersions.forEach((v,i)=>{if(v)setEquipVerLabel(`st${i}`,v);});
  if(s.mountSkillTrait){s.mountSkillTrait.forEach((v,i)=>{if(v)mountSlotPicked[`m${i}`]=v;});syncMounts();}
  set('c-comp-race',s.compRace||'Dragon');set('c-fairy-race',s.fairyRace||'Dragon');set('c-fairy-buff',s.fairyBuff||'HP Buff');
  syncCompFairy();
  // stats
  if(s.statCaps)statCaps=s.statCaps.map(x=>({...x}));
  if(s.statPriority)statPriority=s.statPriority.map(x=>({...x}));
  if(s.statCaps||s.statPriority){renderStatCtrl();renderStats();}
  // subs
  paragonImgs=s.paragonImgs?JSON.parse(JSON.stringify(s.paragonImgs)):{};
  paragonTreePicks=s.paragonTreePicks?{...s.paragonTreePicks}:{};
  if(s.subs){
    subs.length=0;s.subs.forEach(sub=>subs.push({n:sub.n,e:'⚔',img:sub.img}));
    const[b,sec,thr]=subs.map(x=>x.n);
    const t=CLASS_TREE[b];
    if(t&&t.second.includes(sec)&&t.third.includes(thr)&&t.paragon.includes(s.cls)){
      pickBase(b);pickTier('second',sec);pickTier('third',thr);pickTier('paragon',s.cls);
    }
    renderCardSubs();
  }
  // sets
  if(s.sets){
    sets.length=0;
    s.sets.forEach(st=>sets.push({lbl:st.lbl,better:st.better,slots:st.slots.map(sl=>({n:sl.n,s:sl.s,c:sl.c,t:sl.t,cat:sl.cat,folder:sl.folder,img:sl.img}))}));
    renderEqCtrl();renderSets();
  }
  // trait combos
  traitImgs=s.traitImgs?{...s.traitImgs}:{};
  combos=s.combos&&s.combos.length?s.combos.map(c=>({...c})):[{}];
  renderComboCtrl();renderCardCombos();
  // images
  if(s.images){
    const imgs=s.images;
    const riOc=(k,src)=>{if(!src)return;const el=document.querySelector(`[onclick="up('${k}')"]`);if(el)el.innerHTML=`<img src="${src}" style="width:100%;height:100%;object-fit:cover">`;};
    // background
    if(imgs.bg)document.getElementById('cbg').style.backgroundImage=`url(${imgs.bg})`;
    else document.getElementById('cbg').style.backgroundImage='';
    // badge (only override if the saved build had a custom one — otherwise keep the default OXO logo)
    if(imgs.badge){document.getElementById('badge').style.display='block';document.getElementById('badge-img').src=imgs.badge;}
    // mounts, steels, runes
    ['m0','m1','m2','st0','st1','st2','rn0','rn1'].forEach(k=>riOc(k,imgs[k]));
  }
  renderSkillTree();
  sync();
}

window.addEventListener('resize',()=>{zFit();renderSkillTree();});
