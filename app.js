// Tailwind script
function initializeTailwind() {
    document.documentElement.style.setProperty('--accent', '#1e40af');
    
    tailwind.config = {
        theme: {
            extend: {
                fontFamily: {
                    'display': ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif']
                }
            }
        }
    };
}

function escapeHtml(value) {
    const element = document.createElement('div');
    element.textContent = String(value ?? '');
    return element.innerHTML;
}

// Sample Business Database
let businesses = [
    {
        id: 1,
        name: "Comcast / Xfinity",
        category: "Telecom / Cable",
        phone: "1-800-934-6489",
        website: "xfinity.com",
        avgWait: "38 min",
        successRate: "94%",
        tips: [
            "Say 'representative' or press 0 repeatedly after prompts",
            "Use the Xfinity app chat first — often faster escalation",
            "Ask for 'Retention Department' directly for cancellations",
            "Reference case number from previous calls to speed things up"
        ]
    },
    {
        id: 2,
        name: "PG&E",
        category: "Utilities",
        phone: "1-877-660-6789",
        website: "pge.com",
        avgWait: "22 min",
        successRate: "89%",
        tips: [
            "For billing disputes, select 'Billing' then say 'supervisor'",
            "Have your 11-digit account number ready",
            "Request 'Level 2 review' for high bill complaints",
            "Email escalations often get faster written responses"
        ]
    },
    {
        id: 3,
        name: "Chase Bank",
        category: "Banking / Finance",
        phone: "1-800-935-9935",
        website: "chase.com",
        avgWait: "14 min",
        successRate: "91%",
        tips: [
            "Say 'speak to a representative' at the main menu",
            "For disputes, ask for 'Executive Office' or 'Office of the President'",
            "Use secure message center in app for paper trail",
            "Mention CFPB complaint if needed for faster escalation"
        ]
    },
    {
        id: 4,
        name: "United Airlines",
        category: "Airlines / Travel",
        phone: "1-800-864-8331",
        website: "united.com",
        avgWait: "27 min",
        successRate: "82%",
        tips: [
            "Call the dedicated Premier line if you have status",
            "For refunds/changes: 'I need to speak with a supervisor about my itinerary'",
            "Use the app's 'Request Callback' feature when available",
            "Reference ticket number and flight date immediately"
        ]
    },
    {
        id: 5,
        name: "AT&T",
        category: "Telecom / Wireless",
        phone: "1-800-331-0500",
        website: "att.com",
        avgWait: "31 min",
        successRate: "87%",
        tips: [
            "Press * then 0 or say 'agent' multiple times",
            "For billing: Choose 'Billing questions' → 'Other billing question'",
            "Retention department for contract buyouts/cancellations",
            "Request written confirmation of any promises made"
        ]
    },
    {
        id: 6,
        name: "California DMV",
        category: "Government",
        phone: "1-800-777-0133",
        website: "dmv.ca.gov",
        avgWait: "45+ min",
        successRate: "76%",
        tips: [
            "Best times: Tuesday-Thursday 8-10am or after 3pm",
            "Have DL #, plate, or case # ready before calling",
            "For registration issues, ask for 'Registration Services supervisor'",
            "Many services now available via online portal or appointment"
        ]
    },
    {
        id: 7,
        name: "Netflix",
        category: "Streaming",
        phone: "1-866-579-7172",
        website: "netflix.com",
        avgWait: "8 min",
        successRate: "96%",
        tips: [
            "Chat support in account is usually fastest",
            "For cancellations: Go to Account → Cancel Membership directly",
            "Ask for 'Retention specialist' for billing issues",
            "Request refund within 30 days of charge for best results"
        ]
    },
    {
        id: 8,
        name: "Amazon",
        category: "E-commerce",
        phone: "1-888-280-4331",
        website: "amazon.com",
        avgWait: "11 min",
        successRate: "93%",
        tips: [
            "Use the 'Call Me' button in the app for instant callback",
            "For orders: Have order # ready and say 'I need help with an order'",
            "Escalate to 'Executive Customer Relations' for serious issues",
            "Amazon often offers goodwill credits easily — just ask politely"
        ],
        ratings: [
            {stars: 2, short: "Terrible hold times", long: "Automated system is awful, took 45 minutes just to speak to someone."},
            {stars: 4, short: "Good chat support", long: "App chat worked well for simple issues."}
        ]
    }
];

// Global ratings storage (synced from Supabase or localStorage)
let businessRatings = {};

// Sample Requests (persisted in localStorage)
var requests = [];

// Current open request id for modal (var for inline onclick handlers)
var currentRequestId = null;

