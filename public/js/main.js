
const $ = id => document.getElementById(id);
const safe = v => v ?? "N/A";
const money = n => "₹" + Number(n || 0).toLocaleString("en-IN");
function badge(status){const s=status||"pending";return `<span class="badge badge-${s}">${s}</span>`;}
function toast(msg){const t=$("toast"); if(!t) return; t.textContent=msg; t.classList.add("show"); setTimeout(()=>t.classList.remove("show"),2600)}
async function getJSON(url){const r=await fetch(url);const text=await r.text();let d;try{d=JSON.parse(text)}catch(e){throw new Error("Backend route not connected: "+url)} if(!r.ok) throw new Error(d.message||"Request failed"); return d;}
async function postJSON(url,body){const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const text=await r.text();let d;try{d=JSON.parse(text)}catch(e){throw new Error("Backend route not connected: "+url)} if(!r.ok) throw new Error(d.message||"Request failed"); return d;}
async function deleteJSON(url){const r=await fetch(url,{method:"DELETE"});const text=await r.text();let d;try{d=JSON.parse(text)}catch(e){throw new Error("Backend route not connected: "+url)} if(!r.ok) throw new Error(d.message||"Request failed"); return d;}
function setAppointment(id){localStorage.setItem("appointment_id",id)}
function filterCards(){const q=($("globalSearch")?.value||"").toLowerCase();document.querySelectorAll(".filter-card").forEach(c=>c.style.display=c.textContent.toLowerCase().includes(q)?"block":"none")}
