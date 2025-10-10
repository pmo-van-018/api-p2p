import { Action, ActionMetadata, ExpressDriver } from 'routing-controllers';
import { AccessDeniedError, AuthorizationCheckerNotDefinedError, AuthorizationRequiredError } from './error';
import { isPromiseLike } from './utils';

export class ExpressDriverCustom extends ExpressDriver {
  registerValidatorAction(actionMetadata: ActionMetadata, executeValidatorCallback: (options: Action) => any): void {
    // custom middlewares required for this action
    const defaultValidatorMiddleware: any[] = [];

    if (actionMetadata.isBodyUsed) {
      if (actionMetadata.isJsonTyped) {
        defaultValidatorMiddleware.push(this.loadBodyParser().json(actionMetadata.bodyExtraOptions));
      } else {
        defaultValidatorMiddleware.push(this.loadBodyParser().text(actionMetadata.bodyExtraOptions));
      }
    }

    if (actionMetadata.isFileUsed || actionMetadata.isFilesUsed) {
      const multer = this.loadMulter();
      actionMetadata.params
        .filter((param) => param.type === 'file')
        .forEach((param) => {
          defaultValidatorMiddleware.push(multer(param.extraOptions).single(param.name));
        });
      actionMetadata.params
        .filter((param) => param.type === 'files')
        .forEach((param) => {
          defaultValidatorMiddleware.push(multer(param.extraOptions).array(param.name));
        });
    }

    // prepare route and route handler function
    const route = ActionMetadata.appendBaseRoute(this.routePrefix, actionMetadata.fullRoute);
    const routeValidatorHandler = function routeHandler(request: any, response: any, next: Function) {
      return executeValidatorCallback({ request, response, next });
    };

    // finally register action in express
    this.express[actionMetadata.type.toLowerCase()](...[route, ...defaultValidatorMiddleware, routeValidatorHandler]);
  }

  registerAction(actionMetadata: ActionMetadata, executeCallback: (options: Action) => any): void {
    // middlewares required for this action
    const defaultMiddlewares: any[] = [];

    if (actionMetadata.isAuthorizedUsed) {
      defaultMiddlewares.push((request: any, response: any, next: Function) => {
        if (!this.authorizationChecker) throw new AuthorizationCheckerNotDefinedError();

        const action: Action = { request, response, next };
        try {
          const checkResult = this.authorizationChecker(action, actionMetadata.authorizedRoles);

          const handleError = (result: any) => {
            if (!result) {
              const error =
                actionMetadata.authorizedRoles.length === 0
                  ? new AuthorizationRequiredError(action)
                  : new AccessDeniedError(action);
              this.handleError(error, actionMetadata, action);
            } else {
              next();
            }
          };

          if (isPromiseLike(checkResult)) {
            checkResult
              .then((result) => handleError(result))
              .catch((error) => this.handleError(error, actionMetadata, action));
          } else {
            handleError(checkResult);
          }
        } catch (error) {
          this.handleError(error, actionMetadata, action);
        }
      });
    }

    // user used middlewares
    const uses = [...actionMetadata.controllerMetadata.uses, ...actionMetadata.uses];
    const beforeMiddlewares = this.prepareMiddlewares(uses.filter((use) => !use.afterAction));
    const afterMiddlewares = this.prepareMiddlewares(uses.filter((use) => use.afterAction));

    // prepare route and route handler function
    const route = ActionMetadata.appendBaseRoute(this.routePrefix, actionMetadata.fullRoute);
    const routeHandler = function routeHandler(request: any, response: any, next: Function) {
      return executeCallback({ request, response, next });
    };

    // This ensures that a request is only processed once to prevent unhandled rejections saying
    // "Can't set headers after they are sent"
    // Some examples of reasons a request may cause multiple route calls:
    // * Express calls the "get" route automatically when we call the "head" route:
    //   Reference: https://expressjs.com/en/4x/api.html#router.METHOD
    //   This causes a double execution on our side.
    // * Multiple routes match the request (e.g. GET /users/me matches both @All(/users/me) and @Get(/users/:id)).
    // The following middleware only starts an action processing if the request has not been processed before.
    const routeGuard = function routeGuard(request: any, _: any, next: Function) {
      if (!request.routingControllersStarted) {
        request.routingControllersStarted = true;
        return next();
      }
    };

    // finally register action in express
    this.express[actionMetadata.type.toLowerCase()](
      ...[route, routeGuard, ...beforeMiddlewares, ...defaultMiddlewares, routeHandler, ...afterMiddlewares]
    );
  }
}
