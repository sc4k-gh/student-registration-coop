//Mocks

//wip
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve([
    { id: '04707d6f-38d1-4eeb-b8aa-83ee8f37590f', name: 'Intermediate Python', level: 'intermediate', target_age: '12-16', status: 'active' },
  ])
}));

jest.mock('react-native', () => ({
  StyleSheet: {
    create: (styles) => styles,
    flatten: (styles) => styles,
  },
  View: ({ children }) => children,
  Text: ({ children }) => children,
  TextInput: (props) => null,
  Pressable: ({ children }) => children,
  Platform: { OS: 'ios', select: (obj) => obj.ios },
  FlatList: ({ data, renderItem }) => data.map((item, i) => renderItem({ item, index: i })),
}));

jest.mock('@react-native-picker/picker', () => {
  const React = require('react');
  const Picker = ({ children }) => React.createElement('div', null, children);
  Picker.Item = ({ label }) => React.createElement('span', null, label);
  return { Picker };
});

//useNavigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));

jest.mock('./src/lib/supabase.js', () => ({
  supabase: {
    auth: {
      signIn: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
  },
}));

jest.mock('react-native-url-polyfill/auto', () => {});