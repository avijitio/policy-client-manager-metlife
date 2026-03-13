// ================================================================
// app.js — Main Application Logic (Updated with Reports)
// ================================================================

let allClients = [];
let currentEditId = null;
let deleteTargetId = null;
let filteredForExport = [];

const IMGBB_API_KEY = '41161bb08ec978b9122d9a89761f7676';

const MONTHS = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];

// ── Tab Switch ──────────────────────────────────────────────────
function switchTab(tab) {
  document.getElementById('tabClients').style.display = tab === 'clients' ? 'block' : 'none';
  document.getElementById('tabReports').style.display = tab === 'reports' ? 'block' : 'none';
  document.getElementById('tabBtnClients').classList.toggle('active', tab === 'clients');
  document.getElementById('tabBtnReports').classList.toggle('active', tab === 'reports');
  if (tab === 'reports') initReports();
}

// ── Initialize App ──────────────────────────────────────────────
function initApp() {
  requireAuth();
  loadClients();
}

// ── Load Clients ────────────────────────────────────────────────
function loadClients() {
  showLoading(true);
  db.collection('clients').orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
    allClients = [];
    snapshot.forEach((doc) => allClients.push({ id: doc.id, ...doc.data() }));
    renderClients(allClients);
    updateStats(allClients);
    checkExpiryAlerts(allClients);
    showLoading(false);
  }, (error) => {
    showToast('ডেটা লোড ব্যর্থ: ' + error.message, 'error');
    showLoading(false);
  });
}

// ── Render Client Cards ─────────────────────────────────────────
function renderClients(clients) {
  const grid = document.getElementById('clientGrid');
  const emptyState = document.getElementById('emptyState');
  if (clients.length === 0) { grid.innerHTML = ''; emptyState.style.display = 'flex'; return; }
  emptyState.style.display = 'none';

  grid.innerHTML = clients.map(client => {
    const expiry = client.expiry_date ? new Date(client.expiry_date) : null;
    const today = new Date();
    const daysLeft = expiry ? Math.ceil((expiry - today) / (1000*60*60*24)) : null;
    let expiryBadge = '';
    if (daysLeft !== null) {
      if (daysLeft < 0) expiryBadge = `<span class="badge badge-expired">মেয়াদ শেষ</span>`;
      else if (daysLeft <= 30) expiryBadge = `<span class="badge badge-warning">⚠️ ${daysLeft} দিন বাকি</span>`;
      else expiryBadge = `<span class="badge badge-ok">✅ সক্রিয়</span>`;
    }
    const photoHtml = client.photo_url
      ? `<img src="${client.photo_url}" alt="${client.name}" class="client-avatar">`
      : `<div class="client-avatar-placeholder">${client.name ? client.name.charAt(0).toUpperCase() : '?'}</div>`;

    const amountHtml = client.amount ? `<span class="detail-item">💰 <span data-bn="পরিমাণ" data-en="Amount">পরিমাণ</span>: ৳${Number(client.amount).toLocaleString('bn-BD')}</span>` : '';
    const sigBadge = client.signature_url ? `<span class="badge badge-sig">✍️ <span data-bn="স্বাক্ষর আছে" data-en="Signed">স্বাক্ষর আছে</span></span>` : '';

    return `
      <div class="client-card" id="card-${client.id}">
        <div class="card-header">
          <div class="card-avatar-wrap">${photoHtml}</div>
          <div class="card-info">
            <h3 class="client-name">${escHtml(client.name)}</h3>
            <p class="policy-num">📋 ${escHtml(client.policy_number)}</p>
            <p class="phone-num">📞 ${escHtml(client.phone)}</p>
            ${expiryBadge}
          </div>
        </div>
        <div class="card-details">
          <span class="detail-item">👤 <span data-bn="নমিনি" data-en="Nominee">নমিনি</span>: ${escHtml(client.nominee || '—')}</span>
          ${amountHtml}
          ${sigBadge}
        </div>
        <div class="card-actions">
          <a href="tel:${client.phone}" class="btn btn-call">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>কল
          </a>
          <a href="https://wa.me/88${client.phone}" target="_blank" class="btn btn-whatsapp">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>WhatsApp
          </a>
          <button onclick="generatePDF('${client.id}')" class="btn btn-pdf">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z"/></svg>PDF
          </button>
        </div>
        <div class="card-actions-2">
          <button onclick="openEditModal('${client.id}')" class="btn btn-edit">✏️ এডিট</button>
          <button onclick="confirmDelete('${client.id}', '${escHtml(client.name)}')" class="btn btn-delete">🗑️ ডিলিট</button>
          <button onclick="viewDocs('${client.id}')" class="btn btn-docs">📎 ডকুমেন্ট</button>
        </div>
      </div>`;
  }).join('');
}

