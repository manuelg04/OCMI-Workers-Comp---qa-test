# OCMI Workers Comp - QA Automation Engineer

This test allows for a hands-on approach to assessing a candidate's test automation skills. The test is designed to be completed in 3-5 hours.

A server running Express, and a simple React application are provided. These apps provide the following functionality:

- Authentication
- CRUD operations for Posts
- Users can specify their favorite book using the OpenLibrary API

You will be responsible for writing tests for the above functionality. Keep in mind that **we will not reject an incomplete test**. Submitting what you have completed is sufficient.

We tried to keep the project as simple as possible, but if you have any questions, please don't hesitate to ask.

- [System Requirements](#system-requirements)
- [Getting Started](#getting-started)
- [Test Requirements](#test-requirements)
- [Structure of Repo](#structure-of-repo)
- [Tools](#tools)
- [Examples](#examples)

## System Requirements

- NodeJS 20.x or higher
- Yarn 4.x or higher
- We recommend an Unix-based system (Linux, MacOS) for this assessment
- NPX (Node Package Runner) is required to run the Nx commands

For simplicity, we use SQLite as the database. You don't need to install any database software. The application will automatically create an SQLite database in the `database.sqlite` file at the root of the project.

## Getting Started

1. Fork or clone this repository
2. Upload your code to a public repository on GitHub
3. E-mail [cristian@ocmiwc.com](mailto:cristian@ocmiwc.com) with the link to your repository
4. Go back to your project and install dependencies using `yarn`
5. Run the server and client apps using `npx nx run server:serve` and `npx nx run client:serve`
6. The server will be running on `http://localhost:3000` and the client on `http://localhost:4200`
7. You can run tests using `npx nx run <app>:test` or `npx nx run <app>-e2e:e2e`
8. Upload changes as you go, we will review your progress

You have until **November 15th** to submit your test. We will review your code and get back to you with feedback. The only additional phase will be a technical interview with our team.

**IMPORTANT: Please do not assume we will reject an incomplete test. We are looking for quality, not quantity.**

## Usage of Artificial Intelligence

We like our tests to be practical and realistic. Therefore, we **allow** the use of AI tools to help you write your tests, since we use them in our day-to-day operations.

However, we expect you to understand the code you are writing and not rely solely on AI tools to generate your tests.

## Troubleshooting

If you encounter any issues at all, please don't hesitate to reach out to us. We are here to help you succeed.

## Test Requirements

We don't want to have this test take up too much of your time, so we are not looking for a comprehensive test suite. Write what you think is necessary to ensure the functionality is working as expected.

Ideally, your tests should primarily demonstrate knowledge of each core testing concept, but don't write too many tests for the sake of writing tests.

Here are some examples of what you could include:

- Unit Testing
- Integration Testing
- E2E Testing (Browser Automation for your client app)
- Mocking and Spying
- Test Data Management

As far as requirements are concerned:

- Submit what you have completed, don't worry about finishing everything
- Try and take less than 5 hours to complete the test
- Must be written in TypeScript
- You must feature at least **3** tests per app
  - Unit Tests: 3 on server, 3 on client
  - E2E Tests: 3 on server-e2e, 3 on client-e2e
  - The more, the merrier

## Structure of Repo

The repo is a monorepo that features four apps (_All in the `apps` folder_):

- server: An Express server that provides an API for the React app
- client: A React app that consumes the API
- server-e2e: E2E tests for the server (Vitest, same syntax as Jest)
- client-e2e: E2E tests for the client (Playwright, but you can use any other tool)

## Tools

The following tools are available, but you are free to use any other tools you are comfortable with:

- Vitest (For Unit Testing, same as Jest)
- Playwright (For Browser Automation)
- Supertest (For API Testing)
- React Testing Library (For React Component Testing)
- Nx (For Monorepo Management)

In our day-to-day operations, we also leverage Nx as a monorepo tool to manage our projects. If you are not familiar with Nx, here's the cliff notes:

### Running the API

- Serve: `npx nx run server:serve`
- Unit Tests: `npx nx run server:test`
- E2E Tests: `npx nx run server-e2e:e2e`

### Running the React App

- Serve: `npx nx run client:serve`
- Unit Tests: `npx nx run client:test`
- E2E Tests: `npx nx run client-e2e:e2e`

## Examples

You will find an example for each type of test:

- Server Unit Test: `apps/server/src/routes/auth.spec.ts`
- Client Unit Test: `apps/client/src/pages/root.spec.tsx`
- Server E2E Test: `apps/server-e2e/src/server/posts.e2e.ts`
- Client E2E Test: `apps/client-e2e/src/client/posts.e2e.ts`

You can use these as guides on how to use the tools provided.
