import { chromium } from 'playwright';
import { setTimeout as sleep } from 'timers/promises';

const BASE = 'http://localhost:3000';
const API = 'http://localhost:8001/api/v1';

async function main() {
  const browser = await chromium.launch({ headless: true, executablePath: '/home/kaiser/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome', args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const issues = [];
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('requestfailed', req => consoleErrors.push(`requestfailed ${req.url()} ${req.failure()?.errorText}`));

  function logIssue(title, severity, location, steps, expected, actual, impact) {
    issues.push({ title, severity, location, steps, expected, actual, impact });
    console.log(`ISSUE [${severity}] ${title} at ${location}: ${actual}`);
  }

  console.log("=== QA START ===");
  // 1. Landing page unauthenticated
  console.log("\n[1] Landing page");
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await sleep(1000);
  let hasAuthCall = false;
  page.on('request', req => { if (req.url().includes('/api/v1/auth/me') || req.url().includes('/api/v1/dashboard')) hasAuthCall = true; });
  const ctas = await page.$$eval('a', els => els.map(e => ({href:e.getAttribute('href'), text:e.textContent?.trim().slice(0,50)})));
  console.log("CTAs", ctas.slice(0,10));
  const heroExists = await page.locator('text=Detect.').count();
  console.log("hero count", heroExists);
  if (heroExists === 0) logIssue("Landing hero missing", "High", "/", "Open /", "Hero Detect. Understand. Fix.", "Not found", "Marketing broken");

  // Check static: should not have called auth
  await sleep(500);
  // Note hasAuthCall will be captured for subsequent navigations
  console.log("consoleErrors so far", consoleErrors.slice(0,5));

  // 2. Register flow
  console.log("\n[2] Register flow");
  await page.goto(BASE + '/register', { waitUntil: 'networkidle' });
  await sleep(800);
  // Test empty submit
  const registerBtn = page.getByRole('button', { name: /continue|send code|verify|create account/i }).first();
  console.log("register btn found", await registerBtn.count());
  // Fill invalid email and try
  const emailInput = page.getByLabel(/email/i).first();
  if (await emailInput.count() > 0) {
    await emailInput.fill('invalid-email');
    await page.getByRole('button', { name: /Send verification code/i }).click();
    await sleep(800);
    const err = await page.locator('text=valid email').count();
    console.log("invalid email error shown?", err);
    if (err===0) logIssue("Invalid email not validated on register step 1", "Medium", "/register", "Enter invalid-email, click continue", "Show validation error", "No error or generic", "User confusion");
  }
  // Now do valid flow with unique email
  const testEmail = `qa_ui_${Date.now()}@example.com`;
  console.log("testEmail", testEmail);
  await emailInput.fill(testEmail);
  await page.getByRole('button', { name: /Send verification code/i }).click();
  await sleep(1500);
  // Should go to OTP step
  let otpInput = page.getByPlaceholder(/code|otp/i).first();
  if (await otpInput.count()===0) otpInput = page.locator('input').nth(1);
  console.log("otp input count", await otpInput.count());
  // Try wrong OTP first (6 boxes)
  const wrongOtp = '111111';
  try {
    for (let i = 0; i < 6; i++) {
      const digit = page.getByLabel(`Digit ${i+1}`);
      if (await digit.count()>0) await digit.fill(wrongOtp[i]);
    }
    await page.getByRole('button', { name: /Verify email/i }).click();
    await sleep(1000);
    const err2 = await page.locator('text=Incorrect').count();
    const errAlt = await page.locator('text=invalid').count();
    console.log("wrong otp error Incorrect", err2, "invalid", errAlt, "content", (await page.content()).slice(0,800));
    // Clear wrong OTP for next try
    for (let i = 0; i < 6; i++) {
      const digit = page.getByLabel(`Digit ${i+1}`);
      if (await digit.count()>0) await digit.fill('');
    }
  } catch(e){ console.log("wrong otp fill error", e.message.slice(0,300)); }

  // Now correct OTP 000000
  await sleep(500);
  try {
    for (let i = 0; i < 6; i++) {
      const digit = page.getByLabel(`Digit ${i+1}`);
      if (await digit.count()>0) await digit.fill('0');
    }
    await sleep(300);
    let verifyBtn = page.getByRole('button', { name: /Verify email/i }).first();
    if (await verifyBtn.count()===0) verifyBtn = page.getByRole('button', { name: /Verify/i }).first();
    console.log("verify btn correct", await verifyBtn.count(), await verifyBtn.textContent().then(t=>t?.slice(0,30) || 'none'));
    await verifyBtn.click();
    await sleep(1500);
    console.log("after verify URL", page.url());
    console.log("after verify content snippet", (await page.content()).slice(0,1200));
  } catch(e){ console.log("correct otp error", e.message.slice(0,500)); }

  // After verify, should be on password step
  await sleep(1000);
  const pwdInputs = page.locator('input[type="password"]');
  console.log("pwd inputs", await pwdInputs.count());
  if (await pwdInputs.count() >= 2) {
    // Test weak password
    await pwdInputs.nth(0).fill('123');
    await pwdInputs.nth(1).fill('123');
    const createBtn = page.getByRole('button', { name: /Create account/i }).first();
    console.log("create btn", await createBtn.count(), await createBtn.textContent().then(t=>t?.slice(0,30) || 'none'));
    await createBtn.click();
    await sleep(1000);
    const weakErr = await page.locator('text=at least 8').count();
    console.log("weak pwd error", weakErr);
    if (weakErr===0) logIssue("Weak password not rejected on complete step", "Medium", "/register", "Enter 123 / 123, click create", "Show validation", "No error", "Weak accounts created");

    // Correct password
    await pwdInputs.nth(0).fill('StrongPass123!');
    await pwdInputs.nth(1).fill('StrongPass123!');
    await createBtn.click();
    await sleep(2000);
    console.log("after complete URL", page.url());
    // Should redirect to onboarding or dashboard
    const urlAfter = page.url();
    console.log("url after complete", urlAfter);
    if (!urlAfter.includes('/onboarding') && !urlAfter.includes('/dashboard')) {
      logIssue("Registration complete did not redirect to onboarding/dashboard", "High", "/register", "Complete valid registration", "Redirect to /onboarding", `Stayed at ${urlAfter}`, "User stuck");
    }
  } else {
    logIssue("Password step not reached after OTP", "Critical", "/register", "Complete OTP with 000000", "Show password fields", `Found ${await pwdInputs.count()} pwd inputs, URL ${page.url()}`, "Cannot complete signup");
    console.log("page content", (await page.content()).slice(0,2000));
  }

  // 3. Onboarding - create org and project
  console.log("\n[3] Onboarding");
  if (page.url().includes('/onboarding')) {
    await sleep(1000);
    // Org creation
    const orgInput = page.getByPlaceholder(/Acme/i).first();
    const orgCount = await orgInput.count();
    console.log("org input count", orgCount, "label fallback", await page.getByLabel(/Organization name/i).count());
    const orgField = await page.getByLabel(/Organization name/i).count() >0 ? page.getByLabel(/Organization name/i).first() : orgInput;
    if (await orgField.count()>0) {
      await orgField.fill(`QA Org ${Date.now()}`);
      const orgBtn = page.getByRole('button', { name: /Create organization/i }).first();
      console.log("org btn", await orgBtn.count());
      await orgBtn.click();
      await sleep(1500);
      console.log("after org URL", page.url());
      console.log("after org content snippet", (await page.content()).slice(0,1200));
    }
    // Project creation
    await sleep(800);
    const projInput = page.getByLabel(/Project name/i).first();
    console.log("proj input", await projInput.count());
    if (await projInput.count()>0) {
      await projInput.fill('qa-e2e-proj');
      const projBtn = page.getByRole('button', { name: /Create project/i }).first();
      console.log("proj btn", await projBtn.count());
      await projBtn.click();
      await sleep(2000);
      console.log("after project URL", page.url());
      console.log("after project content", (await page.content()).slice(0,1500));
      // Check API key shown once
      const apiKeyBlock = await page.locator('code, pre').count();
      console.log("api key blocks", apiKeyBlock);
      const keyText = await page.content();
      if (keyText.includes('api_key') || keyText.includes('X-API-Key') || keyText.includes('curl')) {
        console.log("api key snippet found");
        // Check continue button
        const contBtn = page.getByRole('button', { name: /I saved my key/i }).first();
        console.log("continue btn", await contBtn.count());
        if (await contBtn.count()>0) {
          await contBtn.click();
          await sleep(1000);
          console.log("after continue", page.url(), (await page.content()).slice(0,800));
          // Click Continue to dashboard
          const dashLink = page.getByRole('link', { name: /Continue to dashboard/i }).first();
          if (await dashLink.count()>0) {
            await dashLink.click();
            await sleep(1500);
            console.log("after dash link", page.url());
          }
        }
      } else {
        logIssue("API key not shown after project creation", "High", "/onboarding", "Create project", "Show API key once with curl snippet", "No key/snippet visible", "User cannot integrate");
      }
      // Try leaving and returning - key should not reappear
      await page.goto(BASE + '/settings', { waitUntil: 'networkidle' });
      await sleep(800);
      const stillKey = (await page.content()).includes('X-API-Key:');
      if (stillKey) logIssue("API key shown again after leaving onboarding (should be prefix only)", "Medium", "/settings", "Leave onboarding, go to settings", "Only prefix shown", "Raw key still visible", "Key leak");
    }
  } else {
    console.log("Not on onboarding, current", page.url());
    // Try to go to onboarding manually
    await page.goto(BASE + '/onboarding', { waitUntil: 'networkidle' });
    await sleep(800);
    console.log("manual onboarding content", (await page.content()).slice(0,1200));
  }

  // 4. Dashboard
  console.log("\n[4] Dashboard");
  await page.goto(BASE + '/dashboard', { waitUntil: 'networkidle' });
  await sleep(1000);
  console.log("dashboard consoleErrors", consoleErrors.slice(0,10));
  const dashboardText = await page.content();
  console.log("dashboard has overview", dashboardText.includes('Overview') || dashboardText.includes('open_incidents'));
  // Check project switcher
  const projSelect = page.locator('select').first();
  console.log("project select count", await projSelect.count());
  if (await projSelect.count()>0) {
    console.log("project options", await projSelect.locator('option').count());
  }
  // Check for error banners
  if (dashboardText.includes('Couldn')) logIssue("Dashboard shows Couldn't load projects", "Medium", "/dashboard", "Load dashboard", "Projects loaded", "Error banner", "User cannot switch");

  // 5. Incidents
  console.log("\n[5] Incidents");
  await page.goto(BASE + '/incidents', { waitUntil: 'networkidle' });
  await sleep(1000);
  let incidentsContent = await page.content();
  console.log("incidents snippet", incidentsContent.slice(0,1500));
  // Check filters
  const filterBtns = await page.getByRole('button').all();
  console.log("filter btns", filterBtns.length);
  // Try clicking incident if exists
  const incidentLinks = page.locator('a[href*="/incidents/"]');
  const incCount = await incidentLinks.count();
  console.log("incident links", incCount);
  if (incCount>1) {
    // click first incident (skip list header)
    await incidentLinks.nth(1).click();
    await sleep(1500);
    console.log("incident detail URL", page.url());
    const detailContent = await page.content();
    console.log("detail has timeline?", detailContent.includes('timeline') || detailContent.includes('Timeline'));
    console.log("detail has stacktrace?", detailContent.includes('stacktrace') || detailContent.includes('at '));
    // Try comment
    const commentBox = page.getByPlaceholder(/comment/i).first();
    if (await commentBox.count()>0) {
      await commentBox.fill('qa comment via UI');
      const postBtn = page.getByRole('button', { name: /comment|post/i }).first();
      await postBtn.click();
      await sleep(1000);
      const afterComment = await page.content();
      if (!afterComment.includes('qa comment')) logIssue("Comment not appearing after post", "Medium", "/incidents/[id]", "Post comment", "Comment appears instantly", "Not visible", "Collaboration broken");
    }
    // Try status change
    const statusBtn = page.getByRole('button', { name: /resolve|investigating|status/i }).first();
    console.log("status btn", await statusBtn.count());
  } else {
    console.log("No incidents found, checking empty state");
    if (!incidentsContent.includes('No incidents') && !incidentsContent.includes('empty') ) {
      // maybe empty state is there
      console.log("empty state check");
    }
  }

  // 6. Settings - unified nav
  console.log("\n[6] Settings");
  for (const path of ['/settings', '/settings/team', '/settings/alerts', '/settings/integrations', '/settings/preferences']) {
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    await sleep(800);
    const content = await page.content();
    console.log(`settings ${path} loaded`, content.includes('settings') || content.includes('Settings'));
    // Check nav pills / select
    const navCount = await page.locator('nav').count();
    console.log(`nav count for ${path}`, navCount);
    // Check for console errors after each
    if (consoleErrors.length>0) console.log("consoleErrors after", path, consoleErrors.slice(-3));
  }
  // Test mobile select for settings nav
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto(BASE + '/settings', { waitUntil: 'networkidle' });
  await sleep(800);
  const selectVisible = await page.locator('#settings-nav-select').count();
  console.log("mobile select visible", selectVisible);
  if (selectVisible===0) logIssue("Mobile settings nav select not visible at 375px", "Medium", "/settings", "Resize to 375px", "Show select dropdown", "Not visible, pills crowded", "Mobile UX broken");
  // Check pills hidden on mobile
  const pillsVisible = await page.locator('nav >> text=Overview').count();
  console.log("pills visible mobile", pillsVisible);
  // Back to desktop
  await page.setViewportSize({ width: 1280, height: 800 });

  // 7. Logs and Services
  console.log("\n[7] Logs/Services/Docs");
  for (const path of ['/logs', '/services', '/docs', '/ai-assistant']) {
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    await sleep(800);
    console.log(`${path} content`, (await page.content()).slice(0,600));
  }

  // 8. Auth edge: logout, try accessing protected, refresh
  console.log("\n[8] Auth edge");
  // Find logout button
  const logoutBtn = page.getByRole('button', { name: /log out/i }).first();
  if (await logoutBtn.count()>0) {
    console.log("found logout");
    // Don't actually logout yet, test refresh first
    await page.reload();
    await sleep(1000);
    console.log("after reload still auth?", page.url(), (await page.content()).includes('Overview') || (await page.content()).includes('Sign in'));
  }

  // 9. Test invalid URLs
  console.log("\n[9] Invalid URLs");
  await page.goto(BASE + '/incidents/invalid-uuid', { waitUntil: 'networkidle' });
  await sleep(800);
  console.log("invalid incident content", (await page.content()).slice(0,800));
  await page.goto(BASE + '/settings/invalid', { waitUntil: 'networkidle' });
  await sleep(800);
  console.log("invalid settings", (await page.content()).slice(0,800));

  // 10. Check console errors final
  console.log("\n=== CONSOLE ERRORS ===");
  console.log(consoleErrors.join("\n").slice(0,3000));

  console.log("\n=== ISSUES ===");
  console.log(JSON.stringify(issues, null, 2));

  await browser.close();
  console.log("QA DONE");
}

main().catch(e=>{console.error(e); process.exit(1)});
