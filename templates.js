/**
 * Dynamic templates library with auto-fill from current request / form.
 */
const TemplatesModule = (function () {
    let templates = [];
    let filtered = [];
    let selectedTemplateId = null;
    let contextSource = 'form';

    const PLACEHOLDERS = [
        '{{business}}', '{{account}}', '{{category}}', '{{description}}',
        '{{phone}}', '{{request_id}}', '{{customer_name}}', '{{urgency}}'
    ];

    function getRequestContext() {
        const fromModal = (typeof currentRequestId !== 'undefined' && currentRequestId && typeof requests !== 'undefined')
            ? requests.find(r => r.id === currentRequestId)
            : null;

        if (contextSource === 'request' && fromModal) {
            return {
                business: fromModal.business || '',
                account: fromModal.accountNumber || '',
                category: fromModal.category || '',
                description: fromModal.description || '',
                phone: fromModal.phone || '',
                request_id: fromModal.id || 'DRAFT',
                customer_name: 'Jordan Ellis',
                urgency: fromModal.urgency || 'Medium'
            };
        }

        return {
            business: document.getElementById('business-name')?.value.trim() || '',
            account: document.getElementById('account-number')?.value.trim() || 'Not provided',
            category: document.getElementById('issue-category')?.value || '',
            description: document.getElementById('issue-description')?.value.trim() || '',
            phone: document.getElementById('business-phone')?.value.trim() || 'Not provided',
            request_id: fromModal?.id || 'DRAFT-' + Date.now().toString(36).toUpperCase(),
            customer_name: 'Jordan Ellis',
            urgency: document.getElementById('urgency')?.value || 'Medium'
        };
    }

    function fillTemplate(body, ctx) {
        return body
            .replace(/\{\{business\}\}/g, ctx.business || '[Business]')
            .replace(/\{\{account\}\}/g, ctx.account || '[Account]')
            .replace(/\{\{category\}\}/g, ctx.category || '[Category]')
            .replace(/\{\{description\}\}/g, ctx.description || '[Describe issue]')
            .replace(/\{\{phone\}\}/g, ctx.phone || '[Phone]')
            .replace(/\{\{request_id\}\}/g, ctx.request_id || 'DRAFT')
            .replace(/\{\{customer_name\}\}/g, ctx.customer_name || 'Customer')
            .replace(/\{\{urgency\}\}/g, ctx.urgency || 'Medium');
    }

    function scoreTemplate(t, ctx) {
        let score = 0;
        const biz = (ctx.business || '').toLowerCase();
        if (biz && t.business_tags?.some(tag => biz.includes(tag.toLowerCase()) || tag.toLowerCase().includes(biz))) {
            score += 3;
        }
        if (ctx.category && t.issue_categories?.includes(ctx.category)) score += 4;
        if (ctx.business && !t.business_tags?.length) score += 1;
        return score;
    }

    function applyFilters() {
        const search = (document.getElementById('template-search')?.value || '').toLowerCase().trim();
        const channel = document.getElementById('template-channel-filter')?.value || 'all';
        const category = document.getElementById('template-category-filter')?.value || 'all';
        const ctx = getRequestContext();

        filtered = templates.filter(t => {
            if (channel !== 'all' && t.channel !== channel) return false;
            if (category !== 'all' && t.category !== category) return false;
            if (search) {
                const hay = `${t.title} ${t.body} ${(t.business_tags || []).join(' ')}`.toLowerCase();
                if (!hay.includes(search)) return false;
            }
            return true;
        });

        filtered.sort((a, b) => scoreTemplate(b, ctx) - scoreTemplate(a, ctx));
        renderTemplateList();
        renderTemplatePreview();
    }

    function channelIcon(channel) {
        const icons = { call: 'fa-phone', email: 'fa-envelope', portal: 'fa-lock', escalation: 'fa-arrow-up' };
        return icons[channel] || 'fa-file-lines';
    }

    function renderTemplateList() {
        const container = document.getElementById('template-list');
        if (!container) return;

        const ctx = getRequestContext();
        const hasContext = ctx.business || ctx.description;

        if (filtered.length === 0) {
            container.innerHTML = `<div class="text-center py-8 text-slate-400 text-sm">No templates match your filters.</div>`;
            return;
        }

        container.innerHTML = filtered.map(t => {
            const score = scoreTemplate(t, ctx);
            const recommended = hasContext && score >= 4;
            const active = selectedTemplateId === (t.id || t.slug);
            return `
            <button type="button" onclick="TemplatesModule.select('${t.id || t.slug}')"
                    class="w-full text-left p-4 rounded-2xl border transition-all ${active ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-white hover:border-indigo-200'}">
                <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0 flex-1">
                        <div class="font-semibold text-sm truncate">${t.title}</div>
                        <div class="text-[10px] text-slate-500 mt-0.5">${t.category} · ${t.channel}</div>
                    </div>
                    <div class="flex items-center gap-1 shrink-0">
                        ${recommended ? '<span class="text-[9px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-semibold">MATCH</span>' : ''}
                        <i class="fa-solid ${channelIcon(t.channel)} text-indigo-400 text-xs"></i>
                    </div>
                </div>
            </button>`;
        }).join('');
    }

    function renderTemplatePreview() {
        const preview = document.getElementById('template-preview');
        const meta = document.getElementById('template-preview-meta');
        if (!preview) return;

        const t = filtered.find(x => (x.id || x.slug) === selectedTemplateId)
            || filtered[0];

        if (!t) {
            preview.textContent = 'Select a template to preview with your request details auto-filled.';
            if (meta) meta.textContent = '';
            return;
        }

        if (!selectedTemplateId) selectedTemplateId = t.id || t.slug;

        const ctx = getRequestContext();
        const filled = fillTemplate(t.body, ctx);

        preview.textContent = filled;
        if (meta) {
            meta.innerHTML = `<span class="font-medium">${t.title}</span> · ${Object.values(ctx).filter(Boolean).length} fields auto-filled`;
        }
    }

    function renderContextBanner() {
        const banner = document.getElementById('template-context-banner');
        if (!banner) return;
        const ctx = getRequestContext();
        const sourceLabel = contextSource === 'request' ? 'open request' : 'new request form';

        if (!ctx.business && !ctx.description) {
            banner.innerHTML = `
                <div class="flex items-center gap-2 text-amber-700">
                    <i class="fa-solid fa-circle-info"></i>
                    <span>Start a request or open one to enable smart template matching and auto-fill.</span>
                </div>`;
            banner.className = 'mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs';
            return;
        }

        banner.innerHTML = `
            <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-2 text-indigo-700">
                    <i class="fa-solid fa-wand-magic-sparkles"></i>
                    <span>Auto-fill from <strong>${sourceLabel}</strong>: ${ctx.business || '—'} · ${ctx.category || '—'}</span>
                </div>
                <div class="flex gap-1">
                    <button type="button" onclick="TemplatesModule.setContextSource('form')" 
                            class="text-[10px] px-2 py-1 rounded-lg ${contextSource === 'form' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200'}">Form</button>
                    <button type="button" onclick="TemplatesModule.setContextSource('request')" 
                            class="text-[10px] px-2 py-1 rounded-lg ${contextSource === 'request' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200'}">Open Request</button>
                </div>
            </div>`;
        banner.className = 'mb-4 p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs';
    }

    function populateCategoryFilter() {
        const select = document.getElementById('template-category-filter');
        if (!select) return;
        const cats = [...new Set(templates.map(t => t.category))].sort();
        select.innerHTML = '<option value="all">All categories</option>' +
            cats.map(c => `<option value="${c}">${c}</option>`).join('');
    }

    async function load() {
        templates = await DataLayer.fetchTemplates();
        filtered = [...templates];
        populateCategoryFilter();
        selectedTemplateId = filtered[0]?.id || filtered[0]?.slug || null;
        renderContextBanner();
        applyFilters();
    }

    function select(id) {
        selectedTemplateId = id;
        renderTemplateList();
        renderTemplatePreview();
    }

    function setContextSource(source) {
        contextSource = source;
        renderContextBanner();
        applyFilters();
    }

    function refreshContext() {
        renderContextBanner();
        applyFilters();
    }

    function applyToDescription() {
        const t = filtered.find(x => (x.id || x.slug) === selectedTemplateId);
        if (!t) {
            showToast('Select a template first.', 'error');
            return;
        }
        const filled = fillTemplate(t.body, getRequestContext());
        const desc = document.getElementById('issue-description');
        if (desc) {
            desc.value = filled;
            showView('new-request');
            desc.focus();
            showToast('Template applied to description field.', 'success');
        } else {
            copyToClipboard(filled);
        }
    }

    function copyFilled() {
        const t = filtered.find(x => (x.id || x.slug) === selectedTemplateId);
        if (!t) {
            showToast('Select a template first.', 'error');
            return;
        }
        copyToClipboard(fillTemplate(t.body, getRequestContext()));
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Filled template copied to clipboard.', 'success');
        }).catch(() => {
            showToast('Could not copy — select text manually.', 'error');
        });
    }

    function openFromRequestModal() {
        contextSource = 'request';
        showView('templates');
    }

    return {
        load,
        select,
        setContextSource,
        refreshContext,
        applyFilters,
        applyToDescription,
        copyFilled,
        openFromRequestModal,
        getRequestContext,
        fillTemplate
    };
})();

window.TemplatesModule = TemplatesModule;
