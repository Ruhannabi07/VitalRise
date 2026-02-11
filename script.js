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
     INFINITE CAROUSEL
     ═══════════════════════════════════════════ */
  const track = document.getElementById('carouselTrack');
  const slides = document.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.carousel-dot');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const totalSlides = slides.length;
  let currentSlide = 0;
  let isAnimating = false;

  function goToSlide(index, animate = true) {
    if (isAnimating) return;
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

  prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
  nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goToSlide(parseInt(dot.dataset.slide, 10));
    });
  });

  document.addEventListener('keydown', (e) => {
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
     BENEFICIARY DETAILS – FIREBASE FIRESTORE
     ═══════════════════════════════════════════ */
  const beneficiaryList = document.getElementById('beneficiaryList');
  const totalBadge = document.getElementById('totalBadge');
  const beneficiarySearch = document.getElementById('beneficiarySearch');

  // Store all beneficiaries locally for search filtering
  let allBeneficiaries = [];

  // ── Render a single beneficiary list item ──
  function createBeneficiaryItem(beneficiary) {
    const li = document.createElement('li');
    li.className = 'beneficiary-item';
    li.dataset.id = beneficiary.id;
    li.innerHTML = `
      <div class="beneficiary-info">
        <p class="beneficiary-name">${escapeHtml(beneficiary.fullName)}</p>
        <div class="beneficiary-details-row">
          <span class="beneficiary-detail"><i class="fa-solid fa-phone"></i> ${escapeHtml(beneficiary.phone) || 'N/A'}</span>
          <span class="beneficiary-detail"><i class="fa-solid fa-calendar"></i> ${escapeHtml(beneficiary.dob) || 'N/A'}</span>
        </div>
        <p class="beneficiary-aadhar"><i class="fa-solid fa-id-card"></i> AADHAR: ${escapeHtml(beneficiary.aadhar) || 'N/A'}</p>
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
      (b.fullName || '').toLowerCase().includes(searchQuery)
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

    const fullName = document.getElementById('fullNameInput').value.trim();
    const aadhar = document.getElementById('aadharInput').value.trim();
    const dob = document.getElementById('dobInput').value.trim();
    const phone = document.getElementById('phoneInput').value.trim();

    if (!fullName) {
      alert('Please enter the full name.');
      return;
    }

    const addBtn = document.getElementById('addBeneficiaryBtn');
    addBtn.disabled = true;
    addBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Adding...';

    try {
      await addDoc(beneficiariesRef, {
        fullName,
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
        <p>Are you sure you want to delete <strong>${escapeHtml(beneficiary.fullName)}</strong>? This action cannot be undone.</p>
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
