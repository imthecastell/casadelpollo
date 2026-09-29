import { tagsDe } from '../data/productTags.js'
import '../styles/tags.css'

export default function TagsChips({ producto }) {
  const tags = tagsDe(producto)
  if (tags.length === 0) return null
  return (
    <div className="tc-row">
      {tags.map(t => <span key={t} className="tc-tag">{t}</span>)}
    </div>
  )
}
