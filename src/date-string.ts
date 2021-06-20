// Copyright IBM Corp. 2017,2019. All Rights Reserved.
// Node module: loopback-datasource-juggler
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import { CustomInspectFunction, inspect } from "util";

/**
 * A String whose value is a valid representation of a Date.
 * Use this type if you need to preserve the format of the value and still
 * check if it's valid.
 * Example:
 * 
 * @remarks
 * ```js
 * var loopback = require('loopback');
 * var dt = new loopback.DateString('2001-01-01');
 *
 * dt.toString();
 * // '2001-01-01'
 * dt._date.toISOString();
 * // '2001-01-01T00:00:00.000Z'
 * ```
 *
 * You can use this definition on your models as well:
 * ```json
 * {
 *   "name": "Person",
 *   "base": "PersistedModel",
 *   "properties": {
 *     "name": {
 *       "type": "string"
 *     },
 *     "dob": {
 *       "type": "DateString",
 *       "required": true
 *     },
 *   },
 *   "validations": [],
 *   "relations": {},
 *   "acls": [],
 *   "methods": {}
 * }
 * ```
 */
exports = class DateString {
  private _when: string;
  private _date: Date;

  get when() {
    return this._when;
  }

  set when(val: string) {
    const d = new Date(val);
    if (isNaN(d.getTime())) {
      throw new Error('Invalid date');
    } else {
      this._when = val;
      this._date = d;
    }
  }

  /**
   * 
   * @param value
   */
  constructor(value: string | DateString) {
    if (!(this instanceof DateString))
      return new DateString(value);
  
    if (value instanceof DateString)
      value = value.when;
  
    if (typeof(value) !== 'string')
      throw new Error('Input must be a string');
  
    this.when = value;
  }

  /**
   * Returns the value of DateString in its original form.
   * @returns The Date as a String.
   */
  toString(): string {
    return this.when;
  }

  /**
   * Returns the JSON representation of the DateString object.
   * @returns A JSON string.
   */
  toJSON(): string {
    return JSON.stringify({
      when: this.when,
    })
  }

  inspect: CustomInspectFunction = (depth, options) => this[inspect.custom](depth, options);

  [inspect.custom]: CustomInspectFunction = (...[,,]) => {
    return 'DateString ' + inspect({
      when: this.when,
      _date: this._date,
    });
  }
}
