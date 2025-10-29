# Data Model — FR-001 Daily N5 Drill

## Entities

### DrillSession
- id: string (uuid)
- date: string (YYYY-MM-DD)
- questions: Question[] (length = 10)
- answers: Answer[]
- startedAt: string (ISO)
- completedAt?: string (ISO)
- accuracy?: number (0..1)
- nextReviewAt?: string (ISO)
- version: number (schema version)

### Question
- id: string
- type: 'single' | 'fill' | 'match'
- prompt: string
- options?: string[] (single)
- pairs?: { left: string; right: string }[] (match)
- answerKey: string | string[] | { [left: string]: string }
- tags?: string[]
- difficulty?: 'N5'

### Answer
- questionId: string
- value: string | string[] | { [left: string]: string }
- isCorrect: boolean
- answeredAt: string (ISO)

### SyncQueue
- id: string (uuid)
- entityType: 'DrillSession' | 'Answer'
- payload: object
- op: 'UPSERT' | 'DELETE'
- createdAt: string (ISO)
- retried: number

## Relationships
- DrillSession 1 - n Question
- DrillSession 1 - n Answer (by questionId)

## Rules
- Always 10 questions per session
- Answers must match type constraints
- accuracy = correctCount / total
- nextReviewAt = SRS(schedule(history))

## Migrations
- v1 → v2: field additions must be backward-compatible; write migration script for local store
