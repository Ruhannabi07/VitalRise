/* ============================================
   VITAL RISE HEALTH DASHBOARD – script.js
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ═══════════════════════════════════════════
     INFINITE CAROUSEL
     ═══════════════════════════════════════════ */
  const track = document.getElementById('carouselTrack');
  const slides = document.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.carousel-dot');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const totalSlides = slides.length; // 3
  let currentSlide = 0;
  let isAnimating = false;

  function goToSlide(index, animate = true) {
    if (isAnimating) return;

    // Wrap index for infinite loop
    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;

    if (animate) {
      isAnimating = true;
      track.style.transition = 'transform 0.45s cubic-bezier(0.25, 0.8, 0.25, 1)';
    } else {
      track.style.transition = 'none';
    }

    currentSlide = index;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;

    // Update dots
    dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));

    if (animate) {
      setTimeout(() => { isAnimating = false; }, 460);
    }
  }

  // Arrow clicks
  prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
  nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));

  // Dot clicks
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goToSlide(parseInt(dot.dataset.slide, 10));
    });
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goToSlide(currentSlide - 1);
    if (e.key === 'ArrowRight') goToSlide(currentSlide + 1);
  });

  /* ── Touch / Swipe support ── */
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartY = 0;
  let touchEndY = 0;
  const SWIPE_THRESHOLD = 50;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    // Only trigger if horizontal swipe is dominant
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > SWIPE_THRESHOLD) {
      if (diffX > 0) {
        // Swiped left → next slide
        goToSlide(currentSlide + 1);
      } else {
        // Swiped right → previous slide
        goToSlide(currentSlide - 1);
      }
    }
  }

  /* ── Mouse drag support (desktop) ── */
  let mouseDown = false;
  let mouseStartX = 0;

  track.addEventListener('mousedown', (e) => {
    mouseDown = true;
    mouseStartX = e.clientX;
    track.style.cursor = 'grabbing';
  });

  track.addEventListener('mouseup', (e) => {
    if (!mouseDown) return;
    mouseDown = false;
    track.style.cursor = '';
    const diff = mouseStartX - e.clientX;
    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) goToSlide(currentSlide + 1);
      else goToSlide(currentSlide - 1);
    }
  });

  track.addEventListener('mouseleave', () => {
    mouseDown = false;
    track.style.cursor = '';
  });

  // Prevent drag on images/links inside carousel
  track.addEventListener('dragstart', (e) => e.preventDefault());


  /* ═══════════════════════════════════════════
     ACCORDION
     ═══════════════════════════════════════════ */
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  accordionHeaders.forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.accordion-item');
      const isActive = item.classList.contains('active');
      document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });

  /* ═══════════════════════════════════════════
     GENDER SELECTOR
     ═══════════════════════════════════════════ */
  const genderBtns = document.querySelectorAll('.gender-btn');
  genderBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      genderBtns.forEach(b => {
        b.classList.remove('selected');
        const check = b.querySelector('.gender-check');
        if (check) check.style.display = 'none';
      });
      btn.classList.add('selected');
      let check = btn.querySelector('.gender-check');
      if (!check) {
        const span = document.createElement('span');
        span.className = 'gender-check';
        span.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
        btn.appendChild(span);
        check = span;
      }
      check.style.display = 'block';
    });
  });

  /* ═══════════════════════════════════════════
     GROWTH DATA / SHOW RESULTS
     ═══════════════════════════════════════════ */
  const growthData = {
    boy: {
      0: { height: 49.9, weight: 3.3 },
      1: { height: 54.7, weight: 4.5 },
      2: { height: 58.4, weight: 5.6 },
      3: { height: 61.4, weight: 6.4 },
      6: { height: 67.6, weight: 7.9 },
      9: { height: 72.0, weight: 9.0 },
      12: { height: 75.7, weight: 9.6 },
      18: { height: 82.3, weight: 10.9 },
      24: { height: 87.8, weight: 12.2 },
      36: { height: 96.1, weight: 14.3 },
      48: { height: 103.3, weight: 16.3 },
      60: { height: 110.0, weight: 18.3 },
      72: { height: 116.0, weight: 20.5 },
    },
    girl: {
      0: { height: 49.1, weight: 3.2 },
      1: { height: 53.7, weight: 4.2 },
      2: { height: 57.1, weight: 5.1 },
      3: { height: 59.8, weight: 5.8 },
      6: { height: 65.7, weight: 7.3 },
      9: { height: 70.1, weight: 8.2 },
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

  /* ═══════════════════════════════════════════
     NUTRITION INPUTS
     ═══════════════════════════════════════════ */
  const nutritionInputs = [
    { input: 'pregnantInput', total: 'pregnantTotal' },
    { input: 'lactatingInput', total: 'lactatingTotal' },
    { input: 'input6m3y', total: 'total6m3y' },
    { input: 'input3y6y', total: 'total3y6y' },
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

  /* ═══════════════════════════════════════════
     BENEFICIARY FORM / LIST
     ═══════════════════════════════════════════ */
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

    document.getElementById('fullNameInput').value = '';
    document.getElementById('aadharInput').value = '';
    document.getElementById('dobInput').value = '';
    document.getElementById('phoneInput').value = '';
  });

  // Existing delete buttons
  document.querySelectorAll('.beneficiary-item .delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.beneficiary-item').remove();
      totalCount--;
      totalBadge.textContent = `Total: ${totalCount}`;
    });
  });

  /* ═══════════════════════════════════════════
     BENEFICIARY SEARCH
     ═══════════════════════════════════════════ */
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
