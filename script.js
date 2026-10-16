// Keba Restaurant - order form behaviour (images and menu live in index.html)
var DELIVERY = 3000;
function $(id){ return document.getElementById(id); }
function fmt(n){ return n.toLocaleString(); }

// Collect every ticked food / sauce item using the data-price attribute in the HTML
function selected(){
  var out = [];
  var boxes = document.querySelectorAll('input[type=checkbox]');
  for (var i = 0; i < boxes.length; i++){
    var c = boxes[i];
    var card = $("card-" + c.id);
    if (c.checked){
      var q = parseInt($("q" + c.id).value, 10) || 1;
      q = Math.min(20, Math.max(1, q));
      var price = parseInt(c.getAttribute("data-price"), 10);
      out.push({name: c.value, qty: q, sub: price * q});
      if (card) card.classList.add("selected");
    } else if (card){
      card.classList.remove("selected");
    }
  }
  return out;
}

function update(){
  var s = selected(), sub = 0, html = "";
  for (var i = 0; i < s.length; i++){
    sub += s[i].sub;
    html += "<li>" + s[i].name + " x " + s[i].qty + " - UGX " + fmt(s[i].sub) + "</li>";
  }
  $("sumList").innerHTML = html || "<li>No items selected yet.</li>";
  var d = s.length ? DELIVERY : 0;
  $("del").textContent = fmt(d);
  $("total").textContent = fmt(sub + d);
}
document.addEventListener("input", update);
document.addEventListener("change", update);

$("resetBtn").addEventListener("click", function(){
  setTimeout(function(){
    var errs = document.querySelectorAll(".err");
    for (var i = 0; i < errs.length; i++) errs[i].textContent = "";
    var bad = document.querySelectorAll(".invalid");
    for (var j = 0; j < bad.length; j++) bad[j].classList.remove("invalid");
    update();
  }, 0);
});

// ----- Validation -----
var phoneRx = /^(\+256|0)7\d{8}$/;
function setErr(id, msg, field){
  $("e-" + id).textContent = msg;
  if (field) $(field).classList.toggle("invalid", !!msg);
  return !msg;
}
function validate(){
  var ok = true;
  var name = $("name").value.trim(), email = $("email").value.trim();
  var ph = $("phone").value.trim().replace(/\s/g, ""), alt = $("alt").value.trim().replace(/\s/g, "");
  var addr = $("address").value.trim();

  ok = setErr("name", (!/^[A-Za-z][A-Za-z .'-]+$/.test(name) || name.split(/\s+/).length < 2) ? "Enter your full name (first and last, letters only)." : "", "name") && ok;
  ok = setErr("email", !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? "Enter a valid email address." : "", "email") && ok;
  ok = setErr("phone", !phoneRx.test(ph) ? "Enter a valid number, e.g. 0771234567 or +256771234567." : "", "phone") && ok;
  var altMsg = "";
  if (alt){
    if (!phoneRx.test(alt)) altMsg = "Enter a valid number or leave blank.";
    else if (alt === ph) altMsg = "Must differ from the main number.";
  }
  ok = setErr("alt", altMsg, "alt") && ok;
  ok = setErr("address", addr.length < 5 ? "Enter a delivery address." : "", "address") && ok;
  ok = setErr("items", selected().length === 0 ? "Select at least one item." : "") && ok;
  ok = setErr("pay", !document.querySelector('input[name=pay]:checked') ? "Choose a payment method." : "") && ok;
  return ok;
}

// ----- Submit & confirmation pop-up -----
$("orderForm").addEventListener("submit", function(e){
  e.preventDefault();
  if (!validate()){
    var f = document.querySelector(".invalid");
    if (f) f.scrollIntoView({behavior: "smooth", block: "center"});
    return;
  }
  var s = selected(), total = DELIVERY, list = "";
  for (var i = 0; i < s.length; i++){ total += s[i].sub; list += "<li>" + s[i].name + " x " + s[i].qty + "</li>"; }
  var cust = $("name").value.trim().replace(/</g, "&lt;");
  $("confirmBody").innerHTML = "<p>Thank you, <b>" + cust + "</b>! Your order is on its way.</p><ul>" + list + "</ul>" +
    "<p>Payment: <b>" + document.querySelector('input[name=pay]:checked').value + "</b><br>Total (incl. delivery): <b>UGX " + fmt(total) + "</b></p>";
  $("modal").classList.add("show");
});
$("closeBtn").addEventListener("click", function(){
  $("modal").classList.remove("show");
  $("orderForm").reset();
  setTimeout(update, 0);
});
