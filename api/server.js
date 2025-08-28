import express from 'express'
// Create customer
app.post('/customers', async (req, res) => {
const b = req.body
const q = `INSERT INTO customers (account_number, company_name, emirate, area, status, payment_status, outstanding_amount, recovered_amount, sales_consultant)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *;`
const { rows } = await pool.query(q, [
b.account_number,
b.company_name,
b.emirate,
b.area,
b.status || 'Active',
b.payment_status || 'Pending',
Number(b.outstanding_amount || 0),
Number(b.recovered_amount || 0),
b.sales_consultant || 'Unassigned'
])
res.json(rows[0])
})


// Update customer
app.put('/customers/:id', async (req, res) => {
const { id } = req.params
const b = req.body
const q = `UPDATE customers SET
account_number=$1, company_name=$2, emirate=$3, area=$4,
status=$5, payment_status=$6, outstanding_amount=$7, recovered_amount=$8,
sales_consultant=$9, date_recovered=$10
WHERE id=$11 RETURNING *;`
const { rows } = await pool.query(q, [
b.account_number, b.company_name, b.emirate, b.area,
b.status, b.payment_status, Number(b.outstanding_amount || 0), Number(b.recovered_amount || 0),
b.sales_consultant, b.date_recovered || null,
id
])
res.json(rows[0])
})


// Delete customer
app.delete('/customers/:id', async (req, res) => {
await pool.query('DELETE FROM customers WHERE id=$1', [req.params.id])
res.json({ ok: true })
})


// Add note
app.post('/customers/:id/notes', async (req, res) => {
const { rows } = await pool.query(
'INSERT INTO notes (customer_id, html) VALUES ($1,$2) RETURNING *',
[req.params.id, req.body.html]
)
res.json(rows[0])
})


// Schedule visit
app.post('/customers/:id/visits', async (req, res) => {
const { rows } = await pool.query(
'INSERT INTO visits (customer_id, visit_date, note_text) VALUES ($1,$2,$3) RETURNING *',
[req.params.id, req.body.visit_date, req.body.note_text || null]
)
res.json(rows[0])
})


// List visits (for calendar)
app.get('/visits', async (_req, res) => {
const { rows } = await pool.query(
`SELECT v.*, c.company_name, c.emirate, c.sales_consultant
FROM visits v JOIN customers c ON c.id = v.customer_id`
)
res.json(rows)
})


const port = process.env.PORT || 8080
app.listen(port, () => console.log(`API listening on :${port}`))