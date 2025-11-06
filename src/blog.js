import { createHighlighter } from 'shiki';

let mojoGrammar;

async function setupCodeBlocks() {
  // Define the custom mojo language highlighter
  if (!mojoGrammar) {
    mojoGrammar = await fetch(
      'https://raw.githubusercontent.com/modularml/mojo-syntax/main/syntaxes/mojo.syntax.json'
    )
      .then((response) => response.json())
      .catch((error) => console.error('Error:', error));
  }
  const mojoLang = {
    id: 'mojo',
    scopeName: 'source.mojo',
    grammar: mojoGrammar,
    aliases: ['mojo', '🔥'],
  };

  // Create a custom highlighter with languages we want to use
  const highlighter = await createHighlighter({
    langs: ['py', 'python', 'mojo', 'bash', 'c', 'cpp', 'yaml', 'markdown', 'json', 'llvm'],
    themes: ['material-theme-palenight'],
  });

  await highlighter.loadLanguage(mojoLang);

  const codeBlocks = document.querySelectorAll('.text-rich-text > p > sub:first-child');
  for (const element of codeBlocks) {
    const codeContent = element.textContent;
    const [lang, ...codeParts] = codeContent.split(',');
    const code = codeParts.join(',').trim(); // Rejoin in case there are commas in the code

    try {
      const highlighted = highlighter.codeToHtml(code, {
        lang: lang.toLowerCase(),
        theme: 'material-theme-palenight',
      });
      const wEmbedDiv = document.createElement('div');
      wEmbedDiv.className = 'w-embed';

      const codeContainerDiv = document.createElement('div');
      codeContainerDiv.className = 'code-container';

      const labelSpan = document.createElement('span');
      labelSpan.className = `label ${lang.toLowerCase()}`;
      labelSpan.textContent = lang.charAt(0).toUpperCase() + lang.slice(1);

      const codeDiv = document.createElement('div');
      codeDiv.className = `code language-${lang.toLowerCase()}`;
      codeDiv.innerHTML = highlighted;

      const copyButton = document.createElement('button');
      copyButton.className = 'copy-button';
      copyButton.textContent = 'Copy';
      copyButton.addEventListener('click', () => {
        copyToClipboard(copyButton);
      });

      codeContainerDiv.appendChild(labelSpan);
      codeContainerDiv.appendChild(codeDiv);
      codeContainerDiv.appendChild(copyButton);
      wEmbedDiv.appendChild(codeContainerDiv);

      element.parentElement.replaceWith(wEmbedDiv);
    } catch (error) {
      console.error('Error highting code:', error);
    }
  }
}

function copyToClipboard(buttonElement) {
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
}

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
