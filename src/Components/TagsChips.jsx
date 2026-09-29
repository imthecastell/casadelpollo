import { tagsDe } from '../data/productTags.js'

export default function TagsChips({ producto }) {
  const tags = tagsDe(producto)
  if (tags.length === 0) return null
  return (
    <div className="v2-tags-row">
      {tags.map(t => <span key={t} className="v2-tag">{t}</span>)}
    </div>
  )
}
