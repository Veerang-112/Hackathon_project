
let data = [];
let filter = 'All';
let currentPage = 1;
const itemsPerPage = 5;
let sortType = "";
let selectedStatuses = new Set();

/* attachment state */
let attachedImages = [];
let attachedPoll = null;
let attachedLocation = null;

const $ = id => document.getElementById(id);

/* ---- IMAGE UPLOAD ---- */
function triggerImageUpload(){
$('fileInput').click();
}

function handleImageUpload(e){
const files = Array.from(e.target.files);
files.forEach(file => {
const reader = new FileReader();
reader.onload = ev => {
attachedImages.push({ src: ev.target.result, name: file.name });
renderAttachments();
};
reader.readAsDataURL(file);
});
e.target.value = '';
}

/* ---- POLL MODAL ---- */
function openPollModal(){
$('pollModal').classList.add('show');
}
function closePollModal(){ $('pollModal').classList.remove('show'); }

function addPollOption(){
const wrap = $('pollOptions');
const idx = wrap.children.length + 1;
const row = document.createElement('div');
row.className = 'poll-option-row';
row.innerHTML = `<input type="text" placeholder="Option ${idx}"><button class="poll-remove" onclick="removePollOption(this)" title="Remove">×</button>`;
wrap.appendChild(row);
}

function removePollOption(btn){
const rows = $('pollOptions').querySelectorAll('.poll-option-row');
if(rows.length <= 2){ alert('A poll needs at least 2 options.'); return; }
btn.closest('.poll-option-row').remove();
}

function attachPoll(){
const question = $('pollQuestion').value.trim();
if(!question){ alert('Please enter a question.'); return; }
const opts = Array.from($('pollOptions').querySelectorAll('input')).map(i=>i.value.trim()).filter(Boolean);
if(opts.length < 2){ alert('Please fill in at least 2 options.'); return; }
const duration = $('pollDuration').value;
attachedPoll = { question, opts, duration };
closePollModal();
renderAttachments();
}

/* ---- LOCATION MODAL ---- */
function openLocModal(){
$('locModal').classList.add('show');
$('locDisplay').className = 'loc-display';
$('locDisplay').innerHTML = '<span>Click the button below to detect your location</span>';
$('locBtn').textContent = '📡 Detect My Location';
$('locBtn').onclick = detectLocation;
attachedLocation = null;
}
function closeLocModal(){ $('locModal').classList.remove('show'); }

