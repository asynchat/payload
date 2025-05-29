import type { DeleteGlobalVersions } from 'payload'

import { inArray } from 'drizzle-orm'
import { buildVersionGlobalFields } from 'payload'
import toSnakeCase from 'to-snake-case'

import type { DrizzleAdapter } from './types.js'

import { findMany } from './find/findMany.js'
import { getTransaction } from './utilities/getTransaction.js'

export const deleteGlobalVersions: DeleteGlobalVersions = async function deleteVersion(
  this: DrizzleAdapter,
  { slug: globalSlug, locale, req, where: where },
) {
  const db = await getTransaction(this, req)
  const globalConfig = this.payload.globals.config.find(({ slug }) => slug === globalSlug)

  const tableName = this.tableNameMap.get(`_${toSnakeCase(globalSlug)}${this.versionsSuffix}`)

  const fields = buildVersionGlobalFields(this.payload.config, globalConfig, true)

  const { docs } = await findMany({
    adapter: this,
    fields,
    joins: false,
    limit: 0,
    locale,
    page: 1,
    pagination: false,
    req,
    tableName,
    where,
  })

  const ids = []

  docs.forEach((doc) => {
    ids.push(doc.id)
  })

  if (ids.length > 0) {
    await this.deleteWhere({
      db,
      tableName,
      where: inArray(this.tables[tableName].id, ids),
    })
  }

  return docs
}
