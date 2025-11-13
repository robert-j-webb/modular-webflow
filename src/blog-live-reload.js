import morphdom from 'morphdom';

// To be used when we want to direclty view blog posts as they are being wrriten.

async function setUpBlogReload() {
  const searchParams = new URLSearchParams(window.location.search);
  const pageId = searchParams.get('pageId');
  const renderUrl = new URL(searchParams.get('renderUrl'));
  const renderSecret = searchParams.get('secret');

  if (
    renderUrl.hostname !== 'localhost' &&
    renderUrl.hostname !== 'notion-to-html-ashy.vercel.app' &&
    !renderUrl.hostname.match(/^notion-to-html-[^-]*-modular-ai.vercel.app$/)
  ) {
    throw new Error('Invalid render URL');
  }
  document.querySelector('main').style.opacity = 0;
  const abdulAvatar =
    'https://cdn.prod.website-files.com/6908f9f3e78f544600d4d451/6908f9f3e78f544600d4da0a_64078db03b0c89fc5b658614_Abdul.jpeg';
  const defaultCoverImg =
    'https://cdn.prod.website-files.com/63f9f100025c058594957cca/691608a695e069e1dac85e20_404.jpeg';
  while (true) {
    const blogPost = await fetch(
      `${renderUrl.origin}/api/notion?pageId=${pageId}&isPublish=false&secret=${renderSecret}`
    ).then((response) => response.json());
    const properties = blogPost.page?.properties;
    const coverImg = properties['Cover Photo']?.files?.[0]?.file?.url ?? defaultCoverImg;
    const category = properties?.Team?.select?.name ?? properties?.Category?.select?.name;
    const categoryHtml = category
      ? `<div id="category-tag" class="blog-detail_hero-list-item category w-inline-block">
  <div class="icon-embed-xxsmall w-embed">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 9 8" height="8" width="9">
      <rect fill="#f44771" rx="1" height="8" width="8" h="8" x="0.5"></rect>
    </svg>
  </div>
  <p class="n_text-size-label">${category}</p>
</div>`
      : `<div></div>`;
    const authorsHtml =
      properties?.Authors?.multi_select
        ?.map((a) => a.name)
        .map(
          (a) =>
            `<div role="listitem" class="w-dyn-item"><div scroll="toggle" class="blog-detail_hero-list-item">
        <img src="${abdulAvatar}" alt="" class="blog-detail_hero-list-img"><p class="n_text-size-label">
        ${a}
        </p></div></div>`
        )
        .join('') + categoryHtml;

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

    const title = blogPost.page?.properties?.Title?.rich_text?.[0]?.plain_text ?? blogPost.title;
    document.title = title;
    document.querySelector('h1').textContent = title;

    document.querySelector('main').style.opacity = 1;

    window.setupBlog();
    window.renderMathInElement(document.body);

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
