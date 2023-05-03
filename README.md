# svelte-urql-codegen-sample

SvelteKit で urql と graphql-codegen を使って GraphQL サーバにリクエストするサンプルです。graphql-codegen の client-preset というのを使っています。
リクエストする GraphQL サーバは下記を使わせていただきました。<br/>
https://swapi-graphql.netlify.app/

## 使い方

```shell
git clone https://github.com/web3ten0/svelte-urql-codegen-sample
cd svelte-urql-codegen-sample
npm i
npm run dev
```

## このリポジトリで設定した内容のメモ

### SvelteKit プロジェクトの作成

```shell
npm create svelte@latest svelte-urql-codegen-sample
cd svelte-urql-codegen-sample
npm i
```

### 各種インストール

```shell
npm i -D @graphql-codegen/cli @graphql-codegen/client-preset @urql/svelte
```

### urql の client を使えるようにする

`src/routes/+layout.svelte` に下記を書きます。ルートの layout で `setContextClient` を実行することで、それ以外の子のコンポーネントで urql の client を `getContextClient` によって利用することが出来るようになります。

```svelte
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
```

### クエリの作成

下記ディレクトリを作成します。（このディレクトリは `codegen.yml` の設定次第で任意の場所・名前に変更可能です）

```shell
mkdir -p src/lib/queries
```

`src/lib/queries/film/GetAllFilms.ts`を作成します。これは、`src/lib/queries` に GraphQL リクエストで使うクエリをまとめて配置する想定です。`GetAllFilm.ts` に`GetAllFilms`というクエリを書きます。

```ts
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
```

上記コードで、`src/lib/gql/gql`をインポートしようとしていますが、今はありません。`src/lib/gql`内のファイルは、graphql-codegen によって自動作成されます。ですので、上記コードは現時点ではエラーになります。

### codegen.yml の作成

プロジェクトルートに下記の`codegen.yml`を作成します。

```
ignoreNoDocuments: true
schema: https://swapi-graphql.netlify.app/.netlify/functions/index
documents:
  - "src/lib/queries/**/*.ts"
generates:
  src/lib/gql/:
    preset: client-preset
    config:
      useTypeImports: true
```

### package.json の設定と graphql-codege の実行

下記を追加することで、`npm run codegen-watch`を実行したら、コードの変更がある度に graphql-codegen が実行されて、codegen.yml の設定内容に従って、`generates`で指定した場所に、`gql.ts`や`graphql.ts`等が生成されます。これにより、上記で作成した `GetAllFilms.ts` のコードがエラーがなくなります。あとは、この `GetAllFilms` を `urql` の Client にセットして実行すれば、GraphQL リクエストができます。

```json
"scripts": {
  "codegen-watch": "graphql-codegen --watch"
},
```

### GraphQL にリクエストする

`src/routes/+page.svelte`で、GraphQL リクエスト（GetAllFilms）をして、レスポンス内容を表示させてみます。

```svelte
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
```
