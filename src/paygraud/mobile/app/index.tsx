// Location: app/index.tsx
import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to our new cinematic welcome screen
  return <Redirect href="/(auth)/pg-welcome" />;
}
