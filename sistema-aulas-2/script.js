/* script.js — (sin cambios de lógica) sistema: login, mapa 30 aulas, reservas, fotos, roles, localStorage */
/* The functionality is the same as before; only design changed. */

const DEFAULT = {
  aulas: Array.from({length:30}, (_,i) => ({
    id: i+1,
    nombre: `Aula ${i+1}`,
    modulo: Math.ceil((i+1)/6),
    ubicacion: `Mód ${Math.ceil((i+1)/6)} - Zona ${(i%6)+1}`,
    recursos: [
      { id:1, nombre:"Computadora", emoji:"💻", cantidad:18, danado:false, fotos:[] },
      { id:2, nombre:"Silla", emoji:"🪑", cantidad:18, danado:false, fotos:[] },
      { id:3, nombre:"Mouse", emoji:"🖱️", cantidad:18, danado:false, fotos:[] },
      { id:4, nombre:"Teclado", emoji:"⌨️", cantidad:18, danado:false, fotos:[] }
    ],
    reservas: []
  }))
};

function loadState(){ const raw = localStorage.getItem('sistema_aulas_state_v1'); if(!raw){ localStorage.setItem('sistema_aulas_state_v1', JSON.stringify(DEFAULT)); return JSON.parse(JSON.stringify(DEFAULT)); } try{ return JSON.parse(raw);}catch(e){ localStorage.setItem('sistema_aulas_state_v1', JSON.stringify(DEFAULT)); return JSON.parse(JSON.stringify(DEFAULT)); } }
function saveState(s){ localStorage.setItem('sistema_aulas_state_v1', JSON.stringify(s)); }

const USERS = [
  {user:'admin', pass:'admin123', role:'admin'},
  {user:'profesor', pass:'prof123', role:'profesor'},
  {user:'tecnico', pass:'tech123', role:'tecnico'}
];

function setSession(u){ localStorage.setItem('session', JSON.stringify(u)); }
function getSession(){ const r=localStorage.getItem('session'); return r?JSON.parse(r):null; }
function clearSession(){ localStorage.removeItem('session'); }

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname.split('/').pop();
  if(path === '' || path === 'index.html') initLogin();
  if(path === 'dashboard.html') initMap();
  if(path === 'aula.html') initAula();
  document.querySelectorAll('#btnLogout, #logoutBtn').forEach(b => { if(b) b.addEventListener('click', ()=>{ clearSession(); window.location.href='index.html'; }); });
});

function initLogin(){
  const form = document.getElementById('loginForm'); if(!form) return;
  form.addEventListener('submit', (e)=>{ e.preventDefault();
    const user = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value.trim();
    const roleSelect = document.getElementById('loginRole').value;
    const found = USERS.find(u => u.user === user && u.pass === pass);
    if(found){ setSession({user:found.user, role:found.role}); window.location.href='dashboard.html'; return; }
    const byRole = USERS.find(u => u.role === roleSelect && u.pass === pass);
    if(byRole){ setSession({user:byRole.user, role:byRole.role}); window.location.href='dashboard.html'; return; }
    alert('Credenciales incorrectas. Usa admin/admin123 o profesor/prof123 o tecnico/tech123');
  });
}

function initMap(){
  const sess = getSession(); if(!sess){ window.location.href='index.html'; return; }
  const state = loadState();
  const badge = document.getElementById('userBadge'); if(badge) badge.textContent = `Conectado: ${sess.user} • rol: ${sess.role}`;

  for(let i=1;i<=30;i++){
    const g = document.getElementById(`aula-${i}`); if(!g) continue;
    g.style.cursor='pointer';
    g.addEventListener('click', ()=> window.location.href=`aula.html?aula=${i}`);
    // hover glow
    g.addEventListener('mouseenter', ()=> { const rect = g.querySelector('.aula-rect'); rect.style.boxShadow = '0 10px 30px rgba(61,209,255,0.08)'; });
    g.addEventListener('mouseleave', ()=> { const rect = g.querySelector('.aula-rect'); rect.style.boxShadow = 'none'; });
  }

  const btnRes = document.getElementById('btnReservas'); if(btnRes) btnRes.addEventListener('click', ()=> {
    const s = loadState();
    const rows = s.aulas.flatMap(a=> a.reservas.map(r=> `<tr><td>Aula ${a.id}</td><td>${r.profesor}</td><td>${new Date(r.inicioISO).toLocaleString()}</td><td>${new Date(r.finISO).toLocaleString()}</td></tr>`)).join('');
    const w = window.open('','_blank','width=800,height=600'); w.document.write(`<body style="background:#eef9ff;color:#04293a;font-family:Poppins,Arial;padding:18px"><h2>Reservas</h2><table border="1" cellpadding="8" style="width:100%"><tr><th>Aula</th><th>Profesor</th><th>Inicio</th><th>Fin</th></tr>${rows}</table></body>`);
  });

  const liveStatus = document.getElementById('liveStatus');
  function updateLive(){
    const now = new Date();
    const st = loadState();
    let occupied = 0;
    for(let i=1;i<=30;i++){
      const g = document.getElementById(`aula-${i}`); if(!g) continue;
      const rect = g.querySelector('.aula-rect');
      const txt = g.querySelector('.aula-num');
      const aulaState = st.aulas.find(a=>a.id===i);
      const occ = aulaState.reservas.find(r => new Date(r.inicioISO) <= now && new Date(r.finISO) > now);
      if(occ){ rect.setAttribute('fill','#ffdede'); txt.textContent = `Aula ${i} • ${occ.profesor}`; occupied++; } else { rect.setAttribute('fill','#ffffff'); txt.textContent = `Aula ${i}`; }
    }
    if(liveStatus) liveStatus.textContent = `${occupied} de ${st.aulas.length} aulas ocupadas ahora`;
  }
  updateLive();
  setInterval(updateLive, 10_000);

  const btnLogout = document.getElementById('btnLogout'); if(btnLogout) btnLogout.addEventListener('click', ()=>{ clearSession(); window.location.href='index.html'; });
}

