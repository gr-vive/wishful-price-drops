# Manual Acceptance Test Script

Follow these steps to verify the Smart Price Agent (SPA) frontend is working correctly.

## Prerequisites
- App is running locally
- Backend API is available (or Demo Mode is enabled)

## Test Steps

### 1. Initial Load
- [ ] Load the app at `/`
- [ ] Verify EmptyState is visible with `data-testid="empty-state"`
- [ ] Verify "Add Item" and "Add demo items" buttons are present

### 2. Add Demo Items
- [ ] Click "Add Demo Items" button (`data-testid="btn-add-demo"`)
- [ ] Verify 3 item cards appear in the wishlist
- [ ] Verify each card shows:
  - Item title
  - Domain
  - Current price
  - Target price (if applicable)
  - Tracking status badge

### 3. Refresh Prices
- [ ] Click "Refresh Prices" button (`data-testid="btn-refresh"`)
- [ ] Verify per-item loading indicators appear
- [ ] Verify "Last checked" timestamps update after refresh completes
- [ ] Verify success toast notification appears

### 4. Item Details Drawer
- [ ] Click on any item card
- [ ] Verify ItemDetailsDrawer opens (`data-testid="drawer-item-details"`)
- [ ] Verify drawer shows:
  - Title with external link icon (if URL present)
  - Domain
  - Country badge
  - Attributes (if present: color, size, region)
  - SKU key in monospace font
  - Last checked timestamp (`data-testid="details-last-checked"`)
  - Price history section (`data-testid="details-history"`)
  - Tracking rule with edit option

### 5. Edit Tracking Rule
- [ ] In ItemDetailsDrawer, click "Edit Target" button (only for absolute rules)
- [ ] Modify the target price in `input-target-inline`
- [ ] Click Save (`btn-save-target`)
- [ ] Verify target price updates on the item card
- [ ] Close drawer

### 6. Demo Mode - Simulate Drop
- [ ] Ensure Demo Mode toggle is ON (`data-testid="toggle-demo"`)
- [ ] Verify "Simulate Drop" button appears on item cards (`btn-simulate-drop`)
- [ ] Click "Simulate Drop" on an item
- [ ] Verify:
  - Item status changes to "ALERTED"
  - Badge shows "ALERTED" state
  - Success toast appears
  - Current price drops below target

### 7. Add Item via URL Tab
- [ ] Click "Add Item" button (`data-testid="btn-add-item"`)
- [ ] Select URL tab (`data-testid="tab-url"`)
- [ ] Fill in:
  - Title (`input-title`): "Test Product"
  - Country (`select-country`): GB
  - URL (`input-url`): "https://example.com/product"
- [ ] Set tracking rule:
  - Select "Below absolute" (`rule-absolute`)
  - Enter value (`input-absolute-value`): 50
- [ ] Click Submit (`btn-submit-url`)
- [ ] Verify new item appears with correct domain extracted from URL

### 8. Add Item via Name+Attributes Tab
- [ ] Click "Add Item" button
- [ ] Select "Name + Attributes" tab (`data-testid="tab-name-attrs"`)
- [ ] Fill in:
  - Title: "MacBook Pro 14"
  - Country: US
  - Size (`attrs-size`): "512GB"
  - Color (`attrs-color`): "Space Gray"
  - Region (`attrs-region`): "US"
- [ ] Set tracking rule (percentage below average)
- [ ] Click Submit (`btn-submit-nameattrs`)
- [ ] Verify new item appears
- [ ] Open details drawer and verify:
  - Attributes are normalized correctly
  - SKU key includes all attribute components

### 9. Sorting
- [ ] Use sort dropdown (`data-testid="select-sort"`)
- [ ] Test sorting by:
  - Date added (newest first)
  - Current price (low to high)
  - % Change (if available)
- [ ] Verify items reorder correctly

### 10. Demo Mode Toggle
- [ ] Toggle Demo Mode OFF (`data-testid="toggle-demo"`)
- [ ] Verify:
  - Demo banner disappears
  - "Simulate Drop" buttons are hidden
  - Debug panel disappears
- [ ] Toggle Demo Mode ON
- [ ] Verify:
  - Demo banner appears (`data-testid="demo-banner"`)
  - "Simulate Drop" buttons appear
  - Debug panel appears (`data-testid="debug-panel"`)

### 11. Settings Modal
- [ ] Open Settings (if accessible from toolbar/menu)
- [ ] Verify Settings Modal opens (`data-testid="modal-settings"`)
- [ ] Verify controls present:
  - Country selector (`select-country`)
  - Currency selector (`select-currency`)
  - Reset Demo button (`btn-reset-demo`)
- [ ] Click "Reset Demo Data"
- [ ] Verify all items are removed
- [ ] Verify EmptyState appears again

### 12. Error Handling
- [ ] With Demo Mode OFF, try to refresh prices (if backend unavailable)
- [ ] Verify error toast appears with user-friendly message
- [ ] Verify app suggests enabling Demo Mode after consecutive failures

### 13. Accessibility
- [ ] Tab through form inputs - verify focus is visible
- [ ] Verify all inputs have associated labels
- [ ] Test keyboard navigation in dialogs (Esc to close, Tab to navigate)
- [ ] Verify toast notifications use `aria-live="polite"`

### 14. Responsive Design
- [ ] Resize browser to mobile width
- [ ] Verify:
  - Layout adapts to single column
  - All buttons remain accessible
  - Drawers slide in properly
  - Forms are usable on small screens

## Expected Results
All checkboxes above should be checked without errors. Any failures should be documented with:
- Step where failure occurred
- Expected behavior
- Actual behavior
- Screenshots/console logs if applicable

## Notes
- Demo Mode should show a visible banner when active
- All API timeouts should occur after 6 seconds
- LocalStorage should persist items and demo mode setting between sessions
