import morphdom from 'morphdom';

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
  document.querySelector('main').style.opacity = 0;
  const abdulAvatar =
    'https://cdn.prod.website-files.com/6908f9f3e78f544600d4d451/6908f9f3e78f544600d4da0a_64078db03b0c89fc5b658614_Abdul.jpeg';
  while (true) {
    const blogPost = await fetch(
      `${renderUrl.origin}/api/notion?pageId=${pageId}&isPublish=false`
    ).then((response) => response.json());
    document.querySelector('main').style.opacity = 1;
    const coverImg = blogPost.page.properties['Cover Photo'].files[0].file.url;
    const authorsHtml = blogPost.page?.properties?.Authors?.multi_select
      ?.map((a) => a.name)
      .map(
        (a) =>
          `<div role="listitem" class="w-dyn-item"><div scroll="toggle" class="blog-detail_hero-list-item">
        <img src="${abdulAvatar}" alt="" class="blog-detail_hero-list-img"><p class="n_text-size-label">
        ${a}
        </p></div></div>`
      )
      .join('');

    // Update the dom with hand rolled versions of the components.
    const authorContainer = document.querySelector('.blog-detail_hero-list');
    morphdom(
      authorContainer,
      `<div fs-cmsstatic-element="list" role="list" class="blog-detail_hero-list w-dyn-items">${authorsHtml}</div>`
    );
    morphdom(
      document.querySelector('.text-rich-text'),
      `<div class="text-rich-text">${blogPost.html}</div>`
    );
    morphdom(
      document.querySelector('.blog-detail_img'),
      `<div class="blog-detail_img"><img src="${coverImg}" alt="" class="img-cover"></div>`
    );
    document.querySelector('h1').textContent =
      blogPost.page?.properties?.Title?.rich_text?.[0]?.plain_text ?? blogPost.title;
    setupBlog();
    renderMathInElement(document.body);
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
