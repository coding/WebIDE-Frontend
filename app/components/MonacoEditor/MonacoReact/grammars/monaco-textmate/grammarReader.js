/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
import * as plist from 'fast-plist';
import { CAPTURE_METADATA } from './debug';
import { parse as manualParseJSON } from './json';
export function parseJSONGrammar(contents, filename) {
    if (CAPTURE_METADATA) {
        return manualParseJSON(contents, filename, true);
    }
    return JSON.parse(contents);
}
export function parsePLISTGrammar(contents, filename) {
    if (CAPTURE_METADATA) {
        return plist.parseWithLocation(contents, filename, '$vscodeTextmateLocation');
    }
    return plist.parse(contents);
}
