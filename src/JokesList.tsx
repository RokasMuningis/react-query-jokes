import { memo, ReactNode, useCallback, useMemo, useState, VFC } from 'react';
import { useQuery } from 'react-query';
import './App.css';

interface Joke {
  id: string;
  joke: string;
}

interface JokesResponseJSON {
  current_page: number;
  limit: number;
  next_page: number;
  previous_page: number;
  results: Array<Joke>;
  search_term: string;
  status: 200;
  total_jokes: number;
  total_pages: number;
}

const Wrapper: VFC<{ children: ReactNode; footer: ReactNode }> = memo(({ children, footer }) => {
  return (
    <div className="width-100p max-height-100vh min-height-100vh flex flex-column align-items-center justifi-content-center text-medium background-accent-dark color-white overflow-y-hidden">
      <header className="width-100p flex justify-content-center border-style-solid border-width-0 border-bottom-width-2 border-color-white">
        <div className="max-width-1200px">
          <h1>Who doesn{"'"}t love some of them dad jokes, huh?</h1>
        </div>
      </header>
      <main className="overflow-y-scroll flex-grow-1 flex-shrink-1">
        <div className="rows>m16 max-width-1200px">{children}</div>
      </main>
      {footer}
    </div>
  );
});
Wrapper.displayName = 'Wrapper';

export const JokesList: VFC = () => {
  const [page, setPage] = useState(1);
  const { isLoading, isFetching, error, data, isPreviousData } = useQuery<JokesResponseJSON, Error>(
    ['jokes', page],
    async () => {
      const res = await fetch(`https://icanhazdadjoke.com/search?page=${page}`, {
        headers: { Accept: 'application/json' },
      });
      return await res.json();
    },
    { keepPreviousData: true, staleTime: 3600 },
  );
  const onPageSetClick = useCallback(
    (page: number) => {
      if (page === data?.current_page) return;
      setPage(page);
    },
    [setPage, data?.current_page],
  );

  const pages = useMemo(() => {
    if (!data) return [];
    return Array(5)
      .fill(data.current_page ?? 0)
      .map((page, index) => {
        const tryPage = page + (index - 2);
        return tryPage < 1 ? null : tryPage > data.total_pages ? null : tryPage;
      })
      .filter(page => page !== null);
  }, [data]);

  const Footer = (
    <footer className="width-100p flex justify-content-center padding-y-16 border-style-solid border-width-0 border-top-width-2 border-color-white">
      <div className="max-width-1200px">
        {data && (
          <nav className="cols>m16">
            {data.previous_page > 1 && (
              <span className="cursor-pointer" onClick={() => onPageSetClick(data.previous_page)}>
                {'<'} Prev
              </span>
            )}
            {pages.map(page => {
              return (
                <span
                  key={page}
                  onClick={() => onPageSetClick(page)}
                  className={`cursor-pointer${
                    page === data.current_page ? ' txt-bold txt-underline' : ''
                  }`}
                >
                  {page}
                </span>
              );
            })}
            {data.next_page < data.total_pages && (
              <span className="cursor-pointer" onClick={() => onPageSetClick(data.next_page)}>
                Next {'>'}
              </span>
            )}
          </nav>
        )}
      </div>
    </footer>
  );

  if ((isLoading || isFetching) && !isPreviousData)
    return <Wrapper footer={Footer}>Is loading...</Wrapper>;
  if (error)
    return (
      <Wrapper footer={Footer}>
        Something went wrong 😱 -{'>'} {error.message}
      </Wrapper>
    );
  if (!data)
    return <Wrapper footer={Footer}>Something went wrong 😱 -{'>'} No data was received!</Wrapper>;

  return (
    <Wrapper footer={Footer}>
      {data.results.map(joke => {
        return <article key={joke.id}>{joke.joke}</article>;
      })}
    </Wrapper>
  );
};