// ── Stats ───────────────────────────────────────────────────────
function updateStats(clients) {
  const today = new Date();
  const expiringSoon = clients.filter(c => {
    if (!c.expiry_date) return false;
    const d = Math.ceil((new Date(c.expiry_date) - today) / (1000*60*60*24));
    return d >= 0 && d <= 30;
  }).length;
  const expired = clients.filter(c => c.expiry_date && new Date(c.expiry_date) < today).length;
  document.getElementById('statTotal').textContent = clients.length;
  document.getElementById('statExpiring').textContent = expiringSoon;
  document.getElementById('statExpired').textContent = expired;
}

// ── Expiry Alerts ───────────────────────────────────────────────
function checkExpiryAlerts(clients) {
  const today = new Date();
  const alertList = clients.filter(c => {
    if (!c.expiry_date) return false;
    const d = Math.ceil((new Date(c.expiry_date) - today) / (1000*60*60*24));
    return d >= 0 && d <= 30;
  });
  const alertBox = document.getElementById('expiryAlerts');
  if (alertList.length === 0) { alertBox.style.display = 'none'; return; }
  alertBox.style.display = 'block';
  alertBox.innerHTML = `
    <div class="alert-header">⚠️ ${alertList.length}টি পলিসির মেয়াদ ৩০ দিনের মধ্যে শেষ হবে!</div>
    <ul class="alert-list">
      ${alertList.map(c => {
        const d = Math.ceil((new Date(c.expiry_date) - today) / (1000*60*60*24));
        return `<li>📋 <strong>${c.name}</strong> (${c.policy_number}) — ${d} দিন বাকি (${formatDate(c.expiry_date)})</li>`;
      }).join('')}
    </ul>`;
}

// ── Search ──────────────────────────────────────────────────────
function searchClients(query) {
  const q = query.trim().toLowerCase();
  if (!q) { renderClients(allClients); return; }
  renderClients(allClients.filter(c =>
    (c.policy_number && c.policy_number.toLowerCase().includes(q)) ||
    (c.name && c.name.toLowerCase().includes(q)) ||
    (c.phone && c.phone.includes(q))
  ));
}

// ── Add Client ──────────────────────────────────────────────────
async function addClient() {
  const btn = document.getElementById('addSubmitBtn');
  btn.disabled = true; btn.textContent = 'সংরক্ষণ হচ্ছে...';
  const name = document.getElementById('add_name').value.trim();
  const policy_number = document.getElementById('add_policy').value.trim();
  const phone = document.getElementById('add_phone').value.trim();
  const nominee = document.getElementById('add_nominee').value.trim();
  const amount = document.getElementById('add_amount').value;

  if (!name || !policy_number || !phone) {
    showToast('নাম, পলিসি নম্বর এবং ফোন নম্বর আবশ্যক।', 'error');
    btn.disabled = false; btn.textContent = 'সংরক্ষণ করুন'; return;
  }
  try {
    const existing = await db.collection('clients').where('policy_number', '==', policy_number).get();
    if (!existing.empty) { showToast('এই পলিসি নম্বর আগে থেকেই আছে!', 'error'); btn.disabled = false; btn.textContent = 'সংরক্ষণ করুন'; return; }

    const uid = auth.currentUser.uid;
    let photo_url = '', id_card_url = '', nominee_id_url = '', signature_url = '';
    const photoFile = document.getElementById('add_photo').files[0];
    const idFile = document.getElementById('add_idcard').files[0];
    const nomFile = document.getElementById('add_nomineeId').files[0];
    const sigFile = document.getElementById('add_signature').files[0];
    if (photoFile) photo_url = await uploadFile(photoFile);
    if (idFile) id_card_url = await uploadFile(idFile);
    if (nomFile) nominee_id_url = await uploadFile(nomFile);
    if (sigFile) signature_url = await uploadFile(sigFile);

    await db.collection('clients').add({
      name, policy_number, phone, nominee, amount,
      photo_url, id_card_url, nominee_id_url, signature_url,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      userId: uid
    });
    showToast('✅ ক্লায়েন্ট সফলভাবে যোগ করা হয়েছে!', 'success');
    closeModal('addModal'); resetAddForm();
  } catch (err) { showToast('ত্রুটি: ' + err.message, 'error'); }
  btn.disabled = false; btn.textContent = 'সংরক্ষণ করুন';
}