// Initialize sample data if empty
function initializeSampleData() {
    if (false && requests.length === 0) {
        requests = [
            {
                id: "REQ-2847",
                business: "Comcast",
                phone: "1-800-934-6489",
                accountNumber: "8293749102",
                category: "Cancellation / Termination",
                urgency: "High",
                description: "Trying to cancel service for 3 weeks. Stuck in loops, transferred repeatedly. Want to cancel without ETF and get written confirmation.",
                status: "In Progress",
                submitted: "2026-06-24",
                lastUpdate: "2026-06-25T14:22:00",
                timeline: [
                    { time: "2026-06-24 09:14", text: "Request received and authorized. Agent assigned: Marcus T." },
                    { time: "2026-06-24 10:45", text: "Researched best escalation path. Prepared retention script and account history summary." },
                    { time: "2026-06-25 11:30", text: "Called main support line. Navigated IVR using option 4 → 'existing customer' → said 'representative' x3. Reached billing dept." },
                    { time: "2026-06-25 11:48", text: "Spoke with retention specialist. Explained situation and requested supervisor callback. Reference # CX-39281 created." }
                ],
                chat: [
                    { from: "agent", text: "Hi Jordan, I've reviewed your Comcast request. I'm calling them now. Will update you shortly.", time: "11:32" },
                    { from: "user", text: "Thanks! Please make sure they know I don't want to be charged for next month.", time: "11:35" },
                    { from: "agent", text: "Noted. They have your authorization on file. I'll push for same-day written confirmation.", time: "11:36" }
                ]
            },
            {
                id: "REQ-2831",
                business: "PG&E",
                phone: "1-877-660-6789",
                accountNumber: "334-221-88765",
                category: "Billing / Charges",
                urgency: "Medium",
                description: "Received $487 bill for January with huge usage spike I can't explain. Already tried online chat and app. Need dispute filed and usage investigation.",
                status: "In Progress",
                submitted: "2026-06-22",
                lastUpdate: "2026-06-25T09:10:00",
                timeline: [
                    { time: "2026-06-22 16:40", text: "Request received. Agent assigned: Priya K." },
                    { time: "2026-06-23 08:55", text: "Submitted formal dispute via PG&E portal using your authorization. Requested Level 2 review and meter investigation." },
                    { time: "2026-06-24 14:20", text: "Received confirmation from PG&E. Case # BIL-774291 opened. They will send technician within 5 business days." }
                ],
                chat: [
                    { from: "agent", text: "Good morning Jordan. Your PG&E dispute has been filed successfully. They acknowledged receipt.", time: "Yesterday" },
                    { from: "user", text: "Any idea how long the investigation takes?", time: "Yesterday" }
                ]
            },
            {
                id: "REQ-2799",
                business: "Chase Bank",
                phone: "1-800-935-9935",
                accountNumber: "****4821",
                category: "Complaint / Escalation",
                urgency: "High",
                description: "Unauthorized transaction of $1,240 posted. Bank says I authorized it via app but I didn't. Need fraud claim escalated and temporary credit immediately.",
                status: "Resolved",
                submitted: "2026-06-18",
                lastUpdate: "2026-06-20T16:45:00",
                timeline: [
                    { time: "2026-06-18 11:02", text: "Request received. High priority fraud escalation assigned to agent Lena R." },
                    { time: "2026-06-18 11:40", text: "Called fraud department. Filed dispute and requested temporary credit while investigation proceeds." },
                    { time: "2026-06-19 09:15", text: "Temporary credit of $1,240 posted to your account. Full investigation opened (Case # FRD-118392)." },
                    { time: "2026-06-20 16:45", text: "Investigation complete. Fraud confirmed. Permanent credit issued. Letter sent to your address." }
                ],
                chat: [
                    { from: "agent", text: "Your Chase fraud claim has been fully resolved in your favor. $1,240 permanent credit posted.", time: "Jun 20" },
                    { from: "user", text: "Amazing work! Thank you so much.", time: "Jun 20" }
                ]
            }
        ];
        // Prototype fixture only; private requests are never persisted in browser storage.
    }
}

// Save requests to localStorage
function saveRequests() {
    if (!AuthModule.getUser()) {
        showToast('Sign in is required to save private requests.', 'error');
        return Promise.reject(new Error('Authentication required'));
    }
    const changed = currentRequestId ? requests.find(r => r.id === currentRequestId) : requests[0];
    return changed ? DataLayer.saveRequest(changed).catch(error => showToast(`Could not securely save: ${error.message}`, 'error')) : Promise.resolve();
}

