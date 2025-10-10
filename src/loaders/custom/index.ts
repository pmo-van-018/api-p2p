import {
  BaseDriver,
  RoutingControllersOptions,
  useExpressServer as useExpressServerDefault,
} from 'routing-controllers';
import { ValidationOptions } from 'class-validator';
import * as path from 'path';
import { ExpressDriverCustom } from './expressDriver';
import { RoutingControllersCustom } from './routingControllers';

export enum ExpressServerAdapter {
  DEFAULT = 'DEFAULT',
  CUSTOM = 'CUSTOM',
}

export function useFactoryExpressServer<T>(
  adapter: string | ExpressServerAdapter,
  expressServer: T,
  options?: RoutingControllersOptions
): T {
  switch (adapter) {
    case ExpressServerAdapter.DEFAULT:
      return useExpressServerDefault(expressServer, options);
    case ExpressServerAdapter.CUSTOM:
      return useExpressServer(expressServer, options);
    default:
      throw new Error('missing express adapter');
  }
}

export function useExpressServer<T>(expressServer: T, options?: RoutingControllersOptions): T {
  const driver = new ExpressDriverCustom(expressServer);
  return createServer(driver, options);
}

export function createServer<T extends BaseDriver>(driver: T, options?: RoutingControllersOptions): any {
  createExecutor(driver, options);
  return driver.app;
}
export function createExecutor<T extends BaseDriver>(driver: T, options: RoutingControllersOptions = {}): void {
  // import all controllers and middlewares and error handlers (new way)
  let controllerClasses: Function[];
  if (options && options.controllers && options.controllers.length) {
    controllerClasses = (options.controllers as any[]).filter((controller) => controller instanceof Function);
    const controllerDirs = (options.controllers as any[]).filter((controller) => typeof controller === 'string');
    controllerClasses.push(...importClassesFromDirectories(controllerDirs));
  }
  let middlewareClasses: Function[];
  if (options && options.middlewares && options.middlewares.length) {
    middlewareClasses = (options.middlewares as any[]).filter((controller) => controller instanceof Function);
    const middlewareDirs = (options.middlewares as any[]).filter((controller) => typeof controller === 'string');
    middlewareClasses.push(...importClassesFromDirectories(middlewareDirs));
  }
  let interceptorClasses: Function[];
  if (options && options.interceptors && options.interceptors.length) {
    interceptorClasses = (options.interceptors as any[]).filter((controller) => controller instanceof Function);
    const interceptorDirs = (options.interceptors as any[]).filter((controller) => typeof controller === 'string');
    interceptorClasses.push(...importClassesFromDirectories(interceptorDirs));
  }

  if (options && options.development !== undefined) {
    driver.developmentMode = options.development;
  } else {
    driver.developmentMode = process.env.NODE_ENV !== 'production';
  }

  if (options.defaultErrorHandler !== undefined) {
    driver.isDefaultErrorHandlingEnabled = options.defaultErrorHandler;
  } else {
    driver.isDefaultErrorHandlingEnabled = true;
  }

  if (options.classTransformer !== undefined) {
    driver.useClassTransformer = options.classTransformer;
  } else {
    driver.useClassTransformer = true;
  }

  if (options.validation !== undefined) {
    driver.enableValidation = !!options.validation;
    if (options.validation instanceof Object) driver.validationOptions = options.validation as ValidationOptions;
  } else {
    driver.enableValidation = true;
  }

  driver.classToPlainTransformOptions = options.classToPlainTransformOptions;
  driver.plainToClassTransformOptions = options.plainToClassTransformOptions;

  if (options.errorOverridingMap !== undefined) driver.errorOverridingMap = options.errorOverridingMap;

  if (options.routePrefix !== undefined) driver.routePrefix = options.routePrefix;

  if (options.currentUserChecker !== undefined) driver.currentUserChecker = options.currentUserChecker;

  if (options.authorizationChecker !== undefined) driver.authorizationChecker = options.authorizationChecker;

  driver.cors = options.cors;

  // next create a controller executor
  (new RoutingControllersCustom(driver, options) as any)
    .initialize()
    .registerInterceptors(interceptorClasses)
    .registerValidatorControllers(controllerClasses)
    .registerMiddlewares('before', middlewareClasses)
    .registerControllers(controllerClasses)
    .registerMiddlewares('after', middlewareClasses); // todo: register only for loaded controllers?
}

export function importClassesFromDirectories(directories: string[], formats = ['.js', '.ts', '.tsx']): Function[] {
  const loadFileClasses = function (exported: any, allLoaded: Function[]) {
    if (exported instanceof Function) {
      allLoaded.push(exported);
    } else if (exported instanceof Array) {
      exported.forEach((i: any) => loadFileClasses(i, allLoaded));
    } else if (exported instanceof Object || typeof exported === 'object') {
      Object.keys(exported).forEach((key) => loadFileClasses(exported[key], allLoaded));
    }

    return allLoaded;
  };

  const allFiles = directories.reduce((allDirs, dir) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return allDirs.concat(require('glob').sync(path.normalize(dir)));
  }, [] as string[]);

  const dirs = allFiles
    .filter((file) => {
      const dtsExtension = file.substring(file.length - 5, file.length);
      return formats.indexOf(path.extname(file)) !== -1 && dtsExtension !== '.d.ts';
    })
    .map((file) => {
      return require(file);
    });

  return loadFileClasses(dirs, []);
}