// ── Edit Modal ──────────────────────────────────────────────────
function openEditModal(id) {
  const client = allClients.find(c => c.id === id);
  if (!client) return;
  currentEditId = id;
  document.getElementById('edit_name').value = client.name || '';
  document.getElementById('edit_policy').value = client.policy_number || '';
  document.getElementById('edit_phone').value = client.phone || '';
  document.getElementById('edit_nominee').value = client.nominee || '';
  document.getElementById('edit_amount').value = client.amount || '';
  setPreview('editPhotoPreview', client.photo_url);
  setPreview('editIdPreview', client.id_card_url);
  setPreview('editNomIdPreview', client.nominee_id_url);
  setPreview('editSigPreview', client.signature_url);
  openModal('editModal');
}

function setPreview(previewId, url) {
  const el = document.getElementById(previewId);
  if (!el) return;
  if (url) { el.innerHTML = `<img src="${url}" alt="বর্তমান ছবি">`; el.style.display = 'block'; }
  else el.style.display = 'none';
}

// ── Update Client ───────────────────────────────────────────────
async function updateClient() {
  const btn = document.getElementById('editSubmitBtn');
  btn.disabled = true; btn.textContent = 'আপডেট হচ্ছে...';
  const name = document.getElementById('edit_name').value.trim();
  const policy_number = document.getElementById('edit_policy').value.trim();
  const phone = document.getElementById('edit_phone').value.trim();
  const nominee = document.getElementById('edit_nominee').value.trim();
  const amount = document.getElementById('edit_amount').value;

  if (!name || !policy_number || !phone) {
    showToast('নাম, পলিসি নম্বর এবং ফোন আবশ্যক।', 'error');
    btn.disabled = false; btn.textContent = 'আপডেট করুন'; return;
  }
  try {
    const existing = allClients.find(c => c.id === currentEditId);
    let photo_url = existing.photo_url || '';
    let id_card_url = existing.id_card_url || '';
    let nominee_id_url = existing.nominee_id_url || '';
    let signature_url = existing.signature_url || '';
    const photoFile = document.getElementById('edit_photo').files[0];
    const idFile = document.getElementById('edit_idcard').files[0];
    const nomFile = document.getElementById('edit_nomineeId').files[0];
    const sigFile = document.getElementById('edit_signature').files[0];
    if (photoFile) photo_url = await uploadFile(photoFile);
    if (idFile) id_card_url = await uploadFile(idFile);
    if (nomFile) nominee_id_url = await uploadFile(nomFile);
    if (sigFile) signature_url = await uploadFile(sigFile);

    await db.collection('clients').doc(currentEditId).update({
      name, policy_number, phone, nominee, amount,
      photo_url, id_card_url, nominee_id_url, signature_url,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    showToast('✅ ক্লায়েন্ট আপডেট হয়েছে!', 'success');
    closeModal('editModal'); currentEditId = null;
  } catch (err) { showToast('ত্রুটি: ' + err.message, 'error'); }
  btn.disabled = false; btn.textContent = 'আপডেট করুন';
}

// ── Delete ──────────────────────────────────────────────────────
function confirmDelete(id, name) {
  deleteTargetId = id;
  document.getElementById('deleteClientName').textContent = name;
  openModal('deleteModal');
}

async function deleteClient() {
  if (!deleteTargetId) return;
  try {
    await db.collection('clients').doc(deleteTargetId).delete();
    showToast('✅ ক্লায়েন্ট মুছে ফেলা হয়েছে।', 'success');
    closeModal('deleteModal'); deleteTargetId = null;
  } catch (err) { showToast('ত্রুটি: ' + err.message, 'error'); }
}

// ── View Docs with Download ─────────────────────────────────────
function viewDocs(id) {
  const client = allClients.find(c => c.id === id);
  if (!client) return;
  const body = document.getElementById('docsModalBody');

  const docItem = (url, label) => {
    if (!url) return `<div class="doc-item doc-missing"><p class="doc-label">${label}</p><span>কোনো ফাইল নেই</span></div>`;
    return `
      <div class="doc-item">
        <p class="doc-label">${label}</p>
        <img src="${url}" class="doc-img" onclick="window.open('${url}','_blank')" title="বড় করে দেখুন">
        <div class="doc-actions">
          <a href="${url}" target="_blank" class="btn-doc-view">🔍 বড় করে দেখুন</a>
          <a href="${url}" download class="btn-doc-download">⬇️ ডাউনলোড</a>
        </div>
      </div>`;
  };

  body.innerHTML = `
    <h3 class="doc-client-name">${escHtml(client.name)} — ${escHtml(client.policy_number)}</h3>
    ${docItem(client.photo_url, '👤 ক্লায়েন্ট ছবি / Client Photo')}
    ${docItem(client.id_card_url, '🪪 আইডি কার্ড / ID Card')}
    ${docItem(client.nominee_id_url, '🪪 নমিনির আইডি কার্ড / Nominee ID')}
    ${docItem(client.signature_url, '✍️ স্বাক্ষর / Signature')}`;
  openModal('docsModal');
}

// ── Upload to ImgBB ─────────────────────────────────────────────
async function uploadFile(file) {
  const formData = new FormData();
  formData.append('image', file);
  const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: 'POST', body: formData });
  const data = await response.json();
  if (!data.success) throw new Error('ছবি আপলোড ব্যর্থ হয়েছে।');
  return data.data.url;
}

