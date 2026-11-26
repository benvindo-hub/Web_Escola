let estudantes = JSON.parse(localStorage.getItem('estudantes_equipa2') || '[]');

let editId = null;
let ordem = {campo:'nome', asc:true};

if(estudantes.length===0){
  estudantes = [
    {id:1,nome:"Isack Caetano",matricula:"2024-001",curso:"Informática",ano:"3º Ano",email:"ana@email.com",notas:[16,15,17]},
    {id:2,nome:"Ana Caiombo",matricula:"2024-002",curso:"Informática",ano:"3º Ano",email:"joao@email.com",notas:[12,13,11]},
    {id:3,nome:"Geraldo Edmundo",matricula:"2024-003",curso:"Gestão",ano:"2º Ano",email:"maria@email.com",notas:[18,19,17]},
    {id:4,nome:"Benvindo Cahingana",matricula:"2024-004",curso:"Contabilidade",ano:"3º Ano",email:"pedro@email.com",notas:[8,9,7]},
  ];
  
}
salvar();

function guardarEstudante(e){
  e.preventDefault();
  let nome=document.getElementById('nome').value.trim();
  let mat=document.getElementById('matricula').value.trim();
  let curso=document.getElementById('curso').value;
  let ano=document.getElementById('ano').value;
  let email=document.getElementById('email').value.trim();
  let ok=true;
  document.getElementById('erroNome').style.display = nome.length<3 ? 'block':'none';
  if(nome.length<3) ok=false;
  let duplicado = estudantes.some(x=>x.matricula.toLowerCase()===mat.toLowerCase() && x.id!==editId);
  document.getElementById('erroMat').style.display = duplicado ? 'block':'none';
  if(duplicado) ok=false;
  if(!curso){ alert("Seleciona o curso!"); return; }
  if(!ok) return;
  if(editId){
    let est=estudantes.find(x=>x.id===editId);
    Object.assign(est,{nome,matricula:mat,curso,ano,email});
    editId=null; document.getElementById('tituloForm').innerText="Registar Estudante";
  } else {
    estudantes.push({id:Date.now(),nome,matricula:mat,curso,ano,email,notas:[]});
  }
  salvar(); e.target.reset(); render();
  alert("Estudante guardado com sucesso!");
}
function salvar(){ localStorage.setItem('estudantes_equipa2', JSON.stringify(estudantes)); }
function media(e){ if(!e.notas||e.notas.length===0) return 0; return e.notas.reduce((a,b)=>a+b,0)/e.notas.length; }
function classificacao(m){
  if(m===0) return "Sem Notas";
  else if(m>=16) return "Excelente";
  else if(m>=14) return "Bom";
  else if(m>=10) return "Suficiente";
  else return "Insuficiente";
}
function mostrar(id,btn){
  document.querySelectorAll('section').forEach(s=>s.classList.add('hidden'));
  document.getElementById('sec-'+id).classList.remove('hidden');
  document.querySelectorAll('nav button').forEach(b=>b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  render();
}

function cancelarEdicao(){ editId=null; document.getElementById('formEst').reset(); document.getElementById('tituloForm').innerText="Registar Estudante"; }
function editar(id){
  let est=estudantes.find(x=>x.id===id); editId=id;
  document.getElementById('nome').value=est.nome; document.getElementById('matricula').value=est.matricula;
  document.getElementById('curso').value=est.curso; document.getElementById('ano').value=est.ano; document.getElementById('email').value=est.email||"";
  document.getElementById('tituloForm').innerText="Editar: "+est.nome;
  mostrar('estudantes', document.querySelectorAll('nav button')[1]);
}
function apagar(id){
  if(!confirm("Apagar este estudante?")) return;
  estudantes=estudantes.filter(x=>x.id!==id); salvar(); render();
}
function ordenarPor(campo){
  if(ordem.campo===campo) ordem.asc=!ordem.asc; else {ordem.campo=campo; ordem.asc=true;}
  render();
}
function render(){
  // Filtros + Pesquisa dinâmica
  let q=document.getElementById('pesquisa').value.toLowerCase();
  let fc=document.getElementById('filtroCurso').value;
  let fcl=document.getElementById('filtroClass').value;
  let lista=estudantes.filter(e=>{
    let txt=(e.nome+" "+e.matricula+" "+e.curso).toLowerCase();
    return txt.includes(q) && (!fc||e.curso===fc) && (!fcl||classificacao(media(e))===fcl);
  });
  // Ordenação
  lista.sort((a,b)=>{
    let va=a[ordem.campo], vb=b[ordem.campo];
    if(ordem.campo==='media'){ va=media(a); vb=media(b); }
    if(typeof va==='string') return ordem.asc? va.localeCompare(vb): vb.localeCompare(va);
    return ordem.asc? va-vb: vb-va;
  });
  let tbody=document.getElementById('tabela');
  tbody.innerHTML=lista.map(e=>{
    let m=media(e), c=classificacao(m);
    return `<tr><td><b>${e.nome}</b><br><small style="color:#64748b">${e.ano}</small></td><td>${e.matricula}</td><td>${e.curso}</td><td><b>${m.toFixed(1)}</b></td><td><span class="badge ${c}">${c}</span></td><td><button class="btn small blue" onclick="editar(${e.id})">Editar</button> <button class="btn small red" onclick="apagar(${e.id})">Apagar</button></td></tr>`;
  }).join('');
  document.getElementById('vazio').style.display = lista.length? 'none':'block';

  // Indicadores
  document.getElementById('totalEst').innerText=estudantes.length;
  document.getElementById('totalCursos').innerText=new Set(estudantes.map(e=>e.curso)).size;
  let medias=estudantes.map(media).filter(m=>m>0);
  let mg=medias.length? (medias.reduce((a,b)=>a+b,0)/medias.length):0;
  document.getElementById('mediaGeral').innerText=mg.toFixed(1);
  document.getElementById('totalAprov').innerText=estudantes.filter(e=>media(e)>=10).length;

  // Últimos
  document.getElementById('ultimos').innerHTML=estudantes.slice(-3).reverse().map(e=>`<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #eee"><span><b>${e.nome}</b><br><small>${e.curso} • ${e.matricula}</small></span><span class="badge ${classificacao(media(e))}">${classificacao(media(e))}</span></div>`).join('') || "Sem estudantes";

  // Select de notas
  document.getElementById('selEstudante').innerHTML=estudantes.map(e=>`<option value="${e.id}">${e.nome} - ${e.matricula}</option>`).join('');

  // Relatório
  let cursos=[...new Set(estudantes.map(e=>e.curso))];
  document.getElementById('relatorio').innerHTML=cursos.map(c=>{
    let arr=estudantes.filter(e=>e.curso===c); let mm=arr.map(media); let avg=mm.length? (mm.reduce((a,b)=>a+b,0)/mm.length).toFixed(1):0;
    return `<p style="margin:8px 0"><b>${c}</b> — ${arr.length} estudantes • Média ${avg} • Aprovados: ${arr.filter(e=>media(e)>=10).length}</p>`;
  }).join('') || "Sem dados";

  desenharGrafico();
}
function preverMedia(){
  let n1=+document.getElementById('n1').value||0, n2=+document.getElementById('n2').value||0, n3=+document.getElementById('n3').value||0;
  let m=(n1+n2+n3)/3;
  document.getElementById('prevMedia').innerText=m.toFixed(1);
  document.getElementById('prevClass').innerText=classificacao(m);
}
function guardarNotas(){
  let id=+document.getElementById('selEstudante').value;
  let n1=+document.getElementById('n1').value, n2=+document.getElementById('n2').value, n3=+document.getElementById('n3').value;
  if([n1,n2,n3].some(v=>v<0||v>20||isNaN(v))){ alert("Notas devem ser entre 0 e 20!"); return; }
  let est=estudantes.find(e=>e.id===id); est.notas=[n1,n2,n3]; salvar(); render();
  alert(`Notas guardadas! Média: ${media(est).toFixed(1)} - ${classificacao(media(est))}`);
}
function desenharGrafico(){
  let c=document.getElementById('grafico'); let ctx=c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height);
  let cats=["Excelente","Bom","Suficiente","Insuficiente"]; let cores=["#16a34a","#2196f3","#f59e0b","#ef4444"];
  let vals=cats.map(cat=>estudantes.filter(e=>classificacao(media(e))===cat).length);
  let max=Math.max(...vals,1);
  vals.forEach((v,i)=>{
    let h=(v/max)*130; let x=40+i*140;
    ctx.fillStyle=cores[i]; ctx.fillRect(x,150-h,70,h);
    ctx.fillStyle="#0f2a4a"; ctx.font="bold 14px Arial"; ctx.fillText(v, x+28, 145-h);
    ctx.font="11px Arial"; ctx.fillText(cats[i], x, 170);
  });
}
function exportarCSV(){
  let csv="Nome;Matricula;Curso;Media;Classificacao\n"+estudantes.map(e=>`${e.nome};${e.matricula};${e.curso};${media(e).toFixed(1)};${classificacao(media(e))}`).join("\n");
  let a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download="estudantes.csv"; a.click();
}
function limparDados(){ if(confirm("Apagar todos?")){ estudantes=[]; salvar(); render(); } }
render();