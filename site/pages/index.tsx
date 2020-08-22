import React from 'react';

function useSignal(
  fn: (signal: AbortSignal) => Promise<void>,
  deps: React.DependencyList = undefined
) {
  React.useEffect(function () {
    const abortController = new AbortController();

    fn(abortController.signal).catch(function (error) {
      if (error instanceof DOMException && error.code == error.ABORT_ERR) {
        return;
      }
      throw error;
    });

    return function () {
      if (!abortController.signal.aborted) {
        abortController.abort();
      }
    };
  }, deps);
}

const Index: React.FunctionComponent = () => {
  const [data, setData] = React.useState([]);

  useSignal(async (signal) => {
    const response = await fetch(`//${document.location.host}/data/1`, {
      signal: signal,
    });

    const lines = await response.text();

    if (signal.aborted) return;

    setData(
      lines
        .trim()
        .split('\n')
        .reverse()
        .map((line) => {
          const offset = line.indexOf(' ');
          return [
            new Date(line.substring(0, offset)),
            line.substring(offset + 1),
          ];
        })
    );
  }, []);

  return (
    <div>
      <ul>
        {data.map(([date, text], n) => (
          <li key={n}>
            {date.toString()} {text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Index;
