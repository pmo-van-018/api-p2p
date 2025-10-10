import { useContainer as classValidatorUseContainer } from 'class-validator';
import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import { useContainer as routingUseContainer } from 'routing-controllers';
import { Container } from 'typedi';
import { useContainer as ormUseContainer } from 'typeorm';

export const iocLoader: MicroframeworkLoader = (settings: MicroframeworkSettings | undefined) => {
  /**
   * Setup routing-controllers to use typedi container.
   */
  routingUseContainer(Container, {
    fallback: true,
    fallbackOnErrors: true,
  });
  ormUseContainer(Container, {
    fallback: true,
    fallbackOnErrors: true,
  });
  classValidatorUseContainer(Container, {
    fallback: true,
    fallbackOnErrors: true,
  });
};
