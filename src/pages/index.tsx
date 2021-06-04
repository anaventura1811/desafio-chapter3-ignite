import Prismic from '@prismicio/client';
// import { RichText } from 'prismic-dom';
import format from 'date-fns/format';
import Head from 'next/head';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import { useEffect, useState } from 'react';
import { getPrismicClient } from '../services/prismic';

// import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

// type Preview = {
//   preview: boolean;
// };

interface HomeProps {
  postsPagination: PostPagination;
  // preview: boolean;
}

const handleNewPosts = (document: Post[]): Post[] => {
  const posts = document.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'd MMM YYY'
      ).toLowerCase(),
      data: {
        author: post.data.author,
        subtitle: post.data.subtitle,
        title: post.data.title,
      },
    };
  });
  return posts;
};

export default function Home({
  postsPagination, // preview,
}: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>([]);
  const [prismicNextPage, setPrismicNextPage] = useState('');
  const [preview, setPreview] = useState(Boolean);

  useEffect(() => {
    setPosts(postsPagination.results);
    setPrismicNextPage(postsPagination.next_page);
  }, [postsPagination]);

  function handleLoadingMorePosts(): void {
    fetch(prismicNextPage)
      .then(response => response.json())
      .then(data => {
        setPrismicNextPage(data.next_page);
        const newPosts = handleNewPosts(data.results);
        setPosts([...posts, ...newPosts]);
      });
  }

  return (
    <>
      <Head>
        <title>Home | spacetravelling.</title>
      </Head>
      <main className={styles.postsContainer}>
        <div>
          {postsPagination.results.map(post => (
            <Link href={`/posts/${post.uid}`} key={post.uid}>
              <a>
                <p>
                  {format(
                    new Date(post.first_publication_date),
                    'd MMM YYY'
                  ).toLowerCase()}
                </p>
                <strong>{post.data.title}</strong>
                <i>{post.data.subtitle}</i>
                <p>{post.data.author}</p>
              </a>
            </Link>
          ))}
        </div>
        {prismicNextPage && (
          <div>
            <button type="button" onClick={handleLoadingMorePosts}>
              Carregar mais posts
            </button>
          </div>
        )}
        {(preview as boolean) && (
          <aside>
            <Link href="/api/exit-preview">
              <a>Sair do modo Preview</a>
            </Link>
          </aside>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'publication')],
    {
      fetch: [
        'publication.title',
        'publication.author',
        'publication.subtitle',
      ],
      pageSize: 4,
      page: 1,
      ref: previewData?.ref ?? null,
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  // const postsPagination = postsResponse.total_results_size;
  // // eslint-disable-next-line no-console
  // console.log(JSON.stringify(postsPagination));

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts,
      },
      preview,
    },
    revalidate: 3 * 60 * 60, // a cada 3h
  };
};

// Sobre inclusão de JSX.Element: https://stackoverflow.com/questions/56708330/missing-return-type-on-function-for-every-react-class-method