// Show specific view
function showView(view) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    
    const target = document.getElementById('view-' + view);
    if (target) target.classList.add('active');

    document.querySelectorAll('.nav-item, .nav-mobile-item').forEach(el => {
        el.classList.remove('!text-indigo-600', 'font-semibold');
        if (el.dataset.view === view) {
            el.classList.add('!text-indigo-600', 'font-semibold');
        }
    });

    if (view === 'dashboard') {
        renderDashboardActiveRequests();
        updateMetrics();
    }
    if (view === 'my-requests') {
        renderRequestsList();
    }
    if (view === 'business-hub') {
        renderBusinessGrid();
    }
    if (view === 'templates') {
        TemplatesModule.refreshContext();
    }
    if (view === 'secure-portal') {
        PortalModule.render();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Update dashboard metrics
function updateMetrics() {
    const active = requests.filter(r => r.status !== 'Resolved').length;
    const resolved = requests.filter(r => r.status === 'Resolved').length;
    
    document.getElementById('metric-active').textContent = active;
    document.getElementById('metric-resolved').textContent = resolved;
}

// Render active requests on dashboard
function renderDashboardActiveRequests() {
    const container = document.getElementById('dashboard-active-requests');
    const active = requests.filter(r => r.status !== 'Resolved').slice(0, 3);
    
    if (active.length === 0) {
        container.innerHTML = `<div class="text-center py-4 text-sm text-slate-400">No active requests. <button onclick="showView('new-request')" class="text-indigo-600 font-medium">Create one →</button></div>`;
        return;
    }
    
    container.innerHTML = active.map(req => `
        <div onclick="openRequestModal('${req.id}')" class="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl cursor-pointer transition-colors">
            <div class="flex-1 min-w-0">
                <div class="font-semibold">${escapeHtml(req.business)}</div>
                <div class="text-xs text-slate-500 truncate">${escapeHtml(req.description.substring(0, 65))}...</div>
            </div>
            <div class="text-right ml-3">
                <div class="status-pill ${req.status === 'In Progress' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}">${escapeHtml(req.status)}</div>
                <div class="text-[10px] text-slate-400 mt-0.5">${escapeHtml(req.id)}</div>
            </div>
        </div>
    `).join('');
}

// Render full requests list
function renderRequestsList() {
    const container = document.getElementById('requests-list');
    
    if (requests.length === 0) {
        container.innerHTML = `<div class="text-center py-12 bg-white border border-dashed rounded-3xl">
            <i class="fa-solid fa-inbox text-4xl text-slate-300 mb-3"></i>
            <p class="text-slate-500">No requests yet.</p>
            <button onclick="showView('new-request')" class="mt-4 text-sm px-5 py-2 bg-indigo-600 text-white rounded-2xl">Submit your first request</button>
        </div>`;
        return;
    }
    
    container.innerHTML = requests.sort((a,b) => new Date(b.submitted) - new Date(a.submitted)).map(req => {
        const statusColor = req.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 
                           req.status === 'In Progress' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600';
        
        return `
        <div onclick="openRequestModal('${req.id}')" class="request-card bg-white border border-slate-200 rounded-3xl p-5 cursor-pointer hover:border-indigo-200">
            <div class="flex justify-between items-start">
                <div>
                    <div class="flex items-center gap-x-3">
                        <span class="font-semibold text-xl">${escapeHtml(req.business)}</span>
                        <span class="status-pill ${statusColor}">${escapeHtml(req.status)}</span>
                    </div>
                    <div class="text-xs text-slate-400 font-mono mt-0.5">${escapeHtml(req.id)} • Submitted ${escapeHtml(req.submitted)}</div>
                </div>
                <div class="text-right">
                    <div class="text-xs text-slate-500">${escapeHtml(req.urgency)}</div>
                </div>
            </div>
            
            <div class="mt-3 text-sm text-slate-600 line-clamp-2">${escapeHtml(req.description)}</div>
            
            <div class="mt-4 flex items-center justify-between text-xs">
                <div class="text-slate-400">Last update: ${new Date(req.lastUpdate).toLocaleDateString('en-US', {month:'short', day:'numeric'})}</div>
                <div class="flex items-center text-indigo-600 font-medium">View details <i class="fa-solid fa-chevron-right ml-1 text-xs"></i></div>
            </div>
        </div>`;
    }).join('');
}

// Render business grid
function renderBusinessGrid(filteredBusinesses = null) {
    const container = document.getElementById('business-grid');
    const list = filteredBusinesses || businesses;
    
    container.innerHTML = list.map(b => {
        const avgRating = calculateAverageRating(b.id);
        return `
        <div class="business-card bg-white border border-slate-200 rounded-3xl p-5 cursor-pointer hover:border-indigo-300" onclick="selectBusinessFromHub(${b.id})">
            <div class="flex justify-between items-start">
                <div>
                    <div class="font-semibold text-lg">${b.name}</div>
                    <div class="text-xs text-slate-500">${b.category}</div>
                </div>
                <div class="text-right">
                    <div class="text-emerald-600 text-xs font-bold">${b.successRate}</div>
                    <div class="text-[10px] text-slate-400">success</div>
                </div>
            </div>
            
            <div class="mt-4 flex items-center justify-between text-xs border-t border-b py-2">
                <div class="flex items-center gap-x-1">
                    <span class="text-amber-500">★</span>
                    <span class="font-medium">${avgRating.toFixed(1)}</span>
                    <span class="text-slate-400">(${getRatingCount(b.id)})</span>
                </div>
                <button onclick="event.stopImmediatePropagation(); openRatingModal(${b.id});" 
                        class="text-indigo-600 hover:text-indigo-700 text-xs font-semibold flex items-center gap-x-1 px-3 py-1 rounded-xl hover:bg-indigo-50">
                    <i class="fa-solid fa-star"></i> RATE
                </button>
            </div>
            
            <div class="mt-3 flex items-center justify-between text-xs">
                <div>
                    <span class="text-slate-400">Avg wait:</span> <span class="font-medium">${b.avgWait}</span>
                </div>
                <div class="text-indigo-600 text-xs font-semibold flex items-center gap-x-1" onclick="event.stopImmediatePropagation(); quickStartRequest('${b.name}')">
                    GET HELP <i class="fa-solid fa-arrow-right"></i>
                </div>
            </div>
            
            <div class="mt-3 pt-3 border-t text-xs">
                <div class="text-slate-500 mb-1">Top tip:</div>
                <div class="text-slate-600 line-clamp-2">${b.tips[0]}</div>
            </div>
        </div>`;
    }).join('');
}

function calculateAverageRating(businessId) {
    const ratings = businessRatings[businessId] || [];
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, r) => acc + (r.stars || 0), 0);
    return sum / ratings.length;
}

