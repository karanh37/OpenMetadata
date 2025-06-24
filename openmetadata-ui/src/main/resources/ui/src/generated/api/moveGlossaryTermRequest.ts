/*
 *  Copyright 2025 Collate.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
/**
 * Request to move a glossary term to a new parent or glossary
 */
export interface MoveGlossaryTermRequest {
    /**
     * Fully qualified name of the target glossary. If not provided, the term will be moved
     * within the same glossary.
     */
    glossary?: string;
    /**
     * Fully qualified name of the new parent glossary term. If not provided, the term will be
     * moved to the root of the target glossary.
     */
    parent?: string;
}