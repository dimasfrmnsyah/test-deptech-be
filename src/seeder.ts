import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import typeormConfig from 'config/typeorm.config';
import { User } from './modules/users/entities/user.entity';
(async () => {
  const options = typeormConfig();
  const ds = new DataSource(options);
  await ds.initialize();

  const repo = ds.getRepository(User);
  const email = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  let admin = await repo.findOne({ where: { email } });
  if (!admin) {
    admin = repo.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@deptech.com',
      birthDate: '1990-01-01',
      gender: 'L',
      role: 'ADMIN',
      dateJoin: new Date(),
      passwordHash: await bcrypt.hash('123456', 10),
    });
    await repo.save(admin);
    console.log('✅ Admin seeded:', admin.email);
  } else {
    console.log('ℹ️ Admin already exists:', admin.email);
  }
  await ds.destroy();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
