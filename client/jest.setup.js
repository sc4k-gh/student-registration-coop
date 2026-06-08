//Mocks
process.env.EXPO_PUBLIC_API_URL = 'http://localhost:8081';

//fetch
global.fetch = jest.fn((url) => {
  //Working endpoint example
  if (url.includes('/programs')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue([
        { id: '04707d6f-38d1-4eeb-b8aa-83ee8f37590f', 
          name: 'Intermediate Python', 
          level: 'intermediate', 
          target_age: '12-16', 
          status: 'active' 
        }]),
    });
  }
  //Return 401 (example auth restricted endpoint)
  else if (url.includes('/students')) {
    return Promise.resolve({
      ok: false,
      status: 401,
      json: jest.fn().mockResolvedValue({"error":"Authentication required"}),
    });
  }
  //Return 404 if endpoint isn't recognized
  else {
    const path = url.replace(process.env.EXPO_PUBLIC_API_URL, '');
    return Promise.resolve({
      ok: false,
      status: 404,
      json: jest.fn().mockResolvedValue({"error": `Cannot GET ${path}`})
    }
  )};
});

//react-native
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

//react-native-picker
jest.mock('@react-native-picker/picker', () => {
  const React = require('react');
  const Picker = ({ children }) => React.createElement('div', null, children);
  Picker.Item = ({ label }) => React.createElement('span', null, label);
  return { Picker };
});

//react-navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));

//supabase
jest.mock('./src/lib/supabase.js', () => ({
  supabase: {
    auth: {
      signIn: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
  },
}));

//react-native-url-polyfill
jest.mock('react-native-url-polyfill/auto', () => {});