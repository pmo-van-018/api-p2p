import agent from 'elastic-apm-node/start';

export async function wrapRootSpan(name: string, delegate: any) {
  const transaction = agent.startTransaction(name);
  try {
    const result = await delegate();
    transaction.result = 'success';
    return result;
  } finally {
    transaction?.end();
  }
}

export function Tracing() {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      return await wrapRootSpan(
        target.constructor.name + ':' + (propertyKey as any),
        originalMethod.bind(this, ...args)
      );
    };

    return descriptor;
  };
}

export async function wrapSpan(name: string, delegate: any) {
  const span = agent.startSpan(name);
  try {
    return await delegate();
  } finally {
    span?.end();
  }
}

export function Spanning() {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      return await wrapSpan(
        target.constructor.name + ':' + (propertyKey as any),
        originalMethod.bind(this, ...args)
      );
    };

    return descriptor;
  };
}
