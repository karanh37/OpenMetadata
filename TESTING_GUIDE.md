# Testing Guide - Move Glossary Terms Across Glossaries

This guide outlines how to test the new async move functionality for glossary terms.

## Test Setup

### Prerequisites
1. Multiple glossaries with hierarchical terms
2. Admin or appropriate user permissions
3. Some glossary terms with reviewers (to test reviewer workflow)

### Sample Test Data Structure
```
Business Glossary
├── Customer Data
│   ├── Customer ID
│   └── Customer Info
└── Product Data
    └── Product ID

Technical Glossary  
├── Data Elements
│   ├── Primary Key
│   └── Foreign Key
└── Metadata
    └── Schema Info
```

## Backend API Testing

### Test Case 1: Move Term to Root of Different Glossary
```bash
PUT /api/v1/glossaryTerms/{customer-id-term-id}/moveAsync
Content-Type: application/json

{
  "newGlossary": "Technical Glossary"
}
```

**Expected Result**: Customer ID moves to root of Technical Glossary

### Test Case 2: Move Term Under Different Parent in Same Glossary
```bash
PUT /api/v1/glossaryTerms/{customer-id-term-id}/moveAsync
Content-Type: application/json

{
  "newGlossary": "Business Glossary",
  "newParent": "Business Glossary.Product Data"
}
```

**Expected Result**: Customer ID moves under Product Data

### Test Case 3: Move Term to Different Glossary Under Specific Parent
```bash
PUT /api/v1/glossaryTerms/{customer-id-term-id}/moveAsync
Content-Type: application/json

{
  "newGlossary": "Technical Glossary",
  "newParent": "Technical Glossary.Data Elements"
}
```

**Expected Result**: Customer ID moves under Data Elements in Technical Glossary

### Error Cases to Test

#### Test Case 4: Invalid Parent-Glossary Relationship
```bash
PUT /api/v1/glossaryTerms/{customer-id-term-id}/moveAsync
Content-Type: application/json

{
  "newGlossary": "Business Glossary",
  "newParent": "Technical Glossary.Data Elements"
}
```

**Expected Result**: 400 Bad Request - Parent doesn't belong to target glossary

#### Test Case 5: Circular Reference Prevention
```bash
PUT /api/v1/glossaryTerms/{customer-data-term-id}/moveAsync
Content-Type: application/json

{
  "newGlossary": "Business Glossary",
  "newParent": "Business Glossary.Customer Data.Customer ID"
}
```

**Expected Result**: 400 Bad Request - Cannot move parent under its child

## Frontend UI Testing

### Test Case 6: Cross-Glossary UI Move
1. Navigate to a glossary term (e.g., "Customer ID")
2. Click "Manage" → "Change Parent Term"
3. Verify dropdown shows:
   - 📁 Business Glossary (Root)
   - 📁 Technical Glossary (Root)
   - 📄 Product Data
   - 📄 Data Elements
   - 📄 Primary Key
   - 📄 Foreign Key
   - 📄 Metadata
   - 📄 Schema Info
4. Select "📁 Technical Glossary (Root)"
5. Click Submit
6. Verify term moves to Technical Glossary root

### Test Case 7: Move Under Term in Different Glossary
1. Navigate to a glossary term
2. Open change parent dialog
3. Select "📄 Data Elements" (from Technical Glossary)
4. Verify term moves under Data Elements

### Test Case 8: Reviewer Workflow Integration
1. Navigate to a term with reviewers
2. Open change parent dialog
3. Verify confirmation checkbox appears
4. Try to submit without checking - should be disabled
5. Check confirmation checkbox
6. Verify submission works

### Test Case 9: UI Validation
1. Verify current term and its descendants are excluded from options
2. Verify options are grouped by glossary
3. Verify visual indicators (📁 for glossaries, 📄 for terms)
4. Verify search functionality works in dropdown

## Validation Criteria

### Backend Validation
- [ ] Term moves to correct location
- [ ] FQN updates correctly (e.g., "Technical Glossary.Customer ID")
- [ ] Children terms update their FQNs accordingly
- [ ] Database relationships update correctly
- [ ] Search index updates
- [ ] Error handling works for invalid requests

### Frontend Validation
- [ ] UI loads all glossaries and terms
- [ ] Dropdown filters correctly
- [ ] Visual indicators display properly
- [ ] Form submission works
- [ ] Error messages display for failures
- [ ] Loading states work correctly
- [ ] Navigation redirects to new location after move

### Integration Validation
- [ ] Moved terms appear in new location
- [ ] Old location no longer shows the term
- [ ] Breadcrumbs update correctly
- [ ] Term hierarchy displays correctly
- [ ] Assets tagged with moved terms still work
- [ ] Search finds terms in new location

## Performance Testing

### Load Testing
1. Test with large glossaries (100+ terms)
2. Verify dropdown loads in reasonable time
3. Test multiple concurrent move operations

### Error Recovery
1. Test network failures during move
2. Verify system state remains consistent
3. Test browser refresh during operation

## Edge Cases

### Test Case 10: Special Characters in Names
- Test with terms containing spaces, special characters
- Verify FQN encoding/decoding works correctly

### Test Case 11: Deeply Nested Hierarchies
- Test moving terms in 5+ level hierarchies
- Verify all children update correctly

### Test Case 12: Large Volume Moves
- Test moving terms with many children
- Verify all descendants update properly

## Regression Testing

### Existing Functionality
- [ ] Regular term creation still works
- [ ] In-place editing still works
- [ ] Delete operations still work
- [ ] Import/export still works
- [ ] Original parent change (within same glossary) still works

### Backwards Compatibility
- [ ] Existing API endpoints unchanged
- [ ] Existing UI components unchanged
- [ ] No breaking changes for existing integrations