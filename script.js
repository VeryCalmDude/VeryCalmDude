// script.js
// Handles splash animation, custom blob background, and native scrolling theme updates

document.addEventListener('DOMContentLoaded', () => {
  const splashBg = document.getElementById('splash-bg');
  const splashTitle = document.getElementById('splash-title');
  const headerBg = document.getElementById('header-bg');
  const pages = document.querySelectorAll('.page');
  const blobMouse = document.getElementById('blob-mouse');

  // Splash Screen Logic Sequence
  // 1. Initial state: outline text (handled by CSS)
  
  // 2. After 1s, fill the text with cubic animation
  setTimeout(() => {
    splashTitle.classList.add('step-fill');
    
    // 3. After another 1s, move to top middle
    setTimeout(() => {
      splashTitle.classList.add('step-header');
      // Fade out splash background, fade in header background
      splashBg.style.opacity = '0';
      headerBg.style.opacity = '1';
      
      // Cleanup splash background
      setTimeout(() => {
        splashBg.remove();
      }, 1000);
      
    }, 1000);
  }, 1000);

  // Mouse move effect for background
  window.addEventListener('mousemove', (e) => {
    if (blobMouse) {
      blobMouse.style.left = `${e.clientX}px`;
      blobMouse.style.top = `${e.clientY}px`;
    }
  });

  // Scroll-based color changes using IntersectionObserver
  const pageColors = {
    'intro': '#9c88ff',     // Purple
    'raspberry': '#ff4757', // Red
    'coding': '#eccc68',    // Yellow
    'contact': '#2ed573'    // Green
  };

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5 // Trigger when 50% of the section is visible
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        if (pageColors[id]) {
          // Smoothly update CSS variable for background blobs
          document.documentElement.style.setProperty('--bg-color', pageColors[id]);
        }
      }
    });
  }, observerOptions);

  pages.forEach(page => {
    observer.observe(page);
  });

  // Wrap words in paragraphs for negative hover effect
  function wrapWordsInElement(el) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue.trim() !== '') {
        textNodes.push(node);
      }
    }
    
    textNodes.forEach(textNode => {
      // Split by spaces, keep spaces in the array
      const words = textNode.nodeValue.split(/(\s+)/);
      const fragment = document.createDocumentFragment();
      words.forEach(word => {
        if (word.trim() !== '') {
          const span = document.createElement('span');
          span.className = 'hover-word';
          span.textContent = word;
          fragment.appendChild(span);
        } else {
          fragment.appendChild(document.createTextNode(word));
        }
      });
      textNode.parentNode.replaceChild(fragment, textNode);
    });
  }

  const textBlocks = document.querySelectorAll('.content p, .content li div');
  textBlocks.forEach(wrapWordsInElement);
});