function initAula(){
  const sess = getSession(); if(!sess){ window.location.href='index.html'; return; }
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get('aula'));
  const state = loadState();
  const aula = state.aulas.find(a=>a.id===id);
  if(!aula){ alert('Aula no encontrada'); window.location.href='dashboard.html'; return; }

  document.getElementById('aulaTitle').textContent = `${aula.nombre} (Mód ${aula.modulo})`;
  document.getElementById('aulaSubtitle').textContent = aula.ubicacion;

  const back = document.getElementById('backBtn'); if(back) back.addEventListener('click', ()=> window.location.href='dashboard.html');
  const logout = document.getElementById('logoutBtn'); if(logout) logout.addEventListener('click', ()=>{ clearSession(); window.location.href='index.html'; });

  const tbody = document.querySelector('#reservasTable tbody');
  function renderReservas(){
    tbody.innerHTML = '';
    aula.reservas.sort((a,b)=> new Date(a.inicioISO)-new Date(b.inicioISO));
    const now = new Date();
    aula.reservas.forEach(r => {
      const tr = document.createElement('tr');
      const estado = (new Date(r.inicioISO) <= now && new Date(r.finISO) > now) ? 'Ocupada' : (new Date(r.finISO) <= now ? 'Finalizada' : 'Reservada');
      tr.innerHTML = `<td>${r.profesor}</td><td>${new Date(r.inicioISO).toLocaleString()}</td><td>${new Date(r.finISO).toLocaleString()}</td><td>${estado}</td>`;
      tbody.appendChild(tr);
    });
  }
  renderReservas();

  const form = document.getElementById('reserveForm');
  form.addEventListener('submit',(e)=>{ e.preventDefault();
    const prof = document.getElementById('resName').value.trim();
    const start = document.getElementById('resStart').value;
    const end = document.getElementById('resEnd').value;
    if(!prof || !start || !end){ alert('Completa todos los campos'); return; }
    const sISO = new Date(start).toISOString();
    const eISO = new Date(end).toISOString();
    if(new Date(sISO) >= new Date(eISO)){ alert('La fecha/hora de fin debe ser posterior al inicio'); return; }
    const conflict = aula.reservas.some(r => !(new Date(eISO) <= new Date(r.inicioISO) || new Date(sISO) >= new Date(r.finISO)));
    if(conflict){ alert('Ya existe una reserva en ese rango horario'); return; }
    aula.reservas.push({ id: Date.now(), profesor: prof, inicioISO: sISO, finISO: eISO });
    saveState(state);
    document.getElementById('resName').value=''; document.getElementById('resStart').value=''; document.getElementById('resEnd').value='';
    renderReservas(); alert('Reserva registrada ✔');
  });

  const wrap = document.getElementById('resourcesWrap');
  function renderResources(){
    wrap.innerHTML = '';
    aula.recursos.forEach(res => {
      const div = document.createElement('div'); div.className='resource-card';
      div.innerHTML = `<div class="resource-title"><span style="font-size:20px">${res.emoji}</span><div><div>${res.nombre} <span class="muted small">(${res.cantidad})</span></div><div class="resource-meta">${res.danado ? 'Estado: Dañado 🚨' : 'Estado: OK ✅'}</div></div></div>
        <div style="margin-top:10px;"><div style="display:flex;gap:6px;flex-wrap:wrap" id="items-${res.id}">${renderItemsVisual(res.cantidad)}</div>
        <div class="resource-actions"><button class="btn btn-outline" data-report="${res.id}">Marcar Dañado</button>
        ${sess.role==='tecnico' ? `<button class="btn btn-primary" data-fix="${res.id}">Marcar Reparado</button>` : ''}
        <button class="btn btn-ghost" data-photos="${res.id}">Fotos (${res.fotos.length})</button></div></div>`;
      wrap.appendChild(div);
    });

    wrap.querySelectorAll('[data-report]').forEach(b=> b.addEventListener('click', ev=> openPhotoModal(Number(ev.currentTarget.getAttribute('data-report'))) ));
    wrap.querySelectorAll('[data-fix]').forEach(b=> b.addEventListener('click', ev=> {
      const rid = Number(ev.currentTarget.getAttribute('data-fix'));
      if(getSession().role!=='tecnico'){ alert('Solo técnicos pueden marcar reparado'); return; }
      const r = aula.recursos.find(x=>x.id===rid); r.danado=false; saveState(state); renderResources(); alert('Reparado ✔');
    }));
    wrap.querySelectorAll('[data-photos]').forEach(b=> b.addEventListener('click', ev=> viewPhotos(aula.id, Number(ev.currentTarget.getAttribute('data-photos')))));
  }
  renderResources();

  const photoModal = document.getElementById('photoModal');
  const closePhoto = document.getElementById('closePhoto');
  const useCam = document.getElementById('useCam');
  const takePic = document.getElementById('takePic');
  const filePicker = document.getElementById('filePicker');
  const preview = document.getElementById('preview');
  const confirmPhoto = document.getElementById('confirmPhoto');
  const cancelPhoto = document.getElementById('cancelPhoto');
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');

  let cameraStream=null, lastImage=null, targetResourceId=null;

  function openPhotoModal(resourceId){ targetResourceId = resourceId; lastImage=null; preview.innerHTML=''; photoModal.classList.remove('hidden'); }
  closePhoto.onclick = ()=> { stopCamera(); photoModal.classList.add('hidden'); lastImage=null; preview.innerHTML=''; };
  cancelPhoto.onclick = ()=> { stopCamera(); photoModal.classList.add('hidden'); lastImage=null; preview.innerHTML=''; };

  useCam.onclick = async ()=> {
    try{ const s = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:'environment' } }); cameraStream=s; video.srcObject=s; video.style.display='block'; video.play(); }catch(e){ alert('No se pudo activar la cámara; usa subir foto.'); console.warn(e); }
  };
  takePic.onclick = ()=> {
    if(!video || !video.srcObject) return alert('Activa cámara primero');
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d'); ctx.drawImage(video,0,0,canvas.width,canvas.height);
    lastImage = canvas.toDataURL('image/jpeg',0.9); preview.innerHTML = `<img src="${lastImage}" alt="captura" />`;
  };
  filePicker.onchange = (e)=> {
    const f = e.target.files[0]; if(!f) return; const reader = new FileReader(); reader.onload = (ev)=> { lastImage = ev.target.result; preview.innerHTML = `<img src="${lastImage}" />`; }; reader.readAsDataURL(f);
  };
  confirmPhoto.onclick = ()=> {
    if(!lastImage) return alert('Toma o sube foto primero');
    const st = loadState(); const a = st.aulas.find(x=>x.id===aula.id); const r = a.recursos.find(x=>x.id===targetResourceId);
    r.fotos = r.fotos || []; r.fotos.push(lastImage); r.danado = true; saveState(st); stopCamera(); photoModal.classList.add('hidden'); alert('Reporte guardado ✔'); window.location.reload();
  };
  function stopCamera(){ if(cameraStream){ cameraStream.getTracks().forEach(t=>t.stop()); cameraStream=null; } try{ video.srcObject=null; }catch(e){} }

  function viewPhotos(aulaId, recursoId){ const st = loadState(); const a = st.aulas.find(x=>x.id===aulaId); const r = a.recursos.find(x=>x.id===recursoId); if(!r.fotos || r.fotos.length===0) return alert('No hay fotos'); const w = window.open('','_blank','width=700,height=600'); const imgs = r.fotos.map(s=>`<div style="margin:8px"><img src="${s}" style="max-width:300px;border-radius:8px"/></div>`).join(''); w.document.write(`<body style="background:#eef9ff;color:#04293a;padding:18px;font-family:Poppins,Arial"><h2>Fotos — ${r.nombre}</h2><div style="display:flex;flex-wrap:wrap">${imgs}</div></body>`); }

  function renderItemsVisual(count){ let html=''; for(let i=0;i<count;i++) html += `<div style="width:28px;height:28px;border-radius:6px;background:rgba(4,41,58,0.04);display:inline-flex;align-items:center;justify-content:center;margin:4px;font-size:12px">${i+1}</div>`; return html; }
}
