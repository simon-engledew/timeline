import React from 'react';
import TimeAgo from 'react-timeago';

import { InferGetStaticPropsType, GetServerSidePropsContext } from 'next';
import { ParsedUrlQuery } from 'querystring';

import meSrc from 'assets/me.webp';

export const getServerSideProps = async (
  context: GetServerSidePropsContext<ParsedUrlQuery>
) => {
  const response = await fetch(`http://${context.req.headers.host}/data/1`, {});

  const lines = await response.text();

  return {
    props: {
      data: lines
        .trim()
        .split('\n')
        .reverse()
        .map((line) => {
          const offset = line.indexOf(' ');
          return [line.slice(0, offset), line.slice(offset + 1)];
        }),
    },
  };
};

const Index: React.FunctionComponent<InferGetStaticPropsType<
  typeof getServerSideProps
>> = ({ data }) => {
  return (
    <div>
      <style jsx>{`
        header {
          display: inline-block;
          border-radius: 50%;
          margin-left: 50vw;
          transform: translate(-50%, 0);
          border: solid 2px red;
          font-size: 0;
        }
        header img {
          border: solid 2px #fff;
          border-radius: 50%;
        }
        div {
          background: linear-gradient(to bottom, red, red);
          background-size: 2px 1px;
          background-repeat: repeat-y;
          background-position: 50%;
        }
        ul {
          width: 0;
          margin-left: 50vw;
          position: relative;
        }
        li {
          width: 50vw;
          padding: 8px;
          margin-bottom: -24px;
        }
        li:nth-of-type(2n) {
          transform: translate(-100%, 0);
        }
        article {
          border: solid 2px red;
          border-radius: 5px;
          padding: 8px;
          position: relative;
        }
        article:before {
          content: '';
          width: 9px;
          position: absolute;
          background: red;
          height: 2px;
          right: 100%;
          top: 50%;
        }
        li:nth-of-type(2n) article:before {
          left: 100%;
        }
        time {
          position: absolute;
          bottom: 100%;
          right: 8px;
          z-index: 1;
          background: #fff;
          padding: 0 4px;
          border: solid 2px red;
          border-radius: 3px;
          transform: translate(0, 15%);
        }
      `}</style>
      <header>
        <img src={meSrc} />
      </header>
      <ul>
        {data.map(([date, text], n) => (
          <li key={n}>
            <article>
              <time dateTime={date}>
                <TimeAgo date={date} />
              </time>{' '}
              {text}
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Index;
