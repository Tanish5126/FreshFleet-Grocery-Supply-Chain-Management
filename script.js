/* ============================================================
   FreshFleet – Grocery Supply Chain Management
   script.js – Shared + Page-specific JavaScript
   ============================================================ */

'use strict';

// ── Inventory Data Store ──────────────────────────────────────
const defaultInventory = [
  { id: 'P001', name: 'Organic Tomatoes', sku: 'VEG-0012', category: 'Vegetables', qty: 340, threshold: 100, store: 'Warehouse A', unit: 'kg' },
  { id: 'P002', name: 'Whole Milk (2L)', sku: 'DAI-0034', category: 'Dairy', qty: 48, threshold: 80, store: 'Store #1', unit: 'units' },
  { id: 'P003', name: 'Sourdough Bread', sku: 'BAK-0056', category: 'Bakery', qty: 12, threshold: 50, store: 'Store #2', unit: 'loaves' },
  { id: 'P004', name: 'Free-Range Eggs', sku: 'DAI-0078', category: 'Dairy', qty: 200, threshold: 60, store: 'Warehouse B', unit: 'dozen' },
  { id: 'P005', name: 'Atlantic Salmon', sku: 'SEA-0091', category: 'Seafood', qty: 8, threshold: 30, store: 'Store #3', unit: 'kg' },
  { id: 'P006', name: 'Basmati Rice (5kg)', sku: 'GRA-0102', category: 'Grains', qty: 180, threshold: 50, store: 'Warehouse A', unit: 'bags' },
  { id: 'P007', name: 'Olive Oil Extra V.', sku: 'CON-0115', category: 'Condiments', qty: 22, threshold: 40, store: 'Store #1', unit: 'bottles' },
  { id: 'P008', name: 'Greek Yogurt', sku: 'DAI-0127', category: 'Dairy', qty: 95, threshold: 70, store: 'Store #2', unit: 'cups' },
  { id: 'P009', name: 'Fresh Spinach', sku: 'VEG-0139', category: 'Vegetables', qty: 60, threshold: 80, store: 'Warehouse A', unit: 'kg' },
  { id: 'P010', name: 'Cheddar Cheese', sku: 'DAI-0142', category: 'Dairy', qty: 120, threshold: 60, store: 'Store #3', unit: 'kg' },
  { id: 'P011', name: 'Chicken Breast', sku: 'MEA-0155', category: 'Meat', qty: 35, threshold: 60, store: 'Warehouse B', unit: 'kg' },
  { id: 'P012', name: 'Pasta (Penne 500g)', sku: 'GRA-0167', category: 'Grains', qty: 250, threshold: 80, store: 'Store #1', unit: 'boxes' },
];

// Load from localStorage if available, else use defaults
const saved = localStorage.getItem('freshfleet_inventory');
const inventoryData = saved ? JSON.parse(saved) : defaultInventory;

// Write inventoryData to localStorage
function saveInventory() {
  localStorage.setItem('freshfleet_inventory', JSON.stringify(inventoryData));
}



// Stores list
const stores = ['Warehouse A', 'Warehouse B', 'Store #1', 'Store #2', 'Store #3'];

// Reset inventory to defaults
window.resetInventory = function () {
  if (!confirm('Reset all inventory to default values? This cannot be undone.')) return;
  inventoryData.length = 0;
  defaultInventory.forEach(item => inventoryData.push({ ...item }));
  localStorage.removeItem('freshfleet_inventory');
  localStorage.removeItem('freshfleet_transfers');
  transferLog.length = 0;
  saveInventory();
  showToast('✓ Inventory reset to default values.');
  window.location.reload();
};



// ── Utility Helpers ───────────────────────────────────────────
function getStockStatus(item) {
  const ratio = item.qty / item.threshold;
  if (ratio <= 0.3) return 'critical';
  if (ratio <= 1.0) return 'low';
  return 'ok';
}

function getStatusLabel(status) {
  return { ok: '🟢 In Stock', low: '🟡 Low Stock', critical: '🔴 Critical' }[status];
}


function showToast(message, duration = 3500) {
  let toast = document.getElementById('toast');

  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timer);  //This stops any existing countdown that might be running.
  toast._timer = setTimeout(() => toast.classList.remove('show'), duration); // This wait for 'duration' seconds and then remove 'show label'
}

