/**
 * ════════════════════════════════════════════
 * QA Test Case Builder — script.js
 * Vanilla JS · CRUD + Export · No dependencies
 * ════════════════════════════════════════════
 */

'use strict';

/* ══════════════════════════════════════════
   STATE
══════════════════════════════════════════ */

/** @type {TestCase[]} */
let testCases = [];

/** @type {string|null} ID of test case currently being edited */
let editingId = null;

/** @type {string} Current filter value */
let currentFilter = 'all';

/**
 * @typedef {Object} TestCase
 * @property {string} id       - Unique internal ID (UUID-like)
 * @property {string} tcId     - User-defined Test Case ID  e.g. "TC-CR-001"
 * @property {string} module   - Modul / Kategori
 * @property {string} type     - "Positive" | "Negative" | "Edge"
 * @property {string} desc     - Deskripsi Pengujian
 * @property {string} precond  - Prasyarat / Pre-conditions (optional)
 * @property {string} steps    - Langkah-langkah / Test Steps
 * @property {string} expected - Hasil yang Diharapkan
 * @property {number} createdAt - Timestamp
 */

/* ══════════════════════════════════════════
   DOM REFERENCES
══════════════════════════════════════════ */

const form          = /** @type {HTMLFormElement}    */ (document.getElementById('tc-form'));
const inputTcId     = /** @type {HTMLInputElement}   */ (document.getElementById('tc-id'));
const inputModule   = /** @type {HTMLInputElement}   */ (document.getElementById('tc-module'));
const inputType     = /** @type {HTMLSelectElement}  */ (document.getElementById('tc-type'));
const inputDesc     = /** @type {HTMLInputElement}   */ (document.getElementById('tc-desc'));
const inputPrecond  = /** @type {HTMLTextAreaElement}*/ (document.getElementById('tc-precond'));
const inputSteps    = /** @type {HTMLTextAreaElement}*/ (document.getElementById('tc-steps'));
const inputExpected = /** @type {HTMLTextAreaElement}*/ (document.getElementById('tc-expected'));

const btnSubmit     = document.getElementById('btn-submit');
const btnSubmitLabel = document.getElementById('btn-submit-label');
const btnReset      = document.getElementById('btn-reset');
const btnExport     = document.getElementById('btn-export');
const btnCancelEdit = document.getElementById('btn-cancel-edit');
const formModeLabel = document.getElementById('form-mode-label');

const tbody         = document.getElementById('tc-tbody');
const emptyState    = document.getElementById('empty-state');
const countBadge    = document.getElementById('tc-count-badge');
const filterSelect  = document.getElementById('filter-type');

const modalOverlay  = document.getElementById('modal-overlay');
const modalTcId     = document.getElementById('modal-tc-id');
const modalCancel   = document.getElementById('modal-cancel');
const modalConfirm  = document.getElementById('modal-confirm');
const toastContainer = document.getElementById('toast');

/* ══════════════════════════════════════════
   UTILITIES
══════════════════════════════════════════ */

/**
 * Generate a short unique ID.
 * @returns {string}
 */
function genUID() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/**
 * Escape HTML special characters to prevent XSS when rendering via innerHTML.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Escape Markdown pipe characters to prevent table corruption.
 * @param {string} str
 * @returns {string}
 */
function escapeMd(str) {
  if (!str) return '';
  return str.replace(/\|/g, '\\|').replace(/\n/g, '<br>');
}

/**
 * Trim and validate a string is not empty/whitespace-only.
 * @param {string} val
 * @returns {boolean}
 */
function notEmpty(val) {
  return typeof val === 'string' && val.trim().length > 0;
}

/* ══════════════════════════════════════════
   TOAST
══════════════════════════════════════════ */

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'success'|'error'|'info'|'warning'} [type='success']
 * @param {number} [duration=3000]
 */
