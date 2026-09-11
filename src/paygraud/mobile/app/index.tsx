// Location: app/index.tsx
// Entry point — Expo Router always looks for this file first.
// We immediately redirect to login. The auth guard in _layout.tsx
// will then redirect to dashboard if already logged in.

import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/(auth)/pg-login" />;
}
