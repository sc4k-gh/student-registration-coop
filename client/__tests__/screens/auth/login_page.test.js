import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginPage from '../../../src/screens/auth/login_page';

// Mock the AuthProvider and navigation
jest.mock('../../../src/auth/AuthProvider', () => ({
  useAuth: () => ({
    signIn: jest.fn(),
    isSignedIn: false,
    loading: false,
    session: null,
  }),
}));

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe('Login Page', () => {
  let mockSignIn;

  beforeEach(() => {
    jest.clearAllMocks();
    // Get the mocked signIn function
    const { useAuth } = require('../../../src/auth/AuthProvider');
    mockSignIn = useAuth().signIn;
  });

  test('renders login form with email and password inputs', () => {
    const { getByText, getByPlaceholderText } = render(<LoginPage />);

    expect(getByText('Email address')).toBeTruthy();
    expect(getByPlaceholderText('Enter email')).toBeTruthy();
    expect(getByText('Password')).toBeTruthy();
    expect(getByPlaceholderText('Enter password')).toBeTruthy();
  });

  test('toggles password visibility when button is pressed', () => {
    const { getByText } = render(<LoginPage />);
    const passwordInput = getByText('Password');
    const toggleButton = getByText('Toggle password visibility');

    // Initially, password should be obscured
    expect(passwordInput.props.secureTextEntry).toBe(true);

    // Press toggle button
    fireEvent.press(toggleButton);

    // Password should now be visible
    expect(passwordInput.props.secureTextEntry).toBe(false);

    // Press toggle button again
    fireEvent.press(toggleButton);

    // Password should be obscured again
    expect(passwordInput.props.secureTextEntry).toBe(true);
  });

  test('shows loading state when submitting', async () => {
    const { getByText, getByPlaceholderText } = render(<LoginPage />);
    const emailInput = getByPlaceholderText('Enter email');
    const passwordInput = getByPlaceholderText('Enter password');
    const submitButton = getByText('Log In');

    // Fill in form
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    // Mock signIn to simulate delay
    mockSignIn.mockReturnValue(new Promise(resolve => setTimeout(() => resolve({ error: null }), 100)));

    // Press submit
    fireEvent.press(submitButton);

    // Should show submitting text immediately
    expect(getByText('Submitting...')).toBeTruthy();

    // Wait for submission to complete
    await waitFor(() => {
      expect(getByText('Log In')).toBeTruthy();
    });

    // Should have called signIn with correct parameters
    expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  test('navigates to dashboard on successful login', async () => {
    const { getByText, getByPlaceholderText } = render(<LoginPage />);
    const emailInput = getByPlaceholderText('Enter email');
    const passwordInput = getByPlaceholderText('Enter password');
    const submitButton = getByText('Log In');

    // Fill in form
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    // Mock successful signIn
    mockSignIn.mockResolvedValue({ error: null });

    // Press submit
    fireEvent.press(submitButton);

    // Wait for navigation
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });

    // Should navigate (actual screen name depends on your navigator setup)
    expect(mockNavigate).toHaveBeenCalled();
  });

  test('shows error message on failed login', async () => {
    const { getByText, getByPlaceholderText } = render(<LoginPage />);
    const emailInput = getByPlaceholderText('Enter email');
    const passwordInput = getByPlaceholderText('Enter password');
    const submitButton = getByText('Log In');

    // Fill in form
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'wrongpassword');

    // Mock failed signIn - return object with error property
    mockSignIn.mockResolvedValue({ error: { message: 'Invalid credentials' } });

    // Press submit
    fireEvent.press(submitButton);

    // Wait for error to appear
    await waitFor(() => {
      expect(getByText('Invalid credentials')).toBeTruthy();
    });

    // Should show error message
    expect(getByText('Invalid credentials')).toBeTruthy();
  });

  test('clears error message when user types after error', async () => {
    const { getByText, getByPlaceholderText, queryByText } = render(<LoginPage />);
    const emailInput = getByPlaceholderText('Enter email');
    const passwordInput = getByPlaceholderText('Enter password');
    const submitButton = getByText('Log In');

    // Trigger an error first
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'wrongpassword');

    mockSignIn.mockResolvedValue({ error: { message: 'Invalid credentials' } });
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(getByText('Invalid credentials')).toBeTruthy();
    });

    // Now type in email field - should clear error
    fireEvent.changeText(emailInput, 'newemail@example.com');

    // Error should be cleared
    expect(queryByText('Invalid credentials')).toBeFalsy();
  });
});