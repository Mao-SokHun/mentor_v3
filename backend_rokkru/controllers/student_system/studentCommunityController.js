import {
  CommunityPost,
  CommunityType,
  CommunityHistory,
  Student,
  User
} from '../../models/index.js';
import { Op } from 'sequelize';

import {
  successResponse,
  errorResponse
} from '../../utils/response.js';

import { paginate } from '../../utils/pagination.js';

export const getAllPosts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      community_type_id,
      sortBy = 'create_date',
      sortOrder = 'desc'
    } = req.query;

    const where = {};

    if (search) {
      where[Op.or] = [
        {
          title: {
            [Op.iLike]: `%${search}%`
          }
        },
        {
          description: {
            [Op.iLike]: `%${search}%`
          }
        }
      ];
    }

    if (community_type_id) {
      where.community_type_id = community_type_id;
    }

    const order = [[sortBy, sortOrder.toUpperCase()]];

    const { count, rows: posts } = await CommunityPost.findAndCountAll({
      where,
      include: [
        {
          model: CommunityType,
          as: 'communityType',
          attributes: [
            'community_type_id',
            'community_name',
            'community_description'
          ]
        },
        {
          model: Student,
          as: 'student',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['user_id', 'email', 'user_name']
            }
          ]
        }
      ],
      order,
      ...paginate(page, limit)
    });

    return successResponse(
      res,
      200,
      'Community posts retrieved successfully',
      {
        posts,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    );
  } catch (error) {
    next(error);
  }
};

export const getPostById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await CommunityPost.findByPk(id, {
      include: [
        {
          model: CommunityType,
          as: 'communityType',
          attributes: [
            'community_type_id',
            'community_name',
            'community_description'
          ]
        },
        {
          model: Student,
          as: 'student',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['user_id', 'email', 'user_name']
            }
          ]
        }
      ]
    });

    if (!post) {
      return errorResponse(res, 404, 'Community post not found');
    }

    return successResponse(
      res,
      200,
      'Community post retrieved successfully',
      { post }
    );
  } catch (error) {
    next(error);
  }
};

export const createPost = async (req, res, next) => {
  try {
    const student_id = req.user.student_id;

    const {
      community_type_id,
      title,
      description,
      image_url
    } = req.body;

    if (!community_type_id || !title) {
      return errorResponse(
        res,
        400,
        'community_type_id and title are required'
      );
    }

    const communityType = await CommunityType.findByPk(
      community_type_id
    );

    if (!communityType) {
      return errorResponse(res, 404, 'Community type not found');
    }

    const post = await CommunityPost.create({
      student_id,
      community_type_id,
      title,
      description: description || null,
      image_url: image_url || null,
      create_date: new Date()
    });

    await CommunityHistory.create({
      community_post_id: post.community_post_id,
      action_type: 'created',
      action_description: `Post "${title}" created by student ${student_id}`,
      action_date: new Date()
    });

    return successResponse(
      res,
      201,
      'Community post created successfully',
      { post }
    );
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (req, res, next) => {
  try {
    const student_id = req.user.student_id;

    const { id } = req.params;

    const {
      community_type_id,
      title,
      description,
      image_url
    } = req.body;

    const post = await CommunityPost.findOne({
      where: {
        community_post_id: id,
        student_id
      }
    });

    if (!post) {
      return errorResponse(
        res,
        404,
        'Post not found or you do not have permission'
      );
    }

    if (community_type_id) {
      const communityType = await CommunityType.findByPk(
        community_type_id
      );

      if (!communityType) {
        return errorResponse(
          res,
          404,
          'Community type not found'
        );
      }

      post.community_type_id = community_type_id;
    }

    if (title) {
      post.title = title;
    }

    if (description !== undefined) {
      post.description = description;
    }

    if (image_url !== undefined) {
      post.image_url = image_url;
    }

    await post.save();

    await CommunityHistory.create({
      community_post_id: post.community_post_id,
      action_type: 'updated',
      action_description: `Post "${post.title}" updated by student ${student_id}`,
      action_date: new Date()
    });

    return successResponse(
      res,
      200,
      'Community post updated successfully',
      { post }
    );
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const student_id = req.user.student_id;

    const { id } = req.params;

    const post = await CommunityPost.findOne({
      where: {
        community_post_id: id,
        student_id
      }
    });

    if (!post) {
      return errorResponse(
        res,
        404,
        'Post not found or you do not have permission'
      );
    }

    await CommunityHistory.create({
      community_post_id: post.community_post_id,
      action_type: 'deleted',
      action_description: `Post "${post.title}" deleted by student ${student_id}`,
      action_date: new Date()
    });

    await post.destroy();

    return successResponse(
      res,
      200,
      'Community post deleted successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const getCommunityTypes = async (req, res, next) => {
  try {
    const types = await CommunityType.findAll({
      order: [['community_name', 'ASC']]
    });

    return successResponse(
      res,
      200,
      'Community types retrieved successfully',
      { types }
    );
  } catch (error) {
    next(error);
  }
};

export const getMyPosts = async (req, res, next) => {
  try {
    const student_id = req.user.student_id;

    const {
      page = 1,
      limit = 10
    } = req.query;

    const { count, rows: posts } =
      await CommunityPost.findAndCountAll({
        where: { student_id },
        include: [
          {
            model: CommunityType,
            as: 'communityType',
            attributes: [
              'community_type_id',
              'community_name'
            ]
          }
        ],
        order: [['create_date', 'DESC']],
        ...paginate(page, limit)
      });

    return successResponse(
      res,
      200,
      'My posts retrieved successfully',
      {
        posts,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    );
  } catch (error) {
    next(error);
  }
};

export const getCommunityHistory = async (req, res, next) => {
  try {
    const student_id = req.user.student_id;

    const {
      page = 1,
      limit = 10
    } = req.query;

    const studentPosts = await CommunityPost.findAll({
      where: { student_id },
      attributes: ['community_post_id']
    });

    const postIds = studentPosts.map(
      (p) => p.community_post_id
    );

    const { count, rows: history } =
      await CommunityHistory.findAndCountAll({
        where: {
          community_post_id: {
            [Op.in]: postIds
          }
        },
        include: [
          {
            model: CommunityPost,
            as: 'communityPost',
            attributes: ['title']
          }
        ],
        order: [['action_date', 'DESC']],
        ...paginate(page, limit)
      });

    return successResponse(
      res,
      200,
      'Community history retrieved successfully',
      {
        history,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    );
  } catch (error) {
    next(error);
  }
};
