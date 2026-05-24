(async () => {
  const delay = ms => new Promise(r => setTimeout(r, ms));
  const log = (msg) => console.log(`[LI Cleaner] ${msg}`);

  async function deleteAllVisible() {
    let deleted = 0;
    const btns = [...document.querySelectorAll('.nt-card-settings-dropdown-item__button')]
      .filter(b => b.textContent.trim() === 'Delete notification' && !b.dataset.clicked);

    for (const btn of btns) {
      btn.dataset.clicked = 'true';
      btn.click();
      deleted++;
      await delay(300);
    }
    return deleted;
  }

  async function scrollToBottom() {
    log('Scrolling to load all notifications...');
    let lastPos = -1;
    let sameCount = 0;

    while (true) {
      window.scrollBy(0, 800);
      await delay(1200);
      const cur = window.scrollY;
      if (cur === lastPos) {
        sameCount++;
        if (sameCount >= 3) break;
      } else {
        sameCount = 0;
        lastPos = cur;
      }
    }
    log('Reached bottom.');
  }

  async function cleanupLoop() {
    log('Deleting...');
    let total = 0;
    let emptyPasses = 0;

    while (emptyPasses < 3) {
      const deleted = await deleteAllVisible();
      total += deleted;
      if (deleted === 0) {
        emptyPasses++;
        await delay(600);
      } else {
        emptyPasses = 0;
        log(`Deleted ${total} so far...`);
        window.scrollBy(0, 400);
        await delay(800);
      }
    }
    log(`Done! Total deleted: ${total}`);
  }

  await scrollToBottom();
  await cleanupLoop();
})();
