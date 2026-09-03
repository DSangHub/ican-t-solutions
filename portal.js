/** Passwordless provider handoff. iCant never collects third-party credentials. */
const PortalModule = (function () {
    const PORTALS = [
        { id: 'chase', name: 'Chase Online Banking', icon: 'fa-university', url: 'https://secure.chase.com/' },
        { id: 'pge', name: 'PG&E My Energy', icon: 'fa-bolt', url: 'https://www.pge.com/' },
        { id: 'xfinity', name: 'Xfinity Account Center', icon: 'fa-tv', url: 'https://www.xfinity.com/' },
        { id: 'united', name: 'United MileagePlus', icon: 'fa-plane', url: 'https://www.united.com/' },
        { id: 'amazon', name: 'Amazon Account', icon: 'fa-box', url: 'https://www.amazon.com/' }
    ];
    let activeRequestId = null, selectedPortalId = null, workflowStep = 1;
    function esc(value) { const d = document.createElement('div'); d.textContent = String(value ?? ''); return d.innerHTML; }
    function render() { renderRequestSelector(); renderWorkflow(); renderPortalGrid(); renderStatus(); }
    function renderRequestSelector() { const select = document.getElementById('portal-request-select'); if (!select) return; const active = requests.filter(r => r.status !== 'Resolved'); select.innerHTML = '<option value="">— Select active request —</option>' + active.map(r => `<option value="${esc(r.id)}">${esc(r.id)} · ${esc(r.business)}</option>`).join(''); if (!activeRequestId && active[0]) activeRequestId = active[0].id; select.value = activeRequestId || ''; }
    function renderWorkflow() { const el = document.getElementById('portal-workflow-steps'); if (!el) return; const steps = ['Link Request', 'Choose Portal', 'Customer Sign-in', 'Confirm Outcome']; el.innerHTML = steps.map((label, i) => `<div class="flex-1 text-center text-xs ${workflowStep >= i + 1 ? 'text-indigo-700 font-semibold' : 'text-slate-400'}"><div class="mx-auto mb-1 w-8 h-8 rounded-xl flex items-center justify-center ${workflowStep >= i + 1 ? 'bg-indigo-600 text-white' : 'bg-slate-100'}">${i + 1}</div>${label}</div>`).join(''); }
    function renderPortalGrid() { const grid = document.getElementById('portal-grid'); if (!grid) return; grid.innerHTML = PORTALS.map(p => `<button type="button" onclick="PortalModule.selectPortal('${p.id}')" class="p-4 rounded-2xl border text-left ${selectedPortalId === p.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200'}"><i class="fa-solid ${p.icon} text-indigo-600 mr-2"></i>${esc(p.name)}</button>`).join(''); }
    function renderStatus() { const status = document.getElementById('portal-vault-status'); if (status) status.textContent = selectedPortalId ? 'Ready for customer sign-in' : 'Select a provider'; const chat = document.getElementById('portal-chat-window'); if (chat) chat.innerHTML = '<div class="text-center text-sm text-slate-500 py-8">Use case chat only for coordination. Never send passwords, one-time codes, or security answers.</div>'; }
    function selectRequest(id) { activeRequestId = id || null; workflowStep = 1; render(); }
    function selectPortal(id) { selectedPortalId = id; workflowStep = 2; render(); }
    function openProvider() { const portal = PORTALS.find(p => p.id === selectedPortalId); if (!activeRequestId || !portal) return showToast('Select a request and provider first.', 'error'); window.open(portal.url, '_blank', 'noopener,noreferrer'); workflowStep = 3; render(); showToast('Provider opened. Complete sign-in directly with the provider.', 'info'); }
    function endSession() { workflowStep = 4; render(); showToast('Session ended. No provider credentials were retained.', 'success'); }
    function sendPortalMessage() { showToast('Use the signed-in request chat for coordination. Never share credentials.', 'info'); }
    function openForRequest(id) { activeRequestId = id; showView('secure-portal'); render(); }
    return { render, selectRequest, selectPortal, openProvider, endSession, sendPortalMessage, openForRequest };
})();
window.PortalModule = PortalModule;
