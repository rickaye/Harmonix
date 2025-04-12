import { Switch, Route } from "wouter";
import Studio from "./pages/Studio";
import NotFound from "./pages/not-found";

function App() {
  return (
    <Switch>
      <Route path="/" component={Studio} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
