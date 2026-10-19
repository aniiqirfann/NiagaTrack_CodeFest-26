📦 NiagaTrack - PostgreSQL Database Setup #A quick setup guide to configure the PostgreSQL database for the NiagaTrack project.

🛠️ Step-by-Step Instructions

1. Open PostgreSQL / pgAdmin
    - Make sure your PostgreSQL server is up and running.

2. Create a New Database
    - Open your Query Tool or terminal and create a new, empty database: SQL --> CREATE DATABASE niagatrack_db;
    - Make sure to connect to the newly created niagatrack_db database before proceeding to the next step.

3. Run the SQL Script
    - Download or copy the niagatrack_schema.sql file from this repository.
    - Open it, copy all contents, and paste them into the Query Tool in pgAdmin.
    - Click Run (F5) to create the tables, indexes, and insert the sample dummy data.
  
📋 Table Structure This database consists of 4 main relational tables:

1. users: Stores merchant/user account information.
2. kategori: Stores categories for sales and expenses (linked directly to users).
3. jualan: Stores money-in transaction records (with automated total_sales calculation).
4. belanja: Stores money-out transaction records (including notes and receipt fields).
   
💡 Useful Backend Query Example: If you need to test your setup or connection, you can use this daily query:
- Total Sales for a Selected Day: SQL --> SELECT COALESCE(SUM(total_sales), 0) AS total_sales FROM jualan WHERE user_id = 1 AND transaction_date >= TIMESTAMP '2026-10-04 00:00:00' AND transaction_date < TIMESTAMP '2026-10-05 00:00:00';
  
#Done..thats all guys!!
