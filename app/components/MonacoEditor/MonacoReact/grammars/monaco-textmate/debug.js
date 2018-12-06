/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
export const CAPTURE_METADATA = typeof process === 'undefined' ? false : !!process.env['VSCODE_TEXTMATE_DEBUG'];
export const IN_DEBUG_MODE = typeof process === 'undefined' ? false : !!process.env['VSCODE_TEXTMATE_DEBUG'];