function detectLocation(){
const display = $('locDisplay');
const btn = $('locBtn');
display.innerHTML = '⏳ Detecting location...';
if(!navigator.geolocation){ display.innerHTML = '❌ Geolocation not supported.'; return; }
btn.disabled = true;
navigator.geolocation.getCurrentPosition(
pos => {
  const lat = pos.coords.latitude.toFixed(5);
  const lng = pos.coords.longitude.toFixed(5);
  // perform reverse geocoding via Nominatim to get readable address
  const revUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=14`;
  fetch(revUrl, { headers: { 'Accept': 'application/json' } })
    .then(r => r.json())
    .then(j => {
      const addr = j.display_name || `${lat}, ${lng}`;
      attachedLocation = { lat, lng, address: addr };
      display.className = 'loc-display found';
      display.innerHTML = `📍 ${addr}`;
      btn.textContent = '✅ Attach This Location';
      btn.disabled = false;
      btn.onclick = () => { closeLocModal(); renderAttachments(); };
    })
    .catch(() => {
      attachedLocation = { lat, lng };
      display.className = 'loc-display found';
      display.innerHTML = `📍 <strong>Lat:</strong> ${lat} &nbsp; <strong>Lng:</strong> ${lng}`;
      btn.textContent = '✅ Attach This Location';
      btn.disabled = false;
      btn.onclick = () => { closeLocModal(); renderAttachments(); };
    });
},
() => {
display.innerHTML = '❌ Could not get location. Please allow access.';
btn.disabled = false;
}
);
}

function updateLocButtonLabel(){
  const lbl = document.getElementById('locButtonLabel');
  if(!lbl) return;
  if(attachedLocation){
    lbl.textContent = attachedLocation.address ? attachedLocation.address : `${attachedLocation.lat}, ${attachedLocation.lng}`;
    lbl.style.color = 'var(--accent)';
  } else {
    lbl.textContent = 'No location';
    lbl.style.color = 'var(--mid)';
  }
}

/* ---- RENDER ATTACHMENTS ---- */
function renderAttachments(){
const wrap = $('postAttachments');
wrap.innerHTML = '';

attachedImages.forEach((img, i) => {
const div = document.createElement('div');
div.className = 'attach-thumb';
div.innerHTML = `<img src="${img.src}" alt="${img.name}"><button class="attach-remove" onclick="removeImage(${i})" title="Remove">×</button>`;
wrap.appendChild(div);
});

if(attachedPoll){
const div = document.createElement('div');
div.className = 'attach-poll-preview';
div.innerHTML = `
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
<div class="poll-title">📊 ${attachedPoll.question}</div>
<button onclick="removePoll()" style="background:none;border:none;cursor:pointer;color:var(--mid);font-size:18px;line-height:1;">×</button>
</div>
${attachedPoll.opts.map(o=>`<div class="poll-opt">${o}</div>`).join('')}
<div style="font-size:11px;color:var(--mid);margin-top:8px;">⏱ Duration: ${attachedPoll.duration}</div>`;
wrap.appendChild(div);
}

if(attachedLocation){
  const div = document.createElement('div');
  const label = attachedLocation.address ? attachedLocation.address : `${attachedLocation.lat}, ${attachedLocation.lng}`;
  div.innerHTML = `<span class="attach-loc-tag">📍 ${label} <button onclick="removeLocation()" title="Remove">×</button></span>`;
  wrap.appendChild(div.firstChild);
}

// update the small location label on the post action button
updateLocButtonLabel();

const hasAny = attachedImages.length || attachedPoll || attachedLocation;
wrap.classList.toggle('has-items', !!hasAny);
}

function removeImage(i){ attachedImages.splice(i,1); renderAttachments(); }
function removePoll(){ attachedPoll=null; renderAttachments(); }
function removeLocation(){ attachedLocation=null; renderAttachments(); }

/* ---- SUBMIT POST ---- */
function submitPost(){
const text = $('postInput').value.trim();
if(!text && !attachedImages.length && !attachedPoll && !attachedLocation){
alert('Please write a message or add an attachment.');
return;
}
const parts = [];
if(text) parts.push(`Message: "${text}"`);
if(attachedImages.length) parts.push(`${attachedImages.length} image(s)`);
if(attachedPoll) parts.push(`Poll: "${attachedPoll.question}"`);
if(attachedLocation) parts.push(`Location: ${attachedLocation.lat}, ${attachedLocation.lng}`);
alert('✅ Posted!\n\n' + parts.join('\n'));
$('postInput').value = '';
attachedImages = [];
attachedPoll = null;
attachedLocation = null;
renderAttachments();
}

/* ---- ORIGINAL FUNCTIONS (unchanged) ---- */
function closeAll(){ $("filterMenu").style.display="none"; $("sortMenu").style.display="none"; }
function toggleFilter(){ const m=$("filterMenu"); const open=m.style.display==="flex"; closeAll(); if(!open)m.style.display="flex"; }
function toggleSort(){ const m=$("sortMenu"); const open=m.style.display==="flex"; closeAll(); if(!open)m.style.display="flex"; }
document.addEventListener("click",e=>{ if(!e.target.closest(".dropdown")) closeAll(); });

function applyStatusFilter(status,btn){
if(selectedStatuses.has(status)){ selectedStatuses.delete(status); btn.classList.remove("active"); }
else{ selectedStatuses.add(status); btn.classList.add("active"); }
currentPage=1; render();
}
function clearMultiFilter(){ selectedStatuses.clear(); document.querySelectorAll("#filterMenu button").forEach(b=>b.classList.remove("active")); render(); }

function applySort(type){ sortType=type; render(); }

function setFilter(f,btn){
filter=f; currentPage=1;
document.querySelectorAll('.ftab').forEach(t=>t.classList.remove('active'));
btn.classList.add('active');
render();
}

function generateSuggestions(){
const input=$("simpleSearch").value.toLowerCase().trim();
const box=$("suggestions");
if(!input){box.style.display="none";return;}
const matches=data.filter(c=>(c.description||"").toLowerCase().includes(input)).slice(0,5);
if(!matches.length){box.style.display="none";return;}
box.innerHTML=matches.map(c=>
`<div class="suggestion-item" onclick="selectSuggestion('${c.description.replace(/'/g,"")}')">${c.description}</div>`
).join("");
box.style.display="block";
}
function selectSuggestion(text){ $("simpleSearch").value=text; $("suggestions").style.display="none"; render(); }
document.addEventListener("click",e=>{ if(!e.target.closest(".search-bar")) $("suggestions").style.display="none"; });

function highlight(text,words){
if(!words.length)return text;
words.forEach(w=>{ const r=new RegExp(`(${w})`,"gi"); text=text.replace(r,"<mark>$1</mark>"); });
return text;
}

function render(){
let filtered=data;
if(filter!=='All') filtered=filtered.filter(c=>c.status===filter);
if(selectedStatuses.size>0) filtered=filtered.filter(c=>selectedStatuses.has(c.status));
const raw=$("simpleSearch").value.trim().toLowerCase();
const words=raw.split(" ").filter(w=>w);
if(words.length){
filtered=filtered.filter(c=>{
const combined=((c.description||"")+" "+(c.location||"")).toLowerCase();
return words.every(w=>combined.includes(w));
});
}
const advStatus=$("advStatusFilter").value;
if(advStatus) filtered=filtered.filter(c=>c.status===advStatus);
const advLocation=$("advLocationFilter").value.toLowerCase().trim();
if(advLocation)
filtered=filtered.filter(c=>(c.location||"").toLowerCase().includes(advLocation));
if(sortType){
filtered.sort((a,b)=>{
if(sortType==='id_desc') return b.id-a.id;
if(sortType==='id_asc') return a.id-b.id;
if(sortType==='location_asc') return (a.location||"").localeCompare(b.location||"");
if(sortType==='location_desc') return (b.location||"").localeCompare(a.location||"");
});
}
const totalPages=Math.ceil(filtered.length/itemsPerPage)||1;
if(currentPage>totalPages) currentPage=totalPages;
const start=(currentPage-1)*itemsPerPage;
const paginated=filtered.slice(start,start+itemsPerPage);

const feed = $("feed");
if(!paginated.length){
  feed.innerHTML = `<div class="feed-empty">No complaints found.</div>`;
} else {
  feed.innerHTML = paginated.map(c => {
    let desc = highlight(c.description||"", words);
    let loc  = highlight(c.location||"", words);
    const sid = 'sel-'+c.id;
    const cur = c.status || 'Received';
    const sc  = statusClass(cur);
    const timeAgo = c.date ? formatDate(c.date) : 'Recently';
    return `
    <div class="post-card" id="card-${c.id}">
      <div class="post-card-header">
        <div class="post-card-avatar">
          <svg viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
        </div>
        <div class="post-card-meta">
          <span class="post-card-user">Complaint #${c.id}</span>
          <span class="post-card-time">📍 ${loc} &nbsp;·&nbsp; ${timeAgo}</span>
        </div>
        <span class="pill ${sc}-pill post-card-status-pill">${cur}</span>
      </div>
      ${c.image ? `<div class="post-card-img-wrap"><img src="/${c.image}" alt="complaint image" class="post-card-img" loading="lazy"></div>` : ''}
      <div class="post-card-body">
        <p class="post-card-desc">${desc}</p>
      </div>
      <div class="post-card-footer">
        <div class="post-card-actions">
          <button class="post-card-action-btn" onclick="toggleComment(${c.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            Respond
          </button>
        </div>
        <div class="post-card-status-wrap">
          <select class="status-select ${sc}" id="${sid}" onchange="changeStatus(${c.id},this)">
            <option value="Received"    ${cur==='Received'    ?'selected':''}>Received</option>
            <option value="In Progress" ${cur==='In Progress' ?'selected':''}>In Progress</option>
            <option value="Completed"   ${cur==='Completed'   ?'selected':''}>Completed</option>
            <option value="Delayed"     ${cur==='Delayed'     ?'selected':''}>Delayed</option>
          </select>
        </div>
      </div>
      <div class="post-card-comment-box" id="comment-${c.id}" style="display:none;">
        <input type="text" class="comment-input" placeholder="Write a comment..." onkeydown="if(event.key==='Enter') submitComment(${c.id}, this)">
        <button class="comment-submit" onclick="submitComment(${c.id}, this.previousElementSibling)">Send</button>
      </div>
      <div class="post-card-comments" id="comments-list-${c.id}"></div>
    </div>`;
  }).join('');
}

$("pageInfo").textContent=`Page ${currentPage} of ${totalPages}`;
$("prevBtn").disabled=currentPage===1;
$("nextBtn").disabled=currentPage===totalPages;
document.getElementById("totalCount").textContent = data.length;
}

function statusClass(s){
if(s==='Received')   return 's-received';
if(s==='In Progress')return 's-inprogress';
if(s==='Completed')  return 's-completed';
if(s==='Delayed')    return 's-delayed';
return 's-received';
}

function changeStatus(id, sel){
const c = data.find(d=>d.id===id);
if(c){ c.status = sel.value; }
sel.className = 'status-select ' + statusClass(sel.value);
// Update the pill in the card header
const card = document.getElementById('card-'+id);
if(card){
  const pill = card.querySelector('.post-card-status-pill');
  if(pill){
    pill.textContent = sel.value;
    pill.className = 'pill ' + statusClass(sel.value) + '-pill post-card-status-pill';
  }
}
}

function changePage(d){ currentPage+=d; render(); window.scrollTo({top:0,behavior:'smooth'}); }

/* ---- SIDEBAR TOGGLE ---- */
function toggleSidebar(){
  const sb = $('sidebar');
  const ov = $('sidebarOverlay');
  const mainEl = document.querySelector('main');

  if(window.innerWidth >= 769){
    // Desktop: toggle collapse
    const collapsed = sb.classList.toggle('desktop-collapsed');
    if(mainEl) mainEl.classList.toggle('sidebar-collapsed', collapsed);
    if(!collapsed) setTimeout(renderBarChart, 50);
  } else {
    // Mobile: slide-in overlay
    const open = sb.classList.toggle('open');
    ov.classList.toggle('show', open);
    if(open) setTimeout(renderBarChart, 50);
  }
}

/* ---- LIKE ---- */
const likes = {};
function likeCard(id, btn){
  likes[id] = (likes[id]||0) + 1;
  $('likes-'+id).textContent = likes[id];
  btn.classList.add('liked');
  btn.querySelector('svg').style.fill = '#ef4444';
  btn.querySelector('svg').style.stroke = '#ef4444';
}

/* ---- COMMENTS ---- */
function toggleComment(id){
  const box = $('comment-'+id);
  const isHidden = box.style.display === 'none';
  box.style.display = isHidden ? 'flex' : 'none';
  if(isHidden) box.querySelector('input').focus();
}

function submitComment(id, input){
  const text = input.value.trim();
  if(!text) return;
  const list = $('comments-list-'+id);
  const div = document.createElement('div');
  div.className = 'post-comment';
  div.innerHTML = `<span class="comment-author">Admin</span><span class="comment-text">${text}</span>`;
  list.appendChild(div);
  input.value = '';
}

/* ---- DATE FORMAT ---- */
function formatDate(dateStr){
  if(!dateStr) return 'Recently';
  const d = new Date(dateStr);
  if(isNaN(d)) return dateStr;
  const diff = Math.floor((Date.now()-d)/1000);
  if(diff < 60) return 'Just now';
  if(diff < 3600) return Math.floor(diff/60)+'m ago';
  if(diff < 86400) return Math.floor(diff/3600)+'h ago';
  return Math.floor(diff/86400)+'d ago';
}


function renderBarChart(){
  const canvas = $('barChart');
  if(!canvas) return;

  // Count complaints per location from full dataset
  const counts = {};
  data.forEach(c => {
    const loc = (c.location || 'Unknown').trim();
    counts[loc] = (counts[loc] || 0) + 1;
  });

  // Get top 5 locations by count
  const top5 = Object.entries(counts)
    .sort((a,b) => b[1]-a[1])
    .slice(0,5);

  if(!top5.length) return;

  // Set canvas resolution for crisp rendering
  const dpr = window.devicePixelRatio || 1;
  const cssW = canvas.offsetWidth || 220;
  const cssH = 160;
  canvas.width  = cssW * dpr;
  canvas.height = cssH * dpr;
  canvas.style.height = cssH + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const W = cssW;
  const H = cssH;

  // Layout
  const padL = 32, padR = 8, padT = 18, padB = 38;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  // Clear
  ctx.clearRect(0, 0, W, H);

  // Y scale — nice round max
  const maxVal = top5[0][1];
  const niceMax = Math.ceil(maxVal / 5) * 5 || 10;
  const steps = 4;
  const stepVal = niceMax / steps;

  // Gridlines & Y labels
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.font = `${9 * (1/dpr) + 8}px IBM Plex Sans, sans-serif`;
  ctx.font = '9px IBM Plex Sans, sans-serif';

  for(let i = 0; i <= steps; i++){
    const val = stepVal * i;
    const y = padT + chartH - (val / niceMax) * chartH;

    // Gridline
    ctx.beginPath();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + chartW, y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Y label
    ctx.fillStyle = '#9ca3af';
    ctx.fillText(Math.round(val), padL - 4, y);
  }

  // Axes
  ctx.beginPath();
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 1.5;
  // Y axis
  ctx.moveTo(padL, padT);
  ctx.lineTo(padL, padT + chartH);
  // X axis
  ctx.lineTo(padL + chartW, padT + chartH);
  ctx.stroke();

  // Bars
  const barColors = ['#2563eb','#3b82f6','#60a5fa','#93c5fd','#bfdbfe'];
  const n = top5.length;
  const totalGap = chartW * 0.35;
  const barW = (chartW - totalGap) / n;
  const gap = totalGap / (n + 1);

  top5.forEach(([loc, count], i) => {
    const barH = (count / niceMax) * chartH;
    const x = padL + gap + i * (barW + gap);
    const y = padT + chartH - barH;

    // Bar with rounded top
    ctx.fillStyle = barColors[i] || '#2563eb';
    const r = Math.min(4, barW / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + barW - r, y);
    ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
    ctx.lineTo(x + barW, y + barH);
    ctx.lineTo(x, y + barH);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();

    const cx = x + barW / 2;

    // Value label on top
    ctx.fillStyle = '#1e40af';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.font = 'bold 9px IBM Plex Sans, sans-serif';
    ctx.fillText(count, cx, y - 2);

    // X label — wrap into 2 lines max
    const words = loc.split(/[\s,]+/);
    const line1 = words.slice(0, Math.ceil(words.length/2)).join(' ');
    const line2 = words.slice(Math.ceil(words.length/2)).join(' ');
    ctx.fillStyle = '#6b7280';
    ctx.font = '8px IBM Plex Sans, sans-serif';
    ctx.textBaseline = 'top';
    const yLbl = padT + chartH + 5;
    ctx.fillText(line1, cx, yLbl);
    if(line2) ctx.fillText(line2, cx, yLbl + 10);
  });
}

/* ---- MOBILE NAV ACTIVE STATE ---- */
function mobileNavActive(btn){
  document.querySelectorAll('.mobile-nav-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

async function enrichLocations(){
  if(!Array.isArray(data)) return;
  const tasks = data.map(async c => {
    if(!c || !c.location || typeof c.location !== 'string') return;
    const m = c.location.trim().match(/^(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)$/);
    if(m){
      const lat = m[1], lon = m[2];
      try{
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=14`);
        const j = await res.json();
        if(j && j.display_name) c.location = j.display_name;
      }catch(e){ /* ignore */ }
    }
  });
  await Promise.all(tasks);
}

async function load(){
  data = await (await fetch('/complaints')).json();
  await enrichLocations();
  render();
  renderBarChart();
}
load();

// initialize location label
updateLocButtonLabel();

window.addEventListener('resize', () => {
  renderBarChart();
  // When resizing to desktop, ensure overlay is hidden
  if(window.innerWidth >= 769){
    const ov = $('sidebarOverlay');
    if(ov) ov.classList.remove('show');
  }
});
