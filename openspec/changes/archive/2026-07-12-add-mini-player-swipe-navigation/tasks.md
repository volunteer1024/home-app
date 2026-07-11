## 1. Playback queue navigation

- [x] 1.1 Add failing tests for sequence and shuffle previous/next navigation at queue boundaries.
- [x] 1.2 Make sequence and shuffle queue helpers return cyclic navigation targets without selecting an unintended duplicate.
- [x] 1.3 Verify player-store navigation continues to immediately play the resolved target for every playback mode.

## 2. Mini-player gesture interaction

- [x] 2.1 Add failing page tests for left/right swipe dispatch, short or vertical movement, and playback-button isolation.
- [x] 2.2 Add pointer gesture handling to the fixed mini player and connect successful swipes to `playPrev` and `playNext`.
- [x] 2.3 Add bounded drag and return animation styles without changing the existing fixed layout or button control.

## 3. Verification

- [x] 3.1 Run focused sleep page and queue tests.
- [x] 3.2 Run type checking and the production build.