function getRatingCount(businessId) {
    return (businessRatings[businessId] || []).length;
}

function filterBusinesses() {
    const term = document.getElementById('business-search').value.toLowerCase().trim();
    if (!term) {
        renderBusinessGrid();
        return;
    }
    const filtered = businesses.filter(b => 
        b.name.toLowerCase().includes(term) || 
        b.category.toLowerCase().includes(term) ||
        b.tips.some(t => t.toLowerCase().includes(term))
    );
    renderBusinessGrid(filtered);
}

function quickStartRequest(businessName) {
    showView('new-request');
    
    setTimeout(() => {
        const businessInput = document.getElementById('business-name');
        if (businessInput) {
            businessInput.value = businessName;
            document.getElementById('issue-description').focus();
        }
    }, 180);
}

function selectBusinessFromHub(businessId) {
    const biz = businesses.find(b => b.id === businessId);
    if (!biz) return;
    
    showView('new-request');
    
    setTimeout(() => {
        document.getElementById('business-name').value = biz.name;
        document.getElementById('business-phone').value = biz.phone;
        showToast(`Pro tip for ${biz.name}: ${biz.tips[0]}`, 'info', 6500);
    }, 220);
}

function submitNewRequest(e) {
    e.preventDefault();
    if (!AuthModule.getUser()) {
        showToast('Sign in before submitting a private request.', 'error');
        return;
    }
    
    const business = document.getElementById('business-name').value.trim();
    const phone = document.getElementById('business-phone').value.trim();
    const account = document.getElementById('account-number').value.trim();
    const category = document.getElementById('issue-category').value;
    const urgency = document.getElementById('urgency').value;
    const description = document.getElementById('issue-description').value.trim();
    
    if (!business || !category || !description) {
        showToast("Please fill out all required fields.", "error");
        return;
    }
    
    const newReq = {
        id: "REQ-" + crypto.randomUUID(),
        business: business,
        phone: phone || "Not provided",
        accountNumber: account || "Not provided",
        category: category,
        urgency: urgency,
        description: description,
        status: "Received",
        submitted: new Date().toISOString().split('T')[0],
        lastUpdate: new Date().toISOString(),
        timeline: [
            { 
                time: new Date().toLocaleString('en-US', {month:'short', day:'numeric', hour:'numeric', minute:'2-digit'}), 
                text: "Request received and authorization recorded. Our team is reviewing it now." 
            }
        ],
        chat: [
            { from: "agent", text: "Thank you for submitting your request. An agent will be assigned within the next 15 minutes. We'll keep you updated here.", time: "Just now" }
        ]
    };
    
    requests.unshift(newReq);
    saveRequests();
    
    e.target.reset();
    
    showToast("Request submitted successfully! Agent will contact you shortly.", "success");
    
    setTimeout(() => {
        showView('my-requests');
        renderRequestsList();
    }, 1200);
}