// ── Generate PDF ────────────────────────────────────────────────
function generatePDF(id) {
  const client = allClients.find(c => c.id === id);
  if (!client) return;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFillColor(10, 22, 40);
  doc.rect(0, 0, 210, 38, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20); doc.setFont('helvetica', 'bold');
  doc.text('MetLife Insurance', 105, 15, { align: 'center' });
  doc.setFontSize(11); doc.setFont('helvetica', 'normal');
  doc.text('Policy Client Information Sheet', 105, 26, { align: 'center' });

  doc.setTextColor(30, 30, 30);
  doc.setFontSize(13); doc.setFont('helvetica', 'bold');
  doc.text('Client Details', 15, 52);
  doc.setDrawColor(0, 180, 216); doc.setLineWidth(0.5);
  doc.line(15, 55, 195, 55);

  const fields = [
    ['Client Name', client.name],
    ['Policy Number', client.policy_number],
    ['Phone Number', client.phone],
    ['Nominee Name', client.nominee || 'N/A'],
    ['Policy Start Date', formatDate(client.start_date)],
    ['Policy Expiry Date', formatDate(client.expiry_date)],
    ['Policy Amount', client.amount ? '৳' + Number(client.amount).toLocaleString() : 'N/A'],
  ];

  let y = 66;
  fields.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold'); doc.setTextColor(100, 100, 100);
    doc.text(label + ':', 15, y);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(20, 20, 20);
    doc.text(value || '—', 78, y);
    y += 12;
  });

  doc.setFillColor(240, 240, 240);
  doc.rect(0, 270, 210, 27, 'F');
  doc.setFontSize(9); doc.setTextColor(120, 120, 120);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, 15, 282);
  doc.text('Policy Client Manager — MetLife Insurance Advisor', 105, 282, { align: 'center' });
  doc.save(`${client.name}_${client.policy_number}.pdf`);
  showToast('✅ PDF ডাউনলোড হচ্ছে!', 'success');
}

// ── Excel Export (All) ──────────────────────────────────────────
function exportExcel() {
  if (allClients.length === 0) { showToast('কোনো ডেটা নেই।', 'error'); return; }
  exportToExcel(allClients, 'PolicyClients_All');
}

