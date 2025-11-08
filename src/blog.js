async function setupCodeBlocks() {
  const legacyCodeBlocks = document.querySelectorAll('.text-rich-text .code');

  const doesNeedHighlighter = legacyCodeBlocks.length > 0;
  if (!doesNeedHighlighter) {
    return;
  }
  loadPageScript('blog-code-highlight.js');
}

window.copyToClipboard = function copyToClipboard(buttonElement) {
  const codeCell = buttonElement.previousElementSibling;
  const textarea = document.createElement('textarea');

  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';

  textarea.value = codeCell.textContent;

  document.body.appendChild(textarea);

  textarea.select();

  try {
    document.execCommand('copy');

    // Change the button's text to 'Copied'
    buttonElement.textContent = 'Copied...';

    // Revert the button's text back to 'Copy Code' after some time
    setTimeout(() => {
      buttonElement.textContent = 'Copy';
    }, 2000);
  } catch (err) {
    console.error('Failed to copy code:', err);
  }

  document.body.removeChild(textarea);
};

function addImageZoom() {
  var images = document.querySelectorAll('img');

  images.forEach(function (img) {
    img.addEventListener('click', function (event) {
      // Prevent the event from bubbling up to the document
      event.stopPropagation();

      // bind the current image so it doesn't lose context
      const clickedImg = event.currentTarget;

      images.forEach(function (innerImg) {
        // Reset all other images to their original size
        if (innerImg !== clickedImg) {
          innerImg.classList.remove('img-enlarged');
          innerImg.style.transform = '';
        }
      });

      if (clickedImg.classList.contains('img-enlarged')) {
        clickedImg.classList.remove('img-enlarged');
        clickedImg.style.transform = ''; // Reset to original size
      } else {
        clickedImg.classList.add('img-enlarged');
        // Calculate scale factor based on window width and height
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;

        var scaleX = windowWidth / this.width;
        var scaleY = windowHeight / this.height;

        // Max scale factor is 2 or window dimension, whichever is smaller
        var scale = Math.min(scaleX, scaleY, 2);

        clickedImg.style.transform = 'scale(' + scale + ')';
      }
    });
  });

  function minimizeImage() {
    images.forEach((img) => {
      img.classList.remove('img-enlarged');
      img.style.transform = '';
    });
  }

  window.addEventListener('keyup', function (evt) {
    if (evt.key === 'Escape') minimizeImage();
  });
  // Listener for clicks outside the images
  document.addEventListener('click', minimizeImage);
}

window.setupBlog = function setupBlog() {
  setupCodeBlocks();
  addImageZoom();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setupBlog();
  });
} else {
  setupBlog();
}