function showToast(message, type = 'success', duration = 3000) {
  const icons = {
    success: `<svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>`,
    error:   `<svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>`,
    info:    `<svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"/></svg>`,
    warning: `<svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/></svg>`,
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `${icons[type] || ''}<span>${escapeHtml(message)}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-out');
    toast.addEventListener('animationend', () => toast.remove());
  }, duration);
}

/* ══════════════════════════════════════════
   FORM VALIDATION
══════════════════════════════════════════ */

/** @type {{ fieldId: string; errorId: string; label: string }[]} */
const REQUIRED_FIELDS = [
  { fieldId: 'tc-id',       errorId: 'err-tc-id',       label: 'Test Case ID' },
  { fieldId: 'tc-module',   errorId: 'err-tc-module',   label: 'Modul' },
  { fieldId: 'tc-type',     errorId: 'err-tc-type',     label: 'Tipe Skenario' },
  { fieldId: 'tc-desc',     errorId: 'err-tc-desc',     label: 'Deskripsi' },
  { fieldId: 'tc-steps',    errorId: 'err-tc-steps',    label: 'Langkah-langkah' },
  { fieldId: 'tc-expected', errorId: 'err-tc-expected', label: 'Hasil yang Diharapkan' },
];

/**
 * Validate the form. Returns true if valid.
 * @returns {boolean}
 */
function validateForm() {
  let valid = true;

  REQUIRED_FIELDS.forEach(({ fieldId, errorId }) => {
    const field = /** @type {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} */ (
      document.getElementById(fieldId)
    );
    const errEl = document.getElementById(errorId);
    const isEmpty = !notEmpty(field.value);

    field.classList.toggle('is-invalid', isEmpty);
    if (errEl) errEl.classList.toggle('hidden', !isEmpty);

    if (isEmpty) valid = false;
  });

  return valid;
}

/** Clear all validation states from form fields. */
function clearValidation() {
  REQUIRED_FIELDS.forEach(({ fieldId, errorId }) => {
    const field = document.getElementById(fieldId);
    const errEl = document.getElementById(errorId);
    if (field)  field.classList.remove('is-invalid');
    if (errEl)  errEl.classList.add('hidden');
  });
}

/* ══════════════════════════════════════════
   FORM READ / WRITE
══════════════════════════════════════════ */

/**
 * Read all form values into a partial TestCase object.
 * @returns {Omit<TestCase, 'id'|'createdAt'>}
 */
function readForm() {
  return {
    tcId:     inputTcId.value.trim(),
    module:   inputModule.value.trim(),
    type:     inputType.value,
    desc:     inputDesc.value.trim(),
    precond:  inputPrecond.value.trim(),
    steps:    inputSteps.value.trim(),
    expected: inputExpected.value.trim(),
  };
}

/**
 * Populate the form with data from an existing TestCase (for editing).
 * @param {TestCase} tc
 */
function populateForm(tc) {
  inputTcId.value     = tc.tcId;
  inputModule.value   = tc.module;
  inputType.value     = tc.type;
  inputDesc.value     = tc.desc;
  inputPrecond.value  = tc.precond;
  inputSteps.value    = tc.steps;
  inputExpected.value = tc.expected;
}

/** Reset form to blank state and exit edit mode. */
function resetForm() {
  form.reset();
  inputType.value = '';
  clearValidation();
  exitEditMode();
}

/* ══════════════════════════════════════════
   EDIT MODE UI
══════════════════════════════════════════ */

/** Enter edit mode visually. */
function enterEditMode(tcId) {
  editingId = tcId;
  formModeLabel.textContent  = 'Edit Test Case';
  btnSubmitLabel.textContent = 'Simpan Perubahan';

  // Change submit button icon to a pencil
  const submitIconSlot = btnSubmit.querySelector('svg');
  if (submitIconSlot) {
    submitIconSlot.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"/>`;
  }

  btnCancelEdit.classList.remove('hidden');

  // Highlight the row being edited
  document.querySelectorAll('#tc-tbody tr').forEach(tr => {
    tr.classList.toggle('is-editing', tr.dataset.id === tcId);
  });

  // Scroll form into view
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  inputTcId.focus();
}

