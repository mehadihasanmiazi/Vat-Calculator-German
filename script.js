// ---------- Cookie popup ----------
(function () {
  var box = document.getElementById('cookieBox');
  if (!box) return;

  function getChoice() {
    try { return localStorage.getItem('cookieChoice'); } catch (e) { return null; }
  }
  function setChoice(v) {
    try { localStorage.setItem('cookieChoice', v); } catch (e) {}
    box.classList.remove('show');
  }

  if (!getChoice()) box.classList.add('show');

  document.getElementById('cookieAccept').addEventListener('click', function () { setChoice('accepted'); });
  document.getElementById('cookieDecline').addEventListener('click', function () { setChoice('declined'); });
})();

// ---------- VAT calculator ----------
(function () {
  var form = document.getElementById('vatForm');
  if (!form) return;

  var amountEl = document.getElementById('amount');
  var customWrap = document.getElementById('customWrap');
  var customEl = document.getElementById('customRate');
  var errorEl = document.getElementById('error');
  var resultEl = document.getElementById('result');

  var fmt = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });

  function selectedRate() {
    var checked = form.querySelector('input[name="rate"]:checked');
    return checked ? checked.value : '19';
  }

  var amountLabel = document.getElementById('amountLabel');

  function selectedMode() {
    var m = form.querySelector('input[name="mode"]:checked');
    return m ? m.value : 'add';
  }

  form.querySelectorAll('input[name="mode"]').forEach(function (m) {
    m.addEventListener('change', function () {
      amountLabel.textContent = selectedMode() === 'remove' ? 'Gross amount (EUR)' : 'Net amount (EUR)';
      resultEl.classList.remove('show');
    });
  });

  form.querySelectorAll('input[name="rate"]').forEach(function (r) {
    r.addEventListener('change', function () {
      customWrap.classList.toggle('show', selectedRate() === 'custom');
    });
  });

  function calculate() {
    errorEl.textContent = '';
    var net = parseFloat(amountEl.value);
    if (isNaN(net) || net < 0) {
      errorEl.textContent = 'Please enter a valid net amount.';
      resultEl.classList.remove('show');
      return;
    }

    var rate = selectedRate();
    var pct;
    if (rate === 'custom') {
      pct = parseFloat(customEl.value);
      if (isNaN(pct) || pct < 0 || pct > 100) {
        errorEl.textContent = 'Please enter a custom rate between 0 and 100.';
        resultEl.classList.remove('show');
        return;
      }
    } else {
      pct = parseFloat(rate);
    }

    var first, last, vat;
    if (selectedMode() === 'remove') {
      // amount entered is gross -> find net
      var netCalc = net / (1 + pct / 100);
      vat = net - netCalc;
      first = net;
      last = netCalc;
    } else {
      vat = net * pct / 100;
      first = net;
      last = net + vat;
    }

    document.getElementById('lblFirst').textContent = selectedMode() === 'remove' ? 'Gross amount' : 'Net amount';
    document.getElementById('lblLast').textContent = selectedMode() === 'remove' ? 'Net amount' : 'Gross amount';
    document.getElementById('rNet').textContent = fmt.format(first);
    document.getElementById('rRate').textContent = pct + '%';
    document.getElementById('rVat').textContent = fmt.format(vat);
    document.getElementById('rGross').textContent = fmt.format(last);
    resultEl.classList.add('show');
  }

  // Quick-fill buttons (e.g. 19% and 7%)
  document.querySelectorAll('.quick button[data-rate]').forEach(function (b) {
    b.addEventListener('click', function () {
      customEl.value = b.getAttribute('data-rate');
      calculate();
    });
  });

  form.addEventListener('submit', function (e) { e.preventDefault(); calculate(); });

  document.getElementById('resetBtn').addEventListener('click', function () {
    form.reset();
    amountLabel.textContent = 'Net amount (EUR)';
    customWrap.classList.remove('show');
    errorEl.textContent = '';
    resultEl.classList.remove('show');
  });
})();

// ---------- Contact form (opens email app) ----------
(function () {
  var form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = document.getElementById('cname').value;
    var email = document.getElementById('cemail').value;
    var msg = document.getElementById('cmsg').value;
    var body = 'Name: ' + name + '\nEmail: ' + email + '\n\n' + msg;
    window.location.href = 'mailto:contact@example.com?subject=' +
      encodeURIComponent('Message from Vat Calculator German') +
      '&body=' + encodeURIComponent(body);
  });
})();
