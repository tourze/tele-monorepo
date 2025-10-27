# Demo Proposal - React Standards Extension

## Purpose
This is a demo specification to show how project-specific proposals work.

## ADDED Requirements

### Requirement: Project-Based Proposal Structure

OpenSpec proposals SHALL be organized by project when working with multi-project workspaces.

#### Scenario: Creating project-specific proposals

- **WHEN** creating a change proposal for a specific project
- **THEN** organize the change under `openspec/changes/[project-name]/[change-name]/`
- **AND** use the project name matching the apps directory (e.g., `utc-react`, `seven-fish-customer-service`)
- **AND** maintain the same internal structure with proposal.md, tasks.md, design.md, and specs/