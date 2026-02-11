/* ============================================
   VITAL RISE HEALTH DASHBOARD – script.js
   Firebase Firestore integration for Beneficiaries
   ============================================ */

// ─── Firebase Imports ───
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-analytics.js";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

// ─── Firebase Config ───
const firebaseConfig = {
  apiKey: "AIzaSyBq1roUrRVDQ1NQE5PGAi8LnSjkx9M3yl4",
  authDomain: "vitalrise-28ba2.firebaseapp.com",
  projectId: "vitalrise-28ba2",
  storageBucket: "vitalrise-28ba2.firebasestorage.app",
  messagingSenderId: "807655370598",
  appId: "1:807655370598:web:b48c4bf294bdaf4bc622a7",
  measurementId: "G-KFVHMTQDZW"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// ─── Firestore collection reference ───
const beneficiariesRef = collection(db, 'beneficiaries');


document.addEventListener('DOMContentLoaded', () => {

  /* ═══════════════════════════════════════════
     INFINITE CAROUSEL (mobile only)
     ═══════════════════════════════════════════ */
  const DESKTOP_BREAKPOINT = 1024;
  const track = document.getElementById('carouselTrack');
  const slides = document.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.carousel-dot');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const totalSlides = slides.length;
  let currentSlide = 0;
  let isAnimating = false;

  function isDesktop() {
    return window.innerWidth >= DESKTOP_BREAKPOINT;
  }

  function goToSlide(index, animate = true) {
    if (isDesktop() || isAnimating) return;
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
    dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));

    if (animate) {
      setTimeout(() => { isAnimating = false; }, 460);
    }
  }

  // Handle resize between mobile ↔ desktop
  let wasDesktop = isDesktop();
  window.addEventListener('resize', () => {
    const nowDesktop = isDesktop();
    if (nowDesktop && !wasDesktop) {
      // Switched to desktop → clear transform
      track.style.transition = 'none';
      track.style.transform = 'none';
    } else if (!nowDesktop && wasDesktop) {
      // Switched to mobile → reset to slide 0
      currentSlide = 0;
      track.style.transition = 'none';
      track.style.transform = 'translateX(0%)';
      dots.forEach((d, i) => d.classList.toggle('active', i === 0));
    }
    wasDesktop = nowDesktop;
  });

  // On load: if desktop, clear any transform
  if (isDesktop()) {
    track.style.transition = 'none';
    track.style.transform = 'none';
  }

  prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
  nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goToSlide(parseInt(dot.dataset.slide, 10));
    });
  });

  document.addEventListener('keydown', (e) => {
    if (isDesktop()) return;
    if (e.key === 'ArrowLeft') goToSlide(currentSlide - 1);
    if (e.key === 'ArrowRight') goToSlide(currentSlide + 1);
  });

  /* ── Touch / Swipe ── */
  let touchStartX = 0, touchEndX = 0, touchStartY = 0, touchEndY = 0;
  const SWIPE_THRESHOLD = 50;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > SWIPE_THRESHOLD) {
      diffX > 0 ? goToSlide(currentSlide + 1) : goToSlide(currentSlide - 1);
    }
  }, { passive: true });

  /* ── Mouse drag ── */
  let mouseDown = false, mouseStartX = 0;

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
      diff > 0 ? goToSlide(currentSlide + 1) : goToSlide(currentSlide - 1);
    }
  });

  track.addEventListener('mouseleave', () => { mouseDown = false; track.style.cursor = ''; });
  track.addEventListener('dragstart', (e) => e.preventDefault());


  /* ═══════════════════════════════════════════
     ACCORDION
     ═══════════════════════════════════════════ */
  document.querySelectorAll('.accordion-header').forEach(btn => {
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
      0: { height: 49.9, weight: 3.3 }, 1: { height: 54.7, weight: 4.5 },
      2: { height: 58.4, weight: 5.6 }, 3: { height: 61.4, weight: 6.4 },
      6: { height: 67.6, weight: 7.9 }, 9: { height: 72.0, weight: 9.0 },
      12: { height: 75.7, weight: 9.6 }, 18: { height: 82.3, weight: 10.9 },
      24: { height: 87.8, weight: 12.2 }, 36: { height: 96.1, weight: 14.3 },
      48: { height: 103.3, weight: 16.3 }, 60: { height: 110.0, weight: 18.3 },
      72: { height: 116.0, weight: 20.5 },
    },
    girl: {
      0: { height: 49.1, weight: 3.2 }, 1: { height: 53.7, weight: 4.2 },
      2: { height: 57.1, weight: 5.1 }, 3: { height: 59.8, weight: 5.8 },
      6: { height: 65.7, weight: 7.3 }, 9: { height: 70.1, weight: 8.2 },
      12: { height: 74.0, weight: 8.9 }, 18: { height: 80.7, weight: 10.2 },
      24: { height: 86.4, weight: 11.5 }, 36: { height: 95.1, weight: 13.9 },
      48: { height: 102.7, weight: 16.1 }, 60: { height: 109.4, weight: 18.2 },
      72: { height: 115.1, weight: 20.2 },
    }
  };

  document.getElementById('showResultsBtn').addEventListener('click', () => {
    const gender = document.querySelector('.gender-btn.selected')?.dataset.gender || 'boy';
    const age = document.getElementById('childAgeSelect').value;
    const heightEl = document.getElementById('heightValue');
    const weightEl = document.getElementById('weightValue');

    if (!age) { heightEl.textContent = '--'; weightEl.textContent = '--'; return; }
    const data = growthData[gender]?.[age];
    if (data) { heightEl.textContent = data.height; weightEl.textContent = data.weight; }
    else { heightEl.textContent = '--'; weightEl.textContent = '--'; }
  });


  /* ═══════════════════════════════════════════
     NUTRITION INPUTS
     Formula: factor × 25 × input
     ═══════════════════════════════════════════ */
  const nutritionInputs = [
    { input: 'pregnantInput', total: 'pregnantTotal', factor: 159 },
    { input: 'lactatingInput', total: 'lactatingTotal', factor: 159 },
    { input: 'input6m3y', total: 'total6m3y', factor: 150 },
    { input: 'input3y6y', total: 'total3y6y', factor: 274 },
    { input: 'adolescentInput', total: 'adolescentTotal', factor: 150 },
  ];

  function updateGrandTotal() {
    let grand = 0;
    nutritionInputs.forEach(({ total }) => {
      grand += parseFloat(document.getElementById(total).textContent) || 0;
    });
    document.getElementById('grandTotal').textContent = grand;
  }

  nutritionInputs.forEach(({ input, total, factor }) => {
    const el = document.getElementById(input);
    if (el) {
      el.addEventListener('input', () => {
        const val = parseFloat(el.value) || 0;
        const result = factor * 25 * val;
        document.getElementById(total).textContent = result;
        updateGrandTotal();
      });
    }
  });


  /* ═══════════════════════════════════════════
     BENEFICIARY DETAILS – FIREBASE FIRESTORE
     ═══════════════════════════════════════════ */
  const beneficiaryList = document.getElementById('beneficiaryList');
  const totalBadge = document.getElementById('totalBadge');
  const beneficiarySearch = document.getElementById('beneficiarySearch');

  // Store all beneficiaries locally for search filtering
  let allBeneficiaries = [];

  // ── Helper: format Aadhar for display (xxxx-xxxx-xxxx) ──
  function formatAadharDisplay(val) {
    if (!val) return '';
    const digits = val.replace(/\D/g, '');
    if (digits.length !== 12) return val;
    return digits.slice(0, 4) + '-' + digits.slice(4, 8) + '-' + digits.slice(8, 12);
  }

  // ── Helper: format DOB for display (DD/MM/YYYY) ──
  function formatDobDisplay(val) {
    if (!val) return '';
    // Already formatted
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) return val;
    // Raw 8-digit input: DDMMYYYY
    const digits = val.replace(/\D/g, '');
    if (digits.length === 8) {
      return digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4, 8);
    }
    return val;
  }

  // ── Helper: get name with backward compat ──
  function getBeneficiaryName(b) {
    return b.name || b.fullName || '';
  }

  // ── Render a single beneficiary list item ──
  function createBeneficiaryItem(beneficiary) {
    const li = document.createElement('li');
    li.className = 'beneficiary-item';
    li.dataset.id = beneficiary.id;

    const displayName = escapeHtml(getBeneficiaryName(beneficiary));
    const displayAadhar = formatAadharDisplay(beneficiary.aadhar);
    const displayDob = formatDobDisplay(beneficiary.dob);
    const displayPhone = beneficiary.phone ? escapeHtml(beneficiary.phone) : '';

    li.innerHTML = `
      <div class="beneficiary-info">
        <p class="beneficiary-name">${displayName}</p>
        <div class="beneficiary-details-row">
          ${displayPhone ? `<span class="beneficiary-detail"><i class="fa-solid fa-phone"></i> ${displayPhone}</span>` : ''}
          ${displayDob ? `<span class="beneficiary-detail"><i class="fa-solid fa-calendar"></i> ${escapeHtml(displayDob)}</span>` : ''}
          ${displayAadhar ? `<span class="beneficiary-detail"><i class="fa-solid fa-id-card"></i> ${escapeHtml(displayAadhar)}</span>` : ''}
        </div>
      </div>
      <button class="delete-btn" aria-label="Delete beneficiary">
        <i class="fa-regular fa-trash-can"></i>
      </button>
    `;

    // Delete with confirmation modal
    li.querySelector('.delete-btn').addEventListener('click', () => {
      showDeleteConfirmation(beneficiary);
    });

    return li;
  }

  // ── Render full list (respects search filter) ──
  function renderBeneficiaryList() {
    const searchQuery = (beneficiarySearch.value || '').toLowerCase();
    beneficiaryList.innerHTML = '';

    const filtered = allBeneficiaries.filter(b =>
      getBeneficiaryName(b).toLowerCase().includes(searchQuery)
    );

    if (filtered.length === 0) {
      beneficiaryList.innerHTML = `
        <li class="beneficiary-item" style="justify-content:center; color:#6b7280; font-size:0.88rem;">
          ${searchQuery ? 'No matches found.' : 'No beneficiaries yet.'}
        </li>`;
      return;
    }

    filtered.forEach(b => {
      beneficiaryList.appendChild(createBeneficiaryItem(b));
    });
  }

  // ── Real-time listener from Firestore ──
  const beneficiaryQuery = query(beneficiariesRef);

  onSnapshot(beneficiaryQuery, (snapshot) => {
    allBeneficiaries = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

    // Update badge total
    totalBadge.textContent = `Total: ${allBeneficiaries.length}`;

    // Re-render list
    renderBeneficiaryList();
  }, (error) => {
    console.error('Firestore listener error:', error);
  });

  // ── Search filter (local, instant) ──
  beneficiarySearch.addEventListener('input', () => {
    renderBeneficiaryList();
  });

  // ── Add beneficiary form → Firestore ──
  document.getElementById('beneficiaryForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('fullNameInput').value.trim();
    const aadharRaw = document.getElementById('aadharInput').value.trim();
    const dobRaw = document.getElementById('dobInput').value.trim();
    const phone = document.getElementById('phoneInput').value.trim();

    if (!name) {
      alert('Please enter the full name.');
      return;
    }

    // Validate & format Aadhar (must be 12 digits → xxxx-xxxx-xxxx)
    const aadharDigits = aadharRaw.replace(/\D/g, '');
    if (aadharRaw && aadharDigits.length !== 12) {
      alert('Aadhar number must be exactly 12 digits.');
      return;
    }
    const aadhar = aadharDigits.length === 12
      ? aadharDigits.slice(0, 4) + '-' + aadharDigits.slice(4, 8) + '-' + aadharDigits.slice(8, 12)
      : '';

    // Validate & format DOB (DDMMYYYY → DD/MM/YYYY)
    const dobDigits = dobRaw.replace(/\D/g, '');
    if (dobRaw && dobDigits.length !== 8) {
      alert('DOB must be 8 digits in DDMMYYYY format (e.g. 20072001).');
      return;
    }
    const dob = dobDigits.length === 8
      ? dobDigits.slice(0, 2) + '/' + dobDigits.slice(2, 4) + '/' + dobDigits.slice(4, 8)
      : '';

    const addBtn = document.getElementById('addBeneficiaryBtn');
    addBtn.disabled = true;
    addBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Adding...';

    try {
      await addDoc(beneficiariesRef, {
        name,
        aadhar,
        dob,
        phone,
        createdAt: serverTimestamp()
      });

      // Clear form
      document.getElementById('fullNameInput').value = '';
      document.getElementById('aadharInput').value = '';
      document.getElementById('dobInput').value = '';
      document.getElementById('phoneInput').value = '';
    } catch (err) {
      console.error('Error adding beneficiary:', err);
      alert('Failed to add beneficiary. Please try again.');
    } finally {
      addBtn.disabled = false;
      addBtn.innerHTML = '<i class="fa-solid fa-circle-plus"></i> Add Beneficiary';
    }
  });


  /* ═══════════════════════════════════════════
     DELETE CONFIRMATION MODAL
     ═══════════════════════════════════════════ */
  function showDeleteConfirmation(beneficiary) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
      <div class="confirm-dialog">
        <div class="confirm-icon">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <h3>Delete Beneficiary?</h3>
        <p>Are you sure you want to delete <strong>${escapeHtml(getBeneficiaryName(beneficiary))}</strong>? This action cannot be undone.</p>
        <div class="confirm-actions">
          <button class="confirm-cancel" id="confirmCancelBtn">Cancel</button>
          <button class="confirm-delete" id="confirmDeleteBtn">
            <i class="fa-regular fa-trash-can"></i> Delete
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Close on overlay background click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    // Close on Escape key
    const escHandler = (e) => {
      if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', escHandler); }
    };
    document.addEventListener('keydown', escHandler);

    // Cancel button
    overlay.querySelector('#confirmCancelBtn').addEventListener('click', () => {
      overlay.remove();
      document.removeEventListener('keydown', escHandler);
    });

    // Delete button
    overlay.querySelector('#confirmDeleteBtn').addEventListener('click', async () => {
      const deleteBtn = overlay.querySelector('#confirmDeleteBtn');
      deleteBtn.disabled = true;
      deleteBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Deleting...';

      try {
        await deleteDoc(doc(db, 'beneficiaries', beneficiary.id));
        overlay.remove();
      } catch (err) {
        console.error('Error deleting beneficiary:', err);
        deleteBtn.disabled = false;
        deleteBtn.innerHTML = '<i class="fa-regular fa-trash-can"></i> Delete';
        alert('Failed to delete. Please try again.');
      }
      document.removeEventListener('keydown', escHandler);
    });
  }


  // ── Utility ──
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }
});
