// These are hack resolvers to get over some module resolution issues, with a PR to fix them upstream.

import type { ResolverProps, ResolverResult } from "./shared"

// Last resort resolver for weird packages:
export async function handleHacks({
  specifier,
  dependency
}: ResolverProps): Promise<ResolverResult> {
  switch (specifier) {
    // Example of a resolved hack:
    // TODO: remove this when we have other hacks here...
    // case "svelte/internal/disclose-version": {
    //   // https://github.com/sveltejs/svelte/pull/8874
    //   const sveltePjPath = require.resolve("svelte/package.json", {
    //     paths: [dependency.resolveFrom]
    //   })

    //   return {
    //     filePath: join(
    //       dirname(sveltePjPath),
    //       "src",
    //       "runtime",
    //       "internal",
    //       "disclose-version",
    //       "index.js"
    //     )
    //   }
    // }

    default:
      return null
  }
}
