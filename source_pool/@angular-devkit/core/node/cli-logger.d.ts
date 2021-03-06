/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { logging } from '@angular-devkit/core';
/**
 * A Logger that sends information to STDOUT and STDERR.
 */
export declare function createConsoleLogger(verbose?: boolean): logging.Logger;