function openRequestModal(requestId) {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;
    
    currentRequestId = requestId;
    
    document.getElementById('modal-business').textContent = req.business;
    document.getElementById('modal-req-id').textContent = req.id;
    const issue = document.getElementById('modal-issue');
    issue.replaceChildren();
    const category = document.createElement('strong');
    category.textContent = req.category;
    issue.append(category, document.createElement('br'), document.createTextNode(req.description));
    
    const statusEl = document.getElementById('modal-status-pill');
    statusEl.innerHTML = req.status;
    statusEl.className = `status-pill ${req.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`;
    
    renderTimeline(req);
    renderChat(req);
    
    document.getElementById('request-modal').classList.remove('hidden');
    document.getElementById('request-modal').classList.add('flex');
}

function renderTimeline(req) {
    const container = document.getElementById('modal-timeline');
    container.innerHTML = req.timeline.map((item, idx) => `
        <div class="timeline-item flex gap-x-3">
            <div class="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full ${idx === req.timeline.length - 1 ? 'bg-indigo-600' : 'bg-slate-300'} flex items-center justify-center">
                <i class="fa-solid fa-check text-white text-[10px]"></i>
            </div>
            <div class="flex-1 pb-1">
                <div class="text-xs text-slate-400">${escapeHtml(item.time)}</div>
                <div class="text-sm text-slate-700">${escapeHtml(item.text)}</div>
            </div>
        </div>
    `).join('');
}

function renderChat(req) {
    const container = document.getElementById('chat-window');
    container.innerHTML = req.chat.map(msg => {
        if (msg.from === 'user') {
            return `<div class="flex justify-end"><div class="chat-message chat-user">${escapeHtml(msg.text)}<div class="text-[9px] opacity-60 text-right mt-0.5">${escapeHtml(msg.time)}</div></div></div>`;
        } else {
            return `<div class="flex"><div class="chat-message chat-agent">${escapeHtml(msg.text)}<div class="text-[9px] opacity-60 mt-0.5">${escapeHtml(msg.time)}</div></div></div>`;
        }
    }).join('');
    container.scrollTop = container.scrollHeight;
}

function sendChatMessage() {
    if (!currentRequestId) return;
    
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;
    
    const reqIndex = requests.findIndex(r => r.id === currentRequestId);
    if (reqIndex === -1) return;
    
    const req = requests[reqIndex];
    
    req.chat.push({
        from: "user",
        text: text,
        time: "Just now"
    });
    
    saveRequests();
    renderChat(req);
    input.value = '';
    
    setTimeout(() => {
        if (!currentRequestId || requests[reqIndex].id !== currentRequestId) return;
        
        let replyText = "Thanks for the update. I'll make sure the team notes that.";
        
        if (text.toLowerCase().includes('cancel') || text.toLowerCase().includes('refund')) {
            replyText = "Understood. I'll emphasize that in my next contact with them and push for written confirmation.";
        } else if (text.toLowerCase().includes('how long') || text.toLowerCase().includes('when')) {
            replyText = "Most cases like this resolve in 4-24 hours. I'll follow up with them again this afternoon if no movement.";
        } else if (text.toLowerCase().includes('thank')) {
            replyText = "You're very welcome. Happy to help get this sorted for you.";
        }
        
        req.chat.push({
            from: "agent",
            text: replyText,
            time: "Just now"
        });
        
        saveRequests();
        renderChat(req);
        
        if (Math.random() > 0.6) {
            req.timeline.push({
                time: new Date().toLocaleString('en-US', {month:'short', day:'numeric', hour:'numeric', minute:'2-digit'}),
                text: "Received your message and updated case notes. Agent will follow up with business today."
            });
            renderTimeline(req);
        }
    }, 1450);
}

