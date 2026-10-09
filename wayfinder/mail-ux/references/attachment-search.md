# Search inside attachments

Research for [ticket 009](../tickets/009-search-inside-attachments.md). Date: 2026-10-09.

Sources (primary unless marked):

- Stalwart source, `stalwartlabs/stalwart` `main` at `2f5b9f2` (2026-10-08); latest release v0.16.25 (2026-10-05):
  - indexer: [`crates/email/src/message/index/search.rs`](https://github.com/stalwartlabs/stalwart/blob/main/crates/email/src/message/index/search.rs)
  - JMAP query: [`crates/jmap/src/email/query.rs`](https://github.com/stalwartlabs/stalwart/blob/main/crates/jmap/src/email/query.rs)
  - snippets: [`crates/jmap/src/email/snippet.rs`](https://github.com/stalwartlabs/stalwart/blob/main/crates/jmap/src/email/snippet.rs)
  - filter enum: [`crates/jmap-proto/src/object/email.rs`](https://github.com/stalwartlabs/stalwart/blob/main/crates/jmap-proto/src/object/email.rs)
  - per-backend limits: [`crates/store/src/backend/postgres/search.rs`](https://github.com/stalwartlabs/stalwart/blob/main/crates/store/src/backend/postgres/search.rs), [`crates/store/src/search/index.rs`](https://github.com/stalwartlabs/stalwart/blob/main/crates/store/src/search/index.rs)
  - older code for comparison: [`v0.11.8 crates/email/src/index.rs`](https://github.com/stalwartlabs/stalwart/blob/v0.11.8/crates/email/src/index.rs)
- MIME classification: [`stalwartlabs/mail-parser` `src/parser/`](https://github.com/stalwartlabs/mail-parser/tree/main/src/parser) (`MimeClass::new`, `classify`).
- Stalwart docs: [Full-text search](https://www.stalw.art/docs/storage/fts), updated 2026-10-03.
- Stalwart support forum: [feature request "index text content of document attachments"](https://support.stalw.art/t/full-text-search-index-text-content-of-document-attachments-pdf-etc/1166), 2026-07-24, with a reply on 2026-08-10. No maintainer reply so far.
- [RFC 8621](https://www.rfc-editor.org/rfc/rfc8621.txt): §4.4.1 (Email/query filters) and §5 (SearchSnippet).
- Cyrus IMAP: [`imap/jmap_mail_query.c`](https://github.com/cyrusimap/cyrus-imapd/blob/master/imap/jmap_mail_query.c) and the [`search_attachment_extractor_url`](https://github.com/cyrusimap/cyrus-imapd/blob/master/lib/imapoptions/search_attachment_extractor_url) option. Fastmail runs on Cyrus.
- Elasticsearch: [attachment processor](https://www.elastic.co/docs/reference/enrich-processor/attachment).
- Vendor help pages: [Fastmail](https://www.fastmail.help/hc/en-us/articles/360060591213-Searching-your-mail), [Outlook](https://support.microsoft.com/en-us/office/learn-to-narrow-your-search-criteria-for-better-searches-in-outlook-d824d1e9-a255-4c8a-8553-276fb895a8da), [Exchange file formats](https://learn.microsoft.com/en-us/exchange/file-formats-indexed-by-exchange-search-exchange-2013-help), [Apple Mail](https://support.apple.com/guide/mail/mlhlp1003). For Gmail there are only press reports (secondary): [PCWorld 2012](https://www.pcworld.com/article/461493/gmail-adds-support-for-search-inside-message-attachments.html).
- Suite code at `wayfinder/mail-ux` (HEAD `6dc202882`).

## Summary

- **Stalwart never reads the text of binary attachments.** PDF, DOCX, XLSX, PPTX, ODT, RTF, and CSV or JSON sent as `application/*` are all skipped. No version has done this, no config key turns it on, and no search backend changes it.
- **Attachments that are already text do get indexed.** That covers any `text/*` part shown as an attachment (`.txt`, `.html`, `.csv` sent as `text/csv`, `.ics`, `.md`) and any attached email (`message/rfc822`). Their text goes into a separate `Attachment` field.
- **Suite's search already covers that field.** Suite sends free words as JMAP `text`, and Stalwart's `text` searches it. JMAP `body` does not.
- **Attachment filenames are not searchable**, and Stalwart rejects `attachmentName`. Suite has no `filename:` operator.
- **Suite does not call `SearchSnippet/get`.** It highlights the typed words in the subject and the stored preview on the client. So when a mail matches only through an attachment, the result shows no reason for the match.

## 1. What Stalwart's full-text index covers

### Which parts get indexed

`ArchivedMessageMetadata::index_document` in `search.rs` walks the message parts (up to `MAX_MESSAGE_PARTS = 1000`, `index/mod.rs`):

| Part kind (from mail-parser) | Indexed into | Notes |
| --- | --- | --- |
| `Text` / `Html` that is a text or HTML body part | `Body` | HTML is converted to text first |
| `Text` / `Html` that is any other part, i.e. an attachment | `Attachment` | catch-all `else` branch |
| `Message`, an attached `message/rfc822` or `message/global` | `Attachment` | the attached message's subject, plus its text and HTML parts |
| anything else (`Binary`, `InlineBinary`) | nothing | the `_ => {}` arm |

mail-parser decides what counts as text by MIME type alone (`MimeClass::new`):

- Text: any `text/*`, and a part with no Content-Type.
- Not text: `application/*`, including `application/pdf`, the OOXML types and `application/octet-stream`, and all images, audio and video.

So `application/pdf` and `application/vnd.openxmlformats-*` parts are never decoded for the index. A CSV labelled `application/vnd.ms-excel` or `application/octet-stream` is skipped too, which is common from some senders. The forum report gives the same reading of the source.

### History

The indexer code in v0.11.8 (`crates/email/src/index.rs`) indexes `PartType::Text` and `Html` attachments into `Field::Attachment` and skips binary parts. The 0.15 schema rewrite kept that behaviour. The latest commits touching `search.rs` (2026-03 `hasAttachment` fix, 2026-06 header fix) did not change it. The CHANGELOG has no entry about extracting attachment text.

### Config

These live on the `Search` singleton ([docs](https://www.stalw.art/docs/storage/fts); `crates/common/src/config/mailstore/email.rs`):

- `indexEmail`: whether email is indexed at all.
- `indexEmailFields`: a list of `from, to, cc, bcc, subject, body, attachment, receivedAt, sentAt, size, hasAttachment, headers`. An empty list means every field except `headers`, which only gets indexed when listed explicitly. Removing `attachment` stops even text attachments from being indexed.
- `defaultLanguage` and `supportedLanguages`: settings for language detection and stemming.

No key exists for binary extraction, OCR, or an extractor URL.

### Backends

The `SearchStore` options are the internal store (RocksDB, FoundationDB and the other data stores), PostgreSQL, MySQL, Elasticsearch and Meilisearch. All of them receive the same `IndexDocument` built by `index_document`, so none sees binary attachment content. The forum report confirms this for Elasticsearch, and the 2026-08-10 reply measured it on 0.16.16 with Meilisearch: of 5,233 mails with attachments, only 9% had any text in the `attach` field.

Each backend also has its own size limits:

- PostgreSQL cuts each text field at 650,000 bytes (`postgres/search.rs`).
- FoundationDB cuts terms at 1 MiB (`search/index.rs`).
- MySQL does no stemming (docs).

## 2. How JMAP exposes it

### RFC 8621 filters (§4.4.1)

- `text`: the server MUST search From, To, Cc, Bcc and Subject, and SHOULD search "any `text/*` or other body parts that may be converted to text by the server".
- `body`: searches one of the body parts. The server MAY exclude parts other than `text/*` and `message/*`.
- `hasAttachment`: compared to the Email's `hasAttachment` property.
- **No `attachmentName` or `attachmentType` in RFC 8621.** Those, plus `attachmentBody`, are Cyrus/Fastmail extensions (`jmap_mail_query.c`).

### What Stalwart does with them (`query.rs`)

- `text` becomes `OR(From, To, Cc, Bcc, Subject, Body, Attachment)`, so **`text` matches attachment text**.
- `body` searches the `Body` field only, so **`body` does not match attachments**.
- `EmailFilter` has no `attachmentName`, `attachmentType` or `attachmentBody`. An unknown filter returns `unsupportedFilter`. Filenames are not indexed under any field. `headers` covers only the root part's headers, and is off by default.

### `SearchSnippet/get`

RFC 8621 §5: `preview` is "the relevant section of the body" with `<mark>` around matches, up to 255 octets.

Stalwart (`snippet.rs`) builds the snippet when it is asked for:

1. It takes the terms from `text`, `subject` and `body` conditions.
2. It walks every `Text` and `Html` part in order, text attachments and attached emails included.
3. It returns the first excerpt that matches.

So for a text attachment the snippet can come from the attachment. The response has no field saying which part matched. Binary parts are never scanned. The number of `emailIds` per call is capped by `jmap.snippet_max_results`.

## 3. What Suite sends today

- **Frontend.** `parseMailSearchQuery` (`frontend/src/apps/mail/components/CommandPalette/searchQuery.ts`) maps operators to JMAP filters:
  - `from`, `to`, `cc`, `bcc`, `subject`, `after`, `before` map directly.
  - `has:attachment` and `has:no-attachment` map to `hasAttachment`.
  - `is:read` and `is:unread` map to `isRead`.
  - Every other word becomes **`text`**.
  - There is no `body:`, `filename:` or `filetype:` operator.
- **Composable.** `useMailCommandPaletteSearch.ts` merges the filter badges with the parsed query and calls `search_mails`.
- **Backend.** `search_mails` → `normalize_filter` (`suite/mail/api/mail.py`) turns `hasAttachment` and `isRead` into JMAP types and joins all conditions under AND. `search_messages` → `fetch_messages` (`suite/mail/doctype/mail_message/mail_message.py`) runs `Email/query` plus `Email/get` and returns the stored `preview`.
- **No snippets.** Nothing in `suite/mail` calls `SearchSnippet/get`, although the installed `jmaplib` 3.0.1 has `SearchSnippetGettable`.
- **Highlighting.** `MailListItem.vue` and `MailSearchResult.vue` highlight the typed words in subject, sender and the stored preview with `HighlightedText`. `MailListItem` shows up to two attachment capsules by filename. The palette result shows only an attachment count.
- **Effect.** A word that appears only in a `.txt` or `.ics` attachment, or in an attached email, finds the mail today, but the row shows nothing highlighted. A word that appears only inside a PDF or DOCX finds nothing.

### Stalwart version on the bench

- The bench site's `server_url` is `https://mail.frappemail.com/`, a remote server.
- Its unauthenticated endpoints return `server: Frappe Cloud` and no version. I did not query its version with credentials.
- CI and the test compose file pin `stalwartlabs/stalwart:v0.16.20` (`.github/workflows/suite-ci.yml`, `suite/mail/tests/docker/docker-compose.yml`).
- Every version from 0.11.8 to `main` behaves as described above, so the answer does not depend on which of them the server runs.

## 4. Cost

### If Stalwart extracted text, or Suite added it

- **CPU.** PDF and OOXML parsing is the costly step. Elastic's docs call Tika extraction "a resource intensive operation" and recommend dedicated ingest nodes. The forum reply asks for extraction to run asynchronously with timeouts, a cache keyed by blob hash (the same attachment arrives many times), and a per-tenant switch.
- **Index size.** The extracted text of a PDF or DOCX is usually far smaller than the file, since images, fonts and compression are dropped. I found no Stalwart measurement. Index growth would be roughly the attachment text plus stems. The internal store's write amplification (docs) makes this cost more than on Elasticsearch or Meilisearch.
- **Limits.** Stalwart has no limit on attachment size for indexing beyond the per-backend cuts above. Comparable systems cap it:
  - Elasticsearch's attachment processor indexes 100,000 characters by default (`indexed_chars`).
  - Exchange indexes files up to 32 MB by default.
  - Any Stalwart extension would need its own limit.
- **OCR.** None in Stalwart. Tika can OCR only with Tesseract installed, which costs much more again. Scanned PDFs stay unsearchable in every option below unless OCR is added on purpose. Not recommended.
- **Backfill.** Existing mail needs a reindex. Stalwart has `reindex`; the CHANGELOG has fixes to it.

## 5. How other clients present attachment matches

| Client | Searches attachment text? | How a match shows |
| --- | --- | --- |
| Gmail | Yes since 2012: PDF, Office (press reports; Google's own help only documents `has:attachment` and `filename:`) | Not documented. Rows in Default density show attachment chips; no documented highlight of the matching chip. |
| Fastmail | Yes: "can find terms inside attachments as well as in file names". `attached:` searches attachments only, `body:` leaves them out, plus `filename:` and `filetype:` | Not documented. Cyrus behind it uses an external extractor (`search_attachment_extractor_url`, an HTTP GET/PUT protocol, Xapian only) |
| Outlook / Exchange | Yes: "scans both email messages and many types of attachments". PDF, Office, ODF, RTF, txt, html, zip, msg, eml. Files ≤ 32 MB on-prem | Not documented in the help pages checked |
| Apple Mail | Not documented. The current help covers "Message with attachments" only | Not documented |

No vendor documents a snippet from inside the attachment. The common pattern is a mail row with its attachment chips plus operators to narrow the search (`filename:`, `filetype:`, `attached:`/`has:attachment`). Some say it is unclear whether Gmail highlights the chip; that is not verified here.

## Decision options

These don't depend on each other: the UX options (A, B) can ship whatever happens to extraction (C, D, E).

- **A. Explain the matches Suite already gets.**
  - Call `SearchSnippet/get` for the result page and show its `<mark>` preview in place of the stored preview.
  - This also fixes body matches deep in a mail, which the stored 256-character preview misses today.
  - It needs one extra JMAP call per page and no server change.
  - It still can't say "matched in attachment X": Stalwart's snippet does not name the part.
- **B. Add operators the server supports.** `body:` (searches the message body only, no attachments) maps to JMAP `body`. A `filename:` operator is **not possible** on Stalwart today: no filter, and filenames are not indexed.
- **C. Upstream extraction in Stalwart.**
  - Contribute, or ask for, opt-in text extraction for PDF and OOXML into the existing `Attachment` field.
  - It should have a size cap, a blob-hash cache and async indexing.
  - Matches then flow through `text` with no Suite change, and work on every backend.
  - There is an open forum request with no maintainer reply. We would have to wait or carry a patch. This fixes the problem where it lives.
- **D. Upstream a Cyrus-style extractor hook in Stalwart.**
  - Stalwart would PUT each binary attachment to a configured HTTP extractor (Tika server) and index the text it returns.
  - It covers the most formats and keeps parsing out of the mail server.
  - It needs a Stalwart change plus a new service to run. Per the map, a service outside the mail server is flagged and decided on its own.
- **E. A sidecar index in Suite.**
  - Suite would fetch blobs on new mail, extract the text in Python, keep its own index, and merge its hits with `Email/query`.
  - No server change is needed. The costs are a second index to keep in sync (moves, deletes, sharing), and fetching every attachment.
  - This works around the server, against the map's "fix the underlying problem". Not recommended unless C and D are both blocked.

Not recommended in any option: OCR for scanned PDFs.
