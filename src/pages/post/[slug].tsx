import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { getPrismicClient } from '../../services/prismic';

// import commonStyles from '../../styles/common.module.scss';
// import styles from './post.module.scss';

interface Post {
  uid: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetravelling </title>
      </Head>
      <main>
        {router.isFallback ? (
          <div>Carregando...</div>
        ) : (
          <article>
            <h1>{post.data.title}</h1>
            <h3>{post.data.subtitle}</h3>
            <img src={post.data.banner.url} alt="" />
            <p>{post.data.author}</p>
            <p>4 min</p>
            <time>
              {format(new Date(post.first_publication_date), 'd MMM YYY', {
                locale: ptBR,
              }).toLowerCase()}
            </time>
            {post.data.content.map((contentGroup, ind) => (
              <div key={ind}>
                <h4>{contentGroup.heading}</h4>
                {contentGroup.body.map((bodyItem, index) => (
                  <p
                    key={index}
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: bodyItem.text }}
                  />
                ))}
              </div>
            ))}
          </article>
        )}
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'publication')],
    {
      fetch: ['publication.uid'],
      pageSize: 3,
    }
  );
  const paths = postsResponse.results.map(post => {
    return {
      params: { slug: post.uid },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps<PostProps> = async ({
  params,
  preview = false,
  previewData,
}) => {
  const { slug } = params;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('publication', String(slug), {
    ref: previewData?.ref ?? null,
  });

  if (!response) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const post: Post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(type => {
        return {
          heading: type.heading,
          body: type.body,
        };
      }),
    },
  };

  let previousPost = null;
  let nextPost = null;

  if (!preview) {
    const responsePreviousPost = await prismic.query(
      [
        Prismic.predicates.at('document.type', 'publication'),
        Prismic.predicates.dateAfter(
          'document.first_publication_date',
          post.first_publication_date
        ),
      ],
      {
        fetch: ['publication.title'],
        pageSize: 1,
        page: 1,
      }
    );

    if (responsePreviousPost.results.length) {
      previousPost = {
        uid: responsePreviousPost.results[0].uid,
        title: responsePreviousPost.results[0].data?.title,
      };
    }
  }

  const responseNextPost = await prismic.query(
    [
      Prismic.predicates.at('document.type', 'publication'),
      Prismic.predicates.dateBefore(
        'document.first_publication_date',
        post.first_publication_date
      ),
    ],
    {
      fetch: ['publication.title'],
      pageSize: 1,
      page: 1,
    }
  );

  if (responseNextPost.results.length) {
    nextPost = {
      uid: responseNextPost.results[0].uid,
      title: responseNextPost.results[0].data?.title,
    };
  }

  return {
    props: {
      post,
      preview,
      previousPost,
      nextPost,
    },
    revalidate: 60 * 60 * 3, // a cada 3h
  };
};

// Consulta à documentação para exibição da mensagem de carregando e configuração de StaticPaths e fallback
// --> https://nextjs.org/docs/basic-features/data-fetching#fallback-pages
