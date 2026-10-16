// Menu data: [name, price (UGX), image]
const foods=[
  ["Grilled Steak Plate",28000,"images/steak-plate.jpg"],
  ["Vegetarian Platter",20000,"images/vegetarian-platter.jpg"],
  ["Injera with Beef Wat",22000,"images/injera-beef-wat.jpg"],
  ["Traditional Coffee",6000,"images/ethiopian-coffee.jpg"]
];
const sauces=[["Tomato Sauce",1000],["Chilli Sauce",1500],["Garlic Sauce",2000],["BBQ Sauce",2000],["Peanut Sauce",2500],["Mayonnaise",1000]];
const DELIVERY=3000;
const $=id=>document.getElementById(id);

function build(list,box,type){
  $(box).innerHTML=list.map((x,i)=>`<div class="item">${x[2]?`<img src="${x[2]}" alt="${x[0]}">`:""}<input type="checkbox" id="${type}${i}" data-type="${type}" data-i="${i}" aria-label="${x[0]}"><span>${x[0]}</span><b>${x[1].toLocaleString()}</b><input type="number" class="qty" id="q${type}${i}" min="1" max="20" value="1" aria-label="Quantity"></div>`).join("");
}
build(foods,"foods","f");build(sauces,"sauces","s");

function selected(){
  const out=[];
  document.querySelectorAll('input[type=checkbox]').forEach(c=>{
    if(c.checked){
      const l=c.dataset.type==="f"?foods:sauces, it=l[c.dataset.i];
      let q=parseInt($("q"+c.id).value)||1; q=Math.min(20,Math.max(1,q));
      out.push({name:it[0],qty:q,sub:it[1]*q});
    }
  });
  return out;
}
function update(){
  const s=selected(), sub=s.reduce((a,b)=>a+b.sub,0);
  $("sumList").innerHTML=s.length?s.map(i=>`<li>${i.name} × ${i.qty} — UGX ${i.sub.toLocaleString()}</li>`).join(""):"<li>No items selected yet.</li>";
  const d=s.length?DELIVERY:0;
  $("del").textContent=d.toLocaleString();
  $("total").textContent=(sub+d).toLocaleString();
}
document.addEventListener("input",update);
document.addEventListener("change",update);
$("resetBtn").addEventListener("click",()=>setTimeout(()=>{document.querySelectorAll(".err").forEach(e=>e.textContent="");document.querySelectorAll(".invalid").forEach(e=>e.classList.remove("invalid"));update();},0));

const phoneRx=/^(\+256|0)7\d{8}$/;
function setErr(id,msg,field){
  $("e-"+id).textContent=msg;
  if(field)$(field).classList.toggle("invalid",!!msg);
  return !msg;
}
function validate(){
  let ok=true;
  const name=$("name").value.trim(), email=$("email").value.trim(),
        ph=$("phone").value.trim().replace(/\s/g,""), alt=$("alt").value.trim().replace(/\s/g,""),
        addr=$("address").value.trim();
  ok&=setErr("name",!/^[A-Za-z][A-Za-z .'-]+$/.test(name)||name.split(/\s+/).length<2?"Enter your full name (first and last, letters only).":"","name");
  ok&=setErr("email",!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)?"Enter a valid email address.":"","email");
  ok&=setErr("phone",!phoneRx.test(ph)?"Enter a valid number, e.g. 0771234567 or +256771234567.":"","phone");
  ok&=setErr("alt",alt&&(!phoneRx.test(alt)||alt===ph)?(alt===ph?"Must differ from the main number.":"Enter a valid number or leave blank."):"","alt");
  ok&=setErr("address",addr.length<5?"Enter a delivery address.":"","address");
  ok&=setErr("items",selected().length===0?"Select at least one item.":"");
  ok&=setErr("pay",!document.querySelector('input[name=pay]:checked')?"Choose a payment method.":"");
  return !!ok;
}
$("orderForm").addEventListener("submit",e=>{
  e.preventDefault();
  if(!validate()){const f=document.querySelector(".invalid,.err:not(:empty)");if(f)f.scrollIntoView({behavior:"smooth",block:"center"});return;}
  const s=selected(), total=s.reduce((a,b)=>a+b.sub,0)+DELIVERY;
  $("confirmBody").innerHTML=`<p>Thank you, <b>${$("name").value.trim().replace(/</g,"&lt;")}</b>! Your order is on its way.</p>
  <ul>${s.map(i=>`<li>${i.name} × ${i.qty}</li>`).join("")}</ul>
  <p>Payment: <b>${document.querySelector('input[name=pay]:checked').value}</b><br>Total (incl. delivery): <b>UGX ${total.toLocaleString()}</b></p>`;
  $("modal").classList.add("show");
});
$("closeBtn").addEventListener("click",()=>{$("modal").classList.remove("show");$("orderForm").reset();setTimeout(update,0);});
