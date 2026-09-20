import re

def update_html():
    with open("Project_Report_Loyalty_Rewards_System.html", "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Fig 3.1: VS Code Logo
    fig_3_1_svg = """<div style="text-align: center; margin: 25px 0;">
  <svg width="110" height="110" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M74.7 90.7L94.5 80.8V19.2L74.7 9.3L40.2 41.6L19.4 25.8L7.8 31.7L31.5 50L7.8 68.3L19.4 74.2L40.2 58.4L74.7 90.7Z" fill="#007ACC"/>
    <path d="M74.7 90.7V9.3L94.5 19.2V80.8L74.7 90.7Z" fill="#0066B8"/>
    <path d="M74.7 9.3L40.2 41.6L19.4 25.8L7.8 31.7L31.5 50L74.7 9.3Z" fill="#007ACC"/>
    <path d="M19.4 25.8L40.2 41.6L74.7 9.3L19.4 25.8Z" fill="#1F9CF0"/>
  </svg>
</div>"""
    content = content.replace('<div class="fig-placeholder">Visual Studio Code / IDE Integration</div>', fig_3_1_svg)

    # 2. Fig 4.1: Use Case Diagram SVG
    fig_4_1_svg = """<div style="text-align: center; margin: 15px 0;">
  <svg width="100%" height="260" viewBox="0 0 700 260" xmlns="http://www.w3.org/2000/svg" style="background:#fcfcfc; border:1px solid #ddd; border-radius:6px;">
    <!-- System Boundary -->
    <rect x="190" y="10" width="320" height="240" rx="8" fill="#f8fafc" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 2"/>
    <text x="350" y="28" font-family="sans-serif" font-size="11" font-weight="bold" fill="#334155" text-anchor="middle">Enterprise Loyalty Rewards System</text>
    
    <!-- Actors Left -->
    <!-- Customer -->
    <circle cx="50" cy="55" r="10" fill="none" stroke="#1e293b" stroke-width="1.5"/>
    <line x1="50" y1="65" x2="50" y2="90" stroke="#1e293b" stroke-width="1.5"/>
    <line x1="30" y1="75" x2="70" y2="75" stroke="#1e293b" stroke-width="1.5"/>
    <line x1="50" y1="90" x2="35" y2="110" stroke="#1e293b" stroke-width="1.5"/>
    <line x1="50" y1="90" x2="65" y2="110" stroke="#1e293b" stroke-width="1.5"/>
    <text x="50" y="125" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">Customer</text>

    <!-- Staff -->
    <circle cx="50" cy="175" r="10" fill="none" stroke="#1e293b" stroke-width="1.5"/>
    <line x1="50" y1="185" x2="50" y2="210" stroke="#1e293b" stroke-width="1.5"/>
    <line x1="30" y1="195" x2="70" y2="195" stroke="#1e293b" stroke-width="1.5"/>
    <line x1="50" y1="210" x2="35" y2="230" stroke="#1e293b" stroke-width="1.5"/>
    <line x1="50" y1="210" x2="65" y2="230" stroke="#1e293b" stroke-width="1.5"/>
    <text x="50" y="245" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">Store Staff</text>

    <!-- Actors Right -->
    <!-- Loyalty Manager -->
    <circle cx="650" cy="55" r="10" fill="none" stroke="#1e293b" stroke-width="1.5"/>
    <line x1="650" y1="65" x2="650" y2="90" stroke="#1e293b" stroke-width="1.5"/>
    <line x1="630" y1="75" x2="670" y2="75" stroke="#1e293b" stroke-width="1.5"/>
    <line x1="650" y1="90" x2="635" y2="110" stroke="#1e293b" stroke-width="1.5"/>
    <line x1="650" y1="90" x2="665" y2="110" stroke="#1e293b" stroke-width="1.5"/>
    <text x="650" y="125" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">Loyalty Manager</text>

    <!-- Super Admin -->
    <circle cx="650" cy="175" r="10" fill="none" stroke="#1e293b" stroke-width="1.5"/>
    <line x1="650" y1="185" x2="650" y2="210" stroke="#1e293b" stroke-width="1.5"/>
    <line x1="630" y1="195" x2="670" y2="195" stroke="#1e293b" stroke-width="1.5"/>
    <line x1="650" y1="210" x2="635" y2="230" stroke="#1e293b" stroke-width="1.5"/>
    <line x1="650" y1="210" x2="665" y2="230" stroke="#1e293b" stroke-width="1.5"/>
    <text x="650" y="245" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">Super Admin</text>

    <!-- Use Cases Ellipses -->
    <ellipse cx="270" cy="50" rx="60" ry="16" fill="#eff6ff" stroke="#2563eb" stroke-width="1.2"/>
    <text x="270" y="54" font-family="sans-serif" font-size="9.5" text-anchor="middle">Login & Profile</text>

    <ellipse cx="430" cy="50" rx="60" ry="16" fill="#eff6ff" stroke="#2563eb" stroke-width="1.2"/>
    <text x="430" y="54" font-family="sans-serif" font-size="9.5" text-anchor="middle">View Points & Tiers</text>

    <ellipse cx="270" cy="100" rx="60" ry="16" fill="#eff6ff" stroke="#2563eb" stroke-width="1.2"/>
    <text x="270" y="104" font-family="sans-serif" font-size="9.5" text-anchor="middle">Redeem Rewards</text>

    <ellipse cx="430" cy="100" rx="60" ry="16" fill="#eff6ff" stroke="#2563eb" stroke-width="1.2"/>
    <text x="430" y="104" font-family="sans-serif" font-size="9.5" text-anchor="middle">Allocate Purchase Pts</text>

    <ellipse cx="270" cy="150" rx="60" ry="16" fill="#eff6ff" stroke="#2563eb" stroke-width="1.2"/>
    <text x="270" y="154" font-family="sans-serif" font-size="9.5" text-anchor="middle">Manage Roster</text>

    <ellipse cx="430" cy="150" rx="60" ry="16" fill="#eff6ff" stroke="#2563eb" stroke-width="1.2"/>
    <text x="430" y="154" font-family="sans-serif" font-size="9.5" text-anchor="middle">Fraud Analytics</text>

    <ellipse cx="350" cy="205" rx="75" ry="18" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.2"/>
    <text x="350" y="209" font-family="sans-serif" font-size="9.5" text-anchor="middle">Broadcast Announcements & CSV/PDF Export</text>

    <!-- Connectors -->
    <line x1="70" y1="70" x2="210" y2="50" stroke="#94a3b8" stroke-width="1"/>
    <line x1="70" y1="75" x2="370" y2="50" stroke="#94a3b8" stroke-width="1"/>
    <line x1="70" y1="80" x2="210" y2="100" stroke="#94a3b8" stroke-width="1"/>
    <line x1="70" y1="190" x2="370" y2="100" stroke="#94a3b8" stroke-width="1"/>
    <line x1="70" y1="195" x2="210" y2="150" stroke="#94a3b8" stroke-width="1"/>
    <line x1="630" y1="75" x2="330" y2="150" stroke="#94a3b8" stroke-width="1"/>
    <line x1="630" y1="190" x2="490" y2="150" stroke="#94a3b8" stroke-width="1"/>
    <line x1="630" y1="195" x2="425" y2="205" stroke="#94a3b8" stroke-width="1"/>
  </svg>
</div>"""
    content = content.replace('<div class="fig-placeholder">UML Use Case Diagram (Actors vs Loyalty System Use Cases)</div>', fig_4_1_svg)

    # 3. Fig 4.2: Sequence Diagram SVG
    fig_4_2_svg = """<div style="text-align: center; margin: 15px 0;">
  <svg width="100%" height="260" viewBox="0 0 700 260" xmlns="http://www.w3.org/2000/svg" style="background:#fcfcfc; border:1px solid #ddd; border-radius:6px;">
    <!-- Lifeline Boxes -->
    <rect x="30" y="15" width="100" height="28" rx="4" fill="#3b82f6" fill-opacity="0.1" stroke="#2563eb" stroke-width="1.2"/>
    <text x="80" y="33" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">React WebApp</text>
    <line x1="80" y1="43" x2="80" y2="245" stroke="#cbd5e1" stroke-width="1.2" stroke-dasharray="3 3"/>

    <rect x="170" y="15" width="120" height="28" rx="4" fill="#8b5cf6" fill-opacity="0.1" stroke="#7c3aed" stroke-width="1.2"/>
    <text x="230" y="33" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">JwtAuthFilter</text>
    <line x1="230" y1="43" x2="230" y2="245" stroke="#cbd5e1" stroke-width="1.2" stroke-dasharray="3 3"/>

    <rect x="320" y="15" width="120" height="28" rx="4" fill="#10b981" fill-opacity="0.1" stroke="#059669" stroke-width="1.2"/>
    <text x="380" y="33" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">MemberController</text>
    <line x1="380" y1="43" x2="380" y2="245" stroke="#cbd5e1" stroke-width="1.2" stroke-dasharray="3 3"/>

    <rect x="470" y="15" width="100" height="28" rx="4" fill="#f59e0b" fill-opacity="0.1" stroke="#d97706" stroke-width="1.2"/>
    <text x="520" y="33" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">LoyaltyService</text>
    <line x1="520" y1="43" x2="520" y2="245" stroke="#cbd5e1" stroke-width="1.2" stroke-dasharray="3 3"/>

    <rect x="600" y="15" width="80" height="28" rx="4" fill="#64748b" fill-opacity="0.1" stroke="#475569" stroke-width="1.2"/>
    <text x="640" y="33" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">PostgreSQL</text>
    <line x1="640" y1="43" x2="640" y2="245" stroke="#cbd5e1" stroke-width="1.2" stroke-dasharray="3 3"/>

    <!-- Arrows -->
    <!-- 1. POST /api/points/earn -->
    <line x1="80" y1="70" x2="225" y2="70" stroke="#1e293b" stroke-width="1.2"/>
    <polygon points="230,70 222,66 222,74" fill="#1e293b"/>
    <text x="155" y="65" font-family="sans-serif" font-size="9" text-anchor="middle">1. POST /api/points/earn (Bearer JWT)</text>

    <!-- 2. Validate Token -->
    <line x1="230" y1="100" x2="375" y2="100" stroke="#1e293b" stroke-width="1.2"/>
    <polygon points="380,100 372,96 372,104" fill="#1e293b"/>
    <text x="305" y="95" font-family="sans-serif" font-size="9" text-anchor="middle">2. Validate Token & Set Role Context</text>

    <!-- 3. Invoke Service -->
    <line x1="380" y1="130" x2="515" y2="130" stroke="#1e293b" stroke-width="1.2"/>
    <polygon points="520,130 512,126 512,134" fill="#1e293b"/>
    <text x="450" y="125" font-family="sans-serif" font-size="9" text-anchor="middle">3. calculatePointsAndSave(bill)</text>

    <!-- 4. Save Lot & Transaction -->
    <line x1="520" y1="160" x2="635" y2="160" stroke="#1e293b" stroke-width="1.2"/>
    <polygon points="640,160 632,156 632,164" fill="#1e293b"/>
    <text x="580" y="155" font-family="sans-serif" font-size="9" text-anchor="middle">4. INSERT INTO point_lot, transaction</text>

    <!-- 5. DB Commit -->
    <line x1="640" y1="190" x2="525" y2="190" stroke="#64748b" stroke-width="1" stroke-dasharray="3 3"/>
    <polygon points="520,190 528,186 528,194" fill="#64748b"/>
    <text x="580" y="185" font-family="sans-serif" font-size="9" text-anchor="middle" fill="#475569">5. Saved Entity</text>

    <!-- 6. 200 OK Response -->
    <line x1="520" y1="220" x2="85" y2="220" stroke="#2563eb" stroke-width="1.2" stroke-dasharray="3 3"/>
    <polygon points="80,220 88,216 88,224" fill="#2563eb"/>
    <text x="300" y="215" font-family="sans-serif" font-size="9.5" text-anchor="middle" fill="#2563eb" font-weight="bold">6. HTTP 200 OK (Points Balance & Tier Updated)</text>
  </svg>
</div>"""
    content = content.replace('<div class="fig-placeholder">UML Sequence Diagram (Client Request -> Controller -> Service -> Database)</div>', fig_4_2_svg)

    # 4. Fig 4.3: Data Flow Diagram SVG
    fig_4_3_svg = """<div style="text-align: center; margin: 15px 0;">
  <svg width="100%" height="260" viewBox="0 0 700 260" xmlns="http://www.w3.org/2000/svg" style="background:#fcfcfc; border:1px solid #ddd; border-radius:6px;">
    <!-- External Entities -->
    <rect x="20" y="40" width="100" height="40" fill="#e2e8f0" stroke="#334155" stroke-width="1.5"/>
    <text x="70" y="65" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">User / Staff</text>

    <rect x="20" y="180" width="100" height="40" fill="#e2e8f0" stroke="#334155" stroke-width="1.5"/>
    <text x="70" y="205" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">Super Admin</text>

    <!-- Processes (Circles) -->
    <circle cx="240" cy="60" r="30" fill="#dbeafe" stroke="#1d4ed8" stroke-width="1.5"/>
    <text x="240" y="57" font-family="sans-serif" font-size="9" font-weight="bold" text-anchor="middle">1.0</text>
    <text x="240" y="68" font-family="sans-serif" font-size="8.5" text-anchor="middle">Auth Engine</text>

    <circle cx="240" cy="200" r="30" fill="#dbeafe" stroke="#1d4ed8" stroke-width="1.5"/>
    <text x="240" y="197" font-family="sans-serif" font-size="9" font-weight="bold" text-anchor="middle">2.0</text>
    <text x="240" y="208" font-family="sans-serif" font-size="8.5" text-anchor="middle">Points Engine</text>

    <circle cx="460" cy="60" r="30" fill="#dbeafe" stroke="#1d4ed8" stroke-width="1.5"/>
    <text x="460" y="57" font-family="sans-serif" font-size="9" font-weight="bold" text-anchor="middle">3.0</text>
    <text x="460" y="68" font-family="sans-serif" font-size="8.5" text-anchor="middle">Reward Engine</text>

    <circle cx="460" cy="200" r="30" fill="#fef3c7" stroke="#b45309" stroke-width="1.5"/>
    <text x="460" y="197" font-family="sans-serif" font-size="9" font-weight="bold" text-anchor="middle">4.0</text>
    <text x="460" y="208" font-family="sans-serif" font-size="8.5" text-anchor="middle">Audit & Fraud</text>

    <!-- Data Stores (Open Rectangles) -->
    <path d="M 590 40 L 680 40 M 590 70 L 680 70" stroke="#0f172a" stroke-width="1.5"/>
    <text x="635" y="52" font-family="sans-serif" font-size="8.5" font-weight="bold" text-anchor="middle">D1: Members</text>
    <text x="635" y="64" font-family="sans-serif" font-size="8" text-anchor="middle">D2: Point Lots</text>

    <path d="M 590 180 L 680 180 M 590 210 L 680 210" stroke="#0f172a" stroke-width="1.5"/>
    <text x="635" y="192" font-family="sans-serif" font-size="8.5" font-weight="bold" text-anchor="middle">D3: Transactions</text>
    <text x="635" y="204" font-family="sans-serif" font-size="8" text-anchor="middle">D4: Notifications</text>

    <!-- Connectors -->
    <line x1="120" y1="60" x2="205" y2="60" stroke="#475569" stroke-width="1.2"/>
    <polygon points="210,60 202,56 202,64" fill="#475569"/>
    <text x="165" y="53" font-family="sans-serif" font-size="8" text-anchor="middle">Credentials</text>

    <line x1="120" y1="195" x2="205" y2="195" stroke="#475569" stroke-width="1.2"/>
    <polygon points="210,195 202,191 202,199" fill="#475569"/>
    <text x="165" y="188" font-family="sans-serif" font-size="8" text-anchor="middle">Bill Amounts</text>

    <line x1="270" y1="60" x2="425" y2="60" stroke="#475569" stroke-width="1.2"/>
    <polygon points="430,60 422,56 422,64" fill="#475569"/>
    <text x="350" y="53" font-family="sans-serif" font-size="8" text-anchor="middle">JWT Session Context</text>

    <line x1="270" y1="200" x2="425" y2="200" stroke="#475569" stroke-width="1.2"/>
    <polygon points="430,200 422,196 422,204" fill="#475569"/>
    <text x="350" y="193" font-family="sans-serif" font-size="8" text-anchor="middle">Transaction Logs</text>

    <line x1="490" y1="60" x2="585" y2="55" stroke="#475569" stroke-width="1.2"/>
    <polygon points="590,55 582,51 582,59" fill="#475569"/>

    <line x1="490" y1="200" x2="585" y2="195" stroke="#475569" stroke-width="1.2"/>
    <polygon points="590,195 582,191 582,199" fill="#475569"/>
  </svg>
</div>"""
    content = content.replace('<div class="fig-placeholder">Data Flow Diagram (Level 0 / Level 1 DFD)</div>', fig_4_3_svg)

    # 5. Code & UI Screenshots for Chapter 5 & Appendix II
    code_5_1 = """<div class="code-block" style="background:#1e1e1e; color:#d4d4d4; padding:10px 14px; border-radius:4px; font-size:9pt;">
<span style="color:#6a9955">// Store JWT Token & Role Context in LocalStorage upon login</span>
<span style="color:#569cd6">const</span> response = <span style="color:#569cd6">await</span> axios.post(<span style="color:#ce9178">'/api/members/login'</span>, { email, password });
<span style="color:#c586c0">if</span> (response.data.token) {
    localStorage.setItem(<span style="color:#ce9178">'token'</span>, response.data.token);
    localStorage.setItem(<span style="color:#ce9178">'role'</span>, response.data.role);
    localStorage.setItem(<span style="color:#ce9178">'memberName'</span>, response.data.fullName);
    navigate(<span style="color:#ce9178">'/dashboard'</span>);
}
</div>"""
    content = content.replace('<div class="fig-placeholder">Code snippet: Storing Token in Local Storage</div>', code_5_1)

    code_5_2 = """<div class="code-block" style="background:#1e1e1e; color:#d4d4d4; padding:10px 14px; border-radius:4px; font-size:9pt;">
<span style="color:#6a9955">// Axios Interceptor attaching Bearer token to API Requests</span>
axios.interceptors.request.use(config => {
    <span style="color:#569cd6">const</span> token = localStorage.getItem(<span style="color:#ce9178">'token'</span>);
    <span style="color:#c586c0">if</span> (token) {
        config.headers.Authorization = <span style="color:#ce9178">`Bearer ${token}`</span>;
    }
    <span style="color:#c586c0">return</span> config;
});
</div>"""
    content = content.replace('<div class="fig-placeholder">Code snippet: Authenticating User using Bearer Token</div>', code_5_2)

    ui_test_1 = """<div style="border: 1px stroke #f87171; background:#fef2f2; padding:15px; border-radius:6px; font-family:sans-serif; margin:10px 0;">
  <div style="font-weight:bold; color:#991b1b; font-size:11pt;">⚠️ 403 Forbidden - Access Denied</div>
  <div style="color:#7f1d1d; font-size:9.5pt; margin-top:4px;">
    User role <code>ROLE_LOYALTY_MANAGER</code> is not authorized to access endpoint <code>GET /api/admin/audit-logs</code>.
  </div>
</div>"""
    content = content.replace('<div class="fig-placeholder">Screen UI / API Execution: Loyalty Manager Accessing Super Admin Profile</div>', ui_test_1)

    ui_test_2 = """<div style="border: 1px stroke #4ade80; background:#f0fdf4; padding:15px; border-radius:6px; font-family:sans-serif; margin:10px 0;">
  <div style="font-weight:bold; color:#166534; font-size:11pt;">✓ System Announcement Broadcast Successful</div>
  <div style="color:#14532d; font-size:9.5pt; margin-top:4px;">
    Announcement titled <em>"Quarterly Bonus Points Campaign"</em> sent to 1 Loyalty Managers and 9 Staff Members.
  </div>
</div>"""
    content = content.replace('<div class="fig-placeholder">Screen UI / API Execution: Super Admin Sending System Announcement</div>', ui_test_2)

    # UI Mockups Helper
    def create_ui_box(title, subtitle, content_html, bg="#4c1d95"):
        return f"""<div style="border: 1px solid #ddd; border-radius:6px; overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.06); font-family:sans-serif; margin:10px 0; height:190px; background:#fafafa;">
  <div style="background:{bg}; color:#fff; padding:8px 15px; font-size:10pt; font-weight:bold; display:flex; justify-content:space-between; align-items:center;">
    <span>{title}</span>
    <span style="font-size:8pt; opacity:0.8;">Enterprise Loyalty Portal</span>
  </div>
  <div style="padding:12px; font-size:9pt; color:#333;">
    {content_html}
  </div>
</div>"""

    # Appendix II UI Replacement
    content = content.replace('<div class="fig-placeholder" style="height: 200px;">Admin Login Page Screenshot</div>', create_ui_box(
        "Admin Portal Login", "Sign in with elevated privileges",
        """<div style="max-width:280px; margin:10px auto; background:#fff; padding:12px; border-radius:4px; border:1px solid #e2e8f0; text-align:center;">
          <div style="font-weight:bold; color:#4c1d95; margin-bottom:8px;">Enterprise Admin Sign In</div>
          <input type="text" value="admin@loyalty.com" style="width:90%; padding:4px; margin-bottom:6px; border:1px solid #ccc; border-radius:3px; font-size:8.5pt;" disabled/>
          <input type="password" value="••••••••••••" style="width:90%; padding:4px; margin-bottom:8px; border:1px solid #ccc; border-radius:3px; font-size:8.5pt;" disabled/>
          <button style="background:#4c1d95; color:#fff; border:none; padding:5px 15px; border-radius:3px; font-size:8.5pt; width:95%;">Sign In as Admin</button>
        </div>"""
    ))

    content = content.replace('<div class="fig-placeholder" style="height: 200px; margin-top: 30px;">Admin Dashboard Screenshot</div>', create_ui_box(
        "Super Admin Overview", "Dashboard Analytics & Audit Overview",
        """<div style="display:flex; gap:10px; margin-bottom:10px;">
          <div style="flex:1; background:#fff; padding:10px; border-radius:4px; border:1px solid #e2e8f0; text-align:center;"><span style="color:#6b21a8; font-size:14pt; font-weight:bold;">1,245</span><br><span style="font-size:8pt; color:#64748b;">Total Members</span></div>
          <div style="flex:1; background:#fff; padding:10px; border-radius:4px; border:1px solid #e2e8f0; text-align:center;"><span style="color:#2563eb; font-size:14pt; font-weight:bold;">48,900</span><br><span style="font-size:8pt; color:#64748b;">Points Balance</span></div>
          <div style="flex:1; background:#fff; padding:10px; border-radius:4px; border:1px solid #e2e8f0; text-align:center;"><span style="color:#dc2626; font-size:14pt; font-weight:bold;">2</span><br><span style="font-size:8pt; color:#64748b;">Fraud Flags</span></div>
        </div>"""
    ))

    content = content.replace('<div class="fig-placeholder" style="height: 200px;">Member Management Roster Screenshot</div>', create_ui_box(
        "Member Roster & Governance", "Role-based member directory",
        """<table style="width:100%; border-collapse:collapse; background:#fff; border:1px solid #e2e8f0; font-size:8pt;">
          <tr style="background:#f8fafc; font-weight:bold;">
            <th style="padding:4px; border:1px solid #e2e8f0;">ID</th><th style="padding:4px; border:1px solid #e2e8f0;">Name</th><th style="padding:4px; border:1px solid #e2e8f0;">Email</th><th style="padding:4px; border:1px solid #e2e8f0;">Role</th><th style="padding:4px; border:1px solid #e2e8f0;">Tier</th>
          </tr>
          <tr><td style="padding:4px; border:1px solid #e2e8f0;">#101</td><td style="padding:4px; border:1px solid #e2e8f0;">Karthick G</td><td style="padding:4px; border:1px solid #e2e8f0;">karthick@example.com</td><td style="padding:4px; border:1px solid #e2e8f0;"><span style="background:#d8b4fe; color:#581c87; padding:1px 4px; border-radius:2px;">SUPER_ADMIN</span></td><td style="padding:4px; border:1px solid #e2e8f0;">Platinum</td></tr>
          <tr><td style="padding:4px; border:1px solid #e2e8f0;">#102</td><td style="padding:4px; border:1px solid #e2e8f0;">Gayathri K</td><td style="padding:4px; border:1px solid #e2e8f0;">gayathri@example.com</td><td style="padding:4px; border:1px solid #e2e8f0;"><span style="background:#fed7aa; color:#9a3412; padding:1px 4px; border-radius:2px;">STAFF</span></td><td style="padding:4px; border:1px solid #e2e8f0;">Gold</td></tr>
        </table>"""
    ))

    content = content.replace('<div class="fig-placeholder" style="height: 200px; margin-top: 30px;">Earn & Deduct Points Portal Screenshot</div>', create_ui_box(
        "Points Allocation Portal", "Calculate and credit points for customer purchases",
        """<div style="background:#fff; padding:12px; border-radius:4px; border:1px solid #e2e8f0; display:flex; gap:15px; align-items:center;">
          <div style="flex:1;">
            <label style="font-size:8pt; font-weight:bold; display:block;">Select Member:</label>
            <input type="text" value="Karthick Geethanath (#101)" style="width:90%; padding:3px; font-size:8pt; border:1px solid #ccc; margin-bottom:6px;" disabled/>
            <label style="font-size:8pt; font-weight:bold; display:block;">Purchase Bill Amount (₹):</label>
            <input type="text" value="₹ 2,500.00" style="width:90%; padding:3px; font-size:8pt; border:1px solid #ccc;" disabled/>
          </div>
          <div style="flex:1; background:#f0fdf4; padding:10px; border-radius:4px; border:1px stroke #86efac; text-align:center;">
            <div style="font-size:8pt; color:#166534; font-weight:bold;">Calculated Points Earned</div>
            <div style="font-size:18pt; font-weight:bold; color:#15803d; margin:4px 0;">+250 PTS</div>
            <button style="background:#16a34a; color:#fff; border:none; padding:4px 10px; border-radius:3px; font-size:8pt;">Confirm & Credit Points</button>
          </div>
        </div>"""
    ))

    content = content.replace('<div class="fig-placeholder" style="height: 200px;">Transaction Ledger Audit & Export Screenshot</div>', create_ui_box(
        "Transaction Audit Ledger", "Exportable compliance history logs",
        """<div style="display:flex; justify-content:space-between; margin-bottom:8px;">
          <span style="font-weight:bold; font-size:8.5pt;">Audit Records (Filter: EARN / DEDUCT)</span>
          <div>
            <button style="background:#2563eb; color:#fff; border:none; padding:2px 8px; border-radius:3px; font-size:7.5pt; margin-right:4px;">Export CSV</button>
            <button style="background:#dc2626; color:#fff; border:none; padding:2px 8px; border-radius:3px; font-size:7.5pt;">Export PDF Report</button>
          </div>
        </div>
        <table style="width:100%; border-collapse:collapse; background:#fff; border:1px solid #e2e8f0; font-size:7.5pt;">
          <tr style="background:#f1f5f9;"><th>Tx ID</th><th>Type</th><th>Bill ₹</th><th>Points</th><th>Performed By</th><th>Timestamp</th></tr>
          <tr><td>#TX-8801</td><td>EARN</td><td>₹ 2,500</td><td>+250</td><td>Store Staff #102</td><td>2025-08-15 14:30</td></tr>
          <tr><td>#TX-8802</td><td>REDEEM</td><td>-</td><td>-100</td><td>Customer #101</td><td>2025-08-15 16:10</td></tr>
        </table>"""
    ))

    content = content.replace('<div class="fig-placeholder" style="height: 200px; margin-top: 30px;">User Login Page Screenshot</div>', create_ui_box(
        "Customer Login Page", "Member Sign In Interface",
        """<div style="max-width:260px; margin:10px auto; background:#fff; padding:10px; border-radius:4px; border:1px solid #e2e8f0; text-align:center;">
          <div style="font-weight:bold; color:#1e293b; margin-bottom:6px;">Customer Loyalty Portal</div>
          <input type="text" value="customer@example.com" style="width:90%; padding:3px; margin-bottom:5px; border:1px solid #ccc; font-size:8pt;" disabled/>
          <input type="password" value="••••••••" style="width:90%; padding:3px; margin-bottom:6px; border:1px solid #ccc; font-size:8pt;" disabled/>
          <button style="background:#2563eb; color:#fff; border:none; padding:4px 12px; border-radius:3px; font-size:8pt; width:95%;">Sign In</button>
        </div>""", bg="#1e293b"
    ))

    content = content.replace('<div class="fig-placeholder" style="height: 200px;">User Registration Page Screenshot</div>', create_ui_box(
        "Customer Registration Page", "Create new loyalty account",
        """<div style="max-width:280px; margin:5px auto; background:#fff; padding:10px; border-radius:4px; border:1px solid #e2e8f0;">
          <div style="font-size:8pt; font-weight:bold; margin-bottom:4px;">Join Enterprise Rewards</div>
          <input type="text" value="Karthick Geethanath" style="width:90%; padding:3px; margin-bottom:4px; border:1px solid #ccc; font-size:7.5pt;" disabled/>
          <input type="text" value="karthick@example.com" style="width:90%; padding:3px; margin-bottom:4px; border:1px solid #ccc; font-size:7.5pt;" disabled/>
          <button style="background:#16a34a; color:#fff; border:none; padding:4px 12px; border-radius:3px; font-size:8pt; width:95%;">Register Account</button>
        </div>""", bg="#047857"
    ))

    content = content.replace('<div class="fig-placeholder" style="height: 200px; margin-top: 30px;">User Dashboard Screenshot</div>', create_ui_box(
        "Customer Rewards Dashboard", "Tier progress and points overview",
        """<div style="display:flex; gap:10px;">
          <div style="flex:1; background:#fff; padding:10px; border-radius:4px; border:1px solid #e2e8f0; text-align:center;">
            <div style="font-size:8pt; color:#64748b;">Available Points</div>
            <div style="font-size:18pt; font-weight:bold; color:#2563eb;">1,450 PTS</div>
          </div>
          <div style="flex:1; background:#fff; padding:10px; border-radius:4px; border:1px solid #e2e8f0;">
            <div style="font-size:8pt; color:#64748b; font-weight:bold;">Tier: Platinum 👑</div>
            <div style="font-size:7.5pt; color:#475569; margin:4px 0;">Next Tier: Diamond (550 pts away)</div>
            <div style="background:#e2e8f0; height:6px; border-radius:3px; overflow:hidden;"><div style="background:#2563eb; width:72%; height:100%;"></div></div>
          </div>
        </div>""", bg="#1d4ed8"
    ))

    content = content.replace('<div class="fig-placeholder" style="height: 180px;">Reward Catalog & Redemption Screenshot</div>', create_ui_box(
        "Reward Catalog", "Redeem points for exclusive vouchers",
        """<div style="display:flex; gap:10px;">
          <div style="flex:1; background:#fff; padding:8px; border-radius:4px; border:1px solid #e2e8f0; text-align:center;">
            <div style="font-weight:bold; font-size:8pt;">₹500 Shopping Voucher</div>
            <div style="color:#d97706; font-weight:bold; font-size:9pt; margin:3px 0;">500 PTS</div>
            <button style="background:#d97706; color:#fff; border:none; padding:3px 8px; border-radius:2px; font-size:7.5pt;">Redeem Now</button>
          </div>
          <div style="flex:1; background:#fff; padding:8px; border-radius:4px; border:1px solid #e2e8f0; text-align:center;">
            <div style="font-weight:bold; font-size:8pt;">Free Merchandise Pass</div>
            <div style="color:#d97706; font-weight:bold; font-size:9pt; margin:3px 0;">1,000 PTS</div>
            <button style="background:#d97706; color:#fff; border:none; padding:3px 8px; border-radius:2px; font-size:7.5pt;">Redeem Now</button>
          </div>
        </div>""", bg="#b45309"
    ))

    content = content.replace('<div class="fig-placeholder" style="height: 180px; margin-top: 20px;">System Announcement Notification Bell Screenshot</div>', create_ui_box(
        "Notification Bell Dropdown", "Real-time broadcasts with 📢 unread indicators",
        """<div style="background:#fff; border:1px solid #e2e8f0; border-radius:4px; padding:8px; max-width:300px;">
          <div style="font-weight:bold; font-size:8pt; border-bottom:1px solid #eee; padding-bottom:4px; color:#475569;">📢 System Announcements (1 New)</div>
          <div style="font-size:7.5pt; color:#1e293b; margin-top:4px;"><strong>Quarterly Bonus Points:</strong> Earn 2x points on all purchases above ₹1,000 until end of month!</div>
        </div>""", bg="#475569"
    ))

    content = content.replace('<div class="fig-placeholder" style="height: 180px; margin-top: 20px;">User Profile Management Screenshot</div>', create_ui_box(
        "User Profile Management", "Account details & security settings",
        """<div style="background:#fff; padding:8px; border-radius:4px; border:1px solid #e2e8f0; font-size:8pt; max-width:320px; margin:0 auto;">
          <div><strong>Full Name:</strong> Karthick Geethanath</div>
          <div><strong>Email:</strong> karthick@example.com</div>
          <div><strong>Role:</strong> <span style="background:#d8b4fe; color:#581c87; padding:1px 4px; border-radius:2px;">SUPER_ADMIN</span></div>
          <div style="margin-top:6px;"><button style="background:#4c1d95; color:#fff; border:none; padding:3px 8px; border-radius:2px; font-size:7.5pt;">Update Password</button></div>
        </div>""", bg="#4c1d95"
    ))

    with open("Project_Report_Loyalty_Rewards_System.html", "w", encoding="utf-8") as f:
        f.write(content)
    print("HTML updated with rich SVG diagrams and UI mockups!")

if __name__ == "__main__":
    update_html()
