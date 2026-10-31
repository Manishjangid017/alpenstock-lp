(() => {
  const headingWord = document.querySelector(".hero-layout-contants-heading span");
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!headingWord || motionPreference.matches) {
    return;
  }

  const words = ["Learn", "Grow", "Thrive"];
  let wordIndex = 0;

  window.setInterval(() => {
    if (motionPreference.matches) {
      return;
    }

    headingWord.classList.add("is-changing");

    window.setTimeout(() => {
      wordIndex = (wordIndex + 1) % words.length;
      headingWord.textContent = words[wordIndex];
      headingWord.classList.remove("is-changing");
    }, 220);
  }, 3000);
})();

(() => {
  const slider = document.querySelector(".acampus-designed-layout-slider");

  if (!slider) {
    return;
  }

  const cards = Array.from(slider.querySelectorAll(".acampus-designed-layout-slide-card"));
  const mobileView = window.matchMedia("(max-width: 767.98px)");

  const activateCard = (activeCard) => {
    cards.forEach((card) => {
      const isActive = card === activeCard;
      card.classList.toggle("is-active", isActive);
      card.setAttribute("aria-pressed", String(isActive));
    });
  };

  cards.forEach((card) => {
    card.addEventListener("pointerenter", (event) => {
      if (!mobileView.matches && event.pointerType === "mouse") {
        activateCard(card);
      }
    });

    card.addEventListener("focus", () => activateCard(card));

    card.addEventListener("click", () => {
      activateCard(card);

      if (mobileView.matches) {
        card.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    });
  });
})();


/* ─────────────────────────────────────────────────────────
   FAQ ACCORDION
   One item open at a time; keyboard accessible; respects
   prefers-reduced-motion via CSS grid-template-rows trick
   ───────────────────────────────────────────────────────── */
(() => {
  const accordion = document.getElementById('faqAccordion');
  if (!accordion) return;

  const items    = Array.from(accordion.querySelectorAll('.faq-item'));
  const buttons  = Array.from(accordion.querySelectorAll('.faq-question'));

  function openItem(item) {
    item.classList.add('is-open');
    item.querySelector('.faq-question').setAttribute('aria-expanded', 'true');
  }

  function closeItem(item) {
    item.classList.remove('is-open');
    item.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
  }

  buttons.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      const parentItem  = btn.closest('.faq-item');
      const isOpen      = parentItem.classList.contains('is-open');

      /* Close all first */
      items.forEach(closeItem);

      /* Toggle the clicked one */
      if (!isOpen) openItem(parentItem);
    });

    /* Arrow-key navigation between questions */
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        buttons[(idx + 1) % buttons.length].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        buttons[(idx - 1 + buttons.length) % buttons.length].focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        buttons[0].focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        buttons[buttons.length - 1].focus();
      }
    });
  });
})();
