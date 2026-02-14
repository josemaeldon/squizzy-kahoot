# UI Changes - Visual Guide

This document provides a visual description of the new UI features added to the admin panel.

## Admin Panel - Partidas Section

### Before
The match list showed:
- Match title
- Slug
- PIN (or "N/A" if missing)
- Status
- Player count
- Buttons: "▶️ Iniciar Partida", "📱 QR Code", "Copiar Link", "Excluir"

### After
The match list now shows:
- Match title
- Slug  
- PIN (4-digit code with styling: blue background, monospace font)
- Status (color-coded badges)
- Player count
- **New Buttons**:
  - "▶️ Iniciar Partida" (green) - Only shown if match not started
  - **"⏹️ Finalizar Partida" (orange/warning)** - Only shown if match is started but not ended
  - **"👥 Jogadores" (default)** - Always shown, opens player management modal
  - "📱 QR Code" (green) - QR code and PIN display
  - "Copiar Link" (default) - Copy match URL
  - "Excluir" (red/danger) - Delete match

## New Feature: Players Management Modal

### Trigger
Click the **"👥 Jogadores"** button on any match in the Partidas section.

### Modal Content
```
┌─────────────────────────────────────────────┐
│  Jogadores - [Match Quiz Title]            │
│  Gerencie os jogadores desta partida       │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │ Player Name          100 pontos  [X]  │ │
│  │ Another Player        85 pontos  [X]  │ │
│  │ Third Player          72 pontos  [X]  │ │
│  └───────────────────────────────────────┘ │
│                                             │
│                              [Fechar]       │
└─────────────────────────────────────────────┘
```

### Features
- **Title**: Shows "Jogadores - [Quiz Title]" or "Jogadores - Partida" if quiz title unavailable
- **Help Text**: "Gerencie os jogadores desta partida"
- **Player List**: 
  - Each row shows player name, score, and remove button
  - Hover effect on player items (background changes)
  - Scrollable if many players (max height 400px)
  - Empty state: "Nenhum jogador ainda nesta partida."
- **Actions**:
  - **"Remover" button** (red, on each player row) - Removes that player
  - **"Fechar" button** (secondary, bottom right) - Closes modal

### Styling Details
- Modal has semi-transparent backdrop (click to close)
- Player items have subtle borders and padding
- Hover state provides visual feedback
- Scores displayed in secondary color
- Remove buttons consistently styled as danger actions

## New Feature: Finish Match Button

### Trigger
The **"⏹️ Finalizar Partida"** button appears in the match actions area.

### Visibility Conditions
- ✅ Shows: When match is started (`started_at` is not null) AND not ended (`ended_at` is null)
- ❌ Hidden: When match is not started OR already ended

### Button Styling
- Orange/warning color (`btn-warning` class)
- Icon: ⏹️ (stop square)
- Text: "Finalizar Partida"

### Behavior
1. Click button
2. Confirmation dialog: "Deseja finalizar esta partida? Ela será marcada como concluída."
3. If confirmed:
   - API call to finish match
   - Success message: "Partida finalizada com sucesso!"
   - Match list refreshes
   - Match status updates to "Concluída" (green badge)
   - Button disappears (match is now ended)

## PIN Display Improvements

### Before
- Text: "PIN: N/A" (if PIN was missing)

### After
- Text: "PIN: 1234" (4-digit code)
- **Styling**:
  - Background: Light blue (#f0f9ff)
  - Border: 2px solid blue (#0284c7)
  - Font: Monospace, bold, large size
  - Letter spacing for readability
  - Inline badge style

### In QR Code Modal
Similar styling but larger:
- Font size: 2rem
- Letter spacing: 0.5rem
- Prominent display with label "PIN:"

## Status Badge Colors

Matches now have color-coded status badges:

- **"Aguardando"** (waiting):
  - Background: Light yellow (#fef3c7)
  - Text: Dark brown (#92400e)

- **"Em andamento"** (in_progress):
  - Background: Light blue (#dbeafe)
  - Text: Dark blue (#1e40af)

- **"Concluída"** (completed):
  - Background: Light green (#d1fae5)
  - Text: Dark green (#065f46)

## Responsive Design

All new elements are responsive:

### Desktop (> 768px)
- Modal width: 600px
- Buttons display inline
- Player list shows full information

### Mobile (≤ 768px)
- Modal width: 95% of screen
- Buttons may wrap to new lines
- Player list remains scrollable
- Touch-friendly button sizes

## Accessibility

- All buttons have clear labels
- Modal can be closed by clicking backdrop
- Confirmation dialogs prevent accidental actions
- Color contrast meets WCAG standards
- Keyboard navigation supported (modal close on ESC)

## User Flow Example

### Finishing a Match
1. Admin navigates to "Partidas" section
2. Sees list of matches
3. Finds ongoing match (status "Em andamento")
4. Clicks "⏹️ Finalizar Partida" button
5. Confirms in dialog
6. Sees success message
7. Match status changes to "Concluída"
8. Button disappears

### Removing a Player
1. Admin navigates to "Partidas" section
2. Clicks "👥 Jogadores" on desired match
3. Modal opens showing all players
4. Finds player to remove
5. Clicks "Remover" button next to player name
6. Confirms in dialog
7. Player disappears from list
8. Player count in match list updates
9. Modal remains open for further actions
10. Clicks "Fechar" when done
