import './_app.css';
import { AppProps } from 'next/app';

const App: React.FunctionComponent<AppProps> = function App({
  Component,
  pageProps,
}) {
  return <Component {...pageProps} />;
};

export default App;
