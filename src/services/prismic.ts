import Prismic from '@prismicio/client';
import { DefaultClient } from '@prismicio/client/types/client';

export function getPrismicClient(req?: unknown): DefaultClient {
  const prismic = Prismic.client(process.env.PRISMIC_API_ENDPOINT, {
    req,
  });
  // const prismic = Prismic.client(
  //   'https://spacetravellingigniteproject.cdn.prismic.io/api/v2'
  // );
  return prismic;
}
