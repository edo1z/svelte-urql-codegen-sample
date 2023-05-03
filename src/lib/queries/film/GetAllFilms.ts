import { graphql } from "$lib/gql/gql";

export const GetAllFilms = graphql(/* GraphQL */ `
  query GetAllFilms {
    allFilms {
      totalCount
      films {
        title
        episodeID
        releaseDate
      }
    }
  }
`);