function simulateAgentUpdate() {
    if (!currentRequestId) return;
    
    const reqIndex = requests.findIndex(r => r.id === currentRequestId);
    if (reqIndex === -1) return;
    
    const req = requests[reqIndex];
    
    const updates = [
        "Called the main support number again. Navigated past the first three IVR menus using known shortcuts.",
        "Reached a supervisor. Presented your full case history and authorization. They are escalating internally.",
        "Sent secure follow-up email to the business's executive escalation team with your details and desired outcome.",
        "Received callback from the business. They confirmed your request is now in their priority queue.",
        "Obtained verbal commitment and reference number. Awaiting written confirmation via email."
    ];
    
    const randomUpdate = updates[Math.floor(Math.random() * updates.length)];
    
    req.timeline.push({
        time: new Date().toLocaleString('en-US', {month:'short', day:'numeric', hour:'numeric', minute:'2-digit'}),
        text: randomUpdate
    });
    
    req.lastUpdate = new Date().toISOString();
    
    if (req.status === "Received" && Math.random() > 0.5) {
        req.status = "In Progress";
    }
    
    saveRequests();
    renderTimeline(req);
    
    const statusEl = document.getElementById('modal-status-pill');
    if (statusEl) {
        statusEl.innerHTML = req.status;
        statusEl.className = `status-pill ${req.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`;
    }
    
    showToast("Agent update simulated successfully.", "success", 1800);
    
    setTimeout(() => {
        if (document.getElementById('view-dashboard').classList.contains('active')) {
            renderDashboardActiveRequests();
        }
        if (document.getElementById('view-my-requests').classList.contains('active')) {
            renderRequestsList();
        }
    }, 800);
}

function markRequestResolved() {
    if (!currentRequestId) return;
    
    const reqIndex = requests.findIndex(r => r.id === currentRequestId);
    if (reqIndex === -1) return;
    
    const req = requests[reqIndex];
    req.status = "Resolved";
    req.lastUpdate = new Date().toISOString();
    
    req.timeline.push({
        time: new Date().toLocaleString('en-US', {month:'short', day:'numeric', hour:'numeric', minute:'2-digit'}),
        text: "Issue fully resolved. Confirmation and documentation sent to your email. Request closed."
    });
    
    saveRequests();
    
    const statusEl = document.getElementById('modal-status-pill');
    statusEl.innerHTML = "Resolved";
    statusEl.className = `status-pill bg-emerald-100 text-emerald-700`;
    
    renderTimeline(req);
    
    showToast("Request marked as resolved. Great outcome!", "success");
    
    setTimeout(() => {
        closeRequestModal();
        if (document.getElementById('view-my-requests').classList.contains('active')) {
            renderRequestsList();
        }
        if (document.getElementById('view-dashboard').classList.contains('active')) {
            renderDashboardActiveRequests();
            updateMetrics();
        }
    }, 1600);
}

function closeRequestModal() {
    const modal = document.getElementById('request-modal');
    modal.classList.remove('flex');
    modal.classList.add('hidden');
    currentRequestId = null;
}

function showToast(message, type = "success", duration = 4200) {
    const container = document.getElementById('toast-container');
    
    const colors = {
        success: "bg-emerald-600 text-white",
        error: "bg-red-600 text-white",
        info: "bg-slate-800 text-white"
    };
    
    const icon = {
        success: "fa-check-circle",
        error: "fa-exclamation-circle",
        info: "fa-info-circle"
    };
    
    const toast = document.createElement('div');
    toast.className = `toast flex items-center gap-x-3 px-5 py-3.5 rounded-2xl shadow-xl ${colors[type]} max-w-xs`;
    toast.innerHTML = `
        <i class="fa-solid ${icon[type]} text-lg"></i>
        <div class="text-sm font-medium pr-2">${message}</div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transition = 'all 0.25s ease';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 200);
    }, duration);
}

function showPricingModal() {
    const modalHTML = `
        <div onclick="this.remove()" class="fixed inset-0 bg-black/70 z-[150] flex items-center justify-center p-4">
            <div onclick="event.stopImmediatePropagation()" class="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
                <div class="px-6 pt-6 pb-4">
                    <div class="flex justify-between items-center mb-4">
                        <div>
                            <span class="font-display text-2xl font-semibold">iCant Pro</span>
                        </div>
                        <button onclick="event.target.closest('.fixed').remove()" class="text-3xl leading-none text-slate-300 hover:text-slate-400">&times;</button>
                    </div>
                    
                    <div class="text-sm text-slate-600">Get priority handling, dedicated agents, and unlimited requests.</div>
                    
                    <div class="mt-6">
                        <div class="flex items-baseline">
                            <span class="text-5xl font-semibold">$29</span>
                            <span class="text-slate-500 ml-1">/month</span>
                        </div>
                        <div class="text-emerald-600 text-xs font-semibold mt-1">or $9.99 per individual request (no subscription)</div>
                    </div>
                    
                    <ul class="mt-6 space-y-2.5 text-sm">
                        <li class="flex gap-x-2.5"><i class="fa-solid fa-check text-emerald-500 mt-1"></i> <span>Unlimited requests</span></li>
                        <li class="flex gap-x-2.5"><i class="fa-solid fa-check text-emerald-500 mt-1"></i> <span>Priority agent assignment (&lt;10 min)</span></li>
                        <li class="flex gap-x-2.5"><i class="fa-solid fa-check text-emerald-500 mt-1"></i> <span>Three-way calling option (listen in)</span></li>
                        <li class="flex gap-x-2.5"><i class="fa-solid fa-check text-emerald-500 mt-1"></i> <span>Full call recordings + transcripts</span></li>
                        <li class="flex gap-x-2.5"><i class="fa-solid fa-check text-emerald-500 mt-1"></i> <span>Integration with Hire and Seek verified agents</span></li>
                        <li class="flex gap-x-2.5"><i class="fa-solid fa-check text-emerald-500 mt-1"></i> <span>Monthly savings report</span></li>
                    </ul>
                </div>
                
                <div class="bg-slate-50 px-6 py-5 flex gap-x-3">
                    <button onclick="event.target.closest('.fixed').remove(); showToast('Thanks! In production this would open Stripe checkout.', 'info')" 
                            class="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-2xl">Start 14-day free trial</button>
                    <button onclick="event.target.closest('.fixed').remove()" class="flex-1 py-3 border text-sm font-medium rounded-2xl">Maybe later</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function addKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        if (e.metaKey && e.key === "/") {
            e.preventDefault();
            const search = document.getElementById('business-search');
            if (search && document.getElementById('view-business-hub').classList.contains('active')) {
                search.focus();
            } else {
                showView('business-hub');
                setTimeout(() => document.getElementById('business-search').focus(), 300);
            }
        }
        
        if (e.key === "?" && document.activeElement.tagName === "BODY") {
            e.preventDefault();
            showView('how-it-works');
        }
    });
    
    console.log('%c[iCant] Pro tip: Press Cmd/Ctrl + / in Business Hub to focus search. Press ? for How it Works.', 'color:#64748b');
}

