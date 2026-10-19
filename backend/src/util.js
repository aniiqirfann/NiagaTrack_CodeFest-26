class HttpError extends Error {
  constructor(status, code, detail) { super(detail || code); this.status = status; this.code = code; }
}

// Validate input with a zod schema; throw a 400 error if invalid
function parse(schema, data) {
  const r = schema.safeParse(data);
  if (!r.success) {
    const i = r.error.issues[0];
    throw new HttpError(400, 'INVALID_INPUT', `${i.path.join('.')}: ${i.message}`);
  }
  return r.data;
}


function normalizePhone(raw) {
  let d = String(raw).replace(/\D/g, '');
  if (d.startsWith('60')) d = d.slice(2);
  if (d.startsWith('0')) d = d.slice(1);
  return d;
}

const TZ = "'Asia/Kuala_Lumpur'";

function dayFilter(col, p) {
  return `${col} >= ($${p}::date)::timestamp AT TIME ZONE ${TZ}
      AND ${col} < (($${p}::date + 1)::timestamp AT TIME ZONE ${TZ})`;
}

function todayKL() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kuala_Lumpur' }); 
}

function getDate(query) {
  const d = query.date ?? todayKL();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || isNaN(Date.parse(d))) {
    throw new HttpError(400, 'INVALID_INPUT', 'date must be YYYY-MM-DD');
  }
  return d;
}

module.exports = { HttpError, parse, normalizePhone, dayFilter, todayKL, getDate };