/** Exit edit mode and restore default UI. */
function exitEditMode() {
  editingId = null;
  formModeLabel.textContent  = 'Tambah Test Case Baru';
  btnSubmitLabel.textContent = 'Simpan Test Case';

  // Restore plus icon
  const submitIconSlot = btnSubmit.querySelector('svg');
  if (submitIconSlot) {
    submitIconSlot.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>`;
  }

  btnCancelEdit.classList.add('hidden');

  // Remove editing highlight from all rows
  document.querySelectorAll('#tc-tbody tr').forEach(tr => {
    tr.classList.remove('is-editing');
  });
}

/* ══════════════════════════════════════════
   BADGE & TYPE HELPERS
══════════════════════════════════════════ */

/** @type {Object<string,{class:string,label:string,icon:string}>} */
const TYPE_META = {
  Positive: { class: 'badge-positive', label: 'Positive',  icon: '✅' },
  Negative: { class: 'badge-negative', label: 'Negative',  icon: '❌' },
  Edge:     { class: 'badge-edge',     label: 'Edge',       icon: '⚠️' },
};

/**
 * Render a type badge HTML string.
 * @param {string} type
 * @returns {string}
 */
function renderBadge(type) {
  const meta = TYPE_META[type] || { class: '', label: type, icon: '' };
  return `<span class="badge ${meta.class}">${meta.icon} ${meta.label}</span>`;
}

/* ══════════════════════════════════════════
   RENDER TABLE
══════════════════════════════════════════ */

/** Re-render the entire table based on current state and filter. */
function renderTable() {
  const filtered = currentFilter === 'all'
    ? testCases
    : testCases.filter(tc => tc.type === currentFilter);

  // Update count badge (always shows total, not filtered)
  countBadge.textContent = testCases.length.toString();

  // Toggle export button
  btnExport.disabled = testCases.length === 0;
  btnExport.title    = testCases.length === 0 ? 'Tambahkan test case terlebih dahulu' : 'Export seluruh test case ke Markdown';

  // Toggle empty state
  const isEmpty = filtered.length === 0;
  emptyState.style.display = isEmpty ? 'flex' : 'none';

  if (isEmpty) {
    tbody.innerHTML = '';
    return;
  }

  tbody.innerHTML = filtered.map(tc => renderRow(tc)).join('');
}

/**
 * Render a single table row HTML string.
 * @param {TestCase} tc
 * @returns {string}
 */
function renderRow(tc) {
  const isEditing = tc.id === editingId;

  return `
    <tr data-id="${tc.id}" class="${isEditing ? 'is-editing' : ''}">
      <td class="td-cell td-cell-id">${escapeHtml(tc.tcId)}</td>
      <td class="td-cell td-cell-module">${escapeHtml(tc.module)}</td>
      <td class="td-cell">${renderBadge(tc.type)}</td>
      <td class="td-cell td-cell-desc">
        <p class="font-medium text-slate-800 mb-1">${escapeHtml(tc.desc)}</p>
        ${tc.precond
          ? `<p class="text-xs text-slate-400 mt-0.5"><span class="font-semibold">Prasyarat:</span> ${escapeHtml(tc.precond)}</p>`
          : ''}
        <details class="mt-1.5 group">
          <summary class="text-xs text-primary-600 cursor-pointer hover:text-primary-700 font-medium list-none flex items-center gap-1 w-fit">
            <svg class="w-3 h-3 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/>
            </svg>
            Lihat Detail
          </summary>
          <div class="mt-2 space-y-2 pl-1 border-l-2 border-slate-100">
            <div>
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">Test Steps</p>
              <p class="text-xs text-slate-600 whitespace-pre-wrap">${escapeHtml(tc.steps)}</p>
            </div>
            <div>
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">Expected Result</p>
              <p class="text-xs text-slate-600 whitespace-pre-wrap">${escapeHtml(tc.expected)}</p>
            </div>
          </div>
        </details>
      </td>
      <td class="td-cell">
        <div class="flex items-center justify-center gap-1.5">
          <button
            class="btn-action btn-edit"
            data-action="edit" data-id="${tc.id}"
            title="Edit test case ini"
            aria-label="Edit ${escapeHtml(tc.tcId)}">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"/>
            </svg>
          </button>
          <button
            class="btn-action btn-delete"
            data-action="delete" data-id="${tc.id}"
            title="Hapus test case ini"
            aria-label="Hapus ${escapeHtml(tc.tcId)}">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
            </svg>
          </button>
        </div>
      </td>
    </tr>`;
}

/* ══════════════════════════════════════════
   CRUD OPERATIONS
══════════════════════════════════════════ */

/**
 * CREATE — Add a new test case.
 * @param {Omit<TestCase,'id'|'createdAt'>} data
 */
function createTestCase(data) {
  const tc = {
    id:        genUID(),
    createdAt: Date.now(),
    ...data,
  };
  testCases.push(tc);
  renderTable();

  // Animate the newly added row
  const newRow = tbody.querySelector(`tr[data-id="${tc.id}"]`);
  if (newRow) newRow.classList.add('row-enter');

  showToast(`Test case "${tc.tcId}" berhasil ditambahkan.`, 'success');
}

/**
 * UPDATE — Save changes to an existing test case.
 * @param {string} id Internal UID
 * @param {Omit<TestCase,'id'|'createdAt'>} data
 */
function updateTestCase(id, data) {
  const idx = testCases.findIndex(tc => tc.id === id);
  if (idx === -1) return;

  testCases[idx] = { ...testCases[idx], ...data };
  renderTable();
  showToast(`Test case "${data.tcId}" berhasil diperbarui.`, 'info');
}

/**
 * DELETE — Remove a test case by internal UID.
 * @param {string} id
 */
function deleteTestCase(id) {
  const tc = testCases.find(t => t.id === id);
  testCases = testCases.filter(t => t.id !== id);

  // If we were editing this item, cancel the edit
  if (editingId === id) resetForm();

  renderTable();
  if (tc) showToast(`Test case "${tc.tcId}" telah dihapus.`, 'warning');
}

/* ══════════════════════════════════════════
   EXPORT TO MARKDOWN
══════════════════════════════════════════ */

/**
 * Generate a Markdown table string from all test cases.
 * @returns {string}
 */
function generateMarkdown() {
  if (testCases.length === 0) return '';

  const typeLabelMap = {
    Positive: '✅ Positive',
    Negative: '❌ Negative',
    Edge:     '⚠️ Edge',
  };

  const header = [
    '| Test Case ID | Modul/Kategori | Tipe | Deskripsi Pengujian | Prasyarat | Langkah-langkah (Test Steps) | Hasil yang Diharapkan (Expected Result) |',
    '|---|---|---|---|---|---|---|',
  ];

  const rows = testCases.map(tc => {
    const cols = [
      `\`${escapeMd(tc.tcId)}\``,
      escapeMd(tc.module),
      typeLabelMap[tc.type] || tc.type,
      escapeMd(tc.desc),
      tc.precond ? escapeMd(tc.precond) : '—',
      escapeMd(tc.steps),
      escapeMd(tc.expected),
    ];
    return `| ${cols.join(' | ')} |`;
  });

  // Build a summary section
  const positiveCount = testCases.filter(tc => tc.type === 'Positive').length;
  const negativeCount = testCases.filter(tc => tc.type === 'Negative').length;
  const edgeCount     = testCases.filter(tc => tc.type === 'Edge').length;

  const summary = [
    '',
    '---',
    '',
    '## 📊 Ringkasan Pengujian',
    '',
    '| Kategori | Jumlah |',
    '|---|---|',
    `| ✅ Positive Cases | ${positiveCount} |`,
    `| ❌ Negative Cases | ${negativeCount} |`,
    `| ⚠️ Edge Cases | ${edgeCount} |`,
    `| **Total** | **${testCases.length}** |`,
    '',
    `> *Dokumen dihasilkan oleh QA Test Case Builder pada ${new Date().toLocaleString('id-ID')}*`,
  ];

  return [
    '# 📋 Dokumen Test Case',
    '',
    ...header,
    ...rows,
    ...summary,
  ].join('\n');
}

