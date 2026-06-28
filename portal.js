/**
 * Secure Portal / Chat workflow tab.
 */
const PortalModule = (function () {
    const PORTALS = [
        { id: 'chase', name: 'Chase Online Banking', business: 'Chase Bank', icon: 'fa-university', url: 'chase.com' },
        { id: 'pge', name: 'PG&E My Energy', business: 'PG&E', icon: 'fa-bolt', url: 'pge.com' },
        { id: 'xfinity', name: 'Xfinity Account Center', business: 'Comcast / Xfinity', icon: 'fa-tv', url: 'xfinity.com' },
        { id: 'united', name: 'United MileagePlus', business: 'United Airlines', icon: 'fa-plane', url: 'united.com' },
        { id: 'amazon', name: 'Amazon Account', business: 'Amazon', icon: 'fa-box', url: 'amazon.com' },
        { id: 'custom', name: 'Other Portal', business: '', icon: 'fa-globe', url: '' }
    ];

    const VAULT_KEY = 'icant_portal_vault';
    const CHAT_KEY = 'icant_portal_chat';

    let activeRequestId = null;
    let selectedPortalId = null;
    let workflowStep = 1;

    function getVault() {
        return JSON.parse(localStorage.getItem(VAULT_KEY) || '{}');
    }

    function saveVault(data) {
        localStorage.setItem(VAULT_KEY, JSON.stringify(data));
    }

    function getPortalChats() {
        return JSON.parse(localStorage.getItem(CHAT_KEY) || '{}');
    }

    function savePortalChats(data) {
        localStorage.setItem(CHAT_KEY, JSON.stringify(data));
    }

    function getChatForRequest(reqId) {
        const all = getPortalChats();
        if (!all[reqId]) {
            all[reqId] = [
                { from: 'system', text: 'Secure portal channel opened. Messages are encrypted in transit (demo: stored locally).', time: formatTime() }
            ];
            savePortalChats(all);
        }
        return all[reqId];
    }

    function formatTime() {
        return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }

    function render() {
        renderRequestSelector();
        renderWorkflow();
        renderPortalGrid();
        renderVaultForm();
        renderPortalChat();
    }

    function renderRequestSelector() {
        const select = document.getElementById('portal-request-select');
        if (!select) return;

        const active = (typeof requests !== 'undefined' ? requests : []).filter(r => r.status !== 'Resolved');
        select.innerHTML = '<option value="">— Select active request —</option>' +
            active.map(r => `<option value="${r.id}" ${r.id === activeRequestId ? 'selected' : ''}>${r.id} · ${r.business}</option>`).join('');

        if (!activeRequestId && active.length) {
            activeRequestId = active[0].id;
            select.value = activeRequestId;
        }
    }

    function renderWorkflow() {
        const container = document.getElementById('portal-workflow-steps');
        if (!container) return;

        const steps = [
            { n: 1, label: 'Link Request', icon: 'fa-link' },
            { n: 2, label: 'Choose Portal', icon: 'fa-window-maximize' },
            { n: 3, label: 'Secure Vault', icon: 'fa-vault' },
            { n: 4, label: 'Agent Chat', icon: 'fa-comments' }
        ];

        container.innerHTML = steps.map(s => `
            <div class="flex flex-col items-center flex-1 min-w-[4.5rem]">
                <div class="w-9 h-9 rounded-2xl flex items-center justify-center text-sm font-bold transition-colors
                    ${workflowStep >= s.n ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}">
                    <i class="fa-solid ${s.icon} text-xs"></i>
                </div>
                <span class="text-[9px] mt-1 text-center font-medium ${workflowStep >= s.n ? 'text-indigo-600' : 'text-slate-400'}">${s.label}</span>
            </div>
        `).join('');
    }

    function renderPortalGrid() {
        const grid = document.getElementById('portal-grid');
        if (!grid) return;

        const req = (typeof requests !== 'undefined' ? requests : []).find(r => r.id === activeRequestId);
        const suggested = req ? PORTALS.find(p => req.business.toLowerCase().includes(p.business.split(' ')[0].toLowerCase())) : null;

        grid.innerHTML = PORTALS.map(p => {
            const isSuggested = suggested?.id === p.id;
            const selected = selectedPortalId === p.id;
            return `
            <button type="button" onclick="PortalModule.selectPortal('${p.id}')"
                    class="portal-card p-4 rounded-2xl border text-left transition-all ${selected ? 'border-indigo-400 bg-indigo-50 ring-2 ring-indigo-200' : 'border-slate-200 bg-white hover:border-indigo-200'}">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-indigo-600">
                        <i class="fa-solid ${p.icon}"></i>
                    </div>
                    <div>
                        <div class="font-semibold text-sm">${p.name}</div>
                        ${isSuggested ? '<div class="text-[9px] text-emerald-600 font-semibold">SUGGESTED</div>' : ''}
                    </div>
                </div>
            </button>`;
        }).join('');

        if (suggested && !selectedPortalId) {
            selectPortal(suggested.id);
        }
    }

    function renderVaultForm() {
        const panel = document.getElementById('portal-vault-panel');
        if (!panel || !activeRequestId) return;

        const vault = getVault()[activeRequestId] || {};
        const portal = PORTALS.find(p => p.id === selectedPortalId);

        document.getElementById('portal-vault-status').textContent = vault.saved
            ? 'Credentials stored in encrypted vault (demo: localStorage)'
            : 'No credentials saved yet';

        const username = document.getElementById('portal-username');
        const password = document.getElementById('portal-password');
        const notes = document.getElementById('portal-notes');
        const portalUrl = document.getElementById('portal-custom-url');

        if (username) username.value = vault.username || '';
        if (password) password.value = vault.password ? '••••••••' : '';
        if (notes) notes.value = vault.notes || '';
        if (portalUrl) portalUrl.value = vault.customUrl || (portal?.url ? 'https://' + portal.url : '');
    }

    function renderPortalChat() {
        const window_ = document.getElementById('portal-chat-window');
        if (!window_ || !activeRequestId) {
            if (window_) window_.innerHTML = '<div class="text-slate-400 text-center py-8 text-sm">Select a request to open secure agent chat.</div>';
            return;
        }

        const messages = getChatForRequest(activeRequestId);
        window_.innerHTML = messages.map(m => {
            if (m.from === 'user') {
                return `<div class="flex justify-end"><div class="chat-message chat-user">${escapeHtml(m.text)}<div class="text-[9px] opacity-60 text-right mt-0.5">${m.time}</div></div></div>`;
            }
            if (m.from === 'agent') {
                return `<div class="flex"><div class="chat-message chat-agent">${escapeHtml(m.text)}<div class="text-[9px] opacity-60 mt-0.5">${m.time}</div></div></div>`;
            }
            return `<div class="text-center text-[10px] text-slate-400 py-2"><i class="fa-solid fa-shield-halved text-emerald-500"></i> ${escapeHtml(m.text)}</div>`;
        }).join('');
        window_.scrollTop = window_.scrollHeight;
    }

    function escapeHtml(str) {
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }

    function selectRequest(reqId) {
        activeRequestId = reqId || null;
        workflowStep = reqId ? Math.max(workflowStep, 1) : 1;
        render();
    }

    function selectPortal(portalId) {
        selectedPortalId = portalId;
        workflowStep = Math.max(workflowStep, 2);
        renderPortalGrid();
        renderVaultForm();
        renderWorkflow();
    }

    function saveCredentials() {
        if (!activeRequestId) {
            showToast('Select a request first.', 'error');
            return;
        }

        const username = document.getElementById('portal-username').value.trim();
        const passwordRaw = document.getElementById('portal-password').value;
        const notes = document.getElementById('portal-notes').value.trim();
        const customUrl = document.getElementById('portal-custom-url').value.trim();

        if (!username) {
            showToast('Username or email is required.', 'error');
            return;
        }

        const vault = getVault();
        const existing = vault[activeRequestId] || {};
        vault[activeRequestId] = {
            portalId: selectedPortalId,
            username,
            password: passwordRaw.startsWith('••') ? existing.password : passwordRaw,
            notes,
            customUrl,
            saved: true,
            savedAt: new Date().toISOString()
        };
        saveVault(vault);
        workflowStep = Math.max(workflowStep, 3);

        const chats = getPortalChats();
        if (!chats[activeRequestId]) chats[activeRequestId] = [];
        chats[activeRequestId].push({
            from: 'system',
            text: 'Customer shared portal credentials via secure vault. Agent notified.',
            time: formatTime()
        });
        chats[activeRequestId].push({
            from: 'agent',
            text: "Credentials received securely. I'll log into the portal on your behalf and update you here. You can revoke access anytime.",
            time: formatTime()
        });
        savePortalChats(chats);

        render();
        showToast('Credentials saved to secure vault.', 'success');
    }

    function sendPortalMessage() {
        if (!activeRequestId) return;
        const input = document.getElementById('portal-chat-input');
        const text = input?.value.trim();
        if (!text) return;

        const chats = getPortalChats();
        chats[activeRequestId].push({ from: 'user', text, time: formatTime() });
        savePortalChats(chats);
        input.value = '';
        workflowStep = 4;
        renderPortalChat();
        renderWorkflow();

        setTimeout(() => {
            const replies = [
                "I'm in the portal now — navigating to the billing section.",
                "Portal session active. I'll screenshot confirmations and add them to your case timeline.",
                "Two-factor prompt received — please approve the push notification on your device if you see one."
            ];
            chats[activeRequestId].push({
                from: 'agent',
                text: replies[Math.floor(Math.random() * replies.length)],
                time: formatTime()
            });
            savePortalChats(chats);
            renderPortalChat();
        }, 1200);
    }

    function revokeAccess() {
        if (!activeRequestId) return;
        const vault = getVault();
        delete vault[activeRequestId];
        saveVault(vault);
        const chats = getPortalChats();
        if (chats[activeRequestId]) {
            chats[activeRequestId].push({
                from: 'system',
                text: 'Portal credentials revoked by customer.',
                time: formatTime()
            });
            savePortalChats(chats);
        }
        render();
        showToast('Portal access revoked.', 'info');
    }

    function openForRequest(requestId) {
        activeRequestId = requestId;
        workflowStep = 1;
        showView('secure-portal');
        render();
    }

    return {
        render,
        selectRequest,
        selectPortal,
        saveCredentials,
        sendPortalMessage,
        revokeAccess,
        openForRequest
    };
})();

window.PortalModule = PortalModule;
