# Testing Checklist for PIN Feature

## Manual Testing Guide

This document provides step-by-step instructions to test the new PIN-based match joining system.

### Prerequisites
- Database migrated with PIN column (run `node migrate.js` if updating existing installation)
- Application built and running (`npm run build && npm start`)
- Admin user created

---

## Test 1: PIN Generation on Match Creation

**Steps:**
1. Login to admin panel at `/login`
2. Go to "Partidas" tab
3. Click "+ Criar Nova Partida"
4. Select a quiz from dropdown
5. Enter a slug (e.g., "test-match")
6. Click "Salvar"

**Expected Result:**
- ✓ Match created successfully
- ✓ Match appears in list with a 4-digit PIN displayed
- ✓ PIN is unique (test by creating multiple matches)

**Screenshot Locations:**
- Admin match list showing PIN badge

---

## Test 2: QR Code with PIN Display

**Steps:**
1. In admin panel, find a match in the list
2. Click "📱 QR Code" button

**Expected Result:**
- ✓ Modal opens showing:
  - QR code for scanning
  - Large PIN display with label "PIN: XXXX"
  - Match URL
- ✓ QR code is scannable (test with phone)
- ✓ PIN is clearly visible and formatted

**Screenshot Locations:**
- QR code modal with PIN display

---

## Test 3: Join Match via PIN from Home Page

**Steps:**
1. Open home page `/` (in incognito/private window or different browser)
2. Click "Entrar em uma Partida" button
3. Modal should appear with 4 PIN input boxes
4. Enter the 4-digit PIN from a created match
5. Click "Entrar" or press Enter

**Expected Result:**
- ✓ Modal opens with PIN entry fields
- ✓ Auto-focus on first digit
- ✓ Typing a digit moves to next field
- ✓ Backspace moves to previous field
- ✓ Valid PIN redirects to match page `/match/{slug}`
- ✓ Invalid PIN shows error: "PIN inválido ou partida não encontrada"

**Screenshot Locations:**
- Home page with "Entrar em uma Partida" button
- PIN entry modal
- Error message for invalid PIN

---

## Test 4: Player Nickname Registration

**Steps:**
1. After joining match (via PIN or QR), player sees nickname entry
2. Try entering names of different lengths:
   - 1 character (should show error)
   - 2 characters (should work)
   - 20 characters (should work)
   - 21+ characters (should be truncated by HTML maxlength)
3. Press Enter or click "Entrar no quiz"

**Expected Result:**
- ✓ Input auto-focuses on page load
- ✓ Character counter shows "X/20 caracteres"
- ✓ Names under 2 chars show error: "O apelido deve ter pelo menos 2 caracteres"
- ✓ Valid names register successfully
- ✓ Player sees waiting screen with player count

**Screenshot Locations:**
- Nickname entry screen
- Character counter
- Validation error

---

## Test 5: Start Match Button

**Steps:**
1. In admin panel, create a new match
2. Join the match as a player (in another browser/incognito)
3. In admin panel, find the match
4. Click "▶️ Iniciar Partida" button
5. Confirm the dialog

**Expected Result:**
- ✓ "Iniciar Partida" button only visible for matches not yet started
- ✓ Confirmation dialog appears
- ✓ On confirm, match status updates to "Em andamento"
- ✓ Players see questions start appearing
- ✓ Button disappears after match starts

**Screenshot Locations:**
- Admin match list with start button
- Match in progress (no start button)

---

## Test 6: Rate Limiting Fix

**Steps:**
1. Refresh the home or login page multiple times (20+ times)
2. Try logging in
3. Try navigating to different pages

**Expected Result:**
- ✓ No 429 errors in browser console
- ✓ All pages load normally
- ✓ Login works without rate limit errors

**Browser Console Check:**
- Open Developer Tools → Console
- Should not see "Request failed with status code 429"

---

## Test 7: Full Player Flow

**End-to-End Test:**
1. Admin creates quiz with questions
2. Admin creates match
3. Admin displays QR code with PIN
4. Player A scans QR code → enters nickname → sees waiting screen
5. Player B uses home page → enters PIN → enters nickname → sees waiting screen
6. Admin clicks "Iniciar Partida"
7. Both players see first question
8. Players answer questions
9. Players see results at end

**Expected Result:**
- ✓ Both join methods work
- ✓ Match starts properly
- ✓ Questions display correctly
- ✓ Timer works
- ✓ Results show properly

---

## Regression Testing

Ensure existing features still work:

- ✓ QR code scanning (without PIN) still works
- ✓ Direct URL access still works
- ✓ Quiz creation/editing works
- ✓ Question management works
- ✓ Match deletion works
- ✓ Player scoring works
- ✓ Leaderboard displays correctly

---

## Known Limitations

1. **Alert/Confirm Dialogs**: Uses native browser dialogs (not accessible)
   - Future enhancement: Replace with custom modal components
   
2. **PIN Collision**: 9000 possible PINs, 50 retry attempts
   - Should be sufficient for most use cases
   - Consider longer PINs if scaling to 1000+ concurrent matches

---

## Troubleshooting

**"PIN already exists" error when creating match:**
- Very rare (1 in 9000 chance per match)
- Try creating the match again
- If persistent, check database for orphaned PINs

**Players can't join via PIN:**
- Verify match PIN in admin panel
- Check match hasn't ended (ended_at IS NULL)
- Verify migration was run successfully

**Start button doesn't appear:**
- Button only shows for matches with started_at = NULL
- If match already started, button is hidden correctly

---

## Success Criteria

All tests pass if:
- [x] PINs are generated and displayed correctly
- [x] Players can join via PIN from home page
- [x] QR code shows PIN prominently
- [x] Nickname entry has good UX (focus, validation, counter)
- [x] Admin can start matches
- [x] No rate limiting errors
- [x] No security vulnerabilities
- [x] Build succeeds without errors
