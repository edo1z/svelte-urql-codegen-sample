<script>
  import { getContextClient, queryStore } from "@urql/svelte";
  import { GetAllFilms } from "$lib/queries/film/GetAllFilms";

  const filmsStore = queryStore({
    client: getContextClient(),
    query: GetAllFilms,
  });
</script>

<h1>Films</h1>
{#if $filmsStore.fetching}
  <p>LOADING...</p>
{:else if $filmsStore.error}
  <p>ERROR! {$filmsStore.error.message}</p>
{:else if $filmsStore.data?.allFilms?.films}
  <ul>
    {#each $filmsStore.data.allFilms.films as film}
      {#if film}
        <li>
          {film.title} - Episode {film.episodeID} - Released on {film.releaseDate}
        </li>
      {/if}
    {/each}
  </ul>
{:else}
  <p>NO films found.</p>
{/if}
