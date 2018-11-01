import * as globalAPI from './global';
import * as wsAPI from './ws';
import * as pluginAPI from './plugin';

export default {
    ...globalAPI,
    ...wsAPI,
    ...pluginAPI,
}
