import React from 'react';
import TimeAgo from 'react-timeago';

import { InferGetStaticPropsType } from 'next';
import Head from 'next/head';

import meSrc from 'assets/me.png';

export const getServerSideProps = async () => {
  const util = require('util');
  const fs = require('fs');

  const readdir = util.promisify(fs.readdir);
  const readFile = util.promisify(fs.readFile);

  const dates = (await readdir('../data')).sort().reverse().slice(0, 5);

  const data = await Promise.all<{ date: string; lines: [string, string][] }>(
    dates.map(async function (date) {
      console.log(`../data/${date}`);
      return {
        date,
        lines: (await readFile(`../data/${date}`, { encoding: 'utf-8' }))
          .trim()
          .split('\n')
          .filter((item) => item.length > 0)
          .reverse()
          .map((line) => {
            const offset = line.indexOf(' ');
            return [line.slice(0, offset), line.slice(offset + 1)];
          }),
      };
    })
  );

  return {
    props: {
      data,
    },
  };
};

function pad(o) {
  return String(o).padStart(2, '0');
}

function today(now = new Date()) {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate()
  )}`;
}

function formatTime(time) {
  const hours = time.getHours();
  return `${hours % 12}:${pad(time.getMinutes())}${hours < 12 ? 'am' : 'pm'}`;
}

const splitLink = new RegExp(`(\\[[^\\]]+\\]\\([^\\)]+\\))`, 'g');
const matchLink = new RegExp(`\\[([^\\]]+)\\]\\(([^\\)]+)\\)`, 'g');

const Entry = ({ children }: { children: string }) => {
  return (
    <>
      {children.split(splitLink).map((item, n) => {
        const match = matchLink.exec(item);
        if (match) {
          const [_, $1, $2] = match;
          return (
            <a href={$2} key={n}>
              {$1}
            </a>
          );
        }
        return item;
      })}
    </>
  );
};

const Timeline: React.FunctionComponent<{
  date: string;
  lines: [string, string][];
}> = ({ date, lines }) => {
  const isToday = date === today();

  return (
    <div>
      <style jsx>{`
        header {
          display: inline-block;
          border-radius: 8px;
          margin-left: 50vw;
          transform: translate(-50%, 0);
          border: solid 2px var(--primary);
          box-shadow: 0 2px 8px 0 rgba(0, 0, 17, 0.1);
          font-size: 0;
        }
        header img {
          border: solid 2px #fff;
          border-radius: 8px;
        }
        div {
          color: var(--primary-text);
          background: linear-gradient(
            to bottom,
            var(--primary),
            var(--primary)
          );
          background-size: 2px 1px;
          background-repeat: repeat-y;
          background-position: 50%;
        }
        ul {
          width: 0;
          margin-left: 50vw;
          position: relative;
        }
        ul:after {
          background: #fff;
          content: '';
          border: solid 2px var(--primary);
          position: absolute;
          bottom: 0;
          border-radius: 50%;
          transform: translate(-50%, 100%);
          width: 6px;
          height: 6px;
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
          border: solid 2px var(--primary);
          box-shadow: 0 2px 8px 0 rgba(0, 0, 17, 0.1);
          border-radius: 5px;
          padding: 8px;
          position: relative;
        }
        article:before {
          content: '';
          width: 9px;
          position: absolute;
          background: var(--primary);
          height: 2px;
          right: 100%;
          top: 50%;
        }
        li:nth-of-type(2n) article:before {
          left: 100%;
        }
        time {
          background: var(--primary);
          color: #fff;
          position: absolute;
          bottom: 100%;
          right: 8px;
          font-size: 9pt;

          padding: 0 4px;
          border: solid 2px var(--primary);

          border-radius: 3px;
          transform: translate(0, 15%);
        }
      `}</style>
      <header>
        <img height="128" width="128" src={meSrc} />
      </header>
      <ul>
        {lines.map(([time, text], n) => {
          const datetime = date + 'T' + time;
          return (
            <li key={n}>
              <article>
                <time dateTime={datetime}>
                  {isToday ? (
                    <TimeAgo date={datetime} />
                  ) : (
                    formatTime(new Date(datetime))
                  )}
                </time>
                <Entry>{text}</Entry>
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const Index: React.FunctionComponent<InferGetStaticPropsType<
  typeof getServerSideProps
>> = ({ data }) => {
  const [index, setIndex] = React.useState(0);

  return (
    <>
      <Head>
        <title>Timeline</title>
      </Head>
      <style jsx>{`
        li {
          cursor: pointer;
          color: var(--primary-text);
        }
        li.active {
          text-decoration: underline;
        }
      `}</style>
      <header>
        <ul>
          {data.map(({ date }, n) => (
            <li
              className={index === n ? 'active' : undefined}
              key={date}
              onClick={setIndex.bind(this, n)}
            >
              {date}
            </li>
          ))}
        </ul>
      </header>
      <main>
        <Timeline {...data[index]} />
      </main>
    </>
  );
};

export default Index;