/** Copy Markdown to clipboard and notify the user. */
function exportToMarkdown() {
  const markdown = generateMarkdown();
  if (!markdown) {
    showToast('Tidak ada test case untuk di-export.', 'error');
    return;
  }

  if (!navigator.clipboard) {
    // Fallback for environments without clipboard API
    const ta = document.createElement('textarea');
    ta.value = markdown;
    ta.style.position = 'fixed';
    ta.style.opacity  = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast(`${testCases.length} test case berhasil di-copy ke clipboard!`, 'success', 4000);
    return;
  }

  navigator.clipboard.writeText(markdown)
    .then(() => {
      showToast(`${testCases.length} test case berhasil di-copy ke clipboard!`, 'success', 4000);
    })
    .catch(() => {
      showToast('Gagal mengakses clipboard. Pastikan izin diberikan.', 'error');
    });
}

/* ══════════════════════════════════════════
   DELETE MODAL
══════════════════════════════════════════ */

/** @type {string|null} Pending delete ID stored until modal confirmed */
let pendingDeleteId = null;

/**
 * Open the delete confirmation modal.
 * @param {string} id
 * @param {string} tcId
 */
function openDeleteModal(id, tcId) {
  pendingDeleteId  = id;
  modalTcId.textContent = tcId;
  modalOverlay.classList.remove('hidden');
  modalConfirm.focus();
}

