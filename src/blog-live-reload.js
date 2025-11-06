// To be used when we want to direclty view blog posts as they are being wrriten.

async function setUpBlogReload() {
  const searchParams = new URLSearchParams(window.location.search);
  const pageId = searchParams.get('pageId');
  const renderUrl = new URL(searchParams.get('renderUrl'));

  if (
    renderUrl.hostname !== 'localhost' &&
    renderUrl.hostname !== 'notion-to-html-ashy.vercel.app'
  ) {
    throw new Error('Invalid render URL');
  }

  while (true) {
    const blogPost = await fetch(
      `${renderUrl.origin}/api/notion?pageId=${pageId}&isPublish=true`
    ).then((response) => response.json());

    document.querySelector('.text-rich-text').innerHTML = blogPost.html;
    setupBlog();
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setUpBlogReload();
  });
} else {
  setUpBlogReload();
}
