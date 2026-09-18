export default function PrototypeScene({ organ = null }) {
  const hue = organ?.hue ?? 196
  const label = organ?.name || 'MAIN VIDEO'

  return (
    <section className="prototype-scene prototype-scene-minimal" style={{ '--active-hue': hue }}>
      <div className="prototype-field" />
      <div className="prototype-orbits" aria-hidden="true"><span /><span /><span /></div>
      <div className="prototype-minimal-label">{label}</div>
    </section>
  )
}
