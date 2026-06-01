import { useNavigation } from '@react-navigation/native';
import { verifySubmission } from '../src/screens/auth/signup_page.js';

describe('verifySubmission', () => {
    test('Signup throws no error if correct', () => {
        //Valid submission should return an empty string
        expect(verifySubmission('John Doe', 'Email@Address.com', '1234567890', 'GoodPass85', 'GoodPass85')).toBe('');
    });

    test('Signup throws correct error if password confirmation field does not match', () => {
        expect(verifySubmission('John Doe', 'Email@Address.com', '1234567890', 'Password', 'NotPassword')).toBe( //Different passwords
            'Both password fields must match.'
        );
    });

    test('Signup throws correct error if password is less than 6 characters', () => {
        expect(verifySubmission('John Doe', 'Email@Address.com', '1234567890', 'Pswrd', 'Pswrd')).toBe( // 5 character password
            'Password must be at least 6 characters long.'
        );
    });

    test('Signup throws correct error if any required fields are missing', () => {
        expect(verifySubmission('John Doe', 'Email@Address.com')).toBe( // Incomplete submission
            'All fields are required'
        );
    });

    test('Signup throws correct error if phone number is formatted incorrectly', () => {
        expect(verifySubmission('John Doe', 'Email@Address.com', '123-4', 'Password', 'NotPassword')).toBe( // Wrong number
            'Phone number must be formatted as either "xxx-xxx-xxxx" or "xxxxxxxxxx".'
        );
    });

    test('Signup throws correct error if email is formatted incorrectly', () => {
        expect(verifySubmission('John Doe', 'Emailaddresscom', '1234567890', 'Password', 'NotPassword')).toBe( // Wrong email
            'Invalid email formatting.'
        );
    });
    
});