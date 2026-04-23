// lib/markdown.ts
// Server-side markdown → HTML conversion using the remark/rehype pipeline.
// Call this in Server Components only — never on the client.

import { unified }              from 'unified'
import remarkParse              from 'remark-parse'
import remarkGfm                from 'remark-gfm'
import remarkRehype             from 'remark-rehype'
import rehypeRaw                from 'rehype-raw'
import rehypeSlug               from 'rehype-slug'
import rehypeAutolinkHeadings   from 'rehype-autolink-headings'
import rehypeStringify          from 'rehype-stringify'

export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)              // tables, strikethrough, task lists, autolinks
    .use(remarkRehype, {
      allowDangerousHtml: true,  // pass raw HTML embedded in markdown through
    })
    .use(rehypeRaw)              // parse that embedded HTML
    .use(rehypeSlug)             // add id="" to every heading for anchor links
    .use(rehypeAutolinkHeadings, {
      behavior: 'wrap',          // wrap heading text in <a> so the whole line is clickable
    })
    .use(rehypeStringify)
    .process(markdown)

  return String(result)
}