let currentRatingBusinessId = null;
let selectedRatingStars = 0;

function openRatingModal(businessId) {
    const biz = businesses.find(b => b.id === businessId);
    if (!biz) return;
    
    currentRatingBusinessId = businessId;
    document.getElementById('rating-business-name').textContent = biz.name;
    
    selectedRatingStars = 0;
    document.getElementById('selected-stars').value = 0;
    document.getElementById('short-comment').value = '';
    document.getElementById('long-comment').value = '';
    
    renderStarRating();
    
    const modal = document.getElementById('rating-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeRatingModal() {
    const modal = document.getElementById('rating-modal');
    modal.classList.remove('flex');
    modal.classList.add('hidden');
    currentRatingBusinessId = null;
}

function renderStarRating() {
    const container = document.getElementById('star-rating');
    let html = '';
    for (let i = 1; i <= 5; i++) {
        const filled = i <= selectedRatingStars ? 'text-amber-400' : 'text-slate-300';
        html += `<span onclick="setRatingStars(${i})" class="cursor-pointer hover:scale-110 transition-transform ${filled}">★</span>`;
    }
    container.innerHTML = html;
}

window.setRatingStars = function(stars) {
    selectedRatingStars = stars;
    document.getElementById('selected-stars').value = stars;
    renderStarRating();
};

function submitRating() {
    if (!currentRatingBusinessId || selectedRatingStars === 0) {
        showToast("Please select a star rating.", "error");
        return;
    }
    
    const shortComment = document.getElementById('short-comment').value.trim();
    const longComment = document.getElementById('long-comment').value.trim();
    const biz = businesses.find(b => b.id === currentRatingBusinessId);

    DataLayer.submitRating(
        currentRatingBusinessId,
        biz?.name || '',
        selectedRatingStars,
        shortComment || 'No comment',
        longComment
    ).then((result) => {
        if (!businessRatings[currentRatingBusinessId]) {
            businessRatings[currentRatingBusinessId] = [];
        }
        businessRatings[currentRatingBusinessId].push({
            stars: selectedRatingStars,
            short: shortComment || 'No comment',
            long: longComment || '',
            date: new Date().toISOString()
        });

        closeRatingModal();
        const src = result.source === 'supabase' ? 'Synced to Supabase.' : 'Saved locally.';
        showToast(`Thank you! Your rating helps other customers. ${src}`, 'success');

        if (document.getElementById('view-business-hub').classList.contains('active')) {
            renderBusinessGrid();
        }
    });
}

function updateBackendStatusBadge() {
    const badge = document.getElementById('backend-status-badge');
    if (!badge) return;
    const status = DataLayer.getConnectionStatus();
    if (status === 'connected') {
        badge.className = 'text-xs px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 font-medium self-start';
        badge.innerHTML = '<i class="fa-solid fa-circle text-[8px] mr-1 text-emerald-500"></i> Supabase connected';
    } else {
        badge.className = 'text-xs px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 font-medium self-start cursor-pointer hover:bg-slate-200';
        badge.textContent = 'Secure backend not configured';
        badge.onclick = null;
    }
}

function openSupabaseSettings() {
    showToast('Supabase must be configured at deployment time; it cannot be changed by end users.', 'info');
    return;
    const modalHTML = `
        <div id="supabase-settings-modal" onclick="if (event.target.id === 'supabase-settings-modal') this.remove()" class="fixed inset-0 bg-black/60 z-[150] flex items-center justify-center p-4">
            <div onclick="event.stopImmediatePropagation()" class="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
                <div class="px-6 py-5 border-b bg-slate-50 flex justify-between items-center">
                    <div>
                        <div class="font-semibold text-lg">Supabase Connection</div>
                        <div class="text-xs text-slate-500">Sync templates &amp; ratings to your project</div>
                    </div>
                    <button onclick="document.getElementById('supabase-settings-modal').remove()" class="text-2xl text-slate-300">&times;</button>
                </div>
                <div class="p-6 space-y-4">
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1">PROJECT URL</label>
                        <input id="supabase-url-input" type="url" value="${window.ICANT_CONFIG.supabaseUrl || ''}" placeholder="https://xxxx.supabase.co"
                               class="w-full border border-slate-300 rounded-2xl px-4 py-3 text-sm">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1">ANON KEY</label>
                        <input id="supabase-key-input" type="password" value="${window.ICANT_CONFIG.supabaseAnonKey || ''}" placeholder="eyJ..."
                               class="w-full border border-slate-300 rounded-2xl px-4 py-3 text-sm">
                    </div>
                    <p class="text-[10px] text-slate-400">Run <code class="bg-slate-100 px-1 rounded">supabase/schema.sql</code> in your SQL editor first. Leave blank for offline demo mode.</p>
                </div>
                <div class="px-6 py-4 border-t bg-slate-50 flex gap-3">
                    <button onclick="document.getElementById('supabase-settings-modal').remove()" class="flex-1 py-3 border rounded-2xl text-sm">Cancel</button>
                    <button onclick="saveSupabaseSettings()" class="flex-1 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-semibold">Save &amp; Sync</button>
                </div>
            </div>
        </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

async function saveSupabaseSettings() {
    const url = document.getElementById('supabase-url-input').value;
    const key = document.getElementById('supabase-key-input').value;
    DataLayer.saveSupabaseConfig(url, key);
    document.getElementById('supabase-settings-modal')?.remove();
    updateBackendStatusBadge();
    await TemplatesModule.load();
    businessRatings = await DataLayer.fetchAllRatingsGrouped();
    showToast(url ? 'Supabase connected. Templates synced.' : 'Switched to local-only mode.', 'success');
}

function openMobileMenu() {
    document.getElementById('mobile-menu-sheet')?.classList.remove('hidden');
}

function closeMobileMenu() {
    document.getElementById('mobile-menu-sheet')?.classList.add('hidden');
}

function bindTemplateContextInputs() {
    ['business-name', 'account-number', 'issue-category', 'urgency', 'business-phone'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', () => TemplatesModule.refreshContext());
        if (el) el.addEventListener('change', () => TemplatesModule.refreshContext());
    });
}

async function initializeApp() {
    initializeTailwind();
    await DataLayer.init();
    const signedInUser = await AuthModule.init();
    if (signedInUser) requests = await DataLayer.fetchRequests();

    businessRatings = await DataLayer.fetchAllRatingsGrouped();
    await TemplatesModule.load();
    updateBackendStatusBadge();
    bindTemplateContextInputs();
    
    showView('dashboard');
    updateMetrics();
    renderDashboardActiveRequests();
    
    setTimeout(() => {
        renderRequestsList();
        renderBusinessGrid();
        PortalModule.render();
    }, 800);
    
    addKeyboardShortcuts();
    initPWA();
    
    setTimeout(() => {
        if (!localStorage.getItem('icant_welcomed')) {
            showToast("Welcome to iCant Solutions. Private requests require your signed-in account.", "info", 5200);
            localStorage.setItem('icant_welcomed', 'true');
        }
    }, 2200);
    
    const logoArea = document.querySelector('nav .flex.items-center.gap-x-3');
    if (logoArea) {
        logoArea.style.cursor = 'pointer';
        logoArea.onclick = () => showView('dashboard');
    }
    
    window.iCant = { showView, openRequestModal, simulateAgentUpdate, businesses, get requests() { return requests; } };
    
    console.log('%c[iCant Solutions] App initialized. PWA + Supabase-ready.', 'color:#64748b; font-size:9px');
}

window.onload = initializeApp;
