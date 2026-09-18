export default function PrototypeScene({ organ = null }) {
  const hue = organ?.hue ?? 196

  return (
    <section
      className="prototype-scene prototype-scene-minimal"
      style={{ '--active-hue': hue }}
      aria-hidden="true"
    >
      <div className="prototype-field" />
      <div className="prototype-orbits"><span /><span /><span /></div>
    </section>
  )
}
