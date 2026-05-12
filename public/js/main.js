
function showToast(m){const t=document.getElementById('toast');if(!t)return;t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600)}
function safe(v){return v??'N/A'} function badge(s){s=s||'pending';return `<span class="badge badge-${s}">${s}</span>`} function money(n){return '₹'+Number(n||0).toLocaleString('en-IN')}
async function getJSON(url){const r=await fetch(url);const txt=await r.text();let d;try{d=JSON.parse(txt)}catch(e){throw Error('Backend route not connected: '+url)}if(!r.ok)throw Error(d.message||'Request failed');return d}
async function postJSON(url,body){const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const txt=await r.text();let d;try{d=JSON.parse(txt)}catch(e){throw Error('Backend route not connected: '+url)}if(!r.ok)throw Error(d.message||'Request failed');return d}
