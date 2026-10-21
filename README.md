# NiagaTrack_CodeFest-26
A digital bookkeeping and financial management platform for small entrepreneurs. Created by 4loop.

- **Frontend:** React + Vite (`frontend/`)
- **Backend:** Node.js + Express (`backend/`)
- **Database:** PostgreSQL

```
Browser (React, port 5173)  ->  Express API (port 4000)  ->  PostgreSQL
```

## Project structure

```
niagatrack/
├─ backend/
│  ├─ sql/schema.sql        database tables
│  ├─ src/
│  │  ├─ server.js          starts the API
│  │  ├─ db.js              database connection
│  │  ├─ auth.js            JWT login check
│  │  ├─ util.js            helpers (validation, dates, phone format)
│  │  ├─ defaults.js        default categories for new users
│  │  ├─ setup-db.js        npm run db:reset
│  │  ├─ seed.js            npm run seed
│  │  └─ routes/            auth.js, data.js, reports.js
│  ├─ .env.example          settings template
│  └─ package.json
└─ frontend/
   ├─ src/
   │  ├─ pages/             Login, Register, Home, AddSale, AddExpense, Records, Reports
   │  ├─ components/        Layout, RecordItem
   │  ├─ api.js, auth.jsx, i18n.jsx, util.js, styles.css
   └─ package.json
```

## Requirements

| Tool | Version | Check with |
|---|---|---|
| Node.js | 20 or newer | `node -v` |
| PostgreSQL | **15 or newer** (required by the schema) | `psql --version` |
| Git | any | `git --version` |

## 1. Get the code

```bash
git clone https://github.com/<owner>/<repo>.git
cd <repo>
```

## 2. Create the database

Create an **empty** database named `niagatrack`.

- **pgAdmin:** right-click *Databases* -> *Create* -> *Database* -> name it `niagatrack`.
- **or terminal:** `createdb -U postgres niagatrack`

## 3. Set up the backend

```bash
cd backend
npm install
```

Create your settings file from the template:

```bash
# Windows (Command Prompt)
copy .env.example .env
# Windows (PowerShell), Mac, Linux
cp .env.example .env
```

Open `backend/.env` and edit it:

```env
PORT=4000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/niagatrack
JWT_SECRET=paste-a-long-random-text-here
CLIENT_ORIGIN=http://localhost:5173
```

- `YOUR_PASSWORD` is your PostgreSQL password. If it contains `@`, `#` or `/`, URL-encode those characters.
- Generate a secret with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

Create the tables and demo data:

```bash
npm run db:reset    # creates tables. WARNING: deletes existing data in these tables
npm run seed        # creates demo user + sample sales/expenses
```

Start the API:

```bash
npm run dev         # auto-restarts on file changes
```

Check it works: open http://localhost:4000/api/health. It should show `{"ok":true}`.

## 4. Set up the frontend

Open a **second terminal**:

```bash
cd frontend
npm install
npm run dev
```

Open the address shown in the terminal (normally http://localhost:5173). If port 5173 is busy, Vite uses the next one (5174, 5175...). Use whatever it prints.

In development, Vite forwards every `/api` request to `http://localhost:4000` (see `frontend/vite.config.js`), so keep the backend running.

## 5. Log in

Demo account (created by `npm run seed`):

| Phone | Password |
|---|---|
| `12 345 6789` (the +60 is already shown) | `password123` |

Or press **Daftar akaun** to create your own account. The demo data is dated relative to today, so Home should show Sales RM 480, Expenses RM 165, Profit RM 315.
