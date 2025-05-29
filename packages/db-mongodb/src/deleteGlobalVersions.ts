import type { DeleteGlobalVersions } from 'payload'

import { buildVersionGlobalFields } from 'payload'

import type { MongooseAdapter } from './index.js'

import { buildQuery } from './queries/buildQuery.js'
import { getGlobal } from './utilities/getEntity.js'
import { getSession } from './utilities/getSession.js'

export const deleteGlobalVersions: DeleteGlobalVersions = async function deleteVersions(
  this: MongooseAdapter,
  { slug: globalSlug, locale, req, where },
) {
  const { globalConfig, Model } = getGlobal({
    adapter: this,
    globalSlug,
    versions: true,
  })

  const session = await getSession(this, req)

  const query = await buildQuery({
    adapter: this,
    fields: buildVersionGlobalFields(this.payload.config, globalConfig, true),
    locale,
    where,
  })

  await Model.deleteMany(query, { session })
}
