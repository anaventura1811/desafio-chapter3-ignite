import { GetStaticProps } from 'next';
import Head from 'next/head';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
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

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home(): JSX.Element {
  return (
    <>
      <Head>
        <title>Home | spacetravelling.</title>
      </Head>
      <main className={styles.postsContainer}>
        <p>Hello</p>
      </main>
    </>
  );
}

// export const getStaticProps = async () => {
//   // const prismic = getPrismicClient();
//   // const postsResponse = await prismic.query(TODO);

//   // TODO
// };

// Sobre inclusão de JSX.Element: https://stackoverflow.com/questions/56708330/missing-return-type-on-function-for-every-react-class-method
