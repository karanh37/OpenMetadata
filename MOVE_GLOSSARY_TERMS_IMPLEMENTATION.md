# Move Glossary Terms Across Different Glossaries - Implementation Summary

This document outlines the implementation of the feature to support moving Glossary Terms across different Glossaries using an asynchronous implementation.

## Issue Reference
Fixes: https://github.com/open-metadata/OpenMetadata/issues/20137

## Overview
This implementation enables users to move glossary terms:
- Under any other glossary term (in the same or different glossary)
- Directly to the root of any glossary
- Via an asynchronous API implementation

## Backend Changes

### 1. New JSON Schema
**File**: `openmetadata-spec/src/main/resources/json/schema/api/data/moveGlossaryTermRequest.json`

Created a new schema for the move request with:
- `newGlossary` (required): Target glossary FQN
- `newParent` (optional): Target parent term FQN

### 2. New API Endpoint
**File**: `openmetadata-service/src/main/java/org/openmetadata/service/resources/glossary/GlossaryTermResource.java`

Added new endpoint: `PUT /{id}/moveAsync`

**Features:**
- Validates that parent term belongs to target glossary
- Prevents moving term to be child of itself or its descendants
- Updates term with new glossary and parent references
- Handles cross-glossary moves asynchronously

**Request Body:**
```json
{
  "newGlossary": "target-glossary-name",
  "newParent": "target-glossary-name.parent-term" // optional
}
```

## Frontend Changes

### 1. New API Function
**File**: `openmetadata-ui/src/main/resources/ui/src/rest/glossaryAPI.ts`

Added `moveGlossaryTermAsync()` function to call the new backend endpoint.

### 2. Updated ChangeParentHierarchy Component
**File**: `openmetadata-ui/src/main/resources/ui/src/components/Modals/ChangeParentHierarchy/ChangeParentHierarchy.component.tsx`

**Key Improvements:**
- **Cross-Glossary Support**: Now fetches terms from all glossaries, not just the current one
- **Enhanced UI**: Shows glossary roots and terms with clear visual indicators:
  - 📁 Glossary Name (Root) - for moving to glossary root
  - 📄 Term Name - for moving under specific terms
- **Smart Filtering**: Excludes current term and its descendants from options
- **Better Organization**: Groups options by glossary and sorts appropriately

### 3. Updated Interface
**File**: `openmetadata-ui/src/main/resources/ui/src/components/Modals/ChangeParentHierarchy/ChangeParentHierarchy.interface.ts`

Updated interfaces to support:
- New callback signature: `onSubmit(newGlossary: string, newParent?: string)`
- Enhanced select options with type and glossary information

### 4. Updated GlossaryHeader Component
**File**: `openmetadata-ui/src/main/resources/ui/src/components/Glossary/GlossaryHeader/GlossaryHeader.component.tsx`

Updated `onChangeParentSave` function to use the new async move API instead of patch operations.

## Key Features Implemented

### 1. Cross-Glossary Movement
- Terms can now be moved between different glossaries
- Users can select target glossary and parent from a unified interface

### 2. Flexible Hierarchy Placement
- Move to root of any glossary (when no parent is specified)
- Move under any existing term in any glossary

### 3. Enhanced User Experience
- Visual icons distinguish between glossaries (📁) and terms (📄)
- Clear labeling shows glossary context
- Organized dropdown with glossary grouping

### 4. Validation & Safety
- Prevents circular references (term becoming child of itself)
- Validates parent-glossary relationships
- Maintains existing reviewer workflow integration

### 5. Asynchronous Processing
- Uses async implementation for better performance
- Follows existing async pattern (similar to delete operations)

## Usage

### From UI:
1. Navigate to a glossary term
2. Click "Manage" → "Change Parent Term"
3. Select target location:
   - Choose a glossary root to move term to root level
   - Choose a specific term to move under that term
4. Confirm the move (with reviewer checkbox if applicable)

### From API:
```bash
PUT /api/v1/glossaryTerms/{id}/moveAsync
Content-Type: application/json

{
  "newGlossary": "business-glossary",
  "newParent": "business-glossary.customer-data"
}
```

## Compatibility
- Maintains backward compatibility with existing glossary operations
- Integrates with existing reviewer workflows
- Follows established UI patterns and conventions

## Future Enhancements
- Batch move operations
- Move history tracking
- Enhanced validation rules
- Import/export with cross-glossary references