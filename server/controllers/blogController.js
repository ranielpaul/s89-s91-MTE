const Blog = require('../models/Blog');
const { errorHandler } = require("../auth");

module.exports.getAllPosts = async (req, res) => {
    try {
        const result = await Blog.find({})
            .populate('author', 'username')
            .populate('comments.user', 'username');

        if (result.length > 0) {
            return res.status(200).send(result);
        } else {
            return res.status(404).send({ message: 'No blogs found' });
        }
    } catch (error) {
        return errorHandler(error, req, res);
    }
};

module.exports.getPost = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
            .populate('author', 'username')
            .populate('comments.user', 'username');

        if (blog) {
            return res.status(200).send(blog);
        } else {
            return res.status(404).send({ message: 'Blog not found' });
        }
    } catch (error) {
        return errorHandler(error, req, res);
    }
};

module.exports.createBlog = async (req, res) => {
    try {
        const newBlog = new Blog({
            title: req.body.title,
            content: req.body.content,
            author: req.user.id
        });

        const savedBlog = await newBlog.save();
        await savedBlog.populate('author', 'username');

        return res.status(201).send({
            message: 'Blog created successfully',
            blog: savedBlog
        });
    } catch (error) {
        return errorHandler(error, req, res);
    }
};

module.exports.addComment = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).send({ message: 'Blog not found' });
        }

        const message = req.body.message || req.body.comment;
        if (!message) {
            return res.status(400).send({ message: 'Comment message is required' });
        }

        const comment = {
            user: req.user.id,
            message: message
        };

        blog.comments.push(comment);
        await blog.save();
        await blog.populate('comments.user', 'username');

        return res.status(200).send({
            message: 'Comment added successfully',
            blog: blog
        });
    } catch (error) {
        return errorHandler(error, req, res);
    }
};

module.exports.updateBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).send({ message: 'Blog not found' });
        }

        const isAuthor = blog.author.toString() === req.user.id;
        if (!isAuthor && !req.user.isAdmin) {
            return res.status(403).send({ message: 'Action Forbidden: You can only update your own posts' });
        }

        if (req.body.title) blog.title = req.body.title;
        if (req.body.content) blog.content = req.body.content;

        const updatedBlog = await blog.save();
        await updatedBlog.populate('author', 'username');
        await updatedBlog.populate('comments.user', 'username');

        return res.status(200).send({
            message: 'Blog updated successfully',
            blog: updatedBlog
        });
    } catch (error) {
        return errorHandler(error, req, res);
    }
};

module.exports.deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).send({ message: 'Blog not found' });
        }

        const isAuthor = blog.author.toString() === req.user.id;
        if (!isAuthor && !req.user.isAdmin) {
            return res.status(403).send({ message: 'Action Forbidden: You are not authorized to delete this post' });
        }

        await Blog.findByIdAndDelete(req.params.id);
        return res.status(200).send({ message: 'Blog post deleted successfully' });
    } catch (error) {
        return errorHandler(error, req, res);
    }
};

// Aliases
module.exports.deletePost = module.exports.deleteBlog;
module.exports.getBlog = module.exports.getPost;
