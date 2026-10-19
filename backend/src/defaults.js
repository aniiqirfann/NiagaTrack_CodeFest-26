// Categories every new user gets. system_key is used by the frontend for translation (BM/EN).
const DEFAULT_CATEGORIES = [
  ['Nasi Lemak', 'sales', 'nasi_lemak', 4],
  ['Drinks', 'sales', 'drinks', 4],
  ['Kuih', 'sales', 'kuih', 3],
  ['Raw Materials', 'expense', 'raw_materials', null],
  ['Stall Rental', 'expense', 'stall_rental', null],
  ['Packaging', 'expense', 'packaging', null],
];

async function createDefaultCategories(client, userId) {
  for (const [name, type, key, price] of DEFAULT_CATEGORIES) {
    await client.query(
      `INSERT INTO kategori (user_id, category_name, category_type, system_key, default_price)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, name, type, key, price]
    );
  }
}
module.exports = { createDefaultCategories };
