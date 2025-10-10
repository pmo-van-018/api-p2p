import * as nock from 'nock';
import request from 'supertest';

import { OrderStatus } from '../../../../src/api/models/Order';
import { mockPostBuyOnline } from '../../../mocks/data/PostData';
import { mockUser } from '../../../mocks/data/UserData';
import { MockUtils } from '../../../mocks/MockUtils';
import { BootstrapSettings } from '../../../utils/bootstrap';
import { closeDatabase } from '../../../utils/database';
import { prepareServer } from '../../../utils/server';

describe('Test create buy order controller', () => {
  let settings: BootstrapSettings;
  const apiUrl = '/api/user-order/buy-crypto';
  let dataRequest;

  // -------------------------------------------------------------------------
  // Setup up
  // -------------------------------------------------------------------------

  beforeAll(async () => {
    settings = await prepareServer();
    MockUtils.mockOrm();
  });

  afterAll(async () => {
    nock.cleanAll();
    await closeDatabase(settings.connection);
  });

  beforeEach(() => {
    const user = mockUser();
    const post = mockPostBuyOnline();
    dataRequest = {
      amount: 11,
      postId: post.id,
      price: post.realPrice,
      userId: user.id,
    };
  });

  // -------------------------------------------------------------------------
  // Tests
  // -------------------------------------------------------------------------
  test('Body request is empty', async () => {
    const response = await request(settings.app).post(apiUrl).expect('Content-Type', /json/).expect(412);
    expect(response.body.data).toBeNull();
    expect(response.body.errors).not.toBeNull();
  });

  test('Should new order when data is valid', async () => {
    const response = await request(settings.app)
      .post(apiUrl)
      .send(dataRequest)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.errors).toBeNull();
    expect(response.body.data).not.toBeNull();
    expect(response.body.data.price).toBe(dataRequest.price);
    expect(response.body.data.amount).toBe(dataRequest.amount);
    expect(response.body.data.status).toBe(OrderStatus[OrderStatus.TO_BE_PAID]);
  });
});
