import * as wsAPI from './ws';
import * as pluginAPI from './plugin';

export default {
    ...wsAPI,
    ...pluginAPI,
}
