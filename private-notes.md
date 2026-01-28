## “My Notes” (Private, Location-Bound Notes)

> Implement a **Private Notes** feature under the existing **“My Notes”** tab.
>
> This feature allows users to write **personal, private notes** that are **never posted**, **never shared**, and **only visible to the user**. These notes are **tied to physical locations** and resurface when the user returns to the same place.
>
> This is **not** a social feature, **not** a feed, and **not** public in any way.

---

## Core Guarantees (Must Be Explicit in UI)

The UI must clearly communicate the following, without ambiguity:

1. Notes created here are **private**
2. Notes created here are **never posted**
3. Notes created here are **only visible to the user**
4. Notes are **associated with places**, not timelines

If a user could ever ask *“Did this get posted?”*, the UI has failed.

---

## Page Structure & Copy

### Page Title

Use:

> **My Notes**

Do **not** rename this tab.

---

### Primary Explanatory Copy (Required, near the top)

Use one of the following (preferred is first):

> **Private notes — just for you**
> Notes you write here are never posted or shared.

OR

> **My Notes**
> Personal notes that stay private and are never shared.

This copy must be visible without scrolling.

---

### Optional Secondary Line (Recommended)

If space allows, add one subtle explanatory line:

> They’ll show up again when you return to the same place.

Do not over-explain.

---

## Creating a Private Note

### Input Placeholder Copy (Important)

Use copy that **does not sound like posting**. Examples:

* “Write something just for you…”
* “What did you think of this place?”
* “Leave yourself a note…”

Do **not** use:

* “Post”
* “Share”
* “Send”
* “Broadcast”

---

### Creation Behavior

* Notes created in **My Notes**:

  * Are stored privately
  * Are associated with the user’s current location
  * Are never sent to Home or Map
* No posting animation
* No success toast
* No confirmation modal

Saving should feel **quiet and settled**, not released.

---

## Viewing Private Notes

### Default View (Anywhere)

When opening **My Notes** from anywhere, show a simple list:

Example:

* **DQ Grill & Chill**
  *Soft serve worked last time.*

* **Local Bar**
  *Skip the IPA — too sweet.*

Rules:

* No timestamps by default
* No metrics
* No counts
* No sorting UI
* Minimal typography, whitespace only

---

### When User Returns to a Place

When the user is physically near a place where they’ve written private notes:

* Show a **subtle indicator** within the **My Notes** tab (not a push notification by default)
* Optionally show a quiet line at the top:

  > *You’ve been here before.*

Tapping reveals **only the private notes for that place**.

Do not surface private notes automatically on Home or Map.

---

## Privacy & Trust Constraints (Do Not Violate)

* Never mix private notes with public notes
* Never show private notes on the map
* Never show private notes to other users
* Never default private notes to public
* Never auto-suggest publishing a private note

If a user wants to make a private note public, that must be an **explicit, intentional action** (not required for initial implementation).

---

## Visual & Interaction Style

* Match the calm, minimal design of:

  * Home feed
  * Note creation flow
* No cards, no borders, no dividers
* Text-first, whitespace-driven layout
* No animations that imply sharing or publishing

---

## Conceptual Framing (For Internal Consistency)

This feature represents:

> **What you thought here last time**

Not:

* A journal
* A review system
* A bookmark list
* A reminder app

The experience should feel personal, quiet, and non-performative.

---

## Acceptance Criteria

The implementation is correct if:

* A user immediately understands these notes are private
* A user never wonders whether a note was posted
* Returning to a place feels like rediscovering a personal thought
* The feature feels calm, optional, and trust-building
