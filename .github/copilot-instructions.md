# GitHub Copilot Instructions

## Project Context

This is a React project using TypeScript, Chakra UI, Firebase, and Biome for linting and formatting.

## Coding Guidelines

- Always use TypeScript.
- Make sure to fix any TypeScript errors or warnings.
- Follow Chakra UI best practices for UI components.
- Adhere to Firebase/Firestore data modeling and security rules.
- Ensure code is formatted and linted with Biome. Do not use biome-ignore comments; fix the underlying issue instead.
- Write unit tests for new functionality, especially for utility functions and complex logic.
- Keep components small and focused on a single responsibility.
- Use the provided providers for state management where applicable (e.g., DatabaseProvider, ErrorProvider).
- When adding new dependencies, use `npm install`.
- For any new UI components, ensure they are responsive and accessible.
- There should be no commented out code
- try to avoid functions longer than 20 lines, if it is longer break it out into smaller functions
- keep all helper inside the main component function
- order in main component function:
  - state and other consts
  - effects
  - helper functions
  - render
- after making changes, run `npm run lint && tsc -b` to check for errors (dev server handles the build)

## Do not

- Don't comment or JSDoc code
  - In most cases code should be self-explanatory
  - In cases where explanation is needed, try to break out to well named function
- Don't duplicate code unless it's 3 lines or less, instead break out into common function
- Don't use npx if the dependency is already installed
- Don't cd into root directory, you are already there
- Don't run the application, just write the code
- Don't ignore promises, always await them
