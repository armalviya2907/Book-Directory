const express = require('express');
const router = express.Router();
const Book = require('../models/book');

router.get('/', async (req, res) => {
    const { page = 1, limit = 10, author, genre } = req.query;
    const query = {};

    if (author) {
        query.author = new RegExp(author, 'i'); 
    }

    if (genre) {
        query.genre = new RegExp(genre, 'i'); 
    }

    try {
        const books = await Book.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Book.countDocuments(query);
        
        res.json({
            books,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a book by ID
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (book == null) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json(book);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new book
router.post('/', async (req, res) => {
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        genre: req.body.genre,
        publishedYear: req.body.publishedYear
    });

    try {
        const newBook = await book.save();
        res.status(201).json(newBook);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a book
router.put('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (book == null) {
            return res.status(404).json({ message: 'Book not found' });
        }

        if (req.body.title != null) {
            book.title = req.body.title;
        }
        if (req.body.author != null) {
            book.author = req.body.author;
        }
        if (req.body.genre != null) {
            book.genre = req.body.genre;
        }
        if (req.body.publishedYear != null) {
            book.publishedYear = req.body.publishedYear;
        }

        const updatedBook = await book.save();
        res.json(updatedBook);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a book
router.delete('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (book == null) {
            return res.status(404).json({ message: 'Book not found' });
        }

        await book.remove();
        res.json({ message: 'Book deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
