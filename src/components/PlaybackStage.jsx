import { useEffect, useMemo, useRef, useState } from 'react'
import PrototypeScene from './PrototypeScene'

function waitForVideoReady(video) {
  if (video.readyState >= 2) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      video.removeEventListener('loadeddata', onReady)
      video.removeEventListener('canplay', onReady)
      video.removeEventListener('error', onError)
    }

    const onReady = () => {
      cleanup()
      resolve()
    }

    const onError = () => {
      cleanup()
      reject(video.error || new Error('Video load failed'))
    }

    video.addEventListener('loadeddata', onReady, { once: true })
    video.addEventListener('canplay', onReady, { once: true })
    video.addEventListener('error', onError, { once: true })
  })
}

function fadeVolumes({ incoming, outgoing, durationMs, onDone }) {
  const startedAt = performance.now()
  const incomingStart = incoming.volume
  const outgoingStart = outgoing?.volume ?? 0

  let rafId = 0

  const step = (now) => {
    const progress = Math.min(1, (now - startedAt) / durationMs)
    const eased = 1 - Math.pow(1 - progress, 3)

    incoming.volume = Math.min(1, incomingStart + (1 - incomingStart) * eased)
    if (outgoing) outgoing.volume = Math.max(0, outgoingStart * (1 - eased))

    if (progress < 1) {
      rafId = requestAnimationFrame(step)
    } else {
      onDone?.()
    }
  }

  rafId = requestAnimationFrame(step)
  return () => cancelAnimationFrame(rafId)
}

function PrototypePlayback({ organ, transitionMs }) {
  const [current, setCurrent] = useState(organ)
  const [previous, setPrevious] = useState(null)
  const timerRef = useRef(null)

  useEffect(() => {
    window.clearTimeout(timerRef.current)

    setCurrent((existing) => {
      if (existing?.id === organ?.id) return existing
      setPrevious(existing)
      return organ
    })

    timerRef.current = window.setTimeout(() => {
      setPrevious(null)
    }, transitionMs + 80)

    return () => window.clearTimeout(timerRef.current)
  }, [organ, transitionMs])

  return (
    <div className="playback-prototype-surface" aria-hidden={!organ}>
      {previous && (
        <div className="playback-prototype-layer is-outgoing">
          <PrototypeScene organ={previous} />
        </div>
      )}

      {current && (
        <div key={current.id} className="playback-prototype-layer is-incoming">
          <PrototypeScene organ={current} />
        </div>
      )}
    </div>
  )
}

export default function PlaybackStage({
  provider,
  activeOrgan,
  transitionMs = 420,
  onStoryEnded,
  onPlaybackError,
}) {
  const videoRefs = [useRef(null), useRef(null)]
  const activeIndexRef = useRef(0)
  const activeKeyRef = useRef(null)
  const requestIdRef = useRef(0)
  const pauseTimerRef = useRef(null)
  const cancelVolumeFadeRef = useRef(null)
  const [visibleIndex, setVisibleIndex] = useState(0)

  const hasMedia = provider.hasMedia()

  const target = useMemo(() => {
    if (!hasMedia) return null

    if (activeOrgan) {
      return {
        key: 'story:' + activeOrgan.id,
        kind: 'story',
        organId: activeOrgan.id,
        src: provider.getStory(activeOrgan.id),
      }
    }

    return {
      key: 'idle',
      kind: 'idle',
      organId: null,
      src: provider.getIdle(),
    }
  }, [activeOrgan, hasMedia, provider])

  useEffect(() => {
    if (!hasMedia || !target?.src) return

    const requestId = ++requestIdRef.current
    if (activeKeyRef.current === target.key) return

    window.clearTimeout(pauseTimerRef.current)
    cancelVolumeFadeRef.current?.()
    cancelVolumeFadeRef.current = null

    const oldIndex = activeIndexRef.current
    const nextIndex = 1 - oldIndex
    const outgoing = videoRefs[oldIndex].current
    const incoming = videoRefs[nextIndex].current

    if (!incoming) return

    let disposed = false

    const run = async () => {
      try {
        incoming.pause()
        incoming.loop = target.kind === 'idle'
        incoming.dataset.kind = target.kind
        incoming.dataset.key = target.key
        incoming.dataset.organId = target.organId || ''
        incoming.preload = 'auto'
        incoming.playsInline = true
        incoming.volume = 0

        if (incoming.src !== target.src) {
          incoming.src = target.src
          incoming.load()
        } else {
          incoming.currentTime = 0
        }

        await waitForVideoReady(incoming)

        if (disposed || requestId !== requestIdRef.current) {
          incoming.pause()
          return
        }

        try {
          incoming.currentTime = 0
        } catch {
          // Some decoders reject a seek before metadata is fully available.
        }

        await incoming.play()

        if (disposed || requestId !== requestIdRef.current) {
          incoming.pause()
          return
        }

        activeIndexRef.current = nextIndex
        activeKeyRef.current = target.key
        setVisibleIndex(nextIndex)

        cancelVolumeFadeRef.current = fadeVolumes({
          incoming,
          outgoing,
          durationMs: transitionMs,
          onDone: () => {
            if (outgoing && outgoing !== incoming) {
              outgoing.pause()
              outgoing.volume = 0
            }
          },
        })

        pauseTimerRef.current = window.setTimeout(() => {
          if (outgoing && outgoing !== incoming) {
            outgoing.pause()
            outgoing.volume = 0
          }
        }, transitionMs + 120)
      } catch (error) {
        if (disposed || requestId !== requestIdRef.current) return

        incoming.pause()
        incoming.volume = 0
        onPlaybackError?.({
          target,
          message: error?.message || 'Video playback failed',
        })
      }
    }

    run()

    return () => {
      disposed = true
    }
  }, [hasMedia, target, transitionMs, onPlaybackError])

  useEffect(() => {
    return () => {
      requestIdRef.current += 1
      window.clearTimeout(pauseTimerRef.current)
      cancelVolumeFadeRef.current?.()
      videoRefs.forEach((ref) => {
        if (ref.current) {
          ref.current.pause()
          ref.current.removeAttribute('src')
          ref.current.load()
        }
      })
    }
  }, [])

  if (!hasMedia) {
    return <PrototypePlayback organ={activeOrgan} transitionMs={transitionMs} />
  }

  return (
    <div className="playback-video-surface">
      {[0, 1].map((index) => (
        <video
          key={index}
          ref={videoRefs[index]}
          className={'playback-video-slot' + (visibleIndex === index ? ' is-visible' : '')}
          muted={false}
          playsInline
          preload="auto"
          onEnded={(event) => {
            const video = event.currentTarget
            if (
              index === activeIndexRef.current &&
              video.dataset.kind === 'story'
            ) {
              onStoryEnded?.(video.dataset.organId || null)
            }
          }}
        />
      ))}
    </div>
  )
}
