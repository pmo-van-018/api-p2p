import { RoutingControllersOptions } from 'routing-controllers/types/RoutingControllersOptions';
import { RoutingControllers } from 'routing-controllers/cjs/RoutingControllers';
import { Action, ActionMetadata } from 'routing-controllers';
import { isPromiseLike } from './utils';
import { ParamRequiredError } from './error';

export class RoutingControllersCustom<T> extends RoutingControllers<T> {
  constructor(driver: T, options: RoutingControllersOptions) {
    super(driver, options);
  }

  registerValidatorControllers(classes?: Function[]): this {
    const t = this as any;
    const controllers = t.metadataBuilder.buildControllerMetadata(classes);
    controllers.forEach((controller: any) => {
      controller.actions.forEach((actionMetadata: any) => {
        t.driver.registerValidatorAction(actionMetadata, (action: Action) => {
          return t.executeValidatorAction(actionMetadata, action);
        });
      });
    });
    t.driver.registerRoutes();
    return this;
  }

  registerControllers(classes?: Function[]): this {
    const t = this as any;
    const controllers = t.metadataBuilder.buildControllerMetadata(classes);
    controllers.forEach((controller: any) => {
      controller.actions.forEach((actionMetadata: any) => {
        const interceptorFns = t.prepareInterceptors([
          ...t.interceptors,
          ...actionMetadata.controllerMetadata.interceptors,
          ...actionMetadata.interceptors,
        ]);
        t.driver.registerAction(actionMetadata, (action: Action) => {
          return t.executeAction(actionMetadata, action, interceptorFns);
        });
      });
    });
    t.driver.registerRoutes();
    return this;
  }

  protected executeValidatorAction(actionMetadata: ActionMetadata, action: Action, _interceptorFns: Function[]) {
    const t = this as any;
    // compute all parameters
    const paramsPromises = actionMetadata.params
      .sort((param1, param2) => param1.index - param2.index)
      .map((param) => t.handleWithoutAuth(action, param));

    // after all parameters are computed
    return Promise.all(paramsPromises)
      .then((_params) => {
        return action.next();
      })
      .catch((error) => {
        // otherwise simply handle error without action execution
        return t.driver.handleError(error, actionMetadata, action);
      });
  }

  protected executeAction(actionMetadata: ActionMetadata, action: Action, interceptorFns: Function[]) {
    const t = this as any;
    const paramsPromises = actionMetadata.params
      .sort((param1, param2) => param1.index - param2.index)
      .map(param => t.parameterHandler.handle(action, param));

    // after all parameters are computed
    return Promise.all(paramsPromises)
      .then(params => {
        // execute action and handle result
        const allParams = actionMetadata.appendParams ? actionMetadata.appendParams(action).concat(params) : params;
        const result = actionMetadata.methodOverride
          ? actionMetadata.methodOverride(actionMetadata, action, allParams)
          : actionMetadata.callMethod(allParams, action);
        return t.handleCallMethodResult(result, actionMetadata, action, interceptorFns);
      })
      .catch(error => {
        // otherwise simply handle error without action execution
        return t.driver.handleError(error, actionMetadata, action);
      });

  }

  handleWithoutAuth(action, param) {
    const t = this as any;
    if (param.type === 'request') return action.request;
    if (param.type === 'response') return action.response;
    if (param.type === 'context') return action.context;
    // get parameter value from request and normalize it
    const value = t.parameterHandler['normalizeParamValue'](t.driver.getParamFromRequest(action, param), param);
    if (isPromiseLike(value)) return value.then((v) => t.handleValueWithoutAuth(v, action, param));
    return this.handleValueWithoutAuth(value, action, param);
  }
  // -------------------------------------------------------------------------
  // Protected Methods
  // -------------------------------------------------------------------------
  /**
   * Handles non-promise value.
   */
  handleValueWithoutAuth(value, action, param) {
    // if transform function is given for this param then apply it
    if (param.transform) value = param.transform(action, value);
    // if its current-user decorator then get its value
    // check cases when parameter is required but its empty and throw errors in this case
    if (param.required) {
      const isValueEmpty = value === null || value === undefined || value === '';
      const isValueEmptyObject = typeof value === 'object' && Object.keys(value).length === 0;
      if (param.type === 'body' && !param.name && (isValueEmpty || isValueEmptyObject)) {
        // body has a special check and error message
        return Promise.reject(new ParamRequiredError(action, param));
      } else if (param.name && isValueEmpty) {
        // regular check for all other parameters // todo: figure out something with param.name usage and multiple things params (query params, upload files etc.)
        return Promise.reject(new ParamRequiredError(action, param));
      }
    }
    return value;
  }
}
