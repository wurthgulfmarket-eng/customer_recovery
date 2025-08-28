const API = {
async http(method, path, body){
const res = await fetch(`${window.API_BASE}${path}`,{
method,
headers:{'Content-Type':'application/json'},
body: body ? JSON.stringify(body) : undefined
})
if(!res.ok){ throw new Error(`${method} ${path} → ${res.status}`) }
return res.json()
},
health(){ return this.http('GET','/health') },
list({search='',status=''}={}){ const q=new URLSearchParams({search,status}); return this.http('GET',`/customers?${q}`) },
create(c){ return this.http('POST','/customers',c) },
remove(id){ return this.http('DELETE',`/customers/${id}`) }
}


const els = {
rows: document.querySelector('#rows'),
search: document.querySelector('#search'),
status: document.querySelector('#status'),
refresh: document.querySelector('#refresh'),
health: document.querySelector('#health'),
form: document.querySelector('#createForm')
}


boot()


async function boot(){
try{
const h = await API.health(); els.health.textContent = `API OK – ${new Date(h.now).toLocaleString()}`
}catch(e){ els.health.textContent='API DOWN'; console.error(e) }
bind()
await load()
}


function bind(){
els.refresh.onclick = () => load()
els.search.oninput = debounce(()=>load(), 250)
els.status.onchange = ()=>load()
els.form.addEventListener('submit', async ()=>{
const fd = new FormData(els.form)
const body = Object.fromEntries(fd.entries())
await API.create(body)
els.form.reset()
await load()
})
}


async function load(){
const data = await API.list({ search: els.search.value, status: els.status.value })
render(data)
}


function render(rows){
els.rows.innerHTML = rows.map(r=>`
<tr>
<td>${escapeHtml(r.account_number)}</td>
<td>${escapeHtml(r.company_name)}</td>
<td>${escapeHtml(r.emirate)}</td>
<td>${escapeHtml(r.area)}</td>
<td>${escapeHtml(r.status)}</td>
<td>${escapeHtml(r.payment_status)}</td>
<td>${Number(r.outstanding_amount).toLocaleString()}</td>
<td>${Number(r.recovered_amount).toLocaleString()}</td>
<td>${escapeHtml(r.sales_consultant || '')}</td>
<td><button data-id="${r.id}" class="del">Delete</button></td>
</tr>`).join('')
for (const btn of document.querySelectorAll('button.del')){
btn.onclick = async () => { await API.remove(btn.dataset.id); await load() }
}
}


function debounce(fn, ms){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms) } }
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[m])) }