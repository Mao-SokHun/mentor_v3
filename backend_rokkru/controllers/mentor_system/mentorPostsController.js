// ============= Start mentor posts controller =============
import { MentorPost, SubSkill, Skill, Province } from '../../models/index.js';
import { ok, fail } from '../../utils/mentor_system/apiResponse.js';
import { parseUserID as parseUserId, assertOwner } from '../../utils/mentor_system/assertOwner.js';
import { getAuthUserId } from '../../utils/mentor_system/getAuthUserId.js';

const postInclude = [
    { model: SubSkill, include: [{ model: Skill }] },
    { model: Province },
];

function normalizePostStatus(status) {
  return String(status ?? 'published').trim().toLowerCase();
}

function viewerOwnsMentorPosts(req, mentorUserId) {
  const viewerId = getAuthUserId(req);
  return viewerId != null && viewerId === mentorUserId;
}

/** Published posts are public; drafts require the owning mentor. */
function canAccessPost(req, post) {
  if (!post) return false;
  if (normalizePostStatus(post.status) === 'published') return true;
  return viewerOwnsMentorPosts(req, post.user_id);
}

// Start list published posts
const listPublishedPosts = async (req, res) => {
  try {
    const where = {};
    if (req.query.status) {
      where.status = req.query.status;
    } else {
      where.status = 'published';
    }
    if (req.query.province_id !== undefined) {
      const provinceId = parseInt(req.query.province_id, 10);
      if (!Number.isNaN(provinceId)) where.province_id = provinceId;
    }
    if (req.query.sub_skill_id !== undefined) {
      const subSkillId = parseInt(req.query.sub_skill_id, 10);
      if (!Number.isNaN(subSkillId)) where.sub_skill_id = subSkillId;
    }
    const limit = Math.min(
      200,
      Math.max(1, parseInt(req.query.limit, 10) || 50),
    );
    const items = await MentorPost.findAll({
      where,
      include: postInclude,
      order: [['create_date', 'DESC']],
      limit,
    });
    return ok(res, items);
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

// Start list my posts
const listMyPosts = async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (userId === null) return fail(res, 'Unauthorized', 401);
    const where = { user_id: userId };
    if (req.query.status) {
      where.status = req.query.status;
    }
    const items = await MentorPost.findAll({
      where,
      include: postInclude,
      order: [['create_date', 'DESC']],
    });
    return ok(res, items);
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

const listPost = async(req, res)=>{
    try{
        const userId = parseUserId(req.params.userId);
        if(userId === null){
            return fail(res, 'Invalid user id',400);
        }
        const where = {user_id: userId};
        if (req.query.status) {
          const status = normalizePostStatus(req.query.status);
          if (status !== 'published' && !viewerOwnsMentorPosts(req, userId)) {
            return fail(res, 'Forbidden', 403);
          }
          where.status = status;
        } else {
          where.status = 'published';
        }
        const item = await MentorPost.findAll({
            where,
            include: postInclude,
            order: [['create_date', 'DESC']],
        });
        return ok(res, item);

    }catch(error){
        return fail(res, error.message, 500);
    }
}

const getPostById = async (req, res) =>{
    try{
        const postId = parseInt(req.params.postId,10);
        if(Number.isNaN(postId)){
            return fail(res, 'Invalid post id',400);
        }
        const post = await MentorPost.findByPk(postId, {include: postInclude});
        if(!post) {
            return fail(res, 'Post not found', 404);
        }
        if (!canAccessPost(req, post)) {
            return fail(res, 'Post not found', 404);
        }
        return ok(res, post);

    }catch(error){
        return fail(res, error.message, 500);
    }
}

const getPostByIdLegacy = async(req, res)=>{
    try{
        const postId = parseInt(req.params.postId,10);
        if(Number.isNaN(postId)){
            return fail(res, 'Invalid post id',400);
        }
        const post = await MentorPost.findByPk(postId, {include: postInclude});
        if(!post) {
            return fail(res, 'Post not found',404);
        }
        if (!canAccessPost(req, post)) {
            return fail(res, 'Post not found', 404);
        }
        return ok(res, post);

    }catch(error){
        return fail(res, error.message, 500);
    }
}

// Start create post
const createPost = async (req, res) => {
  try {
    if (!assertOwner(req, res, req.params.userId)) return;

    const userId = parseUserId(req.params.userId);
    const { title, description, province_id, sub_skill_id, status } = req.body;

    if (!title || !province_id || !sub_skill_id) {
      return fail(res, 'title, province_id, and sub_skill_id are required', 400);
    }

    const post = await MentorPost.create({
      user_id: userId,
      title,
      description,
      province_id,
      sub_skill_id,
      status: status || 'draft',
      create_date: new Date(),
    });

    const full = await MentorPost.findByPk(post.post_id, { include: postInclude });
    return ok(res, full, 201);
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

const updatePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.postId, 10);
    if (Number.isNaN(postId)) return fail(res, 'Invalid post id', 400);

    const post = await MentorPost.findByPk(postId);
    if (!post) return fail(res, 'Post not found', 404);
    if (!assertOwner(req, res, post.user_id)) return;

    const allowedFields = ['title', 'description', 'province_id', 'sub_skill_id', 'status'];
    const updates = {};
    allowedFields.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });
    if (Object.keys(updates).length === 0) {
      return fail(res, 'No fields to update', 400);
    }
    updates.update_date = new Date();

    await post.update(updates);
    const full = await MentorPost.findByPk(post.post_id, { include: postInclude });
    return ok(res, full);
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

const deletePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.postId, 10);
    if (Number.isNaN(postId)) return fail(res, 'Invalid post id', 400);

    const post = await MentorPost.findByPk(postId);
    if (!post) return fail(res, 'Post not found', 404);
    if (!assertOwner(req, res, post.user_id)) return;

    await post.destroy();
    return ok(res, { deleted: true });
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

export {
  listPublishedPosts,
  listMyPosts,
  listPost,
  getPostById,
  getPostByIdLegacy,
  createPost,
  updatePost,
  deletePost,
};
// ============= End mentor posts controller =============
