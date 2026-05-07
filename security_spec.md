# Security Specification

## 1. Data Invariants
- A user can only access their own profile and list.
- A user document must have their exact UID.
- All documents must follow the schema exactly.

## 2. The "Dirty Dozen" Payloads
1. Create user with missing keys.
2. Create user with invalid types.
3. Update user modifying immutable field (createdAt).
4. Update user with additional unexpected keys.
5. Access another user's profile.
6. Create list item with invalid types.
7. Create list item missing required fields.
8. Access another user's list item.

## 3. The Test Runner
A `firestore.rules.test.ts` will verify these payloads.
