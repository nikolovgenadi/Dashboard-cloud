import { Pool } from 'pg';
const {
  invoices,
  customers,
  revenue,
  users,
} = require('../app/lib/placeholder-data.js');
const bcrypt = require('bcrypt');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function seedUsers(client) {
  await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  // Create the "users" table if it doesn't exist
  await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `);

  console.log(`Created "users" table`);

  // Insert data into the "users" table
  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await client.query(
      `
        INSERT INTO users (id, name, email, password) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING;`,
      [user.id, user.name, user.email, hashedPassword],
    );
  }

  console.log(`Seeded users`);
}

async function seedInvoices(client) {
  await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

  // Create the "invoices" table if it doesn't exist
  await client.query(`
    CREATE TABLE IF NOT EXISTS invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID NOT NULL,
    amount INT NOT NULL,
    status VARCHAR(255) NOT NULL,
    date DATE NOT NULL
  );
`);

  console.log(`Created "invoices" table`);

  // Insert data into the "invoices" table
  for (const invoice of invoices) {
    await client.query(
      `
        INSERT INTO invoices (customer_id, amount, status, date) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING;`,
      [invoice.customer_id, invoice.amount, invoice.status, invoice.date],
    );
  }

  console.log(`Seeded invoices`);
}

async function seedCustomers(client) {
  await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

  // Create the "customers" table if it doesn't exist
  await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        image_url VARCHAR(255) NOT NULL
      );
    `);

  console.log(`Created "customers" table`);

  // Insert data into the "customers" table
  for (const customer of customers) {
    await client.query(
      `INSERT INTO customers (id, name, email, image_url) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING;`,
      [customer.id, customer.name, customer.email, customer.image_url],
    );
  }

  console.log(`Seeded customers`);
}

async function seedRevenue(client) {
  // Create the "revenue" table if it doesn't exist
  await client.query(`
      CREATE TABLE IF NOT EXISTS revenue (
        month VARCHAR(4) NOT NULL UNIQUE,
        revenue INT NOT NULL
      );
    `);

  console.log(`Created "revenue" table`);

  // Insert data into the "revenue" table
  for (const rev of revenue) {
    await client.query(
      `
        INSERT INTO revenue (month, revenue)
        VALUES ($1, $2)
        ON CONFLICT (month) DO NOTHING;
      `,
      [rev.month, rev.revenue],
    );

    console.log(`Seeded revenue`);
  }
}
async function main() {
  const client = await pool.connect();
  try {
    await seedUsers(client);
    await seedCustomers(client);
    await seedInvoices(client);
    await seedRevenue(client);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
