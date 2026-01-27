# To-Do List

- change location back so that users can only tag a place within a very small radius (100m)


<br>
<br>

<hr>
<hr>


Implement Option A: a live radius preview map inside CreateNoteModal.

Context:
- Radius options are: 30ft, 75ft, 150ft, 300ft
- We want the user to SEE how far the note will reach when selecting radius.

Requirements:
1) In CreateNoteModal.tsx, add a small embedded MapView preview directly under the Radius selector.
   - Height: ~160–190px
   - Rounded corners, subtle border/shadow to match Airnote cards
   - Should not scroll-jank the modal

2) Center the MapView on the user’s current coordinates using our existing location hook/util.
   - Create a stable `initialRegion` around the user.
   - Keep the map mostly static (no heavy interactions required). Allow light pan/zoom if easy.

3) Draw a Circle overlay centered on the user:
   - Convert feet to meters: meters = feet * 0.3048
   - Update the Circle radius live when user selects 30/75/150/300.
   - Use Airnote teal with subtle fill + thin stroke (match theme).

4) Auto-fit / zoom so the circle is always visible:
   - When radius changes, call `mapRef.current?.fitToCoordinates(...)` or set region deltas so the entire circle stays in frame.
   - Add padding so the circle doesn’t touch edges.

5) Location off / unavailable:
   - If permission denied or coords missing, show a placeholder card in the same spot:
     “Enable location to preview radius.”
   - No crashes.

6) Performance:
   - Memoize region and derived meters value.
   - Avoid re-rendering the entire modal on every map region change (don’t store region in state unless needed).
   - Use a ref for MapView.

Deliverable:
- Only implement this preview in CreateNoteModal (no new screens).
- Ensure it works in Expo Go on iOS.

Notes:
- Keep the rest of CreateNoteModal UI unchanged.


<hr>
<hr>

<br>
<br>

**Onboarding + permissions**

* First-launch onboarding (3 slides max: “Here. Now. Together.” + how it works)
* Location permission flow (Allow / Allow Once / Don’t Allow) + graceful “Location Off” mode
* Notification permission *later* (don’t ask on first launch)

**Core product**

* Supabase integration (notes table, create/read, expiration)
* Realtime updates (subscribe to nearby notes) or periodic refresh
* Expiration enforcement (server query filters `expires_at > now()`; client countdown)
* Radius + duration presets (finalize list, include feet + meters)
* Spam/rate limits (e.g., 1 note/min/device)
* Report note + block area/user (basic moderation)
* Empty states (no notes nearby, location off, loading)

**Map / discovery**

* “Within 1 mile” filter (and maybe “Here” = smaller radius)
* Cluster pins + bottom sheet list
* Center-on-me button
* Dark mode map styling

**Settings**

* Toggle: Dark mode / System
* Units: feet vs meters (since you’re using feet)
* Privacy: “Hide exact location” (snap notes to a grid / place label only)
* Safety: Blocked words toggle / reporting info
* About: what Airnote is, contact, terms, privacy

**Quality + shipping**

* App icon/splash finalized and wired in Expo
* Crash handling + basic logging
* Test on multiple iPhones (notch/safe area)
* Build pipeline (EAS build, TestFlight)
* Analytics (very light): app opens, note created, note viewed (no creepy tracking)

---








<hr>


Improve Map UX/UI for Airnote:

PROBLEMS
1) In busy areas it’ll be hard to see individual pins.
2) Map does not switch styles when app toggles dark mode.
3) We want a lightweight “nearby places with notes” list that can be pulled up without leaving the map.

CHANGES TO MAKE

A) Better markers (readable in busy areas)
- Replace the default pin with a custom marker/badge:
  - A circular Airnote teal marker with a white paper-airplane icon inside (or a simple dot if icon is hard).
  - If multiple notes at same spot/cluster, show a count badge (e.g., “3”) inside the marker.
- Implement lightweight clustering (no heavy libs):
  - Group notes within ~60–100 meters into a cluster.
  - Cluster marker shows count.
  - Tapping cluster zooms in OR opens the list for that cluster.

B) Dark mode map styling
- Apply custom map style JSON based on theme:
  - Light style for light mode
  - Dark style for dark mode
- In react-native-maps, use `customMapStyle={isDark ? darkStyle : lightStyle}`.
- Ensure markers + overlays remain high contrast in both modes.

C) Bottom “Nearby notes” drawer on top of the map (Instagram-like)
- Add a small draggable bottom sheet / drawer that sits on top of the map:
  - Collapsed state: a small pill with “Nearby notes • X places” and a chevron.
  - Expanded state: shows a list of “places with notes” within 1 mile (or within current map viewport).
- The list should show grouped “places” (clusters):
  - Title: place label (use reverse geocode area or stored placeName if we have it)
  - Subtitle: distance + “N notes”
- Tapping a list item should:
  - Center the map on that cluster
  - Open cluster details (modal or inline list of notes)

D) Filtering options (simple chips)
- Add 2 small chips near the top of the map:
  - “Within 1 mi” (fixed for now)
  - “Closest / Recent” sort toggle for the drawer list

E) Performance
- Use FlatList for the drawer list
- Memoize clustering results and only recompute when notes/user location changes
- Avoid rerenders of MapView on every state update (keep region state minimal)

DELIVERABLES
- Update Map screen to include:
  - custom markers + clustering
  - dark/light map styles
  - bottom sheet drawer list of clusters/places with notes
- Keep overall Airnote styling: minimal, Apple-like, teal accents, soft surfaces.
