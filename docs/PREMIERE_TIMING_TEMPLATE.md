# Premiere Timing Template — Zone 1 8 Touch

## Locked master

Use one master sequence for every deliverable:

```text
1920 × 1080
16:9
30 fps CFR
H.264
AAC 48 kHz
```

Do not change scale, crop, camera framing, or button coordinates between files.

## HOME FRAME

`idle.mp4` frame 0 is the **HOME FRAME**.

The playback engine now returns `idle.mp4` to this frame every time a Story ends, is cancelled, or Back is touched.

HOME FRAME should contain the stable hub composition:
- same body / subject framing
- same background layout
- same 8 visual button positions
- no one-time animation that only works on first launch

The idle loop may animate after frame 0, but frame 0 must be a clean point that can accept a Story return at any time.

## Transition timing

Current runtime crossfade:

```text
320 ms ≈ 9.6 frames at 30 fps
```

Production rule:

```text
12-frame transition-safe handle at Story IN
12-frame transition-safe handle at Story OUT
```

This gives slightly more visual safety than the runtime blend.

## Story template

Recommended structure:

```text
FRAME 000
HOME-compatible composition
│
├─ Frames 000–011
│  ENTER HANDLE
│  begin movement / glow / zoom from hub
│
├─ Frames 012–...
│  STORY CONTENT
│
├─ Last 12 frames
│  EXIT HANDLE
│  return toward HOME-compatible composition
│
└─ FINAL FRAME
   visually compatible with HOME FRAME
```

The first and final transition handles should not contain critical text or narration beats.

## Direct Story → Story switching

A visitor may switch in the middle of any Story.

Example:

```text
heart.mp4 at 00:14
      ↓ touch lungs
lungs.mp4 frame 0
```

Because the outgoing Story may be on any frame, every Story must begin with a visually forgiving ENTER HANDLE.

Use one or more of:
- same wide hub framing
- shared background tone
- shared light direction
- soft glow / particle veil
- brief camera settle
- motion that starts slowly from HOME FRAME

Avoid opening a Story on:
- a hard close-up with a completely different background
- a full-white frame
- a hard title card
- a sudden camera angle jump

## Idle template

`idle.mp4` must be a seamless loop.

Suggested structure:

```text
Frame 0 = HOME FRAME
↓
slow ambient motion
↓
button pulse / body breathing / subtle motion
↓
return naturally toward HOME-compatible composition
↓
loop to Frame 0 without visible jump
```

Keep the 8 visual buttons in exactly the same screen positions for the whole idle loop.

## Touch-aligned visual buttons

The final button artwork should live inside the video.

Runtime provides transparent hit areas above the video.

Workflow:

```text
F6 Projection
↓
F7 Touch Calibration
↓
F8 show hitboxes
↓
lock geometry
↓
capture/export alignment reference
↓
use reference in Premiere as guide layer
↓
edit all 9 videos against the same guide
```

After final media is approved, do not move F6/F7 geometry unless all affected video graphics are re-aligned.

## Audio continuity

For Story clips:
- do not place a hard transient on frame 0
- allow approximately 320 ms for audio crossfade
- keep ambience compatible with the hub when possible
- narration may start after the enter handle

For `idle.mp4`:
- ambience should loop cleanly
- frame 0 should not contain a loud one-shot sound

## Required deliverables

```text
idle.mp4
brain.mp4
mouth.mp4
lungs.mp4
heart.mp4
liver.mp4
kidney.mp4
digestive.mp4
muscle.mp4
```

All files must use the same export preset.
