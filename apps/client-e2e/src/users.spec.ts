import { expect, test } from '@playwright/test';

test.use({
  screenshot: 'only-on-failure',
  trace: 'retain-on-failure',
  video: 'retain-on-failure',
});

const apiUrl = (url: string) => `http://localhost:3000${url}`;

// Function to generate a random string for unique usernames
const randomString = () => Math.random().toString(36).substring(2, 8);

test.describe('User Module Tests', () => {
  // We'll generate a unique test user for each test run
  let testUser: { username: string; password: string; id?: string };
  let authToken: string;

  test.beforeAll(async ({ request }) => {
    // Generate a unique test user
    testUser = {
      username: `testuser_${randomString()}`,
      password: 'testpassword',
    };

    // Register the user via API
    const signupResponse = await request.post(apiUrl('/users'), {
      data: {
        username: testUser.username,
        password: testUser.password,
      },
    });

    expect(signupResponse.ok()).toBeTruthy();

    // Log in via API to get auth token and user ID
    const loginResponse = await request.post(apiUrl('/auth/login'), {
      data: {
        username: testUser.username,
        password: testUser.password,
      },
    });

    expect(loginResponse.ok()).toBeTruthy();
    const session = await loginResponse.json();
    authToken = session.token;
    testUser.id = session.userId;
  });

  test.afterAll(async ({ request }) => {
    // Clean up: Delete the test user via API
    if (testUser.id) {
      await request.delete(apiUrl(`/users/${testUser.id}`), {
        headers: {
          Authorization: authToken,
        },
      });
    }
  });

  test.describe('User Signup', () => {
    test('User can sign up and log in', async ({ page }) => {
      // Go to signup page
      await page.goto('/signup');

      // Fill in the signup form
      await page
        .getByPlaceholder('Choose a username')
        .fill(testUser.username);
      await page
        .getByPlaceholder('Choose a password')
        .fill(testUser.password);
      await page
        .getByPlaceholder('Confirm your password')
        .fill(testUser.password);

      // Submit the signup form
      await page.getByRole('button', { name: 'Create account' }).click();

      // Verify that the user is redirected to /signup
      await expect(page).toHaveURL('/signup');

      // Log out
      await page.getByRole('button', { name: 'Logout' }).click();

      // Go to login page
      await page.goto('/login');

      // Login with the new user
      await page.getByPlaceholder('Username').fill(testUser.username);
      await page.getByPlaceholder('Password').fill(testUser.password);
      await page.getByRole('button', { name: 'Sign in' }).click();

      // Verify that the user is logged in
      await expect(page).toHaveURL('/posts');
    });
  });

  test.describe('User Profile Tests', () => {
    test.beforeEach(async ({ page }) => {
      // Log in via UI
      await page.goto('/login');
      await page.getByPlaceholder('Username').fill(testUser.username);
      await page.getByPlaceholder('Password').fill(testUser.password);
      await page.getByRole('button', { name: 'Sign in' }).click();
      await expect(page).toHaveURL('/posts');

      // Navigate to profile page
      await page.getByRole('link', { name: 'Profile' }).click();
      await expect(page).toHaveURL('/profile');
    });

    test('Displays user profile correctly', async ({ page }) => {
      // Verify username is displayed
      await expect(
        page.getByRole('heading', { name: testUser.username })
      ).toBeVisible();

      // Verify User ID is displayed
      await expect(page.getByText('User ID')).toBeVisible();

      // Verify account status is 'Active'
      await expect(page.getByText('Active')).toBeVisible();

      // Verify favorite book section
      await expect(page.getByText('Favorite Book')).toBeVisible();
      await expect(
        page.getByText('No favorite book selected')
      ).toBeVisible();
    });

    test('Updates favorite book', async ({ page }) => {
      // Click on the edit button next to 'Favorite Book'
      await page
        .getByRole('button', { name: 'Edit favorite book' })
        .click();

      // Assuming a modal or popup appears with a search input
      // Fill in the search input
      await page
        .getByPlaceholder('Search for a book')
        .fill('The Great Gatsby');

      // Wait for search results to appear
      await page.waitForSelector('text=The Great Gatsby');

      // Click on 'The Great Gatsby' in the search results
      await page.click('text=The Great Gatsby');

      // Wait for the modal to close (if applicable)
      // Verify that the favorite book is updated on the profile page
      await expect(page.getByText('The Great Gatsby')).toBeVisible();
    });
  });
});
