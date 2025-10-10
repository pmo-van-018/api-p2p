class FieldError {
  public key: string;

  public message: string;

  public property: string;
}
export class P2PRequestErrors extends Error {
  public errors: FieldError[];

  constructor(errors: any) {
    super();
    this.errors = errors.flatMap(
      (error: any) => Object.keys(error.constraints)
        .map((key: string) => ({
          key,
          message: error.constraints[key],
          property: error.property,
        }))
    );
  }
}
