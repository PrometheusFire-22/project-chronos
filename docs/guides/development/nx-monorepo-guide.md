# Nx Monorepo Guide

This guide provides an overview of how to work with the Nx monorepo setup in `project-chronos`. Nx is a powerful build system that helps manage and scale monorepos, ensuring consistent development practices, efficient builds, and simplified dependency management.

## Core Concepts

*   **Workspace:** The root of our monorepo (`project-chronos/`).
*   **Applications (`apps/`):** Independent deployable units (e.g., `apps/web`, `apps/worker`). Each application has its own `project.json`.
*   **Packages (`packages/`):** Reusable libraries or components shared across applications (e.g., `packages/config`, `packages/database`). Each package has its own `project.json`.
*   **Projects:** Both applications and packages are considered "projects" within Nx.
*   **Targets:** Executable scripts defined for each project (e.g., `build`, `serve`, `lint`, `test`).
*   **Executors:** Tools that run targets (e.g., `@nx/next:build`, `@nx/js:swc`).
*   **`nx.json`:** Global Nx configuration for the workspace, defining plugins, target defaults, and named inputs.
*   **`pnpm-workspace.yaml`:** Defines which directories are part of the pnpm workspace.

## Essential Commands

All Nx commands are run using `pnpm exec nx` or simply `nx` if it's globally installed.

### Listing Projects

To see all projects in the workspace:
```bash
pnpm exec nx project-graph
```
This command generates an HTML file `project-graph.html` that visualizes the dependencies between your projects.

### Running Targets for a Specific Project

To run a specific target (e.g., `build`, `serve`, `lint`, `test`) for a project:
```bash
pnpm exec nx <target> <project-name>
```
Examples:
*   Build the web application: `pnpm exec nx build web`
*   Serve the web application: `pnpm exec nx serve web`
*   Build the worker application: `pnpm exec nx build worker`
*   Serve the worker application: `pnpm exec nx serve worker`
*   Lint a package: `pnpm exec nx lint packages/ui`

### Running Targets for Multiple Projects

To run a target across multiple projects:
```bash
pnpm exec nx run-many --target=<target> --projects=<project1,project2,...>
```
Examples:
*   Build all applications: `pnpm exec nx run-many --target=build --projects=web,worker`
*   Lint all projects: `pnpm exec nx run-many --target=lint --all` (or `pnpm exec nx lint --all`)
*   Run tests for affected projects: `pnpm exec nx affected --target=test`

### Affects Command

Nx's `affected` commands are very powerful. They identify projects that are impacted by your recent changes, allowing you to run commands only on those relevant projects.

To see which projects are affected by your current changes (compared to `HEAD` or a base branch):
```bash
pnpm exec nx affected:graph
pnpm exec nx affected:lint
pnpm exec nx affected:build
pnpm exec nx affected --target=test
```

### Generating New Projects

To generate new applications or libraries:
```bash
pnpm exec nx generate @nx/next:application my-new-app
pnpm exec nx generate @nx/js:library my-shared-lib
```
You can explore available generators and their options using:
```bash
pnpm exec nx generate --help
```

### Nx Console (VS Code Extension)

If you use VS Code, the "Nx Console" extension is highly recommended. It provides a rich UI for running Nx commands, generating projects, and visualizing the project graph directly within your IDE.

## Troubleshooting

*   **Cache Issues:** If you encounter unexpected behavior, try clearing the Nx cache:
    ```bash
    pnpm exec nx reset
    ```
*   **Dependency Problems:** Ensure `pnpm install` has been run recently after pulling new changes.
*   **Pathing Errors:** Double-check `project.json` and `wrangler.jsonc` paths, especially for build outputs and entry points.

This guide should help you get started with Nx in `project-chronos`. For more in-depth information, refer to the official Nx documentation..
