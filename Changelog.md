# Changelog

## Tax Prep Tracker Version 0.1.1
### New Features
- New 'Account Summary' report type that displays all accounts.
- For 'Income Statement' and 'Trial Balance' reports the user must.
  now select a start and end date (inclusive). Only the relevant data
  from within this time frame will be included in the report.
- For the 'Balance Sheet' report the user must select a single date and
  the asset/liability/equity accounts' state on that date is what will
  be generated on the report.

### Adjustments
- Removed ability to 'save changes' with no client/account selected.
- Default report export location is now the user's Documents folder,
  reports will be saved here if no path is specified.
- When entering a client's SSN, now no dashes are required to increase
  input ease/speed. The dashes are displayed once the user clicks the
  'add client' button to allow for error-checking, at which point the SSN
  can be modified on the 'update client' page.
- Credits are now negative and debits are positive.
- Removed 'Cash Flow Statement' from the list of account types.

### Bug Fixes
- Fixed issues in the internal calculations for report generation due to
  negative account balances not being fully supported.
- Fixed an issue with broken pagination on the 'Manage Transaction' page.
- Fixed an issue where the 'Income Statement' report recieved no response
  from the backend and therefore failed to generate a report.

### Known Bugs
- Bug that causes text fields to be un-interactable randomly after navigating
  through the UI. The hacky fix I tried was to unfocus and immediately refocus
  the application window whenever a new page was loaded, and while this solved
  the issue it caused the last-focused application to be focused and immediately
  unfocused, which caused it to flicker so I reverted this change. More testing
  needed to determine exactly when this happens as I have struggled to replicate.
  
  Workaround: Click out of the window and back in.