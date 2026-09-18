export default function PrototypeScene({ organ }) {
  return (
    <section className="prototype-scene" style={{ '--active-hue': organ.hue }}>
      <div className="prototype-field" />
      <div className="prototype-orbits" aria-hidden="true"><span /><span /><span /></div>

      <div className="prototype-copy">
        <p className="eyebrow">{organ.order} · {organ.en}</p>
        <h2>{organ.name}</h2>
        <p className="prototype-lead">{organ.short}</p>

        <div className="prototype-cards">
          <article><small>ความเสี่ยง</small><p>{organ.risk}</p></article>
          <article><small>ดูแล</small><p>{organ.care}</p></article>
        </div>

        <div className="prototype-zone">
          <small>เชื่อมโยงไป</small>
          <strong>{organ.zone}</strong>
        </div>
      </div>

      <div className="prototype-watermark">PROTOTYPE · VIDEO WILL BE ADDED IN KIOSK BUILD</div>
    </section>
  )
}
