(async () => {
  const delay = ms => new Promise(r => setTimeout(r, ms));

  const log = (msg) => console.log(`[LI Cleaner] ${msg}`);

  async function deleteVisible() {
    // LinkedIn renders notifications as list items with a "..." button
    const cards = document.querySelectorAll(
      '.nt-card-list__item, [data-urn], .notification-card'
    );

    for (const card of cards) {
      if (card.dataset.cleaned) continue;

      // Find the three-dots / overflow menu button inside this card
      const dotsBtn = card.querySelector(
        'button[aria-label*="more"], button[aria-label*="More"], ' +
        'button.artdeco-dropdown__trigger, button[data-control-name="overlay.dismiss_toast"]'
      ) || [...card.querySelectorAll('button')].find(b =>
        b.getAttribute('aria-label')?.toLowerCase().includes('more') ||
        b.querySelector('.notification-card__dismiss, .artdeco-dropdown__trigger')
      );

      if (!dotsBtn) continue;

      dotsBtn.click();
      await delay(400);

      // Find "Delete" or "Remove" in any open dropdown/popover
      const deleteBtn = [...document.querySelectorAll(
        '.artdeco-dropdown__content li button, ' +
        '.contextual-menu__item button, ' +
        '[role="menu"] [role="menuitem"], ' +
        '[role="listbox"] [role="option"]'
      )].find(el =>
        /delete|remove/i.test(el.textContent)
      );

      if (deleteBtn) {
        deleteBtn.click();
        log('Deleted a notification.');
        await delay(500);
      } else {
        // Close the menu if no delete found, move on
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await delay(200);
      }

      card.dataset.cleaned = 'true';
    }
  }

  async function scrollAndDelete() {
    let prevHeight = 0;
    let noNewContentCount = 0;

    while (true) {
      await deleteVisible();

      window.scrollBy(0, 600);
      await delay(1200); // wait for LinkedIn to lazy-load more

      const newHeight = document.body.scrollHeight;

      if (newHeight === prevHeight) {
        noNewContentCount++;
        log(`No new content (${noNewContentCount}/4)...`);
        if (noNewContentCount >= 4) {
          // One final pass at the bottom
          await deleteVisible();
          log('✅ Done! All visible notifications processed.');
          break;
        }
      } else {
        noNewContentCount = 0;
        prevHeight = newHeight;
      }
    }
  }

  log('Starting LinkedIn notification cleaner...');
  await scrollAndDelete();
})();
