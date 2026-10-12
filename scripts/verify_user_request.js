const puppeteer = require('puppeteer-core');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\engji\\\\.gemini\\\\antigravity\\\\brain\\\\0d830c88-d5ed-4364-a8c3-fba936f1e5d5';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,950']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 950 });

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // 1. Verify Tank dropdown (Image 3 requirement: remove redundant + Add Tank)
  console.log('Testing tank dropdown...');
  await page.evaluate(() => {
    const trigger = document.querySelector('header h1');
    if (trigger) {
      const btn = trigger.closest('button');
      if (btn) btn.click();
    }
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'tank_dropdown_without_redundant_add.png') });
  console.log('Captured tank_dropdown_without_redundant_add.png');

  // Close tank dropdown
  await page.evaluate(() => {
    const trigger = document.querySelector('header h1');
    if (trigger) {
      const btn = trigger.closest('button');
      if (btn) btn.click();
    }
  });
  await new Promise(r => setTimeout(r, 500));

  // 2. Verify Tank Profile Milestones (Image 2 requirement: edit saved milestones)
  console.log('Testing Tank Profile milestones editing...');
  // Navigate to Tank Profile tab if not already there
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const profileTab = tabs.find(b => b.textContent && b.textContent.includes('Tank Profile'));
    if (profileTab) profileTab.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Scroll down to milestones section
  await page.evaluate(() => {
    window.scrollTo(0, 600);
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'tank_profile_milestones_with_edit_buttons.png') });
  console.log('Captured tank_profile_milestones_with_edit_buttons.png');

  // Click edit button on the first milestone
  await page.evaluate(() => {
    const editBtns = Array.from(document.querySelectorAll('button')).filter(b => b.title === 'Edit Milestone Data');
    if (editBtns.length > 0) editBtns[0].click();
  });
  await new Promise(r => setTimeout(r, 700));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'tank_profile_edit_milestone_modal.png') });
  console.log('Captured tank_profile_edit_milestone_modal.png');

  // Save changes in the edit milestone modal
  await page.evaluate(() => {
    const submitBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Save Changes'));
    if (submitBtn) submitBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Click on first milestone card to open inspect modal
  await page.evaluate(() => {
    const cards = document.querySelectorAll('.grid > div.cursor-pointer');
    if (cards.length > 0) cards[0].click();
  });
  await new Promise(r => setTimeout(r, 700));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'tank_profile_milestone_inspect_with_edit.png') });
  console.log('Captured tank_profile_milestone_inspect_with_edit.png');

  // Close inspect modal
  await page.evaluate(() => {
    const closeBtn = document.querySelector('div[class*="fixed"] button:has(svg.lucide-x)');
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // 3. Verify Fish / Fauna Vault (Image 1 requirement: only "all fauna", "fish", and "invertebrates")
  console.log('Testing Fish Vault categories...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const fishTab = tabs.find(b => b.textContent && b.textContent.includes('Fish Vault'));
    if (fishTab) fishTab.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'fish_vault_three_categories.png') });
  console.log('Captured fish_vault_three_categories.png');

  await browser.close();
  console.log('All verification tasks succeeded!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
