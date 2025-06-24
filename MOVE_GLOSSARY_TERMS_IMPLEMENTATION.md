# Move Glossary Terms Across Glossaries - Implementation Summary

## Overview
This implementation adds the ability to move Glossary Terms across different Glossaries with an asynchronous backend operation and improved user interface.

## Features Implemented

### 1. Backend API Enhancement
- **New Endpoint**: Added `PUT /api/v1/glossaryTerms/{id}/moveAsync` endpoint
- **Cross-Glossary Support**: Terms can now be moved between different glossaries
- **Async Implementation**: Operations are performed asynchronously for better performance
- **Flexible Targeting**: Can move to any glossary term or glossary root

### 2. Frontend API Integration
- Added `moveGlossaryTermAsync()` function in `glossaryAPI.ts`
- Supports optional `parentFQN` and `glossaryFQN` parameters
- Returns promise for async handling

### 3. Enhanced UI Components

#### ChangeParentHierarchy Component
- **Glossary Selection**: Added dropdown to select target glossary
- **Dynamic Term Loading**: Terms are loaded based on selected glossary
- **Cross-Glossary Filtering**: Excludes current term and its children from options
- **Root Option**: Includes option to move to glossary root
- **Improved UX**: Clear separation between glossary and parent term selection

#### Updated Interface
- Modified `ChangeParentHierarchyProps` to support new async signature
- Added `MoveDestination` interface for better type safety
- Enhanced `SelectOptions` for both glossaries and terms

### 4. Integration Updates
- Updated `GlossaryHeader` component to use new async API
- Removed dependency on manual JSON patch creation
- Simplified the move operation workflow

## Technical Details

### Backend Implementation
```java
@PUT
@Path("/{id}/moveAsync")
public Response moveGlossaryTermAsync(
    @PathParam("id") UUID id,
    @QueryParam("parentFQN") String parentFQN,
    @QueryParam("glossaryFQN") String glossaryFQN
)
```

### Frontend API
```typescript
export const moveGlossaryTermAsync = async (
  id: string,
  parentFQN?: string,
  glossaryFQN?: string
): Promise<GlossaryTerm>
```

### Component Usage
```typescript
<ChangeParentHierarchy
  selectedData={selectedTerm}
  onCancel={handleCancel}
  onSubmit={async (parentFQN?, glossaryFQN?) => {
    await moveGlossaryTermAsync(termId, parentFQN, glossaryFQN);
  }}
/>
```

## Key Benefits

1. **Cross-Glossary Moves**: Users can now move terms between different glossaries
2. **Async Performance**: Large move operations don't block the UI
3. **Improved UX**: Clear, step-by-step selection process
4. **Flexible Targeting**: Move to any term or glossary root
5. **Safety Features**: Prevents moving terms under their own children
6. **Status Handling**: Maintains reviewer approval workflows

## Files Modified

### Backend
- `/workspace/openmetadata-service/src/main/java/org/openmetadata/service/resources/glossary/GlossaryTermResource.java`

### Frontend
- `/workspace/openmetadata-ui/src/main/resources/ui/src/rest/glossaryAPI.ts`
- `/workspace/openmetadata-ui/src/main/resources/ui/src/components/Modals/ChangeParentHierarchy/ChangeParentHierarchy.component.tsx`
- `/workspace/openmetadata-ui/src/main/resources/ui/src/components/Modals/ChangeParentHierarchy/ChangeParentHierarchy.interface.ts`
- `/workspace/openmetadata-ui/src/main/resources/ui/src/components/Glossary/GlossaryHeader/GlossaryHeader.component.tsx`

## Usage Instructions

1. **Navigate** to a Glossary Term
2. **Click** the "Manage" button
3. **Select** "Change Parent Term" option
4. **Choose** target glossary from dropdown
5. **Optionally Select** a parent term within that glossary (or leave empty for root)
6. **Confirm** the move operation
7. **Wait** for async completion and automatic redirect

## Future Enhancements

- Progress indicators for long-running operations
- Batch move operations
- Move history tracking
- Undo functionality
- Enhanced validation messages

This implementation provides a complete solution for moving Glossary Terms across Glossaries while maintaining data integrity and providing an excellent user experience.