import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(private title: Title, private meta: Meta) {}

  setPage(config: {
    title       : string;
    description : string;
    image?      : string;
    url?        : string;
    type?       : string;
  }): void {
    const fullTitle = `${config.title} | Djula Market`;
    const desc      = config.description;
    const image     = config.image || 'https://frontend-ag-bf.vercel.app/assets/og-image.png';
    const url       = config.url   || 'https://frontend-ag-bf.vercel.app';
    const type      = config.type  || 'website';

    this.title.setTitle(fullTitle);

    this.meta.updateTag({ name: 'description', content: desc });

    this.meta.updateTag({ property: 'og:title',       content: fullTitle });
    this.meta.updateTag({ property: 'og:description',  content: desc });
    this.meta.updateTag({ property: 'og:image',        content: image });
    this.meta.updateTag({ property: 'og:url',          content: url });
    this.meta.updateTag({ property: 'og:type',         content: type });
    this.meta.updateTag({ property: 'og:site_name',    content: 'Djula Market' });
    this.meta.updateTag({ property: 'og:locale',       content: 'fr_BF' });

    this.meta.updateTag({ name: 'twitter:card',        content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title',       content: fullTitle });
    this.meta.updateTag({ name: 'twitter:description', content: desc });
    this.meta.updateTag({ name: 'twitter:image',       content: image });

    this.meta.updateTag({ name: 'canonical', content: url });
  }
}
