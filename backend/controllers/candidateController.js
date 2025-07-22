const pool = require('../db');
const { invalidateCache } = require('../middleware/cache');

const getCandidates = async (req, res) => {
    const {
        page = 1,
        limit = 10,
        sortBy = 'created_at',
        sortOrder = 'DESC',
        search = ''
    } = req.query;

    const offset = (page - 1) * limit;

    // Validate sortBy to prevent SQL injection
    const allowedSortBy = ['name', 'email', 'created_at'];
    const safeSortBy = allowedSortBy.includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    let whereClause = '';
    const queryParams = [];

    if (search) {
        // Use MATCH...AGAINST for efficient FULLTEXT search.
        const searchTerms = search.split(' ').map(term => `+${term}*`).join(' ');
        whereClause = 'WHERE MATCH(name, email, tags) AGAINST(? IN BOOLEAN MODE)';
        queryParams.push(searchTerms);
    }

    const countQuery = `SELECT COUNT(id) as total FROM candidates ${whereClause}`;
    const dataQuery = `
        SELECT id, name, email, tags, created_at, enabled
        FROM candidates
        ${whereClause}
        ORDER BY ${safeSortBy} ${safeSortOrder}
        LIMIT ?
        OFFSET ?
    `;

    queryParams.push(parseInt(limit, 10), parseInt(offset, 10));

    try {
        const [countResult] = await pool.execute(countQuery, search ? [queryParams[0]] : []);
        const total = countResult[0].total;

        const [data] = await pool.execute(dataQuery, queryParams);

        const response = {
            data,
            pagination: {
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
        res.status(200).json(response);
    } catch (error) {
        console.error('Failed to fetch candidates:', error);
        res.status(500).json({ error: 'Failed to fetch candidates' });
    }
};

const createCandidate = async (req, res) => {
    const { name, email, phone, tags } = req.body;
    if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
    }

    try {
        const [result] = await pool.execute(
            'INSERT INTO candidates (name, email, phone, tags) VALUES (?, ?, ?, ?)',
            [name, email, phone || null, tags || null]
        );

        // Invalidate the cache for the candidates list
        await invalidateCache('cache:/api/candidates');

        res.status(201).json({ id: result.insertId, message: 'Candidate created successfully' });
    } catch (error) {
        console.error('Failed to create candidate:', error);
        res.status(500).json({ error: 'Failed to create candidate' });
    }
};

module.exports = { getCandidates, createCandidate };