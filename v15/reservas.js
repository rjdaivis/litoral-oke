(function(){
  'use strict';
  const KEY='litoral_reservas_v1';
  const NAME_KEY='litoral_nome_cliente_v1';
  const CFG={maxPerClient:3,preventDuplicate:true,minGap:2};
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}};
  const save=v=>localStorage.setItem(KEY,JSON.stringify(v));
  const getName=()=>localStorage.getItem(NAME_KEY)||'';
  const setName=v=>localStorage.setItem(NAME_KEY,v.trim());
  function ensureStyle(){
    if(document.getElementById('litoral-reserva-style')) return;
    const s=document.createElement('style');s.id='litoral-reserva-style';s.textContent=`
      .litoral-reserva-fab{position:fixed;right:14px;bottom:86px;z-index:9990;background:linear-gradient(135deg,#168BFF,#006FE6);color:#fff;border:1px solid #49B2FF;border-radius:999px;padding:10px 15px;font-weight:800;box-shadow:0 0 18px #168bff66;display:flex;align-items:center;gap:8px}
      .litoral-reserva-badge{min-width:22px;height:22px;border-radius:99px;background:#fff;color:#006FE6;display:inline-flex;align-items:center;justify-content:center;font-size:12px}
      .litoral-modal-back{position:fixed;inset:0;background:#020611d9;backdrop-filter:blur(8px);z-index:10000;display:flex;align-items:flex-end;justify-content:center;padding:12px}
      .litoral-modal{width:100%;max-width:520px;max-height:88vh;overflow:auto;background:linear-gradient(180deg,#0c1728,#050b15);border:1px solid #168BFF;border-radius:24px 24px 16px 16px;box-shadow:0 0 35px #168bff44;padding:18px}
      .litoral-modal h2{margin:0;color:#fff;font-size:21px}.litoral-modal .sub{color:#aebed2;font-size:13px;margin:5px 0 14px}
      .litoral-song{background:#fff;color:#17263a;border-radius:14px;padding:11px;margin:8px 0;border:1px solid #168BFF;display:flex;gap:10px;align-items:center}.litoral-song b{color:#0b6fc9}.litoral-song small{display:block;color:#5e6b7e;margin-top:2px}
      .litoral-close{float:right;color:#dbe9f8;background:#13233a;border:1px solid #285b91;border-radius:50%;width:34px;height:34px;font-size:20px}
      .litoral-field{width:100%;background:#081426;border:1px solid #2a8fe8;color:#fff;border-radius:12px;padding:13px;margin:8px 0 12px;outline:none}
      .litoral-primary{width:100%;background:linear-gradient(135deg,#168BFF,#006FE6);color:#fff;border:1px solid #49B2FF;border-radius:14px;padding:13px;font-weight:900}
      .litoral-secondary{width:100%;background:#12233a;color:#dcecff;border:1px solid #285b91;border-radius:14px;padding:11px;font-weight:700;margin-top:8px}
      .litoral-empty{padding:28px 10px;text-align:center;color:#aebed2}.litoral-warning{background:#3a1d14;border:1px solid #b9653b;color:#ffd9c8;padding:10px;border-radius:12px;font-size:13px;margin:8px 0}
    `;document.head.appendChild(s);
  }
  function openModal(mode='list',song=null){
    ensureStyle();
    document.getElementById('litoral-reserva-modal')?.remove();
    const back=document.createElement('div');back.id='litoral-reserva-modal';back.className='litoral-modal-back';
    const box=document.createElement('div');box.className='litoral-modal';back.appendChild(box);
    const close=()=>back.remove();back.addEventListener('click',e=>{if(e.target===back)close()});
    const reservas=load();
    if(mode==='reserve'&&song){
      box.innerHTML=`<button class="litoral-close" aria-label="Fechar">×</button><h2>🎤 Reservar música</h2><div class="sub">Informe o nome de quem vai cantar.</div><div class="litoral-song"><div style="flex:1"><b>${esc(song.title)}</b><small>${esc(song.singer)} • Código ${esc(song.code)}</small></div></div><input id="litoral-nome" class="litoral-field" maxlength="40" placeholder="Nome do cantor" value="${esc(getName())}"><div class="sub">Limite atual: ${CFG.maxPerClient} reservas por pessoa.</div><button id="litoral-confirm" class="litoral-primary">Confirmar reserva</button><button id="litoral-see" class="litoral-secondary">Ver minhas reservas</button>`;
      box.querySelector('.litoral-close').onclick=close;
      box.querySelector('#litoral-see').onclick=()=>openModal('list');
      box.querySelector('#litoral-confirm').onclick=()=>{
        const name=box.querySelector('#litoral-nome').value.trim(); if(!name){alert('Informe o nome de quem vai cantar.');return}
        const all=load(); const mine=all.filter(r=>r.name.toLowerCase()===name.toLowerCase());
        if(mine.length>=CFG.maxPerClient){alert(`Você já atingiu o limite de ${CFG.maxPerClient} reservas.`);return}
        if(CFG.preventDuplicate&&mine.some(r=>String(r.code)===String(song.code))){alert('Você já reservou esta música.');return}
        setName(name);
        const reservation={id:Date.now().toString(36)+Math.random().toString(36).slice(2,7),name,title:song.title,singer:song.singer,code:song.code,createdAt:new Date().toISOString(),status:'reservada'};
        all.push(reservation);save(all);
        window.dispatchEvent(new CustomEvent('litoral-reservation-created',{detail:reservation}));
        openModal('success',reservation);
      };
    } else if(mode==='success'&&song){
      const all=load(); const pos=all.findIndex(r=>r.id===song.id)+1;
      box.innerHTML=`<button class="litoral-close" aria-label="Fechar">×</button><div style="text-align:center;padding:12px 4px 4px"><div style="font-size:48px">🎤</div><h2>Reserva confirmada!</h2><div class="sub">${esc(song.name)}, sua música entrou na fila.</div><div style="font-size:46px;font-weight:900;color:#39A5FF;margin:12px 0">#${pos}</div><div class="sub">Posição atual da reserva neste dispositivo</div><div class="litoral-song" style="text-align:left"><div style="flex:1"><b>${esc(song.title)}</b><small>${esc(song.singer)} • Código ${esc(song.code)}</small></div></div><button id="litoral-success-list" class="litoral-primary">Ver minhas reservas</button><button id="litoral-success-close" class="litoral-secondary">Continuar catálogo</button></div>`;
      box.querySelector('.litoral-close').onclick=close;box.querySelector('#litoral-success-list').onclick=()=>openModal('list');box.querySelector('#litoral-success-close').onclick=close;
    } else {
      const name=getName(); const mine=name?reservas.filter(r=>r.name.toLowerCase()===name.toLowerCase()):[];
      box.innerHTML=`<button class="litoral-close" aria-label="Fechar">×</button><h2>📋 Minhas reservas</h2><div class="sub">${name?`Cantor: <b>${esc(name)}</b>`:'Informe um nome ao reservar uma música.'}</div>${mine.length?mine.map((r,i)=>`<div class="litoral-song"><div style="width:28px;font-weight:900;color:#168BFF">#${i+1}</div><div style="flex:1"><b>${esc(r.title)}</b><small>${esc(r.singer)} • Código ${esc(r.code)} • ${esc(r.status)}</small></div><button data-cancel="${esc(r.id)}" style="background:#ffe9e4;color:#b23a20;border-radius:9px;padding:7px;font-weight:800">×</button></div>`).join(''):`<div class="litoral-empty">Você ainda não tem reservas neste aparelho.</div>`}<button id="litoral-clear" class="litoral-secondary">Fechar</button>`;
      box.querySelector('.litoral-close').onclick=close;box.querySelector('#litoral-clear').onclick=close;
      box.querySelectorAll('[data-cancel]').forEach(btn=>btn.onclick=()=>{const id=btn.dataset.cancel;save(load().filter(r=>r.id!==id));openModal('list')});
    }
    document.body.appendChild(back);
  }
  window.litoralReserve=function(song){openModal('reserve',song)};
  window.litoralOpenReservations=function(){openModal('list')};
  function mountFab(){
    if(document.getElementById('litoral-reserva-fab'))return;
    ensureStyle();const b=document.createElement('button');b.id='litoral-reserva-fab';b.className='litoral-reserva-fab';b.innerHTML='🎤 Reservas <span class="litoral-reserva-badge">0</span>';b.onclick=()=>openModal('list');document.body.appendChild(b);
    const update=()=>{const n=load().length;const badge=b.querySelector('.litoral-reserva-badge');badge.textContent=n};update();window.addEventListener('litoral-reservation-created',update);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mountFab);else mountFab();
})();
