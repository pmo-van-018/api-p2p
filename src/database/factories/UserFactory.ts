import * as Faker from 'faker';
import { define } from 'typeorm-seeding';

import { Operation } from '../../api/profile/models/Operation';

define(Operation, (_faker: typeof Faker, _settings: { role: string }) => {
  // const gender = faker.random.number(1);
  // const firstName = faker.name.firstName(gender);
  // const lastName = faker.name.lastName(gender);
  // const email = faker.internet.email(firstName, lastName);
  // const username = faker.internet.userName(firstName, lastName);

  const user = new Operation();
  // user.id = uuid.v1();
  // user.firstName = firstName;
  // user.lastName = lastName;
  // user.email = email;
  // user.username = username;
  // user.password = '1234';
  return user;
});
