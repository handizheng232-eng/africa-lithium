(() => {
  const KEY = document.body.dataset.mine;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const md = s => esc(s).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');
  const num = v => v == null ? 'N.D.' : Number(v).toLocaleString('zh-CN',{maximumFractionDigits:3});
  const CLS=['operating','building','planned','stalled','warn','up','down','blue','ok','nd'];
  const status = (txt, cls) => `<span class="status ${CLS.includes(cls)?cls:'planned'}">${esc(txt)}</span>`;
  const safeUrl = u => { const s = String(u == null ? '' : u).replace(/[\u0000-\u001f\u007f]/g, '').trim();
    if (/^https?:\/\//i.test(s) || /^\/\//.test(s)) return s;
    if (/^[a-z][a-z0-9+.-]*:/i.test(s)) return '#';
    return /^[A-Za-z0-9._~\-\/%#?=&+,@()]*$/.test(s) ? s : '#'; };
  const sourceRows = srcs => (srcs || []).map(s => `<div class="cv-src"><span class="cv-srcname">${esc(s)}</span></div>`).join('');

  function tableRows(rows, mode='op') {
    if (!rows || !rows.length) return `<tr><td colspan="4" class="nd">N.D.</td></tr>`;
    if (mode === 'op') return rows.map(r => `<tr><td class="line">${md(r.name)}</td><td>${md(r.current)}</td><td class="prev">${md(r.previous)}</td><td>${md(r.compare)}</td></tr>`).join('');
    return rows.map(r => {
      const cls = r.status === 'ok' ? 'cv-ok' : 'cv-warn';
      return `<tr><td class="line">${md(r.item)}</td><td>${md(r.adopted)}</td><td class="${cls}">${md(r.verified)}</td><td>${sourceRows(r.sources)}</td></tr>`;
    }).join('');
  }

  function forecastCards(f) {
    const cards=[['bear','悲观'],['base','基准'],['bull','乐观']].map(([k,l]) => {
      const v=f[k];
      return `<div class="fc-card ${k}"><div class="fc-label">${l}</div><div class="fc-val">${v==null?'N.D.':num(v)} <small>${esc(f.unit)}</small></div><div class="fc-note">${k==='bear'?'不利条件兑现':k==='base'?'当前公开进度线性外推':'进度与利用率超预期'}</div></div>`;
    }).join('');
    return `<div class="fc-grid">${cards}</div><p class="desc" style="margin-top:10px"><b>预测依据：</b>${md(f.basis)}</p><div class="note"><b>关键假设：</b>${(f.assumptions||[]).map(md).join('；')}。研究性判断，不构成投资建议。</div>`;
  }

  function historyTable(m) {
    const rows=m.history||[];
    return `<div class="table-wrap"><table class="hist-table"><thead><tr><th>期间</th><th>精矿产量</th><th>销量</th><th>均价</th><th>成本</th><th>性质 / 依据</th></tr></thead><tbody>${rows.map(r=>`<tr><td class="line">${esc(r.period)}</td><td class="num ${r.est?'est':r.production==null?'nd':''}">${r.production==null?'N.D.':num(r.production)+(r.est?'E':'')}</td><td class="num ${r.sales==null?'nd':''}">${r.sales==null?'N.D.':num(r.sales)}</td><td class="num ${r.price==null?'nd':''}">${r.price==null?'N.D.':num(r.price)}</td><td class="num ${r.cost==null?'nd':''}">${r.cost==null?'N.D.':num(r.cost)}</td><td>${md(r.basis)}</td></tr>`).join('')}</tbody></table></div>`;
  }

  function timeline(items) {
    return `<div class="timeline">${(items||[]).map(x=>`<div class="tl"><div class="date">${esc(x.date)}</div><div class="text">${md(x.text)}</div></div>`).join('')}</div>`;
  }

  function kvGrid(rows){ return `<div class="overview-grid">${(rows||[]).map(r=>`<div class="kv"><div class="k">${esc(r.k)}</div><div class="v">${md(r.v)}</div></div>`).join('')}</div>`; }

  function constrTable(rows){
    if(!rows||!rows.length) return '<div class="note">施工节点：N.D.（未见公开里程碑披露）</div>';
    const nk=(rows||[]).filter(r=>r.key).length;
    return `<div class="tl-legend">◆ 重点 = 对产能/投产判断最关键的节点（共 ${nk} 个）</div><div class="table-wrap"><table><thead><tr><th>日期</th><th>里程碑 / 事件</th><th>来源</th></tr></thead><tbody>${rows.map(r=>`<tr class="${r.key?'tl-key':''}"><td class="line">${r.key?'<span class="key-badge">◆ 重点</span>':''}${esc(r.date)}</td><td>${md(r.event)}</td><td class="src-cell">${r.url?`<a target="_blank" rel="noopener" href="${esc(safeUrl(r.url))}">${esc(r.src)}</a>`:esc(r.src)}</td></tr>`).join('')}</tbody></table></div>`;
  }

  function envBlock(e){
    if(!e) return '';
    return `<h5 class="sub-h">环评与环境 / 社会影响</h5><p class="desc"><b>环评状态：</b>${md(e.status)}</p><ul class="smelt-list">${(e.items||[]).map(x=>`<li>${md(x)}</li>`).join('')}</ul>${e.note?`<div class="note">${md(e.note)}</div>`:''}`;
  }

  function econBlock(rows){ if(!rows||!rows.length) return ''; return `<h5 class="sub-h">经济性 / 投资与物流</h5>${kvGrid(rows)}`; }

  function mediaBlock(list){
    if(!list||!list.length) return '<div class="note">官方施工影像：公开渠道暂未获取到该项目的现场影像，后续补充。</div>';
    return `<div class="media-grid">${list.map(x=>`<figure class="media-item"><img src="${esc(safeUrl(x.file))}" alt="${esc(x.cap)}" loading="lazy"><figcaption>${esc(x.cap)}<span class="media-src"><a target="_blank" rel="noopener" href="${esc(safeUrl(x.url))}">${esc(x.src)}</a></span></figcaption></figure>`).join('')}</div>`;
  }

  function socialBlock(list){
    if(!list||!list.length) return '';
    return `<h5 class="sub-h">公开信源与社交媒体线索</h5><ul class="smelt-list">${list.map(x=>`<li><a target="_blank" rel="noopener" href="${esc(safeUrl(x.url))}">${esc(x.label)}</a> ｜ ${esc(x.date)}${x.note?` ｜ ${esc(x.note)}`:''}</li>`).join('')}</ul><div class="note">社媒仅作为进度线索使用；设计产能、投资额与投产口径以公司公告、交易所披露、政府文件和环评为准。</div>`;
  }

  function plantLocBlock(p){
    if(!p) return '';
    const lat=Number(p.lat), lng=Number(p.lng), z=p.zoom||13, ok=isFinite(lat)&&isFinite(lng);
    return `<h5 class="sub-h">📍 冶炼厂选址与区位（◆ 重点）</h5><div class="plant-loc"><div class="overview-grid">
      <div class="kv"><div class="k">厂址 / 落位</div><div class="v">${md(p.site)}</div></div>
      <div class="kv"><div class="k">省 / 区</div><div class="v">${esc(p.region||'N.D.')}</div></div>
      <div class="kv"><div class="k">官方地址</div><div class="v">${esc(p.address||'N.D.')}</div></div>
      <div class="kv"><div class="k">区位 / 距离</div><div class="v">${md(p.distance||'N.D.')}</div></div>
      <div class="kv"><div class="k">厂内工序</div><div class="v">${md(p.processes||'N.D.')}</div></div>
      <div class="kv"><div class="k">公用工程 / 配套</div><div class="v">${md(p.utilities||'N.D.')}</div></div></div>
      ${ok?`<div class="coord">📌 厂区参考坐标 <b>${lat.toFixed(5)}, ${lng.toFixed(5)}</b> ｜ ${esc(p.source||'')}</div>
      <div class="sat-links"><a class="sat-btn" target="_blank" rel="noopener" href="https://yandex.com/maps/?ll=${lng},${lat}&z=${z}">Yandex 卫星图</a><a class="sat-btn" target="_blank" rel="noopener" href="https://www.google.com/maps?q=${lat},${lng}&z=${z}">Google Maps</a><a class="sat-btn" target="_blank" rel="noopener" href="https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${z}/${lat}/${lng}">OpenStreetMap</a></div>`:`<div class="note">该厂址未披露可定位坐标。</div>`}
      <div class="note">${md(p.coordNote||'')}</div></div>`;
  }

  const UBOX_CFG = {
    forecast: { title:'我的统计 / 测算（2027 年产量预测）', hint:'记录你自己的口径与判断，逐条按日期留痕。' },
    smelting: { title:'我的统计 / 测算（配套冶炼 / 转化项目）', hint:'记录产能、投产时点、爬坡等自填口径。' },
    survey:   { title:'我的调研纪要', hint:'记录调研、访谈、电话会要点。' }
  };
  const UBOX_LS='africaLithium.ubox.v2.';
  const UBOX_PUB='data/user_notes.json';
  const UBOX_SLOTS=['forecast','smelting','survey'];
  let PUB={mines:{},loaded:false};
  function uLoad(slot,key){
    try{ const raw=localStorage.getItem(UBOX_LS+slot+'.'+key); if(!raw) return {rows:[],note:'',updated:''};
      const o=JSON.parse(raw); return {rows:Array.isArray(o.rows)?o.rows:[],note:String(o.note==null?'':o.note),updated:String(o.updated==null?'':o.updated)};
    }catch(e){ return {rows:[],note:'',updated:''}; }
  }
  function uSave(slot,key,st){ st.updated=new Date().toLocaleString('zh-CN',{hour12:false}); try{ localStorage.setItem(UBOX_LS+slot+'.'+key,JSON.stringify(st)); }catch(e){} }
  function uDl(name,text,type){ const b=new Blob([text],{type:type||'text/plain;charset=utf-8'}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=name; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},600); }
  function uRows(rows,edit){
    if(!rows.length) return edit?'':'<tr><td colspan="3" class="ubox-empty-row">（暂无）</td></tr>';
    return rows.map((r,i)=>`<tr><td class="line">${edit?`<input data-ubrow="${i}" data-ubcol="date" value="${esc(r.date==null?'':r.date)}" placeholder="2026-09-25">`:esc(r.date==null?'':r.date)}</td><td>${edit?`<input data-ubrow="${i}" data-ubcol="note" value="${esc(r.note==null?'':r.note)}" placeholder="备注 / 要点">`:md(r.note==null?'':r.note)}</td>${edit?`<td class="ubox-del"><button data-ub="del" data-ubidx="${i}" type="button" title="删除此行">✕</button></td>`:''}</tr>`).join('');
  }
  function uboxHTML(slot,key){
    const cfg=UBOX_CFG[slot], st=uLoad(slot,key);
    return `<div class="ubox-bar"><h5>${esc(cfg.title)}</h5><span class="ubox-draft">✎ 本机草稿</span></div>
      <div class="ubox-tools"><button data-ub="add" type="button">＋ 添加一行</button><button data-ub="pub" type="button" class="ubox-pub-btn">🌐 发布到站点</button><button data-ub="mj" type="button">导出 Markdown</button><button data-ub="js" type="button">导出 JSON</button><label class="ubox-file">导入 JSON<input type="file" accept="application/json,.json" data-ub="imp"></label><button data-ub="clr" type="button">清空</button></div>
      <div class="ubox-tip">${esc(cfg.hint)} 点「＋ 添加一行」后直接输入，内容自动存到本机浏览器（localStorage）；换设备或清缓存前请先导出 JSON 备份。<b>「发布到站点」会把本机内容合并进公开文件 data/user_notes.json，提交推送后所有人可见。</b></div>
      <div class="table-wrap"><table class="ubox-table"><thead><tr><th>日期</th><th>备注</th><th></th></tr></thead><tbody>${uRows(st.rows,true)}</tbody></table></div>
      <label class="ubox-notelab">补充说明（可选，整段自由文本）</label><textarea class="ubox-note" data-ubnote rows="3" placeholder="补充假设、来源链接、待核实点…">${esc(st.note)}</textarea>
      <div class="ubox-meta">本机草稿最后保存：<span data-ubmeta>${esc(st.updated||'—')}</span></div>`;
  }
  function uPaint(host,slot,key){ host.innerHTML=`<div class="ubox">${uboxHTML(slot,key)}</div><div class="pub-wrap" data-pub="${esc(slot)}"></div>`; uPaintPub(host,slot,key); }
  function uPaintPub(host,slot,key){
    const box=host.querySelector('[data-pub="'+slot+'"]'); if(!box) return;
    const p=(PUB.mines&&PUB.mines[key]&&PUB.mines[key][slot])||null;
    const rows=(p&&Array.isArray(p.rows))?p.rows:[];
    const note=(p&&p.note)?p.note:'';
    if(!PUB.loaded){ box.innerHTML=''; return; }
    if(!rows.length && !note){ box.innerHTML='<div class="pub-empty">🌐 已发布内容：暂无（点上方「发布到站点」生成公开文件）</div>'; return; }
    box.innerHTML=`<div class="pub-block"><div class="pub-head"><span>🌐 已发布到站点 · 公开可见</span><span class="pub-time">${esc(p.updated||'')}</span></div>
      <div class="table-wrap"><table class="ubox-table pub-table"><thead><tr><th>日期</th><th>备注</th></tr></thead><tbody>${uRows(rows,false)}</tbody></table></div>
      ${note?`<div class="pub-note">${md(note)}</div>`:''}</div>`;
  }
  function uBoxMd(slot,key,mname){
    const cfg=UBOX_CFG[slot], st=uLoad(slot,key);
    let out='# '+mname+' · '+cfg.title+'\n\n> 自填内容（非公开来源数据，不进入本研究口径）· 导出时间 '+new Date().toLocaleString('zh-CN',{hour12:false})+'\n\n';
    out+=(st.rows.length?'| 日期 | 备注 |\n|---|---|\n'+st.rows.map(r=>'| '+String(r.date==null?'':r.date).replace(/\|/g,'\\|')+' | '+String(r.note==null?'':r.note).replace(/\|/g,'\\|').replace(/\n/g,' ')+' |').join('\n')+'\n':'（暂无表格行）\n');
    if(st.note) out+='\n## 补充说明\n\n'+st.note+'\n';
    return out;
  }
  function uBuildPublish(key,slot){
    const out={version:1, updated:new Date().toISOString(), mines:JSON.parse(JSON.stringify(PUB.mines||{}))};
    out.mines[key]=out.mines[key]||{};
    const st=uLoad(slot,key);
    out.mines[key][slot]={rows:st.rows.map(r=>({date:r.date||'',note:r.note||''})), note:st.note||'', updated:new Date().toLocaleString('zh-CN',{hour12:false})};
    return out;
  }
  function mountUboxes(key){
    UBOX_SLOTS.forEach(slot=>{
      const host=document.getElementById('ubox-'+slot); if(!host) return;
      if(!host.dataset.bound){
        host.dataset.bound='1';
        host.addEventListener('input',e=>{
          const t2=e.target;
          if(t2.matches('[data-ubrow]')){ const st=uLoad(slot,key), i=+t2.dataset.ubrow; if(st.rows[i]){ st.rows[i][t2.dataset.ubcol]=t2.value; uSave(slot,key,st); const mt=host.querySelector('[data-ubmeta]'); if(mt) mt.textContent=st.updated; } }
          else if(t2.matches('[data-ubnote]')){ const st=uLoad(slot,key); st.note=t2.value; uSave(slot,key,st); const mt=host.querySelector('[data-ubmeta]'); if(mt) mt.textContent=st.updated; }
        });
        host.addEventListener('click',e=>{
          const b=e.target.closest('[data-ub]'); if(!b) return; const act=b.dataset.ub;
          if(act==='add'){ const st=uLoad(slot,key); st.rows.push({date:'',note:''}); uSave(slot,key,st); uPaint(host,slot,key); }
          else if(act==='del'){ const st=uLoad(slot,key); st.rows.splice(+b.dataset.ubidx,1); uSave(slot,key,st); uPaint(host,slot,key); }
          else if(act==='clr'){ if(confirm('清空这个框的本机草稿？（不影响已发布内容与站点公开数据）')){ uSave(slot,key,{rows:[],note:'',updated:''}); uPaint(host,slot,key); } }
          else if(act==='js'){ const st=uLoad(slot,key); uDl('自填_'+key+'_'+slot+'.json', JSON.stringify({mine:key,slot:slot,exportedAt:new Date().toISOString(),state:st},null,2), 'application/json'); }
          else if(act==='mj'){ uDl('自填_'+key+'_'+slot+'.md', uBoxMd(slot,key,key), 'text/markdown;charset=utf-8'); }
          else if(act==='pub'){
            const payload=uBuildPublish(key,slot);
            uDl('user_notes.json', JSON.stringify(payload,null,2), 'application/json');
            const box=host.querySelector('.ubox');
            const old=box.querySelector('.ubox-pubmsg'); if(old) old.remove();
            const n=Object.keys(payload.mines).length;
            const div=document.createElement('div'); div.className='ubox-pubmsg';
            div.innerHTML='✅ 已生成 <b>user_notes.json</b>（含 '+n+' 个矿山）。两种提交方式：<br>① 把该文件放到站点 <code>data/</code> 目录覆盖同名文件 → <code>git add data/user_notes.json &amp;&amp; git commit -m "更新我的调研与测算" &amp;&amp; git push</code>，推送后公开可见（Pages 约 1 分钟重建）。<br>② 直接把文件发我，我来提交。';
            box.appendChild(div);
          }
        });
        host.addEventListener('change',e=>{
          if(!e.target.matches('[data-ub="imp"]')) return;
          const f=e.target.files&&e.target.files[0]; if(!f) return;
          const fr=new FileReader();
          fr.onload=()=>{ try{ const o=JSON.parse(fr.result);
            let src=null;
            if(o&&o.state&&Array.isArray(o.state.rows)) src=o.state;
            else if(o&&Array.isArray(o.rows)) src=o;
            else if(o&&o.mines&&o.mines[key]&&o.mines[key][slot]) src=o.mines[key][slot];
            if(!src){ alert('导入失败：文件里没有可识别的 rows（支持 自填导出JSON 或 user_notes.json）'); return; }
            if(o&&o.mines){ PUB.mines=o.mines; PUB.loaded=true; }
            const st=uLoad(slot,key); st.rows=Array.isArray(src.rows)?src.rows:[]; if(typeof src.note==='string') st.note=src.note; uSave(slot,key,st);
            uPaint(host,slot,key);
            if(o&&o.mines){ UBOX_SLOTS.forEach(s2=>{ const h2=document.getElementById('ubox-'+s2); if(h2&&s2!==slot) uPaintPub(h2,s2,key); }); }
          }catch(err){ alert('导入失败：JSON 解析错误'); } };
          fr.readAsText(f);
        });
      }
      uPaint(host,slot,key);
    });
  }
  function loadPublished(){
    fetch(UBOX_PUB,{cache:'no-store'}).then(r=>r.ok?r.json():null).then(o=>{
      PUB.mines=(o&&o.mines)?o.mines:{}; PUB.updated=(o&&o.updated)||''; PUB.loaded=true;
    }).catch(()=>{ PUB.mines={}; PUB.loaded=true; }).then(()=>{
      const host=document.querySelector('.ubox-host'); const key=host&&host.dataset.minekey;
      UBOX_SLOTS.forEach(slot=>{ const h=document.getElementById('ubox-'+slot); if(h) uPaintPub(h,slot,key); });
    });
  }
  function zwPanel(m, Z){
    if(!Z || !/津巴布韦/.test(m.country||'')) return '';
    return `<div class="zw-panel"><h4>🇿🇼 津巴布韦硫酸锂产能格局 · 本国横向对照</h4>
      <div class="table-wrap"><table><thead><tr><th>企业 / 矿山</th><th>设计产能</th><th>投资额</th><th>状态</th><th>目标投产</th></tr></thead><tbody>${Z.table.map(r=>`<tr><td class="line">${esc(r.mine)}</td><td>${esc(r.cap)}</td><td>${esc(r.capex)}</td><td>${esc(r.status)}</td><td>${esc(r.target)}</td></tr>`).join('')}</tbody></table></div>
      <p class="desc"><b>合计：</b>${md(Z.total.text)}；${md(Z.total.lce)}。${md(Z.total.ref)}</p>
      <h5 class="sub-h">硫酸锂 → LCE 换算口径（三套并列，不可混用）</h5>
      <ul class="smelt-list">${Z.conversion.rows.map(r=>`<li>${esc(r.basis)}：<b>${esc(r.factor)}</b></li>`).join('')}</ul>
      <h5 class="sub-h">本地增值政策与出口管制时间线</h5>
      <ul class="smelt-list">${Z.policy.map(r=>`<li><b>${esc(r.k)}</b>：${md(r.v)}</li>`).join('')}</ul>
      <div class="note">${md(Z.note)}政策整理至 ${esc(Z.asOf)}。</div></div>`;
  }

  function smelting(cards) {
    return (cards||[]).map(s => `<div class="smelt-card"><h4>${esc(s.name)} ${status(s.status,s.statusClass)}</h4><div class="smelt-meta"><span class="tag">产能：${esc(s.capacity==='N.D.'?'未披露':s.capacity)}</span><span class="tag">产品：${esc(s.product==='N.D.'?'尚未确定':s.product)}</span><span class="tag">时间：${esc(s.timing==='N.D.'?'未披露':s.timing)}</span><span class="tag">投资：${esc(s.capex==='N.D.'?'未披露':s.capex)}</span></div><div class="overview-grid smelt-track"><div class="kv"><div class="k">FID / 决策状态</div><div class="v">${esc(s.fid||'未披露')}</div></div><div class="kv"><div class="k">是否计入供应</div><div class="v">${esc(s.include||'不计入')}</div></div><div class="kv"><div class="k">最近核验</div><div class="v">${esc(s.asOf||'2026-09')}</div></div></div><p class="desc"><b>最新进展：</b>${md(s.progress)}</p><p class="desc"><b>研究判断 / 风险：</b>${md(s.risk)}</p><p class="desc"><b>下一观察点：</b>${md(s.next||'等待项目公司进一步披露')}</p>${plantLocBlock(s.plantLocation)}${s.design?`<h5 class="sub-h">设计参数 · 工艺与厂址</h5>${kvGrid(s.design)}`:''}${s.construction?`<h5 class="sub-h">建设与进展时间线</h5>${constrTable(s.construction)}`:''}${envBlock(s.environment)}${econBlock(s.economics)}${s.media?`<h5 class="sub-h">官方施工与现场影像</h5>${mediaBlock(s.media)}`:''}${s.social?socialBlock(s.social):''}<div class="note"><b>跟踪来源：</b>${(s.sources||[]).map(md).join('；')}。可点击来源见页末 Sources。</div></div>`).join('');
  }

  function navHtml(all,key){ return all.map(x=>`<a class="${x.key===key?'active':''}" href="${esc(safeUrl(x.file))}">${esc(x.label)}</a>`).join(''); }

  function render(m, D) {
    const all = D.nav;
    document.title=`${m.name} ｜ 全球非澳洲锂矿供应梳理`;
    document.getElementById('app').innerHTML=`
      <header class="hero">
        <h1>${esc(m.name)}</h1>
        <div class="sub"><a href="overview.html">← 返回非洲锂矿总览</a> ｜ ${esc(m.company)} ｜ 最新披露：${esc(m.report)}</div>
        <div class="tags"><span class="tag hl">${esc(m.status)}</span><span class="tag">${esc(m.country)}</span><span class="tag">${esc(m.grade)}</span><span class="tag">${esc(m.product)}</span></div>
        <div class="nav">${navHtml(all,m.key)}</div>
      </header>

      <section class="mine-block"><div class="mine-head"><h2>项目概览</h2><span class="src">100% 资产口径优先；权益另列</span></div><div class="cat"><div class="overview-grid">
        <div class="kv"><div class="k">公司 / 权益</div><div class="v">${esc(m.equity)}</div></div>
        <div class="kv"><div class="k">资源 / 品位</div><div class="v">${esc(m.resource)}</div></div>
        <div class="kv"><div class="k">采选产能</div><div class="v">${esc(m.capacity)}</div></div>
        <div class="kv"><div class="k">产品</div><div class="v">${esc(m.product)}</div></div>
        <div class="kv"><div class="k">位置</div><div class="v">${esc(m.location)}</div></div>
        <div class="kv"><div class="k">当前状态</div><div class="v">${status(m.status,m.statusClass)}</div></div>
      </div>${timeline(m.timeline)}</div></section>

      <section class="mine-block" id="s1"><div class="mine-head"><h2>① 已有产线运行状况表述</h2><span class="q">${esc(m.latest)} vs ${esc(m.previous)}</span></div><div class="cat"><div class="table-wrap"><table><thead><tr><th>产线 / 项目</th><th>最新披露期（${esc(m.latest)}）</th><th>上一可比期（${esc(m.previous)}）</th><th>对比 · 超预期</th></tr></thead><tbody>${tableRows(m.existing)}</tbody></table></div></div></section>

      <section class="mine-block" id="s2"><div class="mine-head"><h2>② 在建 / 规划中产线运行状况表述</h2><span class="q">严格区分可研 / FID / 开工 / 投产</span></div><div class="cat"><div class="table-wrap"><table><thead><tr><th>项目</th><th>最新披露期</th><th>上一可比期</th><th>进度判断 · 超预期</th></tr></thead><tbody>${tableRows(m.planned)}</tbody></table></div>${timeline(m.timeline)}</div></section>

      <section class="mine-block" id="s3"><div class="mine-head"><h2>③ 整体运行状况表述</h2><span class="q">${esc(m.latest)} vs ${esc(m.previous)}</span></div><div class="cat"><div class="cmp-grid"><p class="desc"><b>最新披露期：</b>${md(m.overall.current)}</p><p class="desc"><b>上一可比期：</b>${md(m.overall.previous)}</p></div><p class="desc"><b>未来产量预期：</b>${md(m.overall.future)}</p><div class="hl-box"><h4>⚡ 超预期 / 意外要点</h4><ul>${(m.overall.highlights||[]).map(x=>`<li>${md(x)}</li>`).join('')}</ul></div></div></section>

      <section class="mine-block" id="s4"><div class="mine-head"><h2>④ 历史数据情况</h2><span class="q">按真实披露频率；不制造季度数据</span></div><div class="cat"><div class="note" style="margin-bottom:10px">产量单位：${esc(m.historyUnit)}。带 E 后缀及描边柱为估算或公司目标；N.D. = 官方未披露。均价/成本仅在项目公司披露时填列。</div><div class="hist-grid"><div class="panel"><h4>精矿产量历史</h4><div class="chart" id="hist_chart"></div></div><div class="panel"><h4>披露完整性</h4><div class="overview-grid"><div class="kv"><div class="k">披露期数</div><div class="v">${(m.history||[]).length}</div></div><div class="kv"><div class="k">有实际/明确值</div><div class="v">${(m.history||[]).filter(r=>r.production!=null&&!r.est).length}</div></div><div class="kv"><div class="k">估算 / 目标</div><div class="v">${(m.history||[]).filter(r=>r.est).length}</div></div></div><div class="desc" style="margin-top:10px">非洲项目多按年度/半年度披露。本页保留原始周期，不将年度值均分到季度。</div><div class="desc"><b>产品口径：</b>${esc(m.product)}</div><div class="desc"><b>数据源：</b>${esc(m.report)}</div></div></div>${historyTable(m)}</div></section>

      <section class="mine-block" id="s5"><div class="mine-head"><h2>⑤ 2027 年产量预测</h2><span class="q">研究性判断 · 日历年度 · 100% 资产口径</span></div><div class="cat">${forecastCards(m.forecast)}<div id="ubox-forecast" class="ubox-host" data-minekey="${esc(m.key)}"></div></div></section>

      <section class="mine-block" id="s6"><div class="mine-head"><h2>⑥ 选矿产能核实</h2><span class="q">多来源交叉印证 · 设计 ≠ 实际</span></div><div class="cat"><p class="desc"><b>核实方法：</b>优先使用运营商年报、交易所公告、DFS/RNS；媒体约数仅作交叉验证。</p><div class="table-wrap"><table><thead><tr><th>产线 / 项目</th><th>页面采用</th><th>核实结果</th><th>来源 / 证据</th></tr></thead><tbody>${tableRows(m.beneficiation,'verify')}</tbody></table></div></div></section>

      <section class="mine-block" id="s7"><div class="mine-head"><h2>⑦ 原矿产能核实</h2><span class="q">矿坑 / 矿体 / 基础设施</span></div><div class="cat"><p class="desc"><b>核实方法：</b>区分资源量、储量、原矿处理能力和精矿产品能力；不同范围/日期并列呈现。</p><div class="table-wrap"><table><thead><tr><th>矿坑 / 设施</th><th>页面采用</th><th>建成与规划状态</th><th>来源 / 证据</th></tr></thead><tbody>${tableRows(m.mining,'verify')}</tbody></table></div>
        <h3 style="margin:22px 0 10px">${m.coord.isArea ? '🗺️ 项目群区域范围（非矿址）' : '🛰️ 卫星影像与地图定位'}</h3><div class="coord">${m.coord.isArea ? '📌 区域参考中心（非矿址）' : '📍 矿区坐标'} <b>${Number(m.coord.lat).toFixed(5)}, ${Number(m.coord.lng).toFixed(5)}</b> ｜ ${esc(m.coord.source)}</div><div class="sat-grid"><iframe src="https://www.google.com/maps?q=${m.coord.lat},${m.coord.lng}&z=${m.coord.zoom||14}&output=embed" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade" title="${esc(m.name)} ${m.coord.isArea ? '区域参考图' : '卫星视图'}"></iframe></div><div class="sat-links"><a class="sat-btn" target="_blank" rel="noopener" href="https://yandex.com/maps/?ll=${m.coord.lng},${m.coord.lat}&z=${m.coord.zoom||14}">Yandex ${m.coord.isArea ? '区域图' : '卫星图'}</a><a class="sat-btn" target="_blank" rel="noopener" href="https://www.google.com/maps?q=${m.coord.lat},${m.coord.lng}&z=${m.coord.zoom||14}">Google Maps</a><a class="sat-btn" target="_blank" rel="noopener" href="https://www.openstreetmap.org/?mlat=${m.coord.lat}&mlon=${m.coord.lng}#map=${m.coord.zoom||14}/${m.coord.lat}/${m.coord.lng}">OpenStreetMap</a></div><div class="note">${m.coord.isArea ? '本页为多州项目群，未披露的单项目矿址不得由此中心点替代；许可证编号也不等同于空间边界。' : '底图为公开卫星/航拍影像；矿区边界以许可证/矿权证为准。'}</div>
      </div></section>

      <section class="mine-block" id="s8"><div class="mine-head"><h2>⑧ 配套冶炼 / 转化项目解析与跟踪</h2><span class="q">硫酸锂 / 锂盐 · 避免与精矿重复计量</span></div><div class="cat">${zwPanel(m,D.zimbabweSulphate)}${smelting(m.smelting)}<div id="ubox-smelting" class="ubox-host" data-minekey="${esc(m.key)}"></div></div></section>

      <section class="mine-block" id="s9"><div class="mine-head"><h2>⑨ 调研信息</h2><span class="q">我的调研纪要 · 自填 · 不进入研究口径</span></div><div class="cat"><div class="note" style="margin-bottom:12px">本栏用于沉淀我自己的调研/访谈/电话会纪要。分两条轨道：<b>✎ 本机草稿</b>存在本机浏览器（仅自己可见，不随站点更新）；点「🌐 发布到站点」会把本机内容合并进公开文件 <b>data/user_notes.json</b>，提交推送后成为<b>公开可见</b>内容。两轨均<b>不属于公开来源证据，也不进入本研究口径与合计</b>。</div><div id="ubox-survey" class="ubox-host" data-minekey="${esc(m.key)}"></div></div></section>

      <section class="mine-block"><div class="mine-head"><h2>来源（Sources）</h2><span class="src">旧页证据链完整保留</span></div><div class="cat"><ol class="sources">${(m.sources||[]).map(s=>`<li>${s.url?`<a target="_blank" rel="noopener" href="${esc(safeUrl(s.url))}">${esc(s.text)}</a>`:esc(s.text)}</li>`).join('')}</ol></div></section>
      <section class="mine-block"><div class="mine-head"><h2>口径与说明</h2></div><div class="cat"><div class="note">· 历史数据按公司真实披露频率展示；没有季度数据时不进行年度均分。<br>· 产量、销量、品位、价格和成本口径不统一，跨矿比较须回到本页行标签。<br>· 设计产能、目标、试产、首发运和商业达产严格区分。<br>· 冶炼/转化项目单独跟踪，精矿与转化产品不可重复计入供应。<br>· 数据整理至 2026-09，仅供研究参考，不构成投资建议。</div></div></section>
      <div class="footer">全球非澳洲锂矿供应梳理 · ${esc(m.name)}</div>`;
    renderChart(m);
    mountUboxes(m.key);
    loadPublished();
    if (location.hash) {
      setTimeout(() => document.querySelector(location.hash)?.scrollIntoView({block:'start'}), 80);
    }
  }

  function renderChart(m){
    const el=document.getElementById('hist_chart');
    if(!el||typeof echarts==='undefined') return;
    const rows=m.history||[];
    const chart=echarts.init(el,null,{renderer:'canvas'});
    const data=rows.map(r=>r.production==null?null:(r.est?{value:r.production,itemStyle:{color:'rgba(77,163,255,.32)',borderColor:'#4da3ff',borderWidth:1.5}}:r.production));
    chart.setOption({backgroundColor:'transparent',tooltip:{trigger:'axis'},grid:{left:48,right:12,top:28,bottom:45},xAxis:{type:'category',data:rows.map(r=>r.period),axisLabel:{color:'#a9b6cf',fontSize:11,rotate:0},axisLine:{lineStyle:{color:'#2a3550'}}},yAxis:{type:'value',name:m.historyUnit,axisLabel:{color:'#a9b6cf',fontSize:11},nameTextStyle:{color:'#a9b6cf'},splitLine:{lineStyle:{color:'#232f49'}}},series:[{name:'精矿产量',type:'bar',data,itemStyle:{color:'#4da3ff'},label:{show:true,position:'top',color:'#dbe4f3',fontSize:10,formatter:p=>p.value==null?'':p.value+(rows[p.dataIndex]?.est?'E':'')}}]});
    addEventListener('resize',()=>chart.resize());
  }

  fetch('data/mines_v2.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(`data HTTP ${r.status}`);return r.json();}).then(d=>{
    const m=d.mines[KEY]; if(!m) throw new Error(`unknown mine key: ${KEY}`); render(m,d);
  }).catch(err=>{document.getElementById('app').innerHTML=`<div class="mine-block"><div class="cat"><h2>页面数据加载失败</h2><p class="note">${esc(err.message)}。请通过 HTTP 服务访问，不要用 file:// 双击。</p></div></div>`;console.error(err);});
})();