// ── Navigation: mobile hamburger ─────────────────────────────
function initNav() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  // Highlight active page
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// ── HOME PAGE ─────────────────────────────────────────────────
function initHomePage() {
  if (!document.querySelector('.hero')) return;

  // Animate stats counters
  const counters = document.querySelectorAll('[data-count]');
  counters.forEach(counter => {
    const target = parseFloat(counter.getAttribute('data-count'));
    const isFloat = counter.getAttribute('data-count').includes('.');
    const duration = 1500;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      counter.textContent = isFloat ? current.toFixed(1) : Math.floor(current).toLocaleString();
    }, 16);
  });

  // Build live ticker from inventoryData
  const tickerInner = document.querySelector('.ticker-inner');
  if (tickerInner) {
    const alertItems = inventoryData.filter(i => getStockStatus(i) !== 'ok');
    if (alertItems.length > 0) {
      const html = alertItems.map(item => {
        const status = getStockStatus(item);
        const label = status === 'critical' ? 'CRITICAL' : 'LOW';
        return `<div class="ticker-item ${status === 'critical' ? 'warn' : ''}">
          <span class="dot"></span> ${label}: ${item.name} — ${item.qty} ${item.unit} remaining
        </div>`;
      }).join('');
      tickerInner.innerHTML = html + html; // duplicate for seamless loop
    }
  }

  // Hero real-time mini stats
  updateHeroStats();
}

function updateHeroStats() {
  const critCount = inventoryData.filter(i => getStockStatus(i) === 'critical').length;
  const lowCount = inventoryData.filter(i => getStockStatus(i) === 'low').length;
  const okCount = inventoryData.filter(i => getStockStatus(i) === 'ok').length;

  const el = {
    total: document.getElementById('stat-total'),
    critical: document.getElementById('stat-critical'),
    low: document.getElementById('stat-low'),
    ok: document.getElementById('stat-ok'),
  };

  if (el.total) el.total.textContent = inventoryData.length;
  if (el.critical) el.critical.textContent = critCount;
  if (el.low) el.low.textContent = lowCount;
  if (el.ok) el.ok.textContent = okCount;
}

// ── ALERTS PANEL ─────────────────────────────────────────────
function renderAlertsPanel() {
  const panel = document.getElementById('alerts-panel');
  if (!panel) return;

  const critical = inventoryData.filter(i => getStockStatus(i) === 'critical');
  const low = inventoryData.filter(i => getStockStatus(i) === 'low');
  const total = critical.length + low.length;

  // All clear state
  if (total === 0) {
    panel.innerHTML = `
      <div class="alerts-panel-wrapper">
        <div class="alerts-panel-header">
          <div class="alerts-panel-header-left">
            <div>
              <div class="alerts-panel-title"><i class="bi bi-alarm"></i> Stock Alert Monitor</div>
              <div class="alerts-panel-subtitle">Monitoring ${inventoryData.length} SKUs across all locations</div>
            </div>
          </div>
        </div>
        <div class="alerts-no-issues">
          <span class="icon">🟢</span>
          All inventory levels are above minimum thresholds. No action required.
        </div>
      </div>`;
    return;
  }

  const renderItems = (items, type) => {
    if (items.length === 0) {
      return `<div class="alerts-empty-col"><div class="icon">${type === 'critical' ? '✅' : '👍'}</div>No ${type} items</div>`;
    }
    return items.map(item => {
      const deficit = item.threshold - item.qty;
      return `
        <div class="alert-item ${type}">
          <div class="alert-item-info">
            <div class="alert-item-name">${item.name}</div>
            <div class="alert-item-meta">${item.sku} · ${item.store}</div>
          </div>
          <div class="alert-item-qty ${type}">
            <strong>${item.qty} ${item.unit}</strong>
            <span>min: ${item.threshold} · need ${deficit > 0 ? '+' + deficit : '0'} more</span>
          </div>
        </div>`;
    }).join('');
  };

  panel.innerHTML = `
    <div class="alerts-panel-wrapper">
      <div class="alerts-panel-header">
        <div class="alerts-panel-header-left">
          <div>
            <div class="alerts-panel-title"><i class="bi bi-alarm"></i> Stock Alert Monitor</div>
            <div class="alerts-panel-subtitle">Monitoring ${inventoryData.length} SKUs — ${total} item${total > 1 ? 's' : ''} need attention</div>
          </div>
        </div>
        <div class="alerts-panel-counts">
          ${critical.length > 0 ? `<span class="badge badge-critical">${critical.length} Critical</span>` : ''}
          ${low.length > 0 ? `<span class="badge badge-low">${low.length} Low</span>` : ''}
        </div>
      </div>
      <div class="alerts-panel-body" id="alerts-panel-body">
        <div class="alerts-columns">
          <div class="alerts-column">
            <div class="alerts-column-heading critical">🔴 Critical — Immediate Action Required</div>
            ${renderItems(critical, 'critical')}
          </div>
          <div class="alerts-column">
            <div class="alerts-column-heading low">🟡 Low Stock — Reorder Soon</div>
            ${renderItems(low, 'low')}
          </div>
        </div>
      </div>
      <div class="alerts-panel-footer">
        <span>Last updated: ${new Date().toLocaleTimeString()}</span>
        <a href="transfers.html">↔ Transfer stock to resolve shortfalls</a>
      </div>
    </div>`;
}

