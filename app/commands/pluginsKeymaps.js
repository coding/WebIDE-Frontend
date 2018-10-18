import { flatten } from 'lodash'
import { flattenKeyMaps } from './lib/helpers'
/**
 * ```typescript
 * interface IKeyMaps {
 *    command: string;
 *    mac: string;
 *    win: string;
 * }
 * interface IPluginKeyMaps {
 *    name: string;
 *    keymaps: Array<IKeyMaps>;
 * }
 * ```
 */

let pluginsKeymaps = []

const allKeymaps = flatten(pluginsKeymaps.map((km) => km.keymaps))
export const pluinKeymapsForPlatform = flattenKeyMaps(allKeymaps)

export default pluginsKeymaps
