/* ============================================
   VITAL RISE HEALTH DASHBOARD – script.js
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // ─── Accordion ───
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  accordionHeaders.forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.accordion-item');
      const isActive = item.classList.contains('active');
      // close all
      document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('active'));
      // toggle current
      if (!isActive) item.classList.add('active');
    });
  });

  // ─── Gender Selector ───
  const genderBtns = document.querySelectorAll('.gender-btn');
  genderBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      genderBtns.forEach(b => {
        b.classList.remove('selected');
        const check = b.querySelector('.gender-check');
        if (check) check.style.display = 'none';
      });
      btn.classList.add('selected');
      const check = btn.querySelector('.gender-check');
      if (!check) {
        // create check for girl button if needed
        const span = document.createElement('span');
        span.className = 'gender-check';
        span.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
        btn.appendChild(span);
      }
      const c = btn.querySelector('.gender-check');
      if (c) c.style.display = 'block';
    });
  });

  // ─── Show Results (sample growth data) ───
  const growthData = {
    boy: {
      0:  { height: 49.9, weight: 3.3 },
      1:  { height: 54.7, weight: 4.5 },
      2:  { height: 58.4, weight: 5.6 },
      3:  { height: 61.4, weight: 6.4 },
      6:  { height: 67.6, weight: 7.9 },
      9:  { height: 72.0, weight: 9.0 },
      12: { height: 75.7, weight: 9.6 },
      18: { height: 82.3, weight: 10.9 },
      24: { height: 87.8, weight: 12.2 },
      36: { height: 96.1, weight: 14.3 },
      48: { height: 103.3, weight: 16.3 },
      60: { height: 110.0, weight: 18.3 },
      72: { height: 116.0, weight: 20.5 },
    },
    girl: {
      0:  { height: 49.1, weight: 3.2 },
      1:  { height: 53.7, weight: 4.2 },
      2:  { height: 57.1, weight: 5.1 },
      3:  { height: 59.8, weight: 5.8 },
      6:  { height: 65.7, weight: 7.3 },
      9:  { height: 70.1, weight: 8.2 },
      12: { height: 74.0, weight: 8.9 },
      18: { height: 80.7, weight: 10.2 },
      24: { height: 86.4, weight: 11.5 },
      36: { height: 95.1, weight: 13.9 },
      48: { height: 102.7, weight: 16.1 },
      60: { height: 109.4, weight: 18.2 },
      72: { height: 115.1, weight: 20.2 },
    }
  };

  document.getElementById('showResultsBtn').addEventListener('click', () => {
    const gender = document.querySelector('.gender-btn.selected')?.dataset.gender || 'boy';
    const age = document.getElementById('childAgeSelect').value;
    const heightEl = document.getElementById('heightValue');
    const weightEl = document.getElementById('weightValue');

    if (!age) {
      heightEl.textContent = '--';
      weightEl.textContent = '--';
      return;
    }

    const data = growthData[gender]?.[age];
    if (data) {
      heightEl.textContent = data.height;
      weightEl.textContent = data.weight;
    } else {
      heightEl.textContent = '--';
      weightEl.textContent = '--';
    }
  });

  // ─── Nutrition input handling ───
  const nutritionInputs = [
    { input: 'pregnantInput',   total: 'pregnantTotal' },
    { input: 'lactatingInput',  total: 'lactatingTotal' },
    { input: 'input6m3y',       total: 'total6m3y' },
    { input: 'input3y6y',       total: 'total3y6y' },
    { input: 'adolescentInput', total: 'adolescentTotal' },
  ];

  function updateGrandTotal() {
    let grand = 0;
    nutritionInputs.forEach(({ total }) => {
      grand += parseFloat(document.getElementById(total).textContent) || 0;
    });
    document.getElementById('grandTotal').textContent = grand;
  }

  nutritionInputs.forEach(({ input, total }) => {
    const el = document.getElementById(input);
    if (el) {
      el.addEventListener('input', () => {
        const val = parseFloat(el.value) || 0;
        document.getElementById(total).textContent = val;
        updateGrandTotal();
      });
    }
  });

  // ─── Beneficiary Form ───
  const beneficiaryList = document.getElementById('beneficiaryList');
  const totalBadge = document.getElementById('totalBadge');
  let totalCount = 86;

  document.getElementById('beneficiaryForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('fullNameInput').value.trim();
    const aadhar = document.getElementById('aadharInput').value.trim();
    if (!name) return;

    const li = document.createElement('li');
    li.className = 'beneficiary-item';
    li.innerHTML = `
      <div class="beneficiary-info">
        <p class="beneficiary-name">${escapeHtml(name)}</p>
        <p class="beneficiary-aadhar">AADHAR: ${escapeHtml(aadhar) || 'N/A'}</p>
      </div>
      <button class="delete-btn" aria-label="Delete beneficiary">
        <i class="fa-regular fa-trash-can"></i>
      </button>
    `;

    li.querySelector('.delete-btn').addEventListener('click', () => {
      li.remove();
      totalCount--;
      totalBadge.textContent = `Total: ${totalCount}`;
    });

    beneficiaryList.prepend(li);
    totalCount++;
    totalBadge.textContent = `Total: ${totalCount}`;

    // clear form
    document.getElementById('fullNameInput').value = '';
    document.getElementById('aadharInput').value = '';
    document.getElementById('dobInput').value = '';
    document.getElementById('phoneInput').value = '';
  });

  // Delete buttons on existing items
  document.querySelectorAll('.beneficiary-item .delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.beneficiary-item').remove();
      totalCount--;
      totalBadge.textContent = `Total: ${totalCount}`;
    });
  });

  // ─── Beneficiary Search ───
  document.getElementById('beneficiarySearch').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll('.beneficiary-item').forEach(item => {
      const name = item.querySelector('.beneficiary-name')?.textContent.toLowerCase() || '';
      item.style.display = name.includes(query) ? '' : 'none';
    });
  });

  // Utility
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
});