function exportFilteredExcel() {
  if (filteredForExport.length === 0) { showToast('কোনো ডেটা নেই।', 'error'); return; }
  exportToExcel(filteredForExport, 'PolicyClients_Filtered');
}

function exportToExcel(clients, filename) {
  const data = clients.map((c, i) => ({
    'ক্রম': i + 1,
    'নাম': c.name,
    'পলিসি নম্বর': c.policy_number,
    'ফোন নম্বর': c.phone,
    'নমিনি': c.nominee || '',
    'শুরুর তারিখ': formatDate(c.start_date),
    'মেয়াদ শেষের তারিখ': formatDate(c.expiry_date),
    'পরিমাণ (টাকা)': c.amount || '',
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Clients');
  XLSX.writeFile(wb, `${filename}_${new Date().toLocaleDateString('en-GB').replace(/\//g,'_')}.xlsx`);
  showToast('✅ Excel ফাইল ডাউনলোড হচ্ছে!', 'success');
}

// ════════════════════════════════════════════════════════════════
// REPORTS
// ════════════════════════════════════════════════════════════════

function initReports() {
  // Populate year select
  const years = [...new Set(allClients.map(c => {
    if (c.createdAt && c.createdAt.toDate) return c.createdAt.toDate().getFullYear();
    return new Date().getFullYear();
  }))].sort((a,b) => b-a);
  if (!years.includes(new Date().getFullYear())) years.unshift(new Date().getFullYear());

  const sel = document.getElementById('reportYear');
  sel.innerHTML = years.map(y => `<option value="${y}">${y}</option>`).join('');
  renderMonthlyReport();
  showExpiryReport('30', document.querySelector('.expiry-tab'));
}

// ── Monthly Bar Chart ───────────────────────────────────────────
function renderMonthlyReport() {
  const year = parseInt(document.getElementById('reportYear').value);
  const counts = Array(12).fill(0);

  allClients.forEach(c => {
    let date = null;
    if (c.createdAt && c.createdAt.toDate) date = c.createdAt.toDate();
    else if (c.start_date) date = new Date(c.start_date);
    if (date && date.getFullYear() === year) counts[date.getMonth()]++;
  });

  const max = Math.max(...counts, 1);
  const container = document.getElementById('monthlyBars');
  container.innerHTML = counts.map((count, i) => `
    <div class="bar-col">
      <div class="bar-count">${count > 0 ? count : ''}</div>
      <div class="bar-wrap">
        <div class="bar-fill" style="height:${Math.round((count/max)*100)}%"></div>
      </div>
      <div class="bar-label">${MONTHS[i].substring(0,3)}</div>
    </div>`).join('');
}

// ── Date Range Filter ───────────────────────────────────────────
function filterByDate() {
  const from = document.getElementById('reportFrom').value;
  const to = document.getElementById('reportTo').value;
  if (!from || !to) { showToast('শুরু ও শেষের তারিখ দিন।', 'error'); return; }

  const fromDate = new Date(from);
  const toDate = new Date(to);
  toDate.setHours(23,59,59);

  filteredForExport = allClients.filter(c => {
    let date = null;
    if (c.createdAt && c.createdAt.toDate) date = c.createdAt.toDate();
    else if (c.start_date) date = new Date(c.start_date);
    if (!date) return false;
    return date >= fromDate && date <= toDate;
  });

  const card = document.getElementById('filteredListCard');
  const listEl = document.getElementById('filteredClientList');
  const title = document.getElementById('filteredListTitle');

  title.textContent = `${formatDate(from)} থেকে ${formatDate(to)} — ${filteredForExport.length}টি পলিসি`;
  card.style.display = 'block';

  // Report summary
  const totalAmount = filteredForExport.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  document.getElementById('reportStats').innerHTML = `
    <div class="rstat-card"><div class="rstat-num">${filteredForExport.length}</div><div class="rstat-label">মোট পলিসি</div></div>
    <div class="rstat-card"><div class="rstat-num">৳${totalAmount.toLocaleString('bn-BD')}</div><div class="rstat-label">মোট পরিমাণ</div></div>`;

  if (filteredForExport.length === 0) {
    listEl.innerHTML = '<p style="padding:20px;color:var(--gray-500);text-align:center">এই সময়ের মধ্যে কোনো পলিসি নেই।</p>';
    return;
  }

  listEl.innerHTML = `
    <table class="report-table">
      <thead><tr><th>#</th><th>নাম</th><th>পলিসি নম্বর</th><th>ফোন</th><th>পরিমাণ</th><th>মেয়াদ শেষ</th></tr></thead>
      <tbody>
        ${filteredForExport.map((c, i) => `
          <tr>
            <td>${i+1}</td>
            <td><strong>${escHtml(c.name)}</strong></td>
            <td>${escHtml(c.policy_number)}</td>
            <td><a href="tel:${c.phone}">${escHtml(c.phone)}</a></td>
            <td>${c.amount ? '৳'+Number(c.amount).toLocaleString() : '—'}</td>
            <td>${formatDate(c.expiry_date)}</td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

function resetDateFilter() {
  document.getElementById('reportFrom').value = '';
  document.getElementById('reportTo').value = '';
  document.getElementById('filteredListCard').style.display = 'none';
  document.getElementById('reportStats').innerHTML = '';
  filteredForExport = [];
}

// ── Expiry Report ───────────────────────────────────────────────
function showExpiryReport(days, btn) {
  document.querySelectorAll('.expiry-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const today = new Date();
  let list;

  if (days === 'expired') {
    list = allClients.filter(c => c.expiry_date && new Date(c.expiry_date) < today);
  } else {
    const d = parseInt(days);
    list = allClients.filter(c => {
      if (!c.expiry_date) return false;
      const daysLeft = Math.ceil((new Date(c.expiry_date) - today) / (1000*60*60*24));
      return daysLeft >= 0 && daysLeft <= d;
    });
  }

  const el = document.getElementById('expiryReportList');
  if (list.length === 0) {
    el.innerHTML = '<p style="padding:20px;color:var(--gray-500);text-align:center">এই তালিকায় কোনো পলিসি নেই।</p>';
    return;
  }

  el.innerHTML = `
    <table class="report-table">
      <thead><tr><th>#</th><th>নাম</th><th>পলিসি নম্বর</th><th>ফোন</th><th>মেয়াদ শেষ</th><th>অবস্থা</th></tr></thead>
      <tbody>
        ${list.map((c, i) => {
          const daysLeft = Math.ceil((new Date(c.expiry_date) - today) / (1000*60*60*24));
          const status = daysLeft < 0 ? `<span class="badge badge-expired">মেয়াদ শেষ</span>` : `<span class="badge badge-warning">${daysLeft} দিন বাকি</span>`;
          return `<tr>
            <td>${i+1}</td>
            <td><strong>${escHtml(c.name)}</strong></td>
            <td>${escHtml(c.policy_number)}</td>
            <td><a href="tel:${c.phone}">${escHtml(c.phone)}</a></td>
            <td>${formatDate(c.expiry_date)}</td>
            <td>${status}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
}

// ── Helpers ─────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });
}

function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function showLoading(show) {
  const el = document.getElementById('loadingOverlay');
  if (el) el.style.display = show ? 'flex' : 'none';
}

function showToast(msg, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('toast-show'), 10);
  setTimeout(() => { toast.classList.remove('toast-show'); setTimeout(() => toast.remove(), 400); }, 3500);
}

function openModal(id) { document.getElementById(id).classList.add('active'); document.body.style.overflow = 'hidden'; }
function closeModal(id) { document.getElementById(id).classList.remove('active'); document.body.style.overflow = ''; }

function resetAddForm() {
  document.getElementById('addClientForm').reset();
  ['addPhotoPreview','addIdPreview','addNomIdPreview','addSigPreview'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.innerHTML = ''; el.style.display = 'none'; }
  });
}

function previewImage(inputId, previewId) {
  const file = document.getElementById(inputId).files[0];
  const preview = document.getElementById(previewId);
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => { preview.innerHTML = `<img src="${e.target.result}" alt="প্রিভিউ">`; preview.style.display = 'block'; };
  reader.readAsDataURL(file);
}
