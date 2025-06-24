# Glossary Term Move Implementation - Issue #20137

## Overview
Implemented support for moving Glossary Terms across different Glossaries with async functionality. Terms can now be moved under any other glossary term or directly to the root of a glossary.

## Backend Changes

### 1. New API Schema
- **File**: `openmetadata-spec/src/main/resources/json/schema/api/moveGlossaryTermRequest.json`
- **Purpose**: Defines the request structure for moving glossary terms
- **Properties**:
  - `parent` (optional): Fully qualified name of the new parent glossary term
  - `glossary` (optional): Fully qualified name of the target glossary

### 2. New API Endpoint
- **File**: `openmetadata-service/src/main/java/org/openmetadata/service/resources/glossary/GlossaryTermResource.java`
- **Endpoint**: `POST /v1/glossaryTerms/{id}/moveAsync`
- **Operation ID**: `moveGlossaryTermAsync`
- **Description**: Asynchronously move a glossary term to a new parent or glossary

### 3. Repository Implementation
- **File**: `openmetadata-service/src/main/java/org/openmetadata/service/jdbi3/GlossaryTermRepository.java`
- **New Methods**:
  - `moveGlossaryTermAsync()`: Main method handling the async move operation
  - `prepareTermForMove()`: Validates and prepares the term for move operation
  - `performMove()`: Executes the actual move using the updater pattern
- **Updated Method**:
  - `validateParent()`: Modified to allow cross-glossary moves while maintaining hierarchy validation

### 4. Hierarchy Validation Updates
- Cross-glossary moves are now allowed during PUT operations
- Parent terms must belong to the target glossary when specified
- Traditional hierarchy validation still applies for same-glossary operations

## Frontend Changes

### 1. New API Function
- **File**: `openmetadata-ui/src/main/resources/ui/src/rest/glossaryAPI.ts`
- **Function**: `moveGlossaryTermAsync()`
- **Purpose**: Calls the new async move endpoint

### 2. TypeScript Interface
- **File**: `openmetadata-ui/src/main/resources/ui/src/generated/api/moveGlossaryTermRequest.ts`
- **Interface**: `MoveGlossaryTermRequest`
- **Purpose**: Provides type safety for move requests

### 3. Enhanced ChangeParentHierarchy Component
- **File**: `openmetadata-ui/src/main/resources/ui/src/components/Modals/ChangeParentHierarchy/ChangeParentHierarchy.component.tsx`
- **New Features**:
  - Fetches terms from all glossaries, not just the current one
  - Allows selection of target glossary
  - Supports moving to root of any glossary
  - Uses the new async move API
- **Updated Interface**:
  - Added support for both parent and glossary parameters in onSubmit callback

### 4. Updated GlossaryHeader Component
- **File**: `openmetadata-ui/src/main/resources/ui/src/components/Glossary/GlossaryHeader/GlossaryHeader.component.tsx`
- **Changes**:
  - Updated `onChangeParentSave()` to use new async API
  - Supports both parent and glossary changes
  - Proper error handling and navigation

## Key Features Implemented

### 1. Cross-Glossary Movement
- Terms can be moved between different glossaries
- Target glossary selection through dropdown
- Validation ensures parent terms belong to target glossary

### 2. Flexible Hierarchy Management
- Move to root of any glossary (by not selecting a parent)
- Move under any term in any glossary
- Maintains existing hierarchy validation for same-glossary moves

### 3. Async Implementation
- Backend endpoint designed for async processing
- Frontend handles the async nature properly
- Ready for future enhancement with actual background processing

### 4. Enhanced User Experience
- Clear labeling showing which glossary each term belongs to
- Tooltip help messages for better understanding
- Optional selection for both glossary and parent term

## API Usage Examples

### Move to Root of Different Glossary
```json
POST /v1/glossaryTerms/{id}/moveAsync
{
  "glossary": "targetGlossary"
}
```

### Move Under Term in Same Glossary
```json
POST /v1/glossaryTerms/{id}/moveAsync
{
  "parent": "currentGlossary.parentTerm"
}
```

### Move Under Term in Different Glossary
```json
POST /v1/glossaryTerms/{id}/moveAsync
{
  "parent": "targetGlossary.parentTerm",
  "glossary": "targetGlossary"
}
```

## Validation Rules

1. **Cross-Glossary Moves**: Parent term must belong to the target glossary
2. **Hierarchy Prevention**: Cannot move a term under its own children
3. **Optional Parameters**: Both parent and glossary are optional
4. **Default Behavior**: If no glossary specified, term stays in current glossary

## Testing Considerations

1. Test cross-glossary moves with various hierarchy levels
2. Verify validation prevents circular dependencies
3. Test moving to root of different glossaries
4. Ensure proper error handling for invalid moves
5. Verify UI updates correctly after successful moves

## Future Enhancements

1. **True Async Processing**: Implement background job processing for large moves
2. **Batch Operations**: Support moving multiple terms at once
3. **Move History**: Track move operations for audit purposes
4. **Permissions**: Add granular permissions for cross-glossary moves