import { useLanguage } from '../i18n/useLanguage.js'
import { productVisuals } from '../content/productVisuals.js'
import './ProductPreview.css'

export function ProductPreview() {
  const { lang } = useLanguage()
  const c = productVisuals[lang]
  return <figure className="product-preview">
    <div className="product-preview-label">{c.label}</div>
    <a href="/product/mac-chat-dark-1216.webp" aria-label={c.enlarge}>
      <img src="/product/mac-chat-dark-960.webp"
        srcSet="/product/mac-chat-dark-640.webp 640w, /product/mac-chat-dark-960.webp 960w, /product/mac-chat-dark-1216.webp 1216w"
        sizes="(max-width: 900px) calc(100vw - 48px), (max-width: 1248px) 52vw, 634px"
        width="1216" height="768" alt={c.alt} fetchPriority="high" />
    </a>
    <figcaption>
      <p>{c.caption}</p>
      <p>{c.warning}</p>
      <a href="/product/mac-chat-dark-1216.webp">{c.enlarge} →</a>
    </figcaption>
  </figure>
}
