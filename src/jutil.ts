// Copyright IBM Corp. 2011,2019. All Rights Reserved.
// Node module: loopback-datasource-juggler
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import util from 'util';

const DEFAULT_INHERITANCE_OPTIONS: InheritanceOptions = {
  staticProperties: true,
  override: false,
}

interface InheritanceOptions {
  staticProperties?: boolean,
  override?: boolean,
}

interface MixinOptions extends InheritanceOptions {
  instanceProperties?: boolean,
  proxyFunctions?: boolean,
}

const DEFAULT_MIXIN_OPTIONS: MixinOptions = {
  staticProperties: true,
  instanceProperties: true,
  override: false,
  proxyFunctions: false,
}

/**
 *
 * @param newClass
 * @param baseClass
 */
export function inherits(newClass: Function, baseClass: Function, options: InheritanceOptions = DEFAULT_INHERITANCE_OPTIONS) {
  util.inherits(newClass, baseClass);

  if (options.staticProperties) {
    Object.keys(baseClass).forEach(function(classProp) {
      if (classProp !== 'super_' && (!newClass.hasOwnProperty(classProp) ||
          options.override)) {
        const pd = Object.getOwnPropertyDescriptor(baseClass, classProp);
        Object.defineProperty(newClass, classProp, pd);
      }
    });
  }
};

export type MixinClass = Function & {
  _mixins?: Function[]
}

/**
 * Mix in the a class into the new class
 * @param newClass The target class to receive the mixin
 * @param mixinClass The class to be mixed in
 * @param options
 */
export function mixin(newClass: MixinClass, mixinClass: MixinClass, options: MixinOptions = DEFAULT_MIXIN_OPTIONS) {
  if (Array.isArray(newClass._mixins)) {
    if (newClass._mixins.indexOf(mixinClass) !== -1) {
      return;
    }
    newClass._mixins.push(mixinClass);
  } else {
    newClass._mixins = [mixinClass];
  }

  if (options.staticProperties === undefined) {
    options.staticProperties = true;
  }

  if (options.instanceProperties === undefined) {
    options.instanceProperties = true;
  }

  if (options.staticProperties) {
    mixInto(mixinClass, newClass, options);
  }

  if (options.instanceProperties && mixinClass.prototype) {
    mixInto(mixinClass.prototype, newClass.prototype, options);
  }

  return newClass;
};

function mixInto(sourceScope: MixinClass, targetScope: MixinClass, options: MixinOptions) {
  Object.keys(sourceScope).forEach(function(propertyName) {
    const targetPropertyExists = targetScope.hasOwnProperty(propertyName);
    const sourceProperty = Object.getOwnPropertyDescriptor(sourceScope, propertyName);
    const targetProperty = targetPropertyExists && Object.getOwnPropertyDescriptor(targetScope, propertyName);
    const sourceIsFunc = typeof sourceProperty.value === 'function';
    const isFunc = targetPropertyExists && typeof targetProperty.value === 'function';
    const isDelegate = isFunc && targetProperty.value._delegate;
    const shouldOverride = options.override || !targetPropertyExists || isDelegate;

    if (propertyName == '_mixins') {
      mergeMixins(sourceScope._mixins, targetScope._mixins);
      return;
    }

    if (shouldOverride) {
      Object.defineProperty(targetScope, propertyName, sourceProperty);
    }
  });
}

function mergeMixins(source: MixinClass['_mixins'], target: MixinClass['_mixins']) {
  // hand-written equivalent of lodash.union()
  for (const ix in source) {
    const mx = source[ix];
    if (target.indexOf(mx) === -1)
      target.push(mx);
  }
}
