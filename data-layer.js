/**
 * Data layer: Supabase when configured, localStorage fallback otherwise.
 */
const DataLayer = (function () {
    let supabase = null;
    let online = false;

    const LOCAL_TEMPLATES_KEY = 'icant_templates_cache';
    const LOCAL_RATINGS_KEY = 'icant_business_ratings';

    const SEED_TEMPLATES = [
        {
            id: 'local-1',
            slug: 'cancellation-retention',
            title: 'Service Cancellation — Retention Call',
            category: 'Cancellation',
            channel: 'call',
            business_tags: ['Comcast', 'Xfinity', 'AT&T', 'Spectrum'],
            issue_categories: ['Cancellation / Termination'],
            body: 'Hello, I am calling as an authorized representative for {{customer_name}} regarding account {{account}}.\n\n{{customer_name}} has requested cancellation of their {{business}} service. Issue: {{description}}\n\nPlease process cancellation without ETF and email written confirmation. Reference: {{request_id}}. Urgency: {{urgency}}.',
            sort_order: 1
        },
        {
            id: 'local-2',
            slug: 'billing-dispute',
            title: 'Billing Dispute — Formal Review',
            category: 'Billing',
            channel: 'call',
            business_tags: ['PG&E', 'Comcast', 'Chase'],
            issue_categories: ['Billing / Charges'],
            body: 'Authorized call for {{customer_name}} (account {{account}}) — billing dispute with {{business}}.\n\n{{description}}\n\nRequest Level 2 review and usage investigation. Case {{request_id}}.',
            sort_order: 2
        },
        {
            id: 'local-3',
            slug: 'fraud-escalation',
            title: 'Fraud Claim — Executive Escalation',
            category: 'Escalation',
            channel: 'call',
            business_tags: ['Chase', 'Bank of America'],
            issue_categories: ['Complaint / Escalation'],
            body: 'Fraud escalation for {{customer_name}}, account {{account}}.\n\n{{description}}\n\nRequest temp credit + supervisor. Case {{request_id}} ({{urgency}}).',
            sort_order: 3
        },
        {
            id: 'local-4',
            slug: 'portal-login-assist',
            title: 'Secure Portal — Agent Login Script',
            category: 'Portal',
            channel: 'portal',
            business_tags: [],
            issue_categories: ['Account Access / Login Issues'],
            body: 'Portal session: {{business}} ({{request_id}}).\n\nAuthorized portal access to resolve: {{description}}\nAccount: {{account}}. Credentials shared via Secure Portal vault.',
            sort_order: 4
        },
        {
            id: 'local-5',
            slug: 'email-confirmation',
            title: 'Written Confirmation Email',
            category: 'Follow-up',
            channel: 'email',
            business_tags: [],
            issue_categories: ['Cancellation / Termination', 'Refund Request'],
            body: 'Subject: Confirmation request — {{business}} {{account}}\n\nOn behalf of {{customer_name}} (case {{request_id}}):\n\n{{description}}\n\nPlease reply with written confirmation. Urgency: {{urgency}}.',
            sort_order: 5
        },
        {
            id: 'local-6',
            slug: 'refund-request',
            title: 'Refund Request Script',
            category: 'Refund',
            channel: 'call',
            business_tags: ['United Airlines', 'Amazon', 'Netflix'],
            issue_categories: ['Refund Request'],
            body: 'Refund request for {{customer_name}}, {{business}} account {{account}}.\n\n{{description}}\n\nCase {{request_id}} — {{urgency}} priority.',
            sort_order: 6
        },
        {
            id: 'local-7',
            slug: 'supervisor-escalation',
            title: 'Supervisor Escalation — Generic',
            category: 'Escalation',
            channel: 'call',
            business_tags: [],
            issue_categories: ['Speak to Supervisor / Manager', 'Complaint / Escalation'],
            body: 'Escalation request for {{customer_name}} regarding {{business}} account {{account}}.\n\nPrior attempts failed. Summary: {{description}}\n\nRequest supervisor callback within 24 hours. iCant ref {{request_id}}.',
            sort_order: 7
        },
        {
            id: 'local-8',
            slug: 'portal-chat-handoff',
            title: 'Portal Chat Handoff Message',
            category: 'Portal',
            channel: 'portal',
            business_tags: [],
            issue_categories: ['Account Access / Login Issues', 'Technical Support'],
            body: 'Secure portal handoff initiated for case {{request_id}}.\n\nBusiness: {{business}}\nGoal: {{description}}\n\nAgent entering portal with customer authorization. Session encrypted end-to-end.',
            sort_order: 8
        }
    ];

    async function init() {
        // Remove private data and legacy backend configuration created by the prototype.
        ['icant_requests', 'icant_portal_vault', 'icant_portal_chat', 'icant_supabase_url', 'icant_supabase_anon_key']
            .forEach(key => localStorage.removeItem(key));
        const { supabaseUrl, supabaseAnonKey } = window.ICANT_CONFIG || {};
        if (supabaseUrl && supabaseAnonKey && window.supabase) {
            try {
                supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
                const { error } = await supabase.auth.getSession();
                if (error) throw error;
                online = true;
            } catch (e) {
                console.warn('[iCant] Supabase init failed, using local mode.', e);
            }
        }
        if (!localStorage.getItem(LOCAL_TEMPLATES_KEY)) {
            localStorage.setItem(LOCAL_TEMPLATES_KEY, JSON.stringify(SEED_TEMPLATES));
        }
    }

    function isOnline() {
        return online && supabase !== null;
    }

    function getConnectionStatus() {
        return isOnline() ? 'connected' : 'local';
    }

    function getClient() {
        return supabase;
    }

    async function getUser() {
        if (!isOnline()) return null;
        const { data, error } = await supabase.auth.getUser();
        if (error) return null;
        return data.user;
    }

    async function fetchRequests() {
        const user = await getUser();
        if (!user) return [];
        const { data, error } = await supabase.from('requests').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data.map(r => ({
            id: r.id, business: r.business, phone: r.business_phone || 'Not provided',
            accountNumber: r.account_reference || 'Not provided', category: r.category,
            urgency: r.urgency, description: r.description, status: r.status,
            submitted: r.created_at.slice(0, 10), lastUpdate: r.updated_at,
            timeline: r.timeline || [], chat: r.chat || []
        }));
    }

    async function ensureProfile() {
        const user = await getUser();
        if (!user) return null;
        const { data, error } = await supabase.from('profiles').upsert({ id: user.id }, { onConflict: 'id' }).select().single();
        if (error) throw error;
        return data;
    }

    async function saveRequest(request) {
        const user = await getUser();
        if (!user) throw new Error('Sign in is required');
        const row = {
            id: request.id, user_id: user.id, business: request.business,
            business_phone: request.phone, account_reference: request.accountNumber,
            category: request.category, urgency: request.urgency,
            description: request.description, status: request.status,
            timeline: request.timeline || [], chat: request.chat || [],
            updated_at: new Date().toISOString()
        };
        const { error } = await supabase.from('requests').upsert(row);
        if (error) throw error;
    }

    async function fetchTemplates() {
        if (isOnline()) {
            const { data, error } = await supabase
                .from('templates')
                .select('*')
                .eq('is_public', true)
                .order('sort_order', { ascending: true });
            if (!error && data && data.length) {
                localStorage.setItem(LOCAL_TEMPLATES_KEY, JSON.stringify(data));
                return data;
            }
            console.warn('[iCant] Supabase templates fetch failed, using cache.', error);
        }
        return JSON.parse(localStorage.getItem(LOCAL_TEMPLATES_KEY) || JSON.stringify(SEED_TEMPLATES));
    }

    async function fetchRatingsForBusiness(businessId) {
        if (isOnline()) {
            const { data, error } = await supabase
                .from('business_ratings')
                .select('*')
                .eq('business_id', businessId)
                .order('created_at', { ascending: false });
            if (!error && data) return data;
        }
        const local = JSON.parse(localStorage.getItem(LOCAL_RATINGS_KEY) || '{}');
        return (local[businessId] || []).map((r, i) => ({
            id: 'local-' + i,
            business_id: businessId,
            stars: r.stars,
            short_comment: r.short,
            long_comment: r.long,
            created_at: r.date
        }));
    }

    async function fetchAllRatingsGrouped() {
        if (isOnline()) {
            const { data, error } = await supabase
                .from('business_ratings')
                .select('*')
                .order('created_at', { ascending: false });
            if (!error && data) {
                const grouped = {};
                data.forEach(r => {
                    if (!grouped[r.business_id]) grouped[r.business_id] = [];
                    grouped[r.business_id].push({
                        stars: r.stars,
                        short: r.short_comment,
                        long: r.long_comment,
                        date: r.created_at
                    });
                });
                localStorage.setItem(LOCAL_RATINGS_KEY, JSON.stringify(grouped));
                return grouped;
            }
        }
        return JSON.parse(localStorage.getItem(LOCAL_RATINGS_KEY) || '{}');
    }

    async function submitRating(businessId, businessName, stars, shortComment, longComment) {
        if (isOnline()) {
            const user = await getUser();
            if (!user) return { ok: false, source: 'auth', error: 'Sign in required' };
            const { error } = await supabase.from('business_ratings').insert({
                business_id: businessId,
                business_name: businessName,
                user_id: user.id,
                stars,
                short_comment: shortComment,
                long_comment: longComment
            });
            if (!error) return { ok: true, source: 'supabase' };
            console.warn('[iCant] Supabase rating insert failed, saving locally.', error);
        }

        const local = JSON.parse(localStorage.getItem(LOCAL_RATINGS_KEY) || '{}');
        if (!local[businessId]) local[businessId] = [];
        local[businessId].push({
            stars,
            short: shortComment || 'No comment',
            long: longComment || '',
            date: new Date().toISOString()
        });
        localStorage.setItem(LOCAL_RATINGS_KEY, JSON.stringify(local));
        return { ok: true, source: 'local' };
    }

    return {
        init,
        isOnline,
        getConnectionStatus,
        getClient,
        getUser,
        fetchRequests,
        ensureProfile,
        saveRequest,
        fetchTemplates,
        fetchRatingsForBusiness,
        fetchAllRatingsGrouped,
        submitRating,
        SEED_TEMPLATES
    };
})();

window.DataLayer = DataLayer;