/** Close the delete modal without deleting. */
function closeDeleteModal() {
  pendingDeleteId = null;
  modalOverlay.classList.add('hidden');
}

/* ══════════════════════════════════════════
   EVENT LISTENERS
══════════════════════════════════════════ */

/* ── Form Submit ─────────────────────────── */
form.addEventListener('submit', (e) => {
  e.preventDefault();

  if (!validateForm()) {
    showToast('Harap lengkapi semua field yang wajib diisi.', 'error');
    // Focus on first invalid field
    const firstInvalid = form.querySelector('.is-invalid');
    if (firstInvalid) /** @type {HTMLElement} */ (firstInvalid).focus();
    return;
  }

  const data = readForm();

  if (editingId) {
    updateTestCase(editingId, data);
    resetForm();
  } else {
    createTestCase(data);
    resetForm();
  }
});

/* ── Reset Button ────────────────────────── */
btnReset.addEventListener('click', () => {
  resetForm();
});

/* ── Cancel Edit Button ──────────────────── */
btnCancelEdit.addEventListener('click', () => {
  resetForm();
  showToast('Edit dibatalkan.', 'warning');
});

/* ── Table Actions (Edit / Delete) ──────── */
tbody.addEventListener('click', (e) => {
  const target = /** @type {HTMLElement} */ (e.target);
  const btn    = target.closest('[data-action]');
  if (!btn) return;

  const action = btn.dataset.action;
  const id     = btn.dataset.id;

  if (action === 'edit') {
    const tc = testCases.find(t => t.id === id);
    if (!tc) return;

    // If already editing this same row, cancel edit instead
    if (editingId === id) {
      resetForm();
      showToast('Edit dibatalkan.', 'warning');
      return;
    }

    // If editing a different row, switch without losing warning
    if (editingId && editingId !== id) {
      resetForm();
    }

    populateForm(tc);
    enterEditMode(id);
  }

  if (action === 'delete') {
    const tc = testCases.find(t => t.id === id);
    if (!tc) return;
    openDeleteModal(id, tc.tcId);
  }
});

/* ── Modal Buttons ───────────────────────── */
modalCancel.addEventListener('click', closeDeleteModal);

modalConfirm.addEventListener('click', () => {
  if (pendingDeleteId) {
    deleteTestCase(pendingDeleteId);
    closeDeleteModal();
  }
});

// Close modal on overlay click
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeDeleteModal();
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modalOverlay.classList.contains('hidden')) {
    closeDeleteModal();
  }
});

/* ── Export Button ───────────────────────── */
btnExport.addEventListener('click', exportToMarkdown);

/* ── Filter Dropdown ─────────────────────── */
filterSelect.addEventListener('change', () => {
  currentFilter = filterSelect.value;
  renderTable();
});

/* ── Clear invalid state on input ────────── */
[inputTcId, inputModule, inputType, inputDesc, inputPrecond, inputSteps, inputExpected].forEach(el => {
  el.addEventListener('input', () => {
    if (el.classList.contains('is-invalid') && notEmpty(el.value)) {
      el.classList.remove('is-invalid');
      // Hide corresponding error message
      const errId = `err-${el.id}`;
      const errEl = document.getElementById(errId);
      if (errEl) errEl.classList.add('hidden');
    }
  });
  // Also handle select change
  el.addEventListener('change', () => {
    if (el.classList.contains('is-invalid') && notEmpty(el.value)) {
      el.classList.remove('is-invalid');
      const errId = `err-${el.id}`;
      const errEl = document.getElementById(errId);
      if (errEl) errEl.classList.add('hidden');
    }
  });
});

/* ══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */

/** Initial render on DOM ready. */
(function init() {
  renderTable();
})();
