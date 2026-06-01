import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignupPage from '../../../src/screens/auth/signup_page';

// Mock the AuthProvider and apiClient
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

jest.mock('../../../src/api/client', () => ({
  post: jest.fn(),
}));

describe('Signup Page', () => {
  let mockSignIn;
  let mockApiPost;

  beforeEach(() => {
    jest.clearAllMocks();
    // Get mocked functions
    const { useAuth } = require('../../../src/auth/AuthProvider');
    mockSignIn = useAuth().signIn;
    const apiClient = require('../../../src/api/client');
    mockApiPost = apiClient.post;
  });

  test('renders signup form with all required fields', () => {
    const { getByText, getByPlaceholderText, getAllByPlaceholderText } = render(<SignupPage />);

    // Check all fields are present
    expect(getByText('Name')).toBeTruthy();
    expect(getByPlaceholderText('Enter your name')).toBeTruthy();

    expect(getByText('Email address')).toBeTruthy();
    expect(getByPlaceholderText('Enter email')).toBeTruthy();

    expect(getByText('Phone number')).toBeTruthy();
    expect(getByPlaceholderText('Enter phone number')).toBeTruthy();

    expect(getByText('Password')).toBeTruthy();
    expect(getByPlaceholderText('Enter password')).toBeTruthy();

    expect(getByText('Confirm password')).toBeTruthy();
    // Get all inputs with placeholder "Enter password" and check we have 2
    const passwordInputs = getAllByPlaceholderText('Enter password');
    expect(passwordInputs).toHaveLength(2);
  });

  test('shows error when any required field is empty', async () => {
    const { getByText, getByPlaceholderText } = render(<SignupPage />);
    const submitButton = getByText('Sign Up');

    // Press submit without filling any fields
    fireEvent.press(submitButton);

    // Should show error about required fields
    await waitFor(() => {
      expect(getByText('All fields are required')).toBeTruthy();
    });
  });

  test('shows error when passwords do not match', async () => {
    const { getByText, getByPlaceholderText } = render(<SignupPage />);
    const nameInput = getByPlaceholderText('Enter your name');
    const emailInput = getByPlaceholderText('Enter email');
    const phoneInput = getByPlaceholderText('Enter phone number');
    const passwordInput = getByPlaceholderText('Enter password');
    const confirmPasswordInput = getByPlaceholderText('Enter password');
    const submitButton = getByText('Sign Up');

    // Fill all fields except make passwords mismatch
    fireEvent.changeText(nameInput, 'Test User');
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(phoneInput, '1234567890');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(confirmPasswordInput, 'differentpassword');

    fireEvent.press(submitButton);

    // Should show password mismatch error
    await waitFor(() => {
      expect(getByText('Both password fields must match.')).toBeTruthy();
    });
  });

  test('shows error when password is too short', async () => {
    const { getByText, getByPlaceholderText } = render(<SignupPage />);
    const nameInput = getByText('Name');
    const emailInput = getByText('Email address');
    const phoneInput = getByText('Phone number');
    const passwordInput = getByText('Password');
    const confirmPasswordInput = getByText('Confirm password');
    const submitButton = getByText('Sign Up');

    // Fill all fields with short password
    fireEvent.changeText(nameInput, 'Test User');
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(phoneInput, '1234567890');
    fireEvent.changeText(passwordInput, '123');
    fireEvent.changeText(confirmPasswordInput, '123');

    fireEvent.press(submitButton);

    // Should show password length error
    await waitFor(() => {
      expect(getByText('Password must be at least 6 characters long.')).toBeTruthy();
    });
  });

  test('shows loading state during submission', async () => {
    const { getByText, getByPlaceholderText } = render(<SignupPage />);
    const nameInput = getByPlaceholderText('Enter your name');
    const emailInput = getByPlaceholderText('Enter email');
    const phoneInput = getByPlaceholderText('Enter phone number');
    const passwordInput = getByPlaceholderText('Enter password');
    const confirmPasswordInput = getByPlaceholderText('Enter password');
    const submitButton = getByText('Sign Up');

    // Fill all valid fields
    fireEvent.changeText(nameInput, 'Test User');
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(phoneInput, '1234567890');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(confirmPasswordInput, 'password123');

    // Mock API calls to simulate delay
    mockApiPost.mockReturnValue(new Promise(resolve => setTimeout(() => resolve({}), 100)));
    mockSignIn.mockReturnValue(new Promise(resolve => setTimeout(() => resolve({ error: null }), 100)));

    fireEvent.press(submitButton);

    // Should show submitting text immediately
    expect(getByText('Submitting...')).toBeTruthy();

    // Wait for submission to complete
    await waitFor(() => {
      expect(getByText('Sign Up')).toBeTruthy();
    });

    // Should have called API endpoints
    expect(mockApiPost).toHaveBeenCalledWith('/auth/signup', {
      name: 'Test User',
      emailAddress: 'test@example.com',
      password: 'password123',
      phone_number: '1234567890',
    });
    expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  test('handles API error during signup', async () => {
    const { getByText, getByPlaceholderText } = render(<SignupPage />);
    const nameInput = getByText('Name');
    const emailInput = getByText('Email address');
    const phoneInput = getByText('Phone number');
    const passwordInput = getByText('Password');
    const confirmPasswordInput = getByText('Confirm password');
    const submitButton = getByText('Sign Up');

    // Fill all valid fields
    fireEvent.changeText(nameInput, 'Test User');
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(phoneInput, '1234567890');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(confirmPasswordInput, 'password123');

    // Mock API error
    mockApiPost.mockRejectedValue({ error: 'Email already exists' });
    mockSignIn.mockResolvedValue({ error: null });

    fireEvent.press(submitButton);

    // Should show API error
    await waitFor(() => {
      expect(getByText('Email already exists')).toBeTruthy();
    });
  });

  test('handles signIn error after successful signup', async () => {
    const { getByText, getByPlaceholderText } = render(<SignupPage />);
    const nameInput = getByText('Name');
    const emailInput = getByText('Email address');
    const phoneInput = getByText('Phone number');
    const passwordInput = getByText('Password');
    const confirmPasswordInput = getByText('Confirm password');
    const submitButton = getByText('Sign Up');

    // Fill all valid fields
    fireEvent.changeText(nameInput, 'Test User');
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(phoneInput, '1234567890');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(confirmPasswordInput, 'password123');

    // Mock successful signup but failed signIn
    mockApiPost.mockResolvedValue({});
    mockSignIn.mockResolvedValue({ error: { message: 'Failed to sign in' } });

    fireEvent.press(submitButton);

    // Should show signIn error
    await waitFor(() => {
      expect(getByText('Failed to sign in')).toBeTruthy();
    });
  });

  test('navigates to login after successful signup and signin', async () => {
    const { getByText, getByPlaceholderText } = render(<SignupPage />);
    const nameInput = getByText('Name');
    const emailInput = getByText('Email address');
    const phoneInput = getByText('Phone number');
    const passwordInput = getByText('Password');
    const confirmPasswordInput = getByText('Confirm password');
    const submitButton = getByText('Sign Up');

    // Fill all valid fields
    fireEvent.changeText(nameInput, 'Test User');
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(phoneInput, '1234567890');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(confirmPasswordInput, 'password123');

    // Mock successful API calls
    mockApiPost.mockResolvedValue({});
    mockSignIn.mockResolvedValue({ error: null });

    fireEvent.press(submitButton);

    // Wait for navigation
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });

    // Should navigate to login screen
    expect(mockNavigate).toHaveBeenCalledWith('Login');
  });
});