import { AppProviders } from "@/context/index.ts";
import { Layout } from "@/components/index.ts";
import { AppRouter } from "@/router/index.ts";
import "./App.css";

export function App() {
  return (
    <AppProviders>
      <Layout>
        <AppRouter />
      </Layout>
    </AppProviders>
  );
}

export default App;
