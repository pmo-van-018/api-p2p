export class PostByPaymentMethodResponse {
  public posts: PostByPaymentMethodDetail[] | [];
  constructor(data: any) {
    this.posts = data.map((item) => new PostByPaymentMethodDetail(item));
  }
}

export class PostByPaymentMethodDetail {
  public refId?: string;
  constructor(data: any) {
    this.refId = data.refId;
  }
}
