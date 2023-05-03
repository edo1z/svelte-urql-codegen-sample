<script>
  import {
    createClient,
    setContextClient,
    cacheExchange,
    fetchExchange,
  } from "@urql/svelte";
  const client = createClient({
    url: "https://swapi-graphql.netlify.app/.netlify/functions/index",
    exchanges: [cacheExchange, fetchExchange],
  });
  setContextClient(client);
</script>

<slot />