function initInventoryPage() {
  const tableBody = document.getElementById('inventory-tbody');
  if (!tableBody) return;

  let currentFilter = 'all';
  let currentSearch = '';


  // Render alerts panel on load
  renderAlertsPanel();

  function renderInventory() {
    let data = [...inventoryData];

    // Search filter
    if (currentSearch) {
      const q = currentSearch.toLowerCase();
      data = data.filter(i => i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q));
    }

    // Status filter
    if (currentFilter !== 'all') {
      data = data.filter(i => getStockStatus(i) === currentFilter);
    }


    tableBody.innerHTML = '';
    if (data.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:3rem;color:var(--text-light)">No items found</td></tr>`;
      return;
    }

    data.forEach((item, index) => {
      const status = getStockStatus(item);
      const pct = Math.min(100, Math.round((item.qty / (item.threshold * 2)) * 100));
      const tr = document.createElement('tr');
      tr.className = status !== 'ok' ? `row-${status}` : '';
      tr.style.animationDelay = `${index * 0.04}s`;
      tr.classList.add('fade-in');

      tr.innerHTML = `
        <td>
          <div class="td-product">${item.name}</div>
          <div class="td-sku">${item.sku}</div>
        </td>
        <td>${item.category}</td>
        <td>${item.store}</td>
        <td>
          <div class="qty-display" id="qty-${item.id}">${item.qty} ${item.unit}</div>
          <div class="progress-bar stock-bar">
            <div class="progress-fill ${status}" style="width:${pct}%"></div>
          </div>
        </td>
        <td>
          <input type="number" class="qty-input" id="input-${item.id}"
                 min="0" value="${item.qty}" aria-label="Update quantity for ${item.name}">
        </td>
        <td><span class="badge badge-${status}">${getStatusLabel(status)}</span></td>
        <td>
          <button class="btn btn-outline" style="padding:.4rem .9rem;font-size:.8rem"
                  onclick="updateItemQty('${item.id}')">Update</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    updateInventorySummary();
    renderAlertsPanel();
  }

  // Search
  const searchInput = document.getElementById('inv-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      currentSearch = searchInput.value;
      renderInventory();
    });
  }

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter');
      renderInventory();
    });
  });

  renderInventory();
}

// Exposed globally for inline onclick
window.updateItemQty = function (id) {
  const input = document.getElementById(`input-${id}`);
  const item = inventoryData.find(i => i.id === id);
  if (!item || !input) return;

  const newQty = parseInt(input.value, 10);
  if (isNaN(newQty) || newQty < 0) {
    showToast('⚠ Please enter a valid quantity.');
    return;
  }

  item.qty = newQty;
  saveInventory();
  showToast(`✓ ${item.name} updated to ${newQty} ${item.unit}`);

  // Re-render table and alerts
  renderAlertsPanel();
  const tbody = document.getElementById('inventory-tbody');
  if (tbody) {
    // Only re-render table rows, not the whole init (avoids stacking listeners)
    const status = getStockStatus(item);
    const pct = Math.min(100, Math.round((item.qty / (item.threshold * 2)) * 100));
    const qtyEl = document.getElementById(`qty-${item.id}`);
    const rowEl = document.getElementById(`input-${item.id}`)?.closest('tr');

    if (qtyEl) qtyEl.textContent = `${newQty} ${item.unit}`;
    if (rowEl) {
      rowEl.className = status !== 'ok' ? `row-${status}` : '';
      const fill = rowEl.querySelector('.progress-fill');
      if (fill) { fill.className = `progress-fill ${status}`; fill.style.width = `${pct}%`; }
      const badge = rowEl.querySelector('.badge');
      if (badge) { badge.className = `badge badge-${status}`; badge.textContent = getStatusLabel(status); }
    }
    updateInventorySummary();
  }
};

function updateInventorySummary() {
  const total = inventoryData.length;
  const critical = inventoryData.filter(i => getStockStatus(i) === 'critical').length;
  const low = inventoryData.filter(i => getStockStatus(i) === 'low').length;

  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setEl('sum-total', total);
  setEl('sum-critical', critical);
  setEl('sum-low', low);
  setEl('sum-ok', total - critical - low);
}

// ── TRANSFERS PAGE ────────────────────────────────────────────
// Load transfer log from localStorage
const savedLog = localStorage.getItem('freshfleet_transfers');
const transferLog = savedLog ? JSON.parse(savedLog) : [];

function saveTransferLog() {
  localStorage.setItem('freshfleet_transfers', JSON.stringify(transferLog));
}

function initTransfersPage() {
  const form = document.getElementById('transfer-form');
  if (!form) return;

  // Populate product dropdown
  const productSelect = document.getElementById('tf-product');
  if (productSelect) {
    inventoryData.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.id;
      opt.textContent = `${item.name} (${item.sku})`;
      productSelect.appendChild(opt);
    });
  }

  // Populate store dropdowns
  const fromStore = document.getElementById('tf-from');
  const toStore = document.getElementById('tf-to');
  [fromStore, toStore].forEach(sel => {
    if (!sel) return;
    stores.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s; opt.textContent = s;
      sel.appendChild(opt);
    });
  });

  // Live preview on input change
  const qtyInput = document.getElementById('tf-qty');
  if (qtyInput) {
    qtyInput.addEventListener('input', updateTransferPreview);
  }
  if (productSelect) productSelect.addEventListener('change', updateTransferPreview);
  if (fromStore) fromStore.addEventListener('change', updateTransferPreview);
  if (toStore) toStore.addEventListener('change', updateTransferPreview);

  // Form submit
  form.addEventListener('submit', handleTransferSubmit);

  renderTransferLog();
  updateTransferStats();
}

function updateTransferPreview() {
  const productId = document.getElementById('tf-product')?.value;
  const qty = parseInt(document.getElementById('tf-qty')?.value, 10);
  const from = document.getElementById('tf-from')?.value;
  const to = document.getElementById('tf-to')?.value;
  const preview = document.getElementById('transfer-preview');
  if (!preview) return;

  if (!productId || !qty || !from || !to) {
    preview.innerHTML = '';
    return;
  }

  const item = inventoryData.find(i => i.id === productId);
  if (!item) return;

  const afterQty = item.qty - qty;
  const status = afterQty <= 0 ? '🔴' : afterQty < item.threshold ? '🟡' : '🟢';

  preview.innerHTML = `
    <div class="alert alert-info">
      <strong>Transfer Preview</strong><br>
      Moving <strong>${qty} ${item.unit}</strong> of <strong>${item.name}</strong>
      from <em>${from}</em> → <em>${to}</em><br>
      Stock after transfer: <strong>${Math.max(0, afterQty)} ${item.unit}</strong> ${status}
    </div>
  `;
}

function handleTransferSubmit(e) {
  e.preventDefault();
  const productId = document.getElementById('tf-product')?.value;
  const qty = parseInt(document.getElementById('tf-qty')?.value, 10);
  const from = document.getElementById('tf-from')?.value;
  const to = document.getElementById('tf-to')?.value;
  const notes = document.getElementById('tf-notes')?.value || '';

  if (!productId || !qty || !from || !to) {
    showToast('⚠ Please fill in all required fields.');
    return;
  }
  if (from === to) {
    showToast('⚠ Source and destination cannot be the same.');
    return;
  }

  const item = inventoryData.find(i => i.id === productId);
  if (!item) return;

  if (qty > item.qty) {
    showToast(`⚠ Insufficient stock. Only ${item.qty} ${item.unit} available.`);
    return;
  }

  // Execute transfer
  item.qty -= qty;
  saveInventory();

  const entry = {
    id: `TRF-${String(transferLog.length + 1).padStart(4, '0')}`,
    product: item.name,
    sku: item.sku,
    qty,
    unit: item.unit,
    from,
    to,
    notes,
    time: new Date().toLocaleTimeString(),
    date: new Date().toLocaleDateString(),
  };
  transferLog.unshift(entry);
  saveTransferLog();

  showToast(`✓ Transfer ${entry.id} completed successfully!`);
  e.target.reset();
  document.getElementById('transfer-preview').innerHTML = '';
  renderTransferLog();
  updateTransferStats();
}

function renderTransferLog() {
  const log = document.getElementById('transfer-log');
  if (!log) return;

  if (transferLog.length === 0) {
    log.innerHTML = `
      <div class="summary-empty">
        <div class="icon"><i class="bi bi-dropbox"></i></div>
        <p>No transfers yet. Use the form to initiate a stock transfer.</p>
      </div>`;
    return;
  }

  log.innerHTML = transferLog.map(t => `
    <div class="transfer-log-item">
      <div class="transfer-info">
        <strong>${t.product} <span class="td-sku">(${t.sku})</span></strong>
        <span>${t.from} <span class="transfer-arrow">→</span> ${t.to}</span>
        <span style="color:var(--text-light);font-size:.75rem">${t.date} at ${t.time} · ${t.id}</span>
        ${t.notes ? `<span style="font-size:.78rem;color:var(--text-mid);font-style:italic">${t.notes}</span>` : ''}
      </div>
      <div class="transfer-qty">${t.qty}<small style="font-size:.7rem;color:var(--text-light);display:block;text-align:center">${t.unit}</small></div>
    </div>
  `).join('');
}

function updateTransferStats() {
  const totalTransfers = document.getElementById('stat-transfers');
  const totalMoved = document.getElementById('stat-moved');
  const logBadge = document.getElementById('log-count-badge'); // ADD THIS
  if (totalTransfers) totalTransfers.textContent = transferLog.length;
  if (totalMoved) {
    const moved = transferLog.reduce((acc, t) => acc + t.qty, 0);
    totalMoved.textContent = moved.toLocaleString();
  }
  if (logBadge) logBadge.textContent = `${transferLog.length} transfers`; // ADD THIS
}
// ── SUPPLIERS PAGE ────────────────────────────────────────────
function initSuppliersPage() {
  const select = document.getElementById('supplier-filter');
  if (!select) return;
  select.addEventListener('change', () => filterSuppliers(select.value));
}

window.filterSuppliers = function (category) {
  document.querySelectorAll('.supplier-card').forEach(card => {
    const cats = card.getAttribute('data-categories') || '';
    card.style.display = (category === 'all' || cats.includes(category)) ? '' : 'none';
  });
};

// ── CONTACT PAGE ──────────────────────────────────────────────
function initContactPage() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const subjectSelect = document.getElementById('ct-subject');
  if (subjectSelect) {
    ['Inventory Inquiry', 'Transfer Support', 'Supplier Issues', 'Technical Support', 'Billing / Subscription', 'Other'].forEach(s => {
      const opt = document.createElement('option');
      opt.value = s; opt.textContent = s;
      subjectSelect.appendChild(opt);
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('ct-name')?.value;
    showToast(`✓ Thank you, ${name}! Your message has been sent. We'll respond within 24 hours.`);
    form.reset();
    const result = document.getElementById('contact-result');
    if (result) {
      result.innerHTML = `<div class="alert alert-success">Your inquiry has been submitted successfully. Reference: #SUP-${Date.now().toString().slice(-6)}</div>`;
      result.style.display = 'block';
    }
  });

  // Subscription plan selection
  document.querySelectorAll('.plan-select-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const plan = btn.getAttribute('data-plan');
      showToast(`✓ You selected the ${plan} plan! Our team will follow up shortly.`);
    });
  });

  // FAQ accordion
  document.querySelectorAll('.faq-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const body = btn.nextElementSibling;
      const isOpen = body.style.display === 'block';
      document.querySelectorAll('.faq-body').forEach(b => b.style.display = 'none');
      document.querySelectorAll('.faq-toggle span').forEach(s => s.textContent = '+');
      if (!isOpen) {
        body.style.display = 'block';
        btn.querySelector('span').textContent = '−';
      }
    });
  });
}

// ── Bootstrap ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initHomePage();
  initInventoryPage();
  initTransfersPage();
  initContactPage();
  initSuppliersPage();

  // Intersection Observer for scroll-triggered fade-ins
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in').forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });
});
